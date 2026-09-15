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

export function FieldUploadsClient() {
  // TODO: wire uploads to the media backend. Empty until that endpoint is available.
  const [uploads] = useState<FieldUploadItem[]>([]);
  const [isUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = () => {
    // The previous version invented a fixed "mobile-field-interview.wav" entry after a timer, so
    // the list showed assets that were never uploaded anywhere.
    setUploadError("Field uploads are not connected to the media backend yet.");
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
          onClick={handleUpload}
          disabled={isUploading}
          className="bg-primary text-primary-foreground font-bold text-xs px-5 py-2 rounded-md hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
        >
          {isUploading ? "Uploading Field Asset..." : "Select Files to Upload"}
        </button>

        {uploadError && (
          <p className="text-xs text-red-500 font-mono">{uploadError}</p>
        )}
      </div>

      {/* Uploaded List */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recent Field Uploads ({uploads.length})
        </div>

        <div className="divide-y divide-border text-xs">
          {uploads.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground">No field uploads.</p>
          )}
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
