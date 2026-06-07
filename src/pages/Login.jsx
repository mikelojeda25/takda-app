import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, login, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo login-logo-image">
          <img src="/alarm-icon.webp" alt="takda" className="logo-icon" />
          <h1 className="logo-text">TAKDA</h1>
          <p className="logo-sub">by Michael Joseph Ojeda</p>
        </div>
        <button className="google-btn" onClick={login}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.7 19.4-20 0-1.3-.1-2.7-.4-4z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.9C9.7 39.7 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41.3 35.5 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"
            />
          </svg>
          Continue with Google
        </button>
        <p className="login-hint">Sign in to sync alarms with your teammates</p>
      </div>
    </div>
  );
}
