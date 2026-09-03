import { StoryWorkspaceClient } from "@/components/workspace/StoryWorkspaceClient";

export const metadata = {
  title: "Story Workspace | Reporter Studio",
  description: "Journalist draft editor and research split workspace.",
};

interface StoryWorkspacePageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryWorkspacePage({ params }: StoryWorkspacePageProps) {
  const { id } = await params;
  return (
    <div className="h-full flex flex-col min-h-0">
      <StoryWorkspaceClient storyId={id} />
    </div>
  );
}
