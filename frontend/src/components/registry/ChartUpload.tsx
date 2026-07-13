import { useState } from "react";
import { Upload, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { extractOrgChart, createDepartmentsBulk } from "@/api/client";
import { useAuthStore } from "@/store/authStore";

interface Candidate {
  id: string;
  text: string;
  accepted: boolean;
}

export function ChartUpload({ onImported }: { onImported: () => void }) {
  const { token } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleExtract() {
    if (!file || !token) return;
    setLoading(true);
    try {
      const result = await extractOrgChart(token, file);
      setCandidates(
        result.candidates.map((text: string, i: number) => ({
          id: `${i}-${text}`,
          text,
          accepted: true,
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  function updateCandidate(id: string, text: string) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  function toggleCandidate(id: string) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, accepted: !c.accepted } : c)));
  }

  async function handleConfirm() {
    if (!token) return;
    const names = candidates.filter((c) => c.accepted && c.text.trim()).map((c) => c.text.trim());
    if (names.length === 0) {
      toast.error("No departments selected");
      return;
    }
    setSubmitting(true);
    try {
      await createDepartmentsBulk(token, names);
      toast.success(`${names.length} departments added`);
      setCandidates([]);
      setFile(null);
      onImported();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save departments");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import Departments from Org Chart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/20 p-4 md:flex-row md:items-center">
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button disabled={!file || loading} onClick={handleExtract}>
            <Upload className="mr-2 h-4 w-4" />
            {loading ? "Extracting..." : "Extract Departments"}
          </Button>
        </div>

        {candidates.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Review extracted names below. Edit or uncheck any that are wrong, then confirm.
            </p>
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                <button onClick={() => toggleCandidate(c.id)} type="button">
                  {c.accepted ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
                </button>
                <Input
                  value={c.text}
                  onChange={(e) => updateCandidate(c.id, e.target.value)}
                  className={c.accepted ? "" : "opacity-50"}
                />
              </div>
            ))}
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Saving..." : "Confirm & Add Departments"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}