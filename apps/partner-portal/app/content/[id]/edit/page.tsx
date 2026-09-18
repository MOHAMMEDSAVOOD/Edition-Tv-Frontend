import { PartnerEditorClient } from "@/components/editor/PartnerEditorClient";

export const metadata = {
  title: "Edit Content Entry | Edition TV Partner Portal",
  description: "Edit article entry, version history, and SEO metadata.",
};

interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params;
  return (
    <div className="h-full flex flex-col min-h-0">
      <PartnerEditorClient entryId={id} />
    </div>
  );
}
