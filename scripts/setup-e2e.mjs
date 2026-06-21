import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const generatedDir = path.join(projectRoot, "e2e", ".generated");
const fixturePath = path.join(generatedDir, "fixtures.json");

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
  console.error("Missing Supabase environment variables required for E2E setup.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const password = "JobPulse123";
const users = {
  candidate: {
    email: "candidate.demo@jobpulse.test",
    password,
    role: "candidate",
    name: "Demo Candidate",
    phone: "+91 9876543210",
  },
  candidateAlt: {
    email: "candidate.alt@jobpulse.test",
    password,
    role: "candidate",
    name: "Alt Candidate",
    phone: "+91 9876543213",
  },
  employer: {
    email: "employer.demo@jobpulse.test",
    password,
    role: "employer",
    name: "Demo Employer",
    phone: "+91 9876543211",
  },
  employerAlt: {
    email: "employer.alt@jobpulse.test",
    password,
    role: "employer",
    name: "Alt Employer",
    phone: "+91 9876543214",
  },
  admin: {
    email: "admin.demo@jobpulse.test",
    password,
    role: "admin",
    name: "Demo Admin",
    phone: "+91 9876543212",
  },
};

async function ensureUser(user) {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) {
    throw listed.error;
  }

  const existing = listed.data.users.find((entry) => entry.email === user.email);
  let authUser = existing ?? null;

  if (!authUser) {
    const created = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        phone: user.phone,
        role: user.role,
      },
      app_metadata: {
        role: user.role,
      },
    });

    if (created.error || !created.data.user) {
      throw created.error ?? new Error(`Could not create ${user.email}`);
    }

    authUser = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: user.name,
        phone: user.phone,
        role: user.role,
      },
      app_metadata: {
        ...(existing.app_metadata ?? {}),
        role: user.role,
      },
    });

    if (updated.error || !updated.data.user) {
      throw updated.error ?? new Error(`Could not update ${user.email}`);
    }

    authUser = updated.data.user;
  }

  return {
    id: authUser.id,
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name,
  };
}

async function main() {
  fs.mkdirSync(generatedDir, { recursive: true });

  const ensuredUsers = {};
  for (const [key, user] of Object.entries(users)) {
    ensuredUsers[key] = await ensureUser(user);
  }

  const fixtures = {
    baseUrl: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    supabaseUrl,
    publishableKey,
    users: ensuredUsers,
  };

  fs.writeFileSync(fixturePath, `${JSON.stringify(fixtures, null, 2)}\n`, "utf8");
  console.log(`Wrote E2E fixtures to ${fixturePath}`);
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
