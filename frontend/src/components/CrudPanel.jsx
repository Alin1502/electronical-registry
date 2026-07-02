import { useState } from "react";

export default function CrudPanel({ title, items, onCreate, onUpdate, onDelete }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName("");
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    await onUpdate(id, editingName.trim());
    setEditingId(null);
    setEditingName("");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  return (
    <div className="corporate-card">
      <h3>{title}</h3>

      {/* Create */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          className="form-control"
          style={{ flex: 1 }}
          placeholder={`Nume ${title.toLowerCase()}...`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
        />
        <button className="btn-primary" onClick={handleCreate}>Adaugă</button>
      </div>

      {/* List */}
      {items.length === 0
        ? <p style={{ color: "#888", fontStyle: "italic", fontSize: "13px" }}>
            Niciun element adăugat încă.
          </p>
        : (
          <ul className="document-list">
            {items.map(item => (
              <li key={item.id} className="document-item">
                {editingId === item.id ? (
                  <input
                    className="form-control"
                    style={{ flex: 1, marginRight: "10px" }}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleUpdate(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="doc-name" style={{ flex: 1 }}>{item.name}</div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  {editingId === item.id ? (
                    <>
                      <button className="btn-primary" onClick={() => handleUpdate(item.id)}>Salvează</button>
                      <button className="btn-secondary" onClick={() => setEditingId(null)}>Anulează</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={() => startEdit(item)}>Editează</button>
                      <button className="btn-danger" onClick={() => onDelete(item.id)}>Șterge</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}