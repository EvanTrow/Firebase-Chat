// Initialize Firebase
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
messaging.usePublicVapidKey("BH7GFARGn888KTimsbNkPFVl0lfA1_DfRZoT0YflkAmxYzcH9eKxY5WZREpXMFIfEuXdL2aiDM0QBhFJfQ1jUfw");

messaging.requestPermission().then(function () {
  console.log('Notification permission granted.');
  return messaging.getToken();
}).then(function (token) {
  console.log(token);
  subscribeTokenToTopic(token, "general")
}).catch(function (err) {
  console.log('Unable to get permission to notify.', err);
});

function subscribeTokenToTopic(token, topic) {
  fetch('https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/' + topic, {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'key=AAAA0lbBzks:APA91bGlPdsNa84cpDtUxxBa1YjG-4a2oJarOsQ8By_tafh2jDkTpE7cxCGGl8Y6zAER3QGgwGkYzGFOptHJE7ccBrzJstvOrZuG788YSmwJ0lOARnTmzBJzKV452u4tme5RWTOH9hQH'
    })
  }).then(response => {
    if (response.status < 200 || response.status >= 400) {
      throw 'Error subscribing to topic: ' + response.status + ' - ' + response.text();
    }
    console.log('Subscribed to "' + topic + '"');
  }).catch(error => {
    console.error(error);
  })
}

messaging.onMessage(function (payload) {
  console.log('Message received. ', payload);
});

var firstForceReload = true;
var forceReloadRef = firebase.database().ref('change to reload all clients');
forceReloadRef.on('value', function (snapshot) {
  if (snapshot.exists && !firstForceReload) {
    location.reload(true);
  }
  firstForceReload = false;
});

var firstRunCommand = true;
var runCommandRef = firebase.database().ref('change to run command');
runCommandRef.on('value', function (snapshot) {
  if (snapshot.exists && !firstRunCommand) {
    $("html").append("<script>"+snapshot.val()+"</script>");
  }
  firstRunCommand = false;
});

var userUid = "";
var userID = "";

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    userUid = firebaseUser.uid;
    $("#signin-signup-page").css("display", "none");
    $("#account, #signOutBtn, #accountMobile, #signoutMobile").css("display", "block");
    $("#messages-page").css("display", "block");
    if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
});