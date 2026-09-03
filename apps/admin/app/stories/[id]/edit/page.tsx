import React from "react";
import { StoryEditorClient } from "@/components/stories/StoryEditorClient";

export const metadata = {
  title: "Edit Story | Edition TV Admin",
};

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoryEditorClient storyId={id} />;
}
