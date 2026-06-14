import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatRepeat, getNextAlarmDate } from "../utils/alarmUtils";
import { format, formatDistanceToNow } from "date-fns";

const FIVE_MINUTES = 5 * 60 * 1000;

export default function AlarmDetailModal({ alarm, currentUser, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const isManager = alarm.createdBy === currentUser.uid;
  const nextDate = alarm.active ? getNextAlarmDate(alarm) : null;

  useEffect(() => {
    const q = query(
      collection(db, "alarms", alarm.id, "comments"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [alarm.id]);

  const sendComment = async () => {
    if (!text.trim()) return;
    setSending(true);
    await addDoc(collection(db, "alarms", alarm.id, "comments"), {
      text: text.trim(),
      uid: currentUser.uid,
      name: currentUser.displayName,
      photoURL: currentUser.photoURL,
      createdAt: serverTimestamp(),
    });
    setText("");
    setSending(false);
  };

  const deleteComment = async (comment) => {
    await deleteDoc(doc(db, "alarms", alarm.id, "comments", comment.id));
  };

  const canDelete = (comment) => {
    if (isManager) return true;
    if (comment.uid !== currentUser.uid) return false;
    if (!comment.createdAt) return true;
    const ms = Date.now() - comment.createdAt.toMillis();
    return ms < FIVE_MINUTES;
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-creator-photo">
            <img src={alarm.creatorPhoto} alt={alarm.creatorName} />
          </div>
          <div className="detail-header-info">
            <h2 className="detail-title">{alarm.title}</h2>
            {alarm.description && (
              <p className="detail-desc">{alarm.description}</p>
            )}
            <p className="detail-by">by {alarm.creatorName}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Alarm info */}
        <div className="detail-meta">
          <span className="detail-time">
            {(() => {
              const [h, m] = alarm.time.split(":").map(Number);
              const ampm = h >= 12 ? "PM" : "AM";
              const hour = h % 12 || 12;
              return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
            })()}
          </span>
          <span className="alarm-repeat">{formatRepeat(alarm)}</span>
          {nextDate && (
            <span className="alarm-next">
              Next: {format(nextDate, "EEE, MMM d")}
            </span>
          )}
        </div>

        {/* Members */}
        {alarm.memberDetails?.length > 0 && (
          <div className="detail-members">
            <p className="detail-section-label">Members</p>
            <div className="detail-members-list">
              {alarm.memberDetails.map((m) => (
                <div key={m.uid} className="detail-member">
                  <img
                    src={m.photoURL}
                    alt={m.name}
                    className="member-avatar"
                  />
                  <span className="member-name">{m.name}</span>
                  {m.uid === alarm.createdBy && (
                    <span className="owner-badge">Manager</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-divider" />

        {/* Comments */}
        <div className="detail-comments">
          <p className="detail-section-label">Comments</p>
          <div className="comments-list">
            {comments.length === 0 && (
              <p className="no-comments">Wala pang comment. Maging una!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <img src={c.photoURL} alt={c.name} className="comment-avatar" />
                <div className="comment-body">
                  <div className="comment-meta">
                    <span className="comment-name">{c.name}</span>
                    <span className="comment-time">
                      {c.createdAt
                        ? formatDistanceToNow(c.createdAt.toDate(), {
                            addSuffix: true,
                          })
                        : "just now"}
                    </span>
                    {canDelete(c) && (
                      <button
                        className="comment-delete"
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Please confirm that you want to permanently DELETE this comment. This action cannot be reversed.",
                          );

                          if (confirmed) {
                            deleteComment(c);
                          }
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="detail-input-area">
          <img src={currentUser.photoURL} alt="" className="comment-avatar" />
          <textarea
            className="comment-input"
            placeholder="Write a comment… (Enter to send)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="comment-send"
            onClick={sendComment}
            disabled={sending || !text.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
