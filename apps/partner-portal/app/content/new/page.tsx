import { PartnerEditorClient } from "@/components/editor/PartnerEditorClient";

export const metadata = {
  title: "New Content Entry | Edition TV Partner Portal",
  description: "Create a new article or editorial entry in Content Studio.",
};

export default function NewContentPage() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <PartnerEditorClient isNew />
    </div>
  );
}
