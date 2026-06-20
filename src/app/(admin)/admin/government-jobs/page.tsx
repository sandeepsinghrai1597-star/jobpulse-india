import { redirect } from "next/navigation";

export default function AdminGovernmentJobsRedirectPage() {
  redirect("/admin?section=government-jobs");
}
