import { useState } from "react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function InviteModal({ alarm, onClose }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `https://takda.netlify.app/join/${alarm.id}`;

  const copy = () => {
    navigator.clipboard.writeText(inviteLink);
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
            Share this link to your team. When they click it, they'll
            automatically join <strong>"{alarm.title}"</strong> and get the
            alarm too.
          </p>
          <div className="invite-link-box">
            <span className="invite-link-text">{inviteLink}</span>
            <button className="copy-btn" onClick={copy}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="invite-note">
            💡 They need to be signed in to Takda first.
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
