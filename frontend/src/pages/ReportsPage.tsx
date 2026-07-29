import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFiles } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import type { UploadedFile } from "@/types/registry";
import { formatDate } from "@/lib/utils";
import { Download, Archive } from "lucide-react";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadFiles();
  }, [token, navigate]);

  async function loadFiles() {
    if (!token) return;
    setLoading(true);
    try {
      const fileData = await getFiles(token);
      setFiles(fileData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Flattened Header */}
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">File Archive</h1>
        <p className="text-sm text-muted-foreground">View and manage archived documents and reports.</p>
      </section>

      {/* 2. Unified List Container */}
      <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">All Archived Files</h3>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Archive className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No archived files yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
                      <Badge variant="secondary" className="font-normal whitespace-nowrap">
                        {file.register_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 bg-background hover:bg-muted">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}