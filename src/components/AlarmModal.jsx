import { useState } from "react";
import { format } from "date-fns";
import { DAYS } from "../utils/alarmUtils";

const REPEAT_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Every Day" },
  { value: "weekly", label: "Weekly" },
];

const DEFAULT_ALARM = {
  title: "",
  description: "",
  time: "08:00",
  date: format(new Date(), "yyyy-MM-dd"),
  repeat: "once",
  days: [],
  monthDay: new Date().getDate(),
  active: true,
};

export default function AlarmModal({ alarm, onSave, onClose }) {
  const [form, setForm] = useState(alarm || DEFAULT_ALARM);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (day) => {
    const days = form.days.includes(day)
      ? form.days.filter((d) => d !== day)
      : [...form.days, day];
    set("days", days);
  };

  const handleSave = () => {
    if (!form.title.trim()) return alert("Pangalan muna ng alarm!");
    if (!form.time) return alert("I-set ang oras!");
    if (form.repeat === "weekly" && form.days.length === 0)
      return alert("Pumili ng kahit isang araw!");
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{alarm ? "Edit Alarm" : "New Project Alarm"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Task</label>
            <input
              type="text"
              placeholder="e.g. Daily Standup, Sprint Review..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              placeholder="What's this alarm for?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>
            {form.repeat === "once" && (
              <div className="form-group flex-1">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Repeat</label>
            <div className="repeat-tabs">
              {REPEAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`repeat-tab ${form.repeat === opt.value ? "active" : ""}`}
                  onClick={() => set("repeat", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            {alarm ? "Save Changes" : "Create Alarm"}
          </button>
        </div>
      </div>
    </div>
  );
}
