import { formatRepeat, getNextAlarmDate } from "../utils/alarmUtils";
import { format } from "date-fns";
import { Users, Pencil, Trash2, UserPlus } from "lucide-react";

export default function AlarmCard({
  alarm,
  currentUser,
  onToggle,
  onEdit,
  onDelete,
  onInvite,
  onDetail,
}) {
  const isOwner = alarm.createdBy === currentUser.uid;
  const nextDate = alarm.active ? getNextAlarmDate(alarm) : null;

  return (
    <div
      className={`alarm-card ${alarm.active ? "active" : "inactive"}`}
      onClick={() => onDetail(alarm)}
      style={{ cursor: "pointer" }}
    >
      <div className="alarm-card-left">
        <div className="alarm-time">
          {(() => {
            const [h, m] = alarm.time.split(":").map(Number);
            const ampm = h >= 12 ? "PM" : "AM";
            const hour = h % 12 || 12;
            return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
          })()}
        </div>
        <div className="alarm-title">{alarm.title}</div>
        {alarm.description && (
          <div className="alarm-desc">{alarm.description}</div>
        )}
        <div className="alarm-meta" style={{ alignItems: "center" }}>
          <span className="alarm-repeat">{formatRepeat(alarm)}</span>
          {nextDate && (
            <span className="alarm-next">
              Next: {format(nextDate, "EEE, MMM d")}
            </span>
          )}
        </div>
        <div className="alarm-members">
          <span className="member-count">
            <Users size={13} /> {alarm.members?.length || 1} member
            {alarm.members?.length !== 1 ? "s" : ""}
          </span>
          {isOwner && <span className="owner-badge">Manager</span>}
        </div>
      </div>
      <div className="alarm-card-right" onClick={(e) => e.stopPropagation()}>
        <label className="toggle">
          <input
            type="checkbox"
            checked={alarm.active}
            onChange={() => onToggle(alarm.id, alarm.active)}
          />
          <span className="toggle-slider" />
        </label>
        <div className="alarm-actions">
          {isOwner && (
            <>
              <button
                className="action-btn"
                onClick={() => onInvite(alarm)}
                title="Invite team"
              >
                <UserPlus size={15} />
              </button>
              <button
                className="action-btn"
                onClick={() => onEdit(alarm)}
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                className="action-btn danger"
                onClick={() => onDelete(alarm.id)}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          {!isOwner && (
            <span className="alarm-creator">by {alarm.creatorName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
