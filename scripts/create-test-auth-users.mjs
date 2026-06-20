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

const testUsers = [
  {
    email: "candidate.demo@jobpulse.test",
    password: "JobPulse123",
    user_metadata: {
      full_name: "Demo Candidate",
      phone: "+91 9876543210",
      role: "candidate",
    },
  },
  {
    email: "employer.demo@jobpulse.test",
    password: "JobPulse123",
    user_metadata: {
      full_name: "Demo Employer",
      phone: "+91 9876543211",
      role: "employer",
    },
  },
];

async function createOrUpdateUser(user) {
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
        role: user.user_metadata.role,
      },
    });

    if (created.error) {
      throw created.error;
    }

    return { action: "created", email: user.email };
  }

  const updated = await supabase.auth.admin.updateUserById(match.id, {
    password: user.password,
    email_confirm: true,
    user_metadata: user.user_metadata,
    app_metadata: {
      ...(match.app_metadata ?? {}),
      role: user.user_metadata.role,
    },
  });

  if (updated.error) {
    throw updated.error;
  }

  return { action: "updated", email: user.email };
}

async function main() {
  for (const user of testUsers) {
    const result = await createOrUpdateUser(user);
    console.log(`${result.action}: ${result.email}`);
  }

  console.log("");
  console.log("Candidate login:");
  console.log("  email: candidate.demo@jobpulse.test");
  console.log("  password: JobPulse123");
  console.log("Employer login:");
  console.log("  email: employer.demo@jobpulse.test");
  console.log("  password: JobPulse123");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
