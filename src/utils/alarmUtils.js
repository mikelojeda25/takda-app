import {
  format,
  addDays,
  nextDay,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  parseISO,
} from "date-fns";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getNextAlarmDate = (alarm) => {
  const now = new Date();
  const [h, m] = alarm.time.split(":").map(Number);

  if (alarm.repeat === "once") {
    const d = alarm.date ? parseISO(alarm.date) : now;
    let target = setSeconds(setMinutes(setHours(new Date(d), h), m), 0);
    return target;
  }

  if (alarm.repeat === "daily") {
    let target = setSeconds(setMinutes(setHours(new Date(now), h), m), 0);
    if (isBefore(target, now)) target = addDays(target, 1);
    return target;
  }

  if (alarm.repeat === "weekly" && alarm.days?.length) {
    const dayIndexes = alarm.days.map((d) => DAYS.indexOf(d));
    let nearest = null;
    for (let i = 0; i < 7; i++) {
      const candidate = addDays(now, i);
      const dayIdx = candidate.getDay();
      if (dayIndexes.includes(dayIdx)) {
        let t = setSeconds(setMinutes(setHours(new Date(candidate), h), m), 0);
        if (i === 0 && isBefore(t, now)) continue;
        nearest = t;
        break;
      }
    }
    return nearest;
  }

  if (alarm.repeat === "monthly") {
    let target = setSeconds(setMinutes(setHours(new Date(now), h), m), 0);
    target.setDate(alarm.monthDay || 1);
    if (isBefore(target, now)) {
      target.setMonth(target.getMonth() + 1);
    }
    return target;
  }

  return null;
};

export const formatRepeat = (alarm) => {
  if (alarm.repeat === "once") return "Once";
  if (alarm.repeat === "daily") return "Every day";
  if (alarm.repeat === "weekly" && alarm.days?.length) {
    if (alarm.days.length === 7) return "Every day";
    if (
      JSON.stringify(alarm.days) ===
      JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri"])
    )
      return "Weekdays";
    if (JSON.stringify(alarm.days) === JSON.stringify(["Sat", "Sun"]))
      return "Weekends";
    return alarm.days.join(", ");
  }
  if (alarm.repeat === "monthly") return `Monthly on day ${alarm.monthDay}`;
  return "";
};

export const scheduleLocalAlarm = (alarm, onRing) => {
  const next = getNextAlarmDate(alarm);
  if (!next) return null;
  const ms = next.getTime() - Date.now();
  if (ms < 0) return null;
  const timeout = setTimeout(() => {
    onRing(alarm);
  }, ms);
  return timeout;
};

export const generateInviteCode = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const seg = (n) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${seg(3)}-${seg(3)}-${seg(4)}`;
};
