import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function TopBar() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="top-bar">
      <div className="logo-area"><span>Regix</span></div>
      <div className="top-nav">
        <Link to="/">Despre Noi</Link>
        <a href="#">Legislatie</a>
        <a href="#">SUPORT</a>
        {token
          ? <>
              <Link to="/dashboard">MANAGEMENT</Link>
              <button onClick={handleLogout} className="btn-danger">Deconectare</button>
            </>
          : <Link to="/login">Logare</Link>
        }
      </div>
    </div>
  );
}