import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/client";
import { useAuthStore } from "../store/authStore";
import TopBar from "../components/TopBar";

export default function LoginPage() {
  const { setToken } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [company_name, setCompanyName] = useState("");
  const [status, setStatus] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    const data = isRegistering
      ? await registerUser(username, company_name, password)
      : await loginUser(username, password);

    if (isRegistering) {
      if (data.message) {
        setStatus("Înregistrare cu succes! Autentificați-vă.");
        setIsRegistering(false);
        window.location.reload();
      } else {
        setStatus(`Eroare: ${data.detail}`);
      }
    } else {
      if (data.access_token) {
        setToken(data.access_token);
        navigate("/dashboard");
      } else {
        setStatus(`Eroare: ${data.detail}`);
      }
    }
  };

  return (
    <>
      <TopBar />
      <div className="hero-header" style={{ textAlign: "center", padding: "30px" }}>
        Acces Securizat Sistem
      </div>
      <div className="main-content auth-container">
        <div className="corporate-card">
          <h3 style={{ textAlign: "center" }}>{isRegistering ? "Creare Cont Nou" : "Autentificare Utilizator"}</h3>
          <form onSubmit={handleAuth} autoComplete="off">
            <div className="form-group">
              <label>Nume Utilizator</label>
              <input className="form-control" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            {isRegistering && (
            <div className="form-group">
              <label>Nume Companie</label>
              <input 
                className="form-control" 
                type="text" 
                value={company_name} 
                onChange={e => setCompanyName(e.target.value)} 
                required 
              />
            </div>
            )}
            <div className="form-group">
              <label>Parolă</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
              {isRegistering ? "Înregistrare" : "Autentificare"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={() => setIsRegistering(!isRegistering)} className="btn-link">
              {isRegistering ? "Aveți deja un cont? Autentificați-vă" : "Nu aveți cont? Solicitați acces"}
            </button>
          </div>
          {status && <div className="status-msg">{status}</div>}
        </div>
      </div>
    </>
  );
}