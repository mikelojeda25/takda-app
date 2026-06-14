import { useState } from "react";

export default function InviteModal({ alarm, onClose }) {
  const [copied, setCopied] = useState(false);
  const code = alarm.inviteCode || "—";

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card invite-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Invite Team</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="invite-desc">
            Share this code with your team to join{" "}
            <strong>"{alarm.title}"</strong>.
          </p>
          <div className="invite-link-box">
            <span
              className="invite-link-text"
              style={{ letterSpacing: "0.15em", fontWeight: "bold" }}
            >
              {code}
            </span>
            <button className="copy-btn" onClick={copy}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="invite-note">
            💡 They need to be signed in to Takda, then enter this code to join.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-save" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
