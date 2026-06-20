import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env");

if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

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

const adminUser = {
  email: "admin.demo@jobpulse.test",
  password: "JobPulse123",
  user_metadata: {
    full_name: "Demo Admin",
    phone: "+91 9876543212",
    role: "admin",
  },
};

async function ensurePublicAdminRecord(userId, user) {
  const payload = {
    id: userId,
    name: user.user_metadata.full_name,
    email: user.email,
    phone: user.user_metadata.phone,
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

async function createOrUpdateAdmin(user) {
  const existing = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (existing.error) {
    throw existing.error;
  }

  const match = existing.data.users.find((entry) => entry.email === user.email);

  if (!match) {
    const created = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata,
      app_metadata: {
        role: "admin",
      },
    });

    if (created.error) {
      throw created.error;
    }

    const createdUser = created.data.user;
    if (!createdUser?.id) {
      throw new Error("Admin user was created in auth, but no user id was returned.");
    }

    await ensurePublicAdminRecord(createdUser.id, user);

    return { action: "created", email: user.email, id: createdUser.id };
  }

  const updated = await supabase.auth.admin.updateUserById(match.id, {
    password: user.password,
    email_confirm: true,
    user_metadata: user.user_metadata,
    app_metadata: {
      ...(match.app_metadata ?? {}),
      role: "admin",
    },
  });

  if (updated.error) {
    throw updated.error;
  }

  await ensurePublicAdminRecord(match.id, user);

  return { action: "updated", email: user.email, id: match.id };
}

async function main() {
  const result = await createOrUpdateAdmin(adminUser);
  console.log(`${result.action}: ${result.email}`);
  console.log(`id: ${result.id}`);
  console.log("");
  console.log("Admin login:");
  console.log("  email: admin.demo@jobpulse.test");
  console.log("  password: JobPulse123");
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
