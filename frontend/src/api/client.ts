import type {
  AdminStats,
  AuthResponse,
  DocumentEntry,
  EntryPayload,
  NamedEntity,
  NextNumberResponse,
  UploadedFile,
} from "@/types/registry";

const BASE = "http://localhost:8000";

const authHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
});

async function jsonRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await response.json() : null;

  if (!response.ok) {
    const detail = data?.detail ?? "Request failed";
    throw new Error(detail);
  }

  return data as T;
}

export function loginUser(username: string, password: string) {
  return jsonRequest<AuthResponse>(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function registerUser(username: string, company_name: string, password: string) {
  return jsonRequest<AuthResponse>(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, company_name, password }),
  });
}

export function getFiles(token: string) {
  return jsonRequest<UploadedFile[]>(`${BASE}/files/`, { headers: authHeaders(token) });
}

export async function uploadFile(token: string, file: File, registerType: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("register_type", registerType);
  return jsonRequest<{ status: string; message: string; file_id: number }>(`${BASE}/files/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
}

export function removeFile(token: string, fileId: number) {
  return jsonRequest<{ status: string; message: string }>(`${BASE}/files/delete/${fileId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function getDownloadUrl(token: string, fileId: number) {
  return jsonRequest<{ download_url: string }>(`${BASE}/files/download/${fileId}`, {
    headers: authHeaders(token),
  });
}

export function getEntries(token: string, registerType: string) {
  return jsonRequest<DocumentEntry[]>(`${BASE}/entries/${encodeURIComponent(registerType)}`, {
    headers: authHeaders(token),
  });
}

export function getNextNr(token: string, registerType: string) {
  return jsonRequest<NextNumberResponse>(`${BASE}/entries/next-nr/${encodeURIComponent(registerType)}`, {
    headers: authHeaders(token),
  });
}

export function createEntry(token: string, entry: EntryPayload) {
  return jsonRequest<DocumentEntry>(`${BASE}/entries/`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });
}

export async function downloadExcel(token: string, registerType: string) {
  const response = await fetch(`${BASE}/entries/${encodeURIComponent(registerType)}/excel`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error("Nu s-a putut descarca fisierul Excel");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${registerType.replace("/", "-")}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllPdfs(token: string, registerType: string) {
  const response = await fetch(`${BASE}/files/download-all/${encodeURIComponent(registerType)}`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let detail = "Nu s-a putut descarca arhiva.";
    try {
      const data = await response.json();
      detail = data.detail ?? detail;
    } catch {
      // noop
    }
    throw new Error(detail);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${registerType.replace("/", "-")}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getAdminStats(token: string) {
  return jsonRequest<AdminStats>(`${BASE}/admin/stats`, { headers: authHeaders(token) });
}

export function getDepartments(token: string) {
  return jsonRequest<NamedEntity[]>(`${BASE}/departments/`, { headers: authHeaders(token) });
}

export function createDepartment(token: string, name: string) {
  return jsonRequest<NamedEntity>(`${BASE}/departments/`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

export function updateDepartment(token: string, id: number, name: string) {
  return jsonRequest<NamedEntity>(`${BASE}/departments/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

export function deleteDepartment(token: string, id: number) {
  return jsonRequest<{ status: string; message: string }>(`${BASE}/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function getRoles(token: string) {
  return jsonRequest<NamedEntity[]>(`${BASE}/roles/`, { headers: authHeaders(token) });
}

export function createRole(token: string, name: string) {
  return jsonRequest<NamedEntity>(`${BASE}/roles/`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

export function updateRole(token: string, id: number, name: string) {
  return jsonRequest<NamedEntity>(`${BASE}/roles/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

export function deleteRole(token: string, id: number) {
  return jsonRequest<{ status: string; message: string }>(`${BASE}/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
