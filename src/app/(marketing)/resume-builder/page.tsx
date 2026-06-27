import { ResumeBuilder } from "@/components/resume";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getResumeTemplate } from "@/lib/resume/templates";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Resume Builder",
  description:
    "Create ATS-friendly resumes for fresher, internship, IT, sales, banking, and experienced roles.",
  path: "/resume-builder",
});

export default async function ResumeBuilderPage() {
  const currentUser = await getCurrentUser();
  const initialResume = getResumeTemplate("fresher");

  if (currentUser) {
    initialResume.basics.fullName = currentUser.name || initialResume.basics.fullName;
    initialResume.basics.email = currentUser.email || initialResume.basics.email;
    initialResume.basics.phone = currentUser.phone ?? initialResume.basics.phone;
  }

  let initialSavedResumes: Array<{
    id: string;
    title: string;
    templateKey:
      | "fresher"
      | "it"
      | "sales"
      | "banking"
      | "government-job"
      | "internship"
      | "experienced-professional";
    updatedAt: string;
  }> = [];

  if (currentUser?.id) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("resumes")
        .select("id, title, template_key, updated_at")
        .eq("user_id", currentUser.id)
        .order("updated_at", { ascending: false })
        .limit(8);

      initialSavedResumes =
        data?.map((item) => ({
          id: item.id,
          title: item.title,
          templateKey: (item.template_key ?? "fresher") as
            | "fresher"
            | "it"
            | "sales"
            | "banking"
            | "government-job"
            | "internship"
            | "experienced-professional",
          updatedAt: item.updated_at,
        })) ?? [];
    } catch (error) {
      console.error("[resume-builder] unable to load saved resumes", error);
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--rb-bg)]">
      <ResumeBuilder
        initialResume={initialResume}
        initialSavedResumes={initialSavedResumes}
        canSave={currentUser?.role === "candidate"}
      />
    </main>
  );
}
