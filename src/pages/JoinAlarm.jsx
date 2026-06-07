import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function JoinAlarm() {
  const { alarmId } = useParams();
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | joining | done | error
  const [alarmTitle, setAlarmTitle] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setStatus("login");
      return;
    }
    joinAlarm();
  }, [user, loading]);

  const joinAlarm = async () => {
    setStatus("joining");
    try {
      const ref = doc(db, "alarms", alarmId);
      const snap = await getDoc(ref);
      if (!snap.exists()) { setStatus("error"); return; }
      const data = snap.data();
      setAlarmTitle(data.title);
      if (!data.members.includes(user.uid)) {
        await updateDoc(ref, { members: arrayUnion(user.uid) });
      }
      setStatus("done");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-icon">⏰</div>
        {status === "loading" && <p>Checking invite…</p>}
        {status === "login" && (
          <>
            <h2>Sign in to join the alarm</h2>
            <button className="google-btn" onClick={login}>
              Continue with Google
            </button>
          </>
        )}
        {status === "joining" && <p>Joining alarm…</p>}
        {status === "done" && (
          <>
            <h2>You're in! 🎉</h2>
            <p>You joined <strong>"{alarmTitle}"</strong>. Redirecting to dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2>Invalid link</h2>
            <p>This invite link is expired or doesn't exist.</p>
            <button className="btn-save" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </>
        )}
      </div>
    </div>
  );
}
