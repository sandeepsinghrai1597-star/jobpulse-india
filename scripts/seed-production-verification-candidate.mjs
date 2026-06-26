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

const email = process.argv[2]?.trim().toLowerCase() || "candidate.verify@jobpulse.test";
const password = process.argv[3]?.trim() || `JobPulse!${crypto.randomBytes(9).toString("base64url")}`;

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

async function listAllUsers() {
  const users = [];
  let page = 1;

  for (;;) {
    const listed = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (listed.error) throw listed.error;
    const batch = listed.data.users ?? [];
    users.push(...batch);
    if (batch.length < 1000) return users;
    page += 1;
  }
}

async function ensureCandidateAuthUser(targetEmail, targetPassword) {
  const users = await listAllUsers();
  const existing = users.find((entry) => entry.email?.toLowerCase() === targetEmail);

  if (!existing) {
    const created = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Verification Candidate",
        role: "candidate",
      },
      app_metadata: {
        role: "candidate",
      },
    });

    if (created.error || !created.data.user?.id) {
      throw created.error ?? new Error(`Could not create ${targetEmail}`);
    }

    return created.data.user.id;
  }

  const updated = await supabase.auth.admin.updateUserById(existing.id, {
    password: targetPassword,
    email_confirm: true,
    user_metadata: {
      ...(existing.user_metadata ?? {}),
      full_name: "Verification Candidate",
      role: "candidate",
    },
    app_metadata: {
      ...(existing.app_metadata ?? {}),
      role: "candidate",
    },
  });

  if (updated.error || !updated.data.user?.id) {
    throw updated.error ?? new Error(`Could not update ${targetEmail}`);
  }

  return updated.data.user.id;
}

async function ensureCandidateProfile(userId) {
  const payload = {
    user_id: userId,
    full_name: "Verification Candidate",
    phone: "+91 9999999999",
    headline: "Production verification candidate",
    bio: "Created temporarily to verify the production apply flow.",
    education: "Graduate",
    skills: ["QA", "Automation"],
    experience: "2 years",
    city: "Bengaluru",
    state: "Karnataka",
    preferred_roles: ["QA Engineer"],
    expected_salary: 900000,
    preferred_job_types: ["full-time"],
    language_preference: "English",
    resume_url: null,
    verified: true,
    verification_status: "verified",
    verified_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("candidate_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error ?? new Error("Could not upsert candidate profile.");
  }

  return data.id;
}

async function ensureResume(userId) {
  const storagePath = `resumes/${userId}/verification-resume.pdf`;
  const payload = {
    user_id: userId,
    title: "Verification Resume",
    storage_path: storagePath,
    file_url: null,
    template_key: "verification",
    version: 1,
    content_json: {
      verified: true,
      generatedFor: "production-verification",
    },
  };

  const { data, error } = await supabase
    .from("resumes")
    .upsert(payload, { onConflict: "user_id,title" })
    .select("id, storage_path")
    .single();

  if (error || !data?.id) {
    throw error ?? new Error("Could not upsert verification resume.");
  }

  return data;
}

async function main() {
  const userId = await ensureCandidateAuthUser(email, password);
  const profileId = await ensureCandidateProfile(userId);
  const resume = await ensureResume(userId);

  console.log(
    JSON.stringify(
      {
        email,
        password,
        userId,
        profileId,
        resumeId: resume.id,
        storagePath: resume.storage_path,
      },
      null,
      2,
    ),
  );
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
