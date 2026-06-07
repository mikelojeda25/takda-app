import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBotTZ6easx9iXUO17lghg6dWRXusfsYS4",
  authDomain: "takda-8de4d.firebaseapp.com",
  projectId: "takda-8de4d",
  storageBucket: "takda-8de4d.firebasestorage.app",
  messagingSenderId: "1001772889118",
  appId: "1:1001772889118:web:d2a17edac9c6985ffb6a0f",
  measurementId: "G-5WB517LK4Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("FCM not supported in this environment");
}

export const VAPID_KEY = "BLWJ0fTIa4Yqth7uRR5Kf6dODGOr1fzQPXw8UfWjTF0vlVDdqp2b80wp1cV3-n0ZWoQxZyusaeVJI9iG-BZnDT4";

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    }
  } catch (e) {
    console.error("Notification permission error:", e);
  }
  return null;
};

export { onMessage };
