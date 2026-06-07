import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlarms } from "../hooks/useAlarms";
import AlarmCard from "../components/AlarmCard";
import AlarmModal from "../components/AlarmModal";
import AlarmRing from "../components/AlarmRing";
import InviteModal from "../components/InviteModal";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, userProfile, logout, loading } = useAuth();
  const [ringing, setRinging] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editAlarm, setEditAlarm] = useState(null);
  const [inviteAlarm, setInviteAlarm] = useState(null);
  const [filter, setFilter] = useState("all"); // all | mine | team

  const { alarms, createAlarm, updateAlarm, deleteAlarm, toggleAlarm } =
    useAlarms((alarm) => setRinging(alarm));

  if (loading) return <div className="splash">Loading…</div>;
  if (!user) return <Navigate to="/" />;

  const filtered = alarms.filter((a) => {
    if (filter === "mine") return a.createdBy === user.uid;
    if (filter === "team") return a.createdBy !== user.uid;
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
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <img src="/alarm-icon.webp" alt="takda" className="home-icon" />
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

      {/* Filter */}
      <div className="dash-filters">
        {["all", "mine", "team"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All Alarms"
              : f === "mine"
                ? "My Alarms"
                : "Team Alarms"}
          </button>
        ))}
      </div>

      {/* Alarm list */}
      <main className="dash-main">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⏰</div>
            <p>Wala pang alarm.</p>
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
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setShowCreate(true)}>
        +
      </button>

      {/* Modals */}
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
      {ringing && (
        <AlarmRing alarm={ringing} onDismiss={() => setRinging(null)} />
      )}
    </div>
  );
}
