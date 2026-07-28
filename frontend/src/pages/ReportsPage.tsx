import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFiles } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Archives & Reports</p>
            <h1 className="mt-2 text-2xl font-semibold">File Archive</h1>
            <p className="mt-3 text-sm text-muted-foreground">View and manage archived documents and reports.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All Archived Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Archive className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No archived files yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{file.filename}</p>
                      <Badge variant="outline">{file.register_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Uploaded {formatDate(file.uploaded_at)}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
