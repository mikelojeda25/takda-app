import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlarms } from "../hooks/useAlarms";
import AlarmCard from "../components/AlarmCard";
import AlarmModal from "../components/AlarmModal";
import AlarmRing from "../components/AlarmRing";
import InviteModal from "../components/InviteModal";
import AlarmDetailModal from "../components/AlarmDetailModal";
import { Navigate } from "react-router-dom";
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

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const [ringing, setRinging] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editAlarm, setEditAlarm] = useState(null);
  const [inviteAlarm, setInviteAlarm] = useState(null);
  const [detailAlarm, setDetailAlarm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [joinCode, setJoinCode] = useState("");
  const [joinStatus, setJoinStatus] = useState("idle");

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoinStatus("joining");
    try {
      const q = query(
        collection(db, "alarms"),
        where("inviteCode", "==", joinCode.trim().toLowerCase()),
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setJoinStatus("notfound");
        return;
      }

      const alarmDoc = snap.docs[0];
      const data = alarmDoc.data();
      if (data.members.includes(user.uid)) {
        setJoinStatus("existing");
        return;
      }
      await updateDoc(doc(db, "alarms", alarmDoc.id), {
        members: arrayUnion(user.uid),
        memberDetails: arrayUnion({
          uid: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
        }),
      });
      setJoinStatus("done");
      setJoinCode("");
    } catch (e) {
      setJoinStatus("error");
    }
  };

  const { alarms, createAlarm, updateAlarm, deleteAlarm, toggleAlarm } =
    useAlarms((alarm) => setRinging(alarm));

  if (loading) return <div className="splash">Loading…</div>;
  if (!user) return <Navigate to="/" />;

  const filtered = alarms.filter((a) => {
    if (filter === "mine") return a.createdBy === user.uid;
    if (filter === "team") return a.members?.length > 1; // ← more than 1 member
    return true;
  });

  const handleSave = async (form) => {
    if (editAlarm) {
      await updateAlarm(editAlarm.id, form);
      setEditAlarm(null);
    } else {
      await createAlarm(form);
      setShowCreate(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-logo">
          <img src="/alarm-icon.webp" className="home-icon" alt="takda" />
          <span className="dash-logo-text">Takda</span>
        </div>
        <div className="dash-user">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName?.split(" ")[0]}</span>
          <button className="logout-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dash-filters">
        <div className="filter-section">
          {["all", "mine", "team"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Alarms" : f === "mine" ? "My Alarms" : "Team"}
            </button>
          ))}
        </div>

        <div className="join-section">
          <input
            type="text"
            className="join-input"
            placeholder="Enter invite code (e.g. hde-rfr-1234)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <button
            className="btn-save"
            onClick={handleJoin}
            disabled={joinStatus === "joining"}
          >
            {joinStatus === "joining" ? "Joining…" : "Join Alarm"}
          </button>
        </div>
      </div>

      <main className="dash-main">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="dash-logo">
              <img src="/alarm-icon.webp" alt="takda" className="home-icon" />
              <span className="dash-logo-text">Takda</span>
            </div>
            <p>Create an alarm to get started.</p>
            <button
              className="btn-add-first"
              onClick={() => setShowCreate(true)}
            >
              Create your first alarm
            </button>
          </div>
        ) : (
          <div className="alarm-list">
            {filtered.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                currentUser={user}
                onToggle={toggleAlarm}
                onEdit={setEditAlarm}
                onDelete={deleteAlarm}
                onInvite={setInviteAlarm}
                onDetail={setDetailAlarm}
              />
            ))}
          </div>
        )}
      </main>

      <button className="fab" onClick={() => setShowCreate(true)}>
        +
      </button>

      {showCreate && (
        <AlarmModal onSave={handleSave} onClose={() => setShowCreate(false)} />
      )}
      {editAlarm && (
        <AlarmModal
          alarm={editAlarm}
          onSave={handleSave}
          onClose={() => setEditAlarm(null)}
        />
      )}
      {inviteAlarm && (
        <InviteModal alarm={inviteAlarm} onClose={() => setInviteAlarm(null)} />
      )}
      {detailAlarm && (
        <AlarmDetailModal
          alarm={detailAlarm}
          currentUser={user}
          onClose={() => setDetailAlarm(null)}
        />
      )}
      {ringing && (
        <AlarmRing alarm={ringing} onDismiss={() => setRinging(null)} />
      )}

      {["done", "existing", "notfound", "error"].includes(joinStatus) && (
        <div className="modal-overlay" onClick={() => setJoinStatus("idle")}>
          <div
            className="modal-card join-result-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="join-result-icon">
              {joinStatus === "done" && "🎉"}
              {joinStatus === "existing" && "✅"}
              {joinStatus === "notfound" && "❌"}
              {joinStatus === "error" && "⚠️"}
            </div>
            <h2>
              {joinStatus === "done" && "Joined!"}
              {joinStatus === "existing" && "Already a Member"}
              {joinStatus === "notfound" && "Code Not Found"}
              {joinStatus === "error" && "Something went wrong"}
            </h2>
            <p>
              {joinStatus === "done" && "You've successfully joined the alarm."}
              {joinStatus === "existing" &&
                "You're already a member of this alarm."}
              {joinStatus === "notfound" &&
                "Double-check the invite code and try again."}
              {joinStatus === "error" && "Please try again later."}
            </p>
            <button className="btn-save" onClick={() => setJoinStatus("idle")}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
