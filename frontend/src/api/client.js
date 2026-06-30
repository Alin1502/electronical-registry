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