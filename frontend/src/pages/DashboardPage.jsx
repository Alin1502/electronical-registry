import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFiles, downloadExcel, downloadAllPdfs } from "../api/client";
import { useAuthStore } from "../store/authStore";
import TopBar from "../components/TopBar";
import UploadCard from "../components/UploadCard";
import DocumentList from "../components/DocumentList";

const REGISTERS = [
  "contracte", "intrari/iesiri", "decizii/hotarari", "facturi",
  "jurnal", "inventar", "casa", "unic de control", "evidenta a salariatilor"
];

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [registerType, setRegisterType] = useState(REGISTERS[0]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchFiles();
  }, [token]);

  const fetchFiles = async () => {
    const data = await getFiles(token);
    if (Array.isArray(data)) setFiles(data);
  };

  return (
    <>
      <TopBar />
      <div className="hero-header">Sistem Electronic de Registratură {user?.company_name}</div>
      <div className="sub-nav">
        {REGISTERS.map(r => (
          <button key={r} className={registerType === r ? "active" : ""} onClick={() => setRegisterType(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="main-content">
        <div className="intro-text">Platforma de Gestionare a Documentelor Digitale</div>
        <UploadCard registerType={registerType} onUploadSuccess={fetchFiles} />
        <DocumentList files={files} registerType={registerType} onDeleteSuccess={fetchFiles} />
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
  <button
        className="btn-secondary"
        style={{ transition: "none", animation: "none" }}
        onClick={() => downloadExcel(token, registerType)}
      >
        Descarcă Excel — {registerType.toUpperCase()}
      </button>
      <button
        className="btn-secondary"
        style={{ transition: "none", animation: "none" }}
        onClick={() => downloadAllPdfs(token, registerType)}
      >
        Descarcă Toate PDF-urile — {registerType.toUpperCase()}
      </button>
    </div>
      </div>
    </>
  );
}