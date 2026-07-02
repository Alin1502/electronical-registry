import { getDownloadUrl, removeFile } from "../api/client";
import { useAuthStore } from "../store/authStore";

export default function DocumentList({ files, registerType, onDeleteSuccess }) {
  const { token } = useAuthStore();

  const handleDelete = async (fileId) => {
    if (!confirm("Sigur doriți să ștergeți acest document?")) return;
    const data = await removeFile(token, fileId);
    if (data.status === "success") {
      onDeleteSuccess();
    } else {
      alert(`Eroare: ${data.detail}`);
    }
  };

  const handleDownload = async (fileId) => {
    const data = await getDownloadUrl(token, fileId);
    if (data.download_url) window.open(data.download_url, "_blank");
    else alert(`Eroare: ${data.detail}`);
  };

  const displayed = files.filter(f => f.register_type === registerType);

  return (
    <div className="corporate-card">
      <h3>Documente Arhivate - {registerType.toUpperCase()}</h3>
      {displayed.length === 0
        ? <p style={{ color: "#888", fontStyle: "italic" }}>Nu există documente în acest registru.</p>
        : (
          <ul className="document-list">
            {displayed.map(f => (
              <li key={f.id} className="document-item">
                <div className="document-info">
                  <div className="doc-name">📄 {f.filename}</div>
                  <div className="doc-meta">
                    Registru: {f.register_type.toUpperCase()}
                  </div>
                </div>

                <div className="document-actions">
                  <button
                    onClick={() => handleDownload(f.id)}
                    className="btn-secondary"
                  >
                    Descarcă
                  </button>

                  <button
                    onClick={() => handleDelete(f.id)}
                    className="btn-secondary"
                  >
                    Șterge Fișier
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}