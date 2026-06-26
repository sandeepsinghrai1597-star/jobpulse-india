import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const [action, emailArg, passwordArg] = process.argv.slice(2);

if (!action || !emailArg) {
  console.error("Usage:");
  console.error("  node scripts/manage-production-admin.mjs ensure-admin <email> [temporaryPassword]");
  console.error("  node scripts/manage-production-admin.mjs delete-user <email>");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

if (!email) {
  console.error("Email is required.");
  process.exit(1);
}

function buildDisplayName(targetEmail) {
  const local = targetEmail.split("@")[0] ?? "admin";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createTemporaryPassword() {
  return `JobPulse!${crypto.randomBytes(9).toString("base64url")}`;
}

async function listAllUsers() {
  const users = [];
  let page = 1;

  for (;;) {
    const listed = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (listed.error) {
      throw listed.error;
    }

    const batch = listed.data.users ?? [];
    users.push(...batch);

    if (batch.length < 1000) {
      return users;
    }

    page += 1;
  }
}

async function ensurePublicAdminRecord(userId, targetEmail, fullName) {
  const payload = {
    id: userId,
    name: fullName,
    email: targetEmail,
    phone: null,
    role: "admin",
    is_banned: false,
  };

  const { error } = await supabase.from("users").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }
}

async function deletePublicUserRecord(userId) {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    throw error;
  }
}

function isUsersGrantError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42501" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("permission denied for table users")
  );
}

async function ensureAdmin(emailAddress, requestedPassword) {
  const users = await listAllUsers();
  const match = users.find((entry) => entry.email?.toLowerCase() === emailAddress);
  const fullName = buildDisplayName(emailAddress);
  const temporaryPassword = requestedPassword?.trim() || createTemporaryPassword();

  if (!match) {
    const created = await supabase.auth.admin.createUser({
      email: emailAddress,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "admin",
      },
      app_metadata: {
        role: "admin",
      },
    });

    if (created.error || !created.data.user?.id) {
      throw created.error ?? new Error(`Could not create ${emailAddress}`);
    }

    let usersTableSynced = true;
    try {
      await ensurePublicAdminRecord(created.data.user.id, emailAddress, fullName);
    } catch (error) {
      if (!isUsersGrantError(error)) {
        throw error;
      }
      usersTableSynced = false;
    }

    return {
      action: "created",
      id: created.data.user.id,
      email: emailAddress,
      password: temporaryPassword,
      usersTableSynced,
    };
  }

  const updated = await supabase.auth.admin.updateUserById(match.id, {
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      ...(match.user_metadata ?? {}),
      full_name: match.user_metadata?.full_name ?? fullName,
      role: "admin",
    },
    app_metadata: {
      ...(match.app_metadata ?? {}),
      role: "admin",
    },
  });

  if (updated.error || !updated.data.user?.id) {
    throw updated.error ?? new Error(`Could not update ${emailAddress}`);
  }

  const effectiveName =
    updated.data.user.user_metadata?.full_name ??
    match.user_metadata?.full_name ??
    fullName;

  let usersTableSynced = true;
  try {
    await ensurePublicAdminRecord(updated.data.user.id, emailAddress, effectiveName);
  } catch (error) {
    if (!isUsersGrantError(error)) {
      throw error;
    }
    usersTableSynced = false;
  }

  return {
    action: "updated",
    id: updated.data.user.id,
    email: emailAddress,
    password: temporaryPassword,
    usersTableSynced,
  };
}

async function deleteUserByEmail(emailAddress) {
  const users = await listAllUsers();
  const match = users.find((entry) => entry.email?.toLowerCase() === emailAddress);

  if (!match?.id) {
    return { deleted: false, email: emailAddress };
  }

  let usersTableDeleted = true;
  try {
    await deletePublicUserRecord(match.id);
  } catch (error) {
    if (!isUsersGrantError(error)) {
      throw error;
    }
    usersTableDeleted = false;
  }

  const deleted = await supabase.auth.admin.deleteUser(match.id);
  if (deleted.error) {
    throw deleted.error;
  }

  return {
    deleted: true,
    id: match.id,
    email: emailAddress,
    usersTableDeleted,
  };
}

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  if (action === "ensure-admin") {
    const result = await ensureAdmin(email, passwordArg);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "delete-user") {
    const result = await deleteUserByEmail(email);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  throw new Error(`Unsupported action: ${action}`);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    try {
      console.error(JSON.stringify(error, null, 2));
    } catch {
      console.error(String(error));
    }
  }
  process.exit(1);
});
