importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBotTZ6easx9iXUO17lghg6dWRXusfsYS4",
  authDomain: "takda-8de4d.firebaseapp.com",
  projectId: "takda-8de4d",
  storageBucket: "takda-8de4d.firebasestorage.app",
  messagingSenderId: "1001772889118",
  appId: "1:1001772889118:web:d2a17edac9c6985ffb6a0f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/takda-icon.png',
    badge: '/takda-icon.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.alarmId || 'takda-alarm',
  });
});
