import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import TopBar from "../components/TopBar";
import CrudPanel from "../components/CrudPanel";
import {
  getAdminStats,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getRoles, createRole, updateRole, deleteRole
} from "../api/client";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("ro-RO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

export default function AdminPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    const [s, d, r] = await Promise.all([
      getAdminStats(token),
      getDepartments(token),
      getRoles(token)
    ]);
    if (s && Array.isArray(s.recent_activity) && typeof s.total_documents === "number") {
      setStats(s);
    } else {
      setStats({ total_documents: 0, total_storage_bytes: 0, recent_activity: [] });
    }
    if (Array.isArray(d)) setDepartments(d);
    if (Array.isArray(r)) setRoles(r);
  };

  const refreshDepts = async () => {
    const d = await getDepartments(token);
    if (Array.isArray(d)) setDepartments(d);
  };

  const refreshRoles = async () => {
    const r = await getRoles(token);
    if (Array.isArray(r)) setRoles(r);
  };

  return (
    <>
      <TopBar />
      <div className="hero-header">Panou de Administrare</div>

      <div className="main-content">

        {/* STATS */}
        <div className="corporate-card">
          <h3>Statistici Generale</h3>
          {!stats ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>Se încarcă...</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <div style={statBox}>
                <div style={statLabel}>Total Documente</div>
                <div style={statValue}>{stats.total_documents}</div>
              </div>
              <div style={statBox}>
                <div style={statLabel}>Spațiu Utilizat</div>
                <div style={statValue}>{formatBytes(stats.total_storage_bytes)}</div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <h3 style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>Activitate Recentă</h3>
          {!stats || !Array.isArray(stats.recent_activity) || stats.recent_activity.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic", fontSize: "13px" }}>
              Nicio activitate înregistrată.
            </p>
          ) : (
            <ul className="document-list">
              {stats.recent_activity.map((a, i) => (
                <li key={i} className="document-item">
                  <div>
                    <div className="doc-name">
                      № <span style={{ fontFamily: "var(--font-mono)" }}>{a.nr_inregistrare || "—"}</span>
                      &nbsp;·&nbsp;{a.register_type.toUpperCase()}
                    </div>
                    <div className="doc-meta">
                      {a.rezumat || "Fără rezumat"} · {formatDate(a.timestamp)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DEPARTMENTS */}
        <CrudPanel
          title="Departamente"
          items={departments}
          onCreate={async (name) => { await createDepartment(token, name); refreshDepts(); }}
          onUpdate={async (id, name) => { await updateDepartment(token, id, name); refreshDepts(); }}
          onDelete={async (id) => { await deleteDepartment(token, id); refreshDepts(); }}
        />

        {/* ROLES */}
        <CrudPanel
          title="Roluri"
          items={roles}
          onCreate={async (name) => { await createRole(token, name); refreshRoles(); }}
          onUpdate={async (id, name) => { await updateRole(token, id, name); refreshRoles(); }}
          onDelete={async (id) => { await deleteRole(token, id); refreshRoles(); }}
        />

      </div>
    </>
  );
}

const statBox = {
  background: "var(--gray-bg)",
  border: "1px solid var(--border)",
  borderTop: "3px solid var(--brand-blue)",
  padding: "20px 24px",
};

const statLabel = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--text-muted)",
  fontWeight: 600,
  marginBottom: "8px",
};

const statValue = {
  fontSize: "32px",
  fontFamily: "var(--font-mono)",
  color: "var(--brand-dark)",
  fontWeight: 400,
};