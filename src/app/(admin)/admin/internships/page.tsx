import { redirect } from "next/navigation";

export default function AdminInternshipsRedirectPage() {
  redirect("/admin?section=internships");
}
