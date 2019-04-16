var friendsList = [];

$('#newFriendId').keyup(function (e) {
    if (e.keyCode == 13) {
        addFriend();
    }
});

$("#addFrendBtn").click(function () {
    addFriend();
});


function addFriend(userid) {
    if (userID != $('#newFriendId').val()) {
        processAddFriend($('#newFriendId').val());
    } else {
        $('#newFriendId').val('');
        Materialize.updateTextFields();
        Materialize.toast('An error occurred.', 3000);
    }
}

function processAddFriend(userid) {
    firebase.database().ref("users").orderByChild("userID").equalTo(userid).once("value", snapshot => {
        const userData = snapshot.val();
        if (userData) {
            snapshot.forEach(function (childSnapshot) {
                var newPostKey = firebase.database().ref().push().key;
                // check if already friends or already sent
                var requestExists = false;
                var isFriend = false;
                var isRecipient = false;
                firebase.database().ref('/users/' + childSnapshot.key + '/friends/').once('value', function (snapshot) {
                    snapshot.forEach(function (friendSnapshot) {
                        firebase.database().ref("users/" + userUid + "/friends").orderByKey().equalTo(friendSnapshot.key).once("value", checkSnapshot => {
                            const userData = checkSnapshot.val();
                            if (userData) {
                                requestExists = true;
                                if (userData[friendSnapshot.key].recipient) {
                                    isRecipient = true;
                                }
                                if (userData[friendSnapshot.key].friends) {
                                    isFriend = true;
                                }
                            }
                        });
                    });
                }).then(function () {
                    if (requestExists) {
                        if (isRecipient && !isFriend) {
                            Materialize.toast('User already sent you a request.', 3000);
                        } else if (isFriend) {
                            Materialize.toast('Already friends.', 3000);
                        } else {
                            Materialize.toast('Request already sent.', 3000);
                        }
                    } else {
                        var updates = {};
                        updates['/users/' + userUid + '/friends/' + newPostKey + '/friends'] = false;
                        updates['/users/' + userUid + '/friends/' + newPostKey + '/recipient'] = false;
                        updates['/users/' + userUid + '/friends/' + newPostKey + '/userUid'] = childSnapshot.key;
                        updates['/users/' + childSnapshot.key + '/friends/' + newPostKey + '/friends'] = false;
                        updates['/users/' + childSnapshot.key + '/friends/' + newPostKey + '/recipient'] = true;
                        updates['/users/' + childSnapshot.key + '/friends/' + newPostKey + '/userUid'] = userUid;
                        firebase.database().ref().update(updates).then(function () {
                            Materialize.toast('Request sent.', 3000);
                            $('#newFriendId').val('');
                            Materialize.updateTextFields();
                            getFriendsList();
                        }).catch(function (error) {
                            Materialize.toast('An error occurred.', 3000);
                        });
                    }
                });
            });
        } else {
            Materialize.toast('User does not exist.', 3000);
            $('#newFriendId').val('');
            Materialize.updateTextFields();
        }
    });
}

function getFriendsList() {
    friendsList = [];
    $('.friends-collection').empty();

    firebase.database().ref("users/" + userUid + "/friends").once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            getFriendInfo(childSnapshot.key, childSnapshot.val().friends, childSnapshot.val().recipient, childSnapshot.val().userUid)
        });
    });
}

function getFriendInfo(requestID, friends, recipient, userUid) {
    firebase.database().ref('/users/' + userUid).once("value", snapshot => {
        var newfriend = new friend(requestID, userUid, snapshot.val().userID, friends, recipient, snapshot.val().displayName, snapshot.val().photoURL);
        friendsList.push(newfriend);
    }).then(function () {
        processFriendsList();
    });

}


function processFriendsList() {
    $('.friends-collection').empty();
    
    friendsList.forEach(function (friend) {
        var pendingAccept = '';
        if (!friend.friends && friend.recipient) {
            pendingAccept = '<a href="#!" onclick="acceptFriendRequest(\'' + friend.requestID + '\',\'' + friend.uid + '\',\'' + friend.displayName + '\')" class="secondary-content"><i class="material-icons green-text">done</i></a>';
        } else if (!friend.friends) {
            pendingAccept = '<a class="secondary-content"><i class="material-icons blue-text">hourglass_empty</i></a>';
        }
        $('.friends-collection').append('<li class="collection-item">\
                        <div>\
                            <i class="left material-icons">\
                                <img src="'+ friend.photoURL + '" height="24" width="24" alt="" class="circle responsive-img">\
                            </i>\
                            '+ friend.displayName + ' -\
                            <span class="light">'+ friend.userid + '</span>\
                            <a href="#!" onclick="removeFriend(\'' + friend.requestID + '\',\'' + friend.uid + '\',\'' + friend.displayName + '\')" class="secondary-content"><i class="material-icons red-text">\
                                remove_circle</i>\
                            </a>\
                            '+ pendingAccept + '\
                        </div>\
                    </li>')
        addMemberAutocomplete();
    });
}

function friend(f_requestID, f_uid, f_userid, f_friends, f_recipient, f_displayName, f_photoURL) {
    this.requestID = f_requestID
    this.uid = f_uid;
    this.userid = f_userid;
    this.friends = f_friends;
    this.recipient = f_recipient;
    this.displayName = f_displayName;
    this.photoURL = f_photoURL;
}

function acceptFriendRequest(requestID, uid, displayName) {//
    var updates = {};
    updates['/users/' + userUid + '/friends/' + requestID + '/friends'] = true;
    updates['/users/' + uid + '/friends/' + requestID + '/friends'] = true;
    firebase.database().ref().update(updates).then(function () {
        Materialize.toast('Accepted friend request from ' + displayName + '.', 3000);
        getFriendsList();
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });
}

function removeFriend(requestID, uid, displayName) {
    var updates = {};
    updates['/users/' + userUid + '/friends/' + requestID] = null;
    updates['/users/' + uid + '/friends/' + requestID] = null;
    firebase.database().ref().update(updates).then(function () {
        Materialize.toast('Removed ' + displayName + ' from friends list.', 3000);
        getFriendsList();
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });
}

var unresponedFriendRequests = 0;
function checkForFriendRequests(){
    var friendsUpdateRef = firebase.database().ref('/users/' + userUid + '/friends/');
    friendsUpdateRef.on('child_added', function(data) {
        if(!data.val().friends && data.val().recipient){
            unresponedFriendRequests++;
            processCheckForFriendRequests();
        }
    });

    friendsUpdateRef.on('child_changed', function(data) {
        if(data.val().friends && data.val().recipient){
            unresponedFriendRequests--;
            processCheckForFriendRequests();
        }
    });

    friendsUpdateRef.on('child_removed', function(data) {
        unresponedFriendRequests--;
        processCheckForFriendRequests();
    });
}

function processCheckForFriendRequests(){
    if(unresponedFriendRequests>0){
        $('.new-friend-notify').css('display','block');
        Materialize.toast('New friend request.', 3000);
    } else {
        $('.new-friend-notify').css('display','none');
    }
}