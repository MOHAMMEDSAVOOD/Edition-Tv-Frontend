import { FieldUploadsClient } from "@/components/uploads/FieldUploadsClient";

export const metadata = {
  title: "Field Uploads | Reporter Studio",
  description: "Upload mobile photography, field audio recordings, and raw interview assets.",
};

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Mobile & Field Integration
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Field Uploads</h1>
      </div>

      <FieldUploadsClient />
    </div>
  );
}
