import { useAuthStore } from "@/store/authStore";
import type {
  AdminStats,
  AuthResponse,
  DocumentEntry,
  EntryPayload,
  NamedEntity,
  NextNumberResponse,
  UploadedFile,
  HistoryEvent,
} from "@/types/registry";
import type { RoleEntity } from "@/types/registry";
const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

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

export async function updateEntryStatus(token: string, entryId: number, status: "validated" | "rejected"): Promise<void> {
  const response = await fetch(`${BASE}/entries/${entryId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to update entry status");
  }
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
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
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
  return jsonRequest<RoleEntity[]>(`${BASE}/roles/`, { headers: authHeaders(token) });
}

export async function createRole(token: string, name: string, permissionLevel: string) {
  const res = await fetch(`${BASE}/roles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, permission_level: permissionLevel }),
  });
  if (!res.ok) throw new Error("Failed to create role");
  return res.json();
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
export async function getEntryHistory(entryId: number): Promise<HistoryEvent[]> {
  const res = await fetch(`${BASE}/entries/${entryId}/history`, {
    headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function addHistoryEvent(entryId: number, status: string, note?: string) {
  const res = await fetch(`${BASE}/entries/${entryId}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error("Failed to add history event");
  return res.json();
}

export async function extractOrgChart(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/departments/extract-chart`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to extract departments");
  return res.json();
}

export async function createDepartmentsBulk(token: string, names: string[]) {
  const res = await fetch(`${BASE}/departments/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ names }),
  });
  if (!res.ok) throw new Error("Failed to create departments");
  return res.json();
}


export async function createInvite(token: string, email: string, roleId?: number) {
  const res = await fetch(`${BASE}/invites/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, role_id: roleId ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send invite");
  }
  return res.json();
}

export async function acceptInvite(payload: { token: string; username: string; password: string }) {
  const res = await fetch(`${BASE}/invites/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to accept invite");
  }
  return res.json();
}

export async function getCompanyUsers(token: string) {
  const res = await fetch(`${BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch users");
  }
  return res.json();
}

export async function removeUser(token: string, userId: number): Promise<void> {
  const response = await fetch(`${BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to remove user");
  }
}

export async function updateUserRole(token: string, userId: number, roleId: number | null): Promise<void> {
  const response = await fetch(`${BASE}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role_id: roleId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to update user role");
  }
}

export async function getPendingNotifications(token: string) {
  const response = await fetch(`${BASE}/entries/pending`, { 
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch pending notifications");
  }
  return response.json();
}