const BASE = "http://localhost:8000";

const authHeaders = (token) => ({
  "Authorization": `Bearer ${token}`
});
const fetchFiles = async () => {
  const data = await getFiles(token);
  console.log("refetched files:", data);
  if (Array.isArray(data)) setFiles(data);
};
export const loginUser = (username, password) =>
  fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  }).then(r => r.json());

export const registerUser = (username,company_name, password) =>
  fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, company_name,password })
  }).then(r => r.json());

export const getFiles = (token) =>
  fetch(`${BASE}/files/`, { headers: authHeaders(token) }).then(r => r.json());

export const uploadFile = (token, file, registerType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("register_type", registerType);
  return fetch(`${BASE}/files/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData
  }).then(r => r.json());
};

export const getDownloadUrl = (token, fileId) =>
  fetch(`${BASE}/files/download/${fileId}`, {
    headers: authHeaders(token)
  }).then(r => r.json());


export const removeFile = (token, fileId) =>
  fetch(`${BASE}/files/delete/${fileId}`,{
     method: "DELETE",
     headers: authHeaders(token)
  }).then(r=>r.json());


export const createEntry = (token, entry) =>
  fetch(`${BASE}/entries/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(entry)
  }).then(r => r.json());

export const getEntries = (token, registerType) =>
  fetch(`${BASE}/entries/${encodeURIComponent(registerType)}`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());

export const downloadExcel = (token, registerType) =>
  fetch(`${BASE}/entries/${encodeURIComponent(registerType)}/excel`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(async res => {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${registerType}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  });

//departments
export const getDepartments = (token) =>
  fetch(`${BASE}/departments/`,{
    headers: authHeaders(token)
}).then(r => r.json())

export const createDepartment = (token, name) =>
  fetch(`${BASE}/departments/`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }).then(r => r.json()); 

export const updateDepartment = (token, id, name) =>
  fetch(`${BASE}/departments/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }).then(r => r.json());

export const deleteDepartment = (token, id) =>
  fetch(`${BASE}/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(r => r.json());

// Roles
export const getRoles = (token) =>
  fetch(`${BASE}/roles/`, {
    headers: authHeaders(token)
  }).then(r => r.json());

export const createRole = (token, name) =>
  fetch(`${BASE}/roles/`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }).then(r => r.json());

export const updateRole = (token, id, name) =>
  fetch(`${BASE}/roles/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }).then(r => r.json());

export const deleteRole = (token, id) =>
  fetch(`${BASE}/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  }).then(r => r.json());

// Admin stats
export const getAdminStats = (token) =>
  fetch(`${BASE}/admin/stats`, {
    headers: authHeaders(token)
  }).then(r => r.json());

export const getNextNr = (token, registerType) =>
  fetch(`${BASE}/entries/next-nr/${encodeURIComponent(registerType)}`, {
    headers: authHeaders(token)
  }).then(r => r.json());

export const downloadAllPdfs = (token, registerType) =>
  fetch(`${BASE}/files/download-all/${encodeURIComponent(registerType)}`, {
    headers: authHeaders(token)
  }).then(async res => {
    if (!res.ok) {
      const err = await res.json();
      alert(`Eroare: ${err.detail}`);
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${registerType.replace("/", "-")}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  });