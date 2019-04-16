firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        userUid = firebaseUser.uid;
        getUserInfo(userUid);
        getConversations();
        getFriendsList();
        checkForFriendRequests();
        // userStatus();
        //login stuff

    } else {
        // logout
    }
})

// function userStatus() {
//     var userRef = firebase.database().ref('/users/' + userUid + '/status')

//     userRef.set('online');

//     userRef.onDisconnect().set('offline');
//     window.onunload = function () {
//         return userRef.set('offline');
//     }
//     window.onbeforeunload = function () {
//         return userRef.set('offline');
//     }


//     var awayCallback = function () {
//         userRef.set('away');
//     };
//     var awayBackCallback = function () {
//         userRef.set('online');
//     };
//     var hiddenCallback = function () {
//         userRef.set('away');
//     };
//     var visibleCallback = function () {
//         userRef.set('online');
//     };

//     var idle = new Idle({
//         onHidden: hiddenCallback,
//         onVisible: visibleCallback,
//         onAway: awayCallback,
//         onAwayBack: awayBackCallback,
//         awayTimeout: 10000
//     });
// }

function getUserInfo(userUid) {
    firebase.database().ref('/users/' + userUid).on('value', function (snapshot) {
        $('#acountName, #accountNameMobile').html(snapshot.val().displayName);
        $("#displayNameEdit").val(snapshot.val().displayName);
        $('#accountProfileImg, #accountProfileImgMobile, #profileImgDisplayEdit').attr("src", snapshot.val().photoURL);
        $('#showUserID').html(snapshot.val().userID)
        userID = snapshot.val().userID;
        Materialize.updateTextFields();
    });
}

function getConversations() {
    var conversationsRef = firebase.database().ref('users/' + userUid + '/conversations');
    conversationsRef.once("value", snapshot => {
        const userData = snapshot.val();
        if (!userData) {
            $(".conversation-collection").html('');
        }
    });
    conversationsRef.on('child_added', function (data) {
        addConversationElement(data.key);
    });
}

function addConversationElement(key) {
    var firstLoad = true;
    $(".preloader-wrapper").remove();
    $(".conversation-collection").append('<li class="collection-item avatar" data-chat="' + key + '" onclick="switchConversation(\'' + key + '\', true)"></li>');
    var conversationRef = firebase.database().ref('conversations/' + key);
    conversationRef.on('value', function (data) {
        if (data.exists()) {
            if (!firstLoad) {
                var recentMessageNotifyRef = firebase.database().ref('conversations/' + key + '/messages').limitToLast(1);
                recentMessageNotifyRef.on('child_added', function (data) {
                    if (data.val().sender != userUid) {
                        new Notification(data.val().message);
                    }
                });
                recentMessageNotifyRef.off();
            }
            firstLoad = false;
            $(".collection-item[data-chat = " + key + "]").html('<img src="' + data.val().icon + '" alt="" class="circle">\
                <span class="title truncate">' + data.val().title + '</span>\
                <p class="lastmessage-'+ key + ' truncate"><script>getLastMessage(\'' + key + '\')</script></p>');
        }
    });
}