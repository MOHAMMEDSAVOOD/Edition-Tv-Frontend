"use client";
import { useState } from "react";
import { UploadCloud, Image as ImageIcon, FileAudio, FileText, Check } from "lucide-react";

interface FieldUploadItem {
  id: string;
  name: string;
  type: "photo" | "audio" | "notes";
  size: string;
  timestamp: string;
}

const INITIAL_UPLOADS: FieldUploadItem[] = [
  { id: "u-1", name: "geneva-press-conference-mic.wav", type: "audio", size: "12.4 MB", timestamp: "30 mins ago" },
  { id: "u-2", name: "lab-equipment-photo-1.jpg", type: "photo", size: "4.2 MB", timestamp: "2 hours ago" },
  { id: "u-3", name: "interview-transcript-raw.txt", type: "notes", size: "128 KB", timestamp: "Yesterday" },
];

export function FieldUploadsClient() {
  const [uploads, setUploads] = useState<FieldUploadItem[]>(INITIAL_UPLOADS);
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newUpload: FieldUploadItem = {
        id: `u-${Date.now()}`,
        name: "mobile-field-interview.wav",
        type: "audio",
        size: "8.1 MB",
        timestamp: "Just now",
      };
      setUploads([newUpload, ...uploads]);
      setIsUploading(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-card border-2 border-dashed border-border rounded-md p-8 text-center space-y-3">
        <UploadCloud className="h-10 w-10 text-primary mx-auto" />
        <div>
          <h3 className="font-bold text-sm text-foreground">Upload Field Audio, Photos, or Transcripts</h3>
          <p className="text-xs text-muted-foreground">Drag and drop files here, or tap to record on mobile devices.</p>
        </div>
        <button
          onClick={handleSimulatedUpload}
          disabled={isUploading}
          className="bg-primary text-primary-foreground font-bold text-xs px-5 py-2 rounded-md hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
        >
          {isUploading ? "Uploading Field Asset..." : "Select Files to Upload"}
        </button>
      </div>

      {/* Uploaded List */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recent Field Uploads ({uploads.length})
        </div>

        <div className="divide-y divide-border text-xs">
          {uploads.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {item.type === "photo" && <ImageIcon className="h-4 w-4" />}
                  {item.type === "audio" && <FileAudio className="h-4 w-4" />}
                  {item.type === "notes" && <FileText className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                  <span className="text-muted-foreground font-mono text-[11px]">{item.size} • {item.timestamp}</span>
                </div>
              </div>

              <span className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                <Check className="h-3 w-3" /> Synced
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
