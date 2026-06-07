import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { scheduleLocalAlarm } from "../utils/alarmUtils";

export const useAlarms = (onRing) => {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const timers = useRef({});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "alarms"),
      where("members", "array-contains", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAlarms(data);
      setLoading(false);

      // Clear old timers
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};

      // Schedule local alarms
      data.forEach((alarm) => {
        if (!alarm.active) return;
        const t = scheduleLocalAlarm(alarm, onRing);
        if (t) timers.current[alarm.id] = t;
      });
    });
    return () => {
      unsub();
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [user]);

  const createAlarm = async (alarmData) => {
    await addDoc(collection(db, "alarms"), {
      ...alarmData,
      createdBy: user.uid,
      creatorName: user.displayName,
      members: [user.uid],
      active: true,
      createdAt: serverTimestamp(),
    });
  };

  const updateAlarm = async (id, data) => {
    await updateDoc(doc(db, "alarms", id), data);
  };

  const deleteAlarm = async (id) => {
    await deleteDoc(doc(db, "alarms", id));
  };

  const toggleAlarm = async (id, current) => {
    await updateDoc(doc(db, "alarms", id), { active: !current });
  };

  return { alarms, loading, createAlarm, updateAlarm, deleteAlarm, toggleAlarm };
};
