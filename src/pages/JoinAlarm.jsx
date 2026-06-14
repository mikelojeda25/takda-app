import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function JoinAlarm() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | joining | done | error | notfound
  const [alarmTitle, setAlarmTitle] = useState("");

  const handleJoin = async () => {
    if (!code.trim()) return;
    if (!user) {
      setStatus("login");
      return;
    }

    setStatus("joining");
    try {
      const q = query(
        collection(db, "alarms"),
        where("inviteCode", "==", code.trim().toLowerCase()),
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setStatus("notfound");
        return;
      }

      const alarmDoc = snap.docs[0];
      const data = alarmDoc.data();
      setAlarmTitle(data.title);

      if (!data.members.includes(user.uid)) {
        await updateDoc(doc(db, "alarms", alarmDoc.id), {
          members: arrayUnion(user.uid),
          memberDetails: arrayUnion({
            uid: user.uid,
            name: user.displayName,
            photoURL: user.photoURL,
          }),
        });
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
        <h2>Join an Alarm</h2>

        {!user && !loading && (
          <>
            <p>Sign in first to join an alarm.</p>
            <button className="google-btn" onClick={login}>
              Continue with Google
            </button>
          </>
        )}

        {user && status !== "done" && (
          <>
            <p>Enter the invite code shared by your team.</p>
            <div className="invite-link-box">
              <input
                type="text"
                placeholder="e.g. hde-rfr-1234"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  background: "#1e1e2e",
                  color: "white",
                }}
              />
              <button
                className="btn-save"
                onClick={handleJoin}
                disabled={status === "joining"}
              >
                {status === "joining" ? "Joining…" : "Join"}
              </button>
            </div>
            {status === "notfound" && (
              <p style={{ color: "salmon" }}>
                ❌ Code not found. Double-check and try again.
              </p>
            )}
            {status === "error" && (
              <p style={{ color: "salmon" }}>
                Something went wrong. Try again.
              </p>
            )}
          </>
        )}

        {status === "done" && (
          <>
            <h2>You're in! 🎉</h2>
            <p>
              You joined <strong>"{alarmTitle}"</strong>. Redirecting…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
