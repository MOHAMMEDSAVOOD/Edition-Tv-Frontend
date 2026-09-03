import { NewsroomControlCenterClient } from "@/components/newsroom/NewsroomControlCenterClient";

export const metadata = {
  title: "Newsroom Control Center | Edition TV CMS",
  description: "Live wire monitoring, candidate triage, story assignment, and external provenance management.",
};

export default function NewsroomPage() {
  return <NewsroomControlCenterClient />;
}
