import { useState } from "react";
import { Upload, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  extractOrgChart,
  createDepartmentsBulk,
} from "@/api/client";

import { useAuthStore } from "@/store/authStore";

interface Candidate {
  id: string;
  text: string;
  accepted: boolean;
}

export function ChartUpload({
  onImported,
}: {
  onImported: () => void;
}) {
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu se pot extrage departamentele din fișier"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateCandidate(id: string, text: string) {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, text }
          : candidate
      )
    );
  }

  function toggleCandidate(id: string) {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              accepted: !candidate.accepted,
            }
          : candidate
      )
    );
  }

  async function handleConfirm() {
    if (!token) return;

    const names = candidates
      .filter(
        (candidate) =>
          candidate.accepted && candidate.text.trim()
      )
      .map((candidate) => candidate.text.trim());

    if (names.length === 0) {
      toast.error("Niciun departament selectat");
      return;
    }

    setSubmitting(true);

    try {
      await createDepartmentsBulk(token, names);

      toast.success(
        `${names.length} ${
          names.length === 1 ? "departament" : "departamente"
        } adăugate`
      );

      setCandidates([]);
      setFile(null);

      onImported();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu s-au putut adăuga departamentele"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>

      {/* Upload area */}
      <div className="rounded-lg border border-dashed border-border p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium text-foreground">
            Încarcă organigrama
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Selectează un fișier imagine cu structura
            organizației.
          </p>

          <div className="mt-4 flex w-full max-w-xl flex-col gap-2 sm:flex-row">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
              className="bg-background"
            />

            <Button
              disabled={!file || loading}
              onClick={handleExtract}
            >
              <Upload className="mr-2 h-4 w-4" />

              {loading ? "Se analizează..." : "Analizează"}
            </Button>
          </div>

          {file ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Fișier selectat:{" "}
              <span className="text-foreground">
                {file.name}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Extraction results */}
      {candidates.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Departamente identificate
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Verifică rezultatele înainte de a le adăuga în
              organizație.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`group flex items-center gap-3 py-3 ${
                  candidate.accepted
                    ? ""
                    : "opacity-50"
                }`}
              >
                <button
                  onClick={() =>
                    toggleCandidate(candidate.id)
                  }
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={
                    candidate.accepted
                      ? "Exclude departamentul"
                      : "Include departamentul"
                  }
                >
                  {candidate.accepted ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>

                <Input
                  value={candidate.text}
                  onChange={(e) =>
                    updateCandidate(
                      candidate.id,
                      e.target.value
                    )
                  }
                  className={
                    candidate.accepted
                      ? "bg-background"
                      : "border-transparent bg-transparent"
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {
                candidates.filter(
                  (candidate) => candidate.accepted
                ).length
              }{" "}
              selectate
            </p>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting
                ? "Se salvează..."
                : "Adaugă departamentele"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}