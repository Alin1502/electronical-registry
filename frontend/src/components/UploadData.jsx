import { useState } from "react";

const FIELDS = [
  { key: "nr_inregistrare", label: "Nr Înregistrare" },
  { key: "cod", label: "Cod" },
  { key: "iesire_intrare", label: "Ieșire / Intrare" },
  { key: "nr_data_emitent", label: "Nr/Data Emitent" },
  { key: "nr_data_destinator", label: "Nr/Data Destinatar" },
  { key: "rezumat", label: "Rezumat" },
  { key: "repartizare_dpt", label: "Repartizare Departament" },
  { key: "mod_rezolvare", label: "Mod Rezolvare" },
  { key: "nr_pag_anexe", label: "Nr Pag & Nr Anexe" },
];

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, ""]));

export default function UploadData({ registerType, onConfirm, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ ...form, register_type: registerType });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: "20px" }}>
          Date Document — <span style={{ color: "var(--brand-blue)" }}>{registerType.toUpperCase()}</span>
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="form-group" style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.85rem" }}>{label}</label>
                <input
                  className="form-control"
                  type="text"
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
            <button type="button" className="btn-danger" onClick={onCancel}>Anulează</button>
            <button type="submit" className="btn-primary">Confirmă și Încarcă</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "white", borderRadius: "8px",
    padding: "30px", width: "600px",
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px"
  }
};