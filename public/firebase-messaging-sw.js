importScripts('https://www.gstatic.com/firebasejs/4.13.0/firebase.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyBFW93gd357vPUsvQm0wIddZ4-2PA491eI",
    authDomain: "chat-ca4f6.firebaseapp.com",
    databaseURL: "https://chat-ca4f6.firebaseio.com",
    projectId: "chat-ca4f6",
    storageBucket: "chat-ca4f6.appspot.com",
    messagingSenderId: "903398673995"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('Received background message.',payload);
});