import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { accessSecureDocument, uploadSecureDocument } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

export default function SecureDocumentsPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isAdmin = Boolean(user?.is_owner || user?.permission_level === "full_access");

  const [searchCode, setSearchCode] = useState("");
  const [uploadCode, setUploadCode] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [issuedCode, setIssuedCode] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  if (!token) return null;

  async function handleSearch() {
    if (!token) return;
    if (!searchCode.trim()) {
      toast.error("Enter a secure code first");
      return;
    }

    setSearching(true);
    try {
      const result = await accessSecureDocument(token, searchCode);
      const downloadUrl = URL.createObjectURL(result.blob);
      const viewer = window.open(downloadUrl, "_blank", "noopener,noreferrer");

      if (!viewer) {
        URL.revokeObjectURL(downloadUrl);
        throw new Error("Popup blocked. Allow popups to view the PDF.");
      }

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
      toast.success("Secure file opened");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlock secure file");
    } finally {
      setSearching(false);
    }
  }

  async function handleUpload() {
    if (!token || !selectedFile) return;
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadSecureDocument(token, selectedFile, "secure-documents", uploadCode);
      setIssuedCode(result.access_code);
      setSelectedFile(null);
      setUploadCode("");
      toast.success("Secure file encrypted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function copyIssuedCode() {
    if (!issuedCode) return;
    await navigator.clipboard.writeText(issuedCode);
    toast.success("Code copied to clipboard");
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-[0.24em]">Protected archive</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Secure Documents</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
            Paste a verification code in order to access the file
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">Unlock by code</h2>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Paste secure code"
              value={searchCode}
              onChange={(event) => setSearchCode(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto">
              {searching ? "Opening..." : "View PDF"}
            </Button>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Access is checked on the server. The file stays encrypted in storage until a valid code is submitted.
          </div>
        </section>

        {isAdmin ? (
          <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-foreground" />
              <h2 className="text-base font-semibold text-foreground">Encrypt a document</h2>
            </div>
            <div className="space-y-4">
              <Input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
              <Input
                placeholder="Optional custom code, leave empty to generate one"
                value={uploadCode}
                onChange={(event) => setUploadCode(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full sm:w-auto">
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? "Encrypting..." : "Encrypt and upload"}
              </Button>
            </div>

            {issuedCode ? (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-foreground">Share this code with authorized users</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono tracking-[0.14em]">
                    {issuedCode}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={copyIssuedCode}>
                    Copy code
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}