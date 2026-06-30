import { useState } from "react";
import { uploadFile, createEntry } from "../api/client";
import { useAuthStore } from "../store/authStore";
import UploadData from "./UploadData";

export default function UploadCard({ registerType, onUploadSuccess }) {
  const { token } = useAuthStore();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [showData,setShowData] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
  setShowData(true); 
  };

  const handleConfirm = async (formData) => {
  setShowData(false);
    setStatus("Se încarcă...");

    try {
      // 1. upload the file
      const uploadData = await uploadFile(token, file, registerType);
      const fileId = uploadData.file_id ?? null;

      // 2. save the metadata entry
      await createEntry(token, { ...formData, file_id: fileId });

      setStatus(`Încărcat cu succes în: ${registerType.toUpperCase()}`);
      setFile(null);
      document.getElementById("fileUploadInput").value = "";
      onUploadSuccess();
    } catch (err) {
      setStatus("Eroare la încărcare.");
    }
  };

  const handleCancel = () => {
  setShowData(false);
    setFile(null);
    document.getElementById("fileUploadInput").value = "";
  };

  return (
    <>
      {showData && (
        <UploadData
          registerType={registerType}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <div className="corporate-card">
        <h3>Adăugare Document — <span style={{ color: "var(--brand-blue)" }}>{registerType.toUpperCase()}</span></h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Selectați fișierul PDF:</label>
            <input
              id="fileUploadInput"
              type="file"
              accept="application/pdf"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {status && <div className="status-msg">{status}</div>}
      </div>
    </>
  );
}