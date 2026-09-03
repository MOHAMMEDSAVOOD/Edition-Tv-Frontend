import React from "react";
import { StoriesClient } from "@/components/stories/StoriesClient";

export const metadata = {
  title: "Story Management | Edition TV Admin",
  description: "Create, edit, and publish editorial content for Edition TV",
};

export default function StoriesPage() {
  return <StoriesClient />;
}
