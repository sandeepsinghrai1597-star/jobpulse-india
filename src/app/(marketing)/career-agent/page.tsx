import { permanentRedirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Career Agent",
  description:
    "Legacy AI career agent route that permanently redirects to the canonical AI career agent page.",
  path: "/career-agent",
  noIndex: true,
});

export default function CareerAgentRedirectPage() {
  permanentRedirect("/ai-career-agent");
}
