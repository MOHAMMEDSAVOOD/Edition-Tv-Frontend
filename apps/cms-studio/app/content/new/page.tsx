import { CmsEditorClient } from "@/components/editor/CmsEditorClient";

export const metadata = {
  title: "New Content Entry | Edition TV CMS",
  description: "Create a new article or editorial entry in Content Studio.",
};

export default function NewContentPage() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <CmsEditorClient isNew />
    </div>
  );
}
