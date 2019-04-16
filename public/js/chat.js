var activeChat = "";
var lastSender = "";
var chatMembers = [];
var memberCount = 0;

var messagesRef;

var firstSwitch = true;

function getMessages() {
    if (firstSwitch == false) {
        messagesRef.off();
        messagesRef = null;
        memberUpdatesRef.off();
        memberUpdatesRef = null;
    }
    firstSwitch = false;
    $('.messages').html('');

    messagesRef = firebase.database().ref('conversations/' + activeChat + '/messages').limitToLast(100);
    messagesRef.on('child_added', function (data) {
        if (data.val().sender == userUid) {
            if (lastSender == data.val().sender) {
                $('.message-info-sent').last().remove();
            }
            $(".messages").append('<div class="chat-message sent">\
                        <div class="chat-bubble sent">\
                        '+ checkIfImage(data.val().message) + '\
                        </div><br>\
                        <span class="message-info-sent">'+ getMembersDisplayName(data.val().sender) + '</span>\
                    </div>');
            $('.messages').scrollTop($('.messages')[0].scrollHeight);
            scrollImages();
        } else {
            if (lastSender == data.val().sender) {
                $('.message-info-received').last().remove();
            }
            var textColor = 'white-text ';
            var messageColor = getMembersColor(data.val().sender);
            if (messageColor == 'yellow' || messageColor == 'lime' || messageColor == 'amber') {
                textColor = 'black-text ';
            }
            $(".messages").append('<div class="chat-message received">\
                        <div class="chat-bubble received '+ textColor + messageColor + '">\
                        '+ checkIfImage(data.val().message) + '\
                        </div><br>\
                        <a style="color: black" href="#!" onclick="displayUserInfo(\''+ data.val().sender + '\')"><span class="message-info-received">' + getMembersDisplayName(data.val().sender) + '</span><a>\
                    </div>');
            $('.messages').scrollTop($('.messages')[0].scrollHeight);
            scrollImages();
        }
        lastSender = data.val().sender;
    });
    checkForMemberUpdates(activeChat);
}

function checkIfImage(url) {
    var urlTemp = url.split('?')[0];
    var parts = urlTemp.split('.');
    var extension = parts[parts.length - 1];
    var imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp']
    if (imageTypes.indexOf(extension) !== -1) {
        scrollImages();
        $('.messages').scrollTop($('.messages')[0].scrollHeight);
        return '<img class="imgMessage" style="max-width:100%;max-height:100%;" src="' + url + '" alt="' + url + '" />';
    } else {
        return url;
    }
    return url;
}

function scrollImages() {
    $('.imgMessage').one('load', function () {
        console.log('scroll')
        $('.messages').scrollTop($('.messages')[0].scrollHeight);
    });
}

// on press enter in text fields
var canSendTimeOut = true;
$('#message').keyup(function (e) {
    if (e.keyCode == 13) {
        if ($('#message').val().length > 0) {
            if ($('#message').val().length <= 300) {
                if (canSendTimeOut) {
                    var message = $('#message').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    sendMessage(message);
                    $('#message').val('');
                    canSendTimeOut = false
                    setTimeout(function () {
                        canSendTimeOut = true;
                    }, 1500);
                } else {
                    Materialize.toast('Stop spamming!', 1000);
                }
            } else {
                Materialize.toast('Message need to be 300 characters or less.', 1500);
            }
        } else {
            Materialize.toast('Enter a Message.', 1500);
        }
    }
});

var memberUpdatesRef = firebase.database().ref('/conversations/');
function checkForMemberUpdates(key) {
    memberUpdatesRef = firebase.database().ref('/conversations/' + key + '/participants/');
    memberUpdatesRef.on('child_changed', function (data) {
        switchConversation(key, false)
    });
}

function sendMessage(message) {
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var messageRef = firebase.database().ref('conversations/' + activeChat + '/messages');
    messageRef.push({
        message: message,
        timeStamp: moment().unix(),
        sender: userUid
    }).off();
}

function getLastMessage(conversation) {
    var recentMessageRef = firebase.database().ref('conversations/' + conversation + '/messages').limitToLast(1);
    recentMessageRef.on('child_added', function (data) {
        if (data.val().message.includes('<img')) {
            $('.lastmessage-' + conversation).html('Image');
        } else {
            $('.lastmessage-' + conversation).html(data.val().message);
        }

    });
}


function setUpConversationEditor() {
    if (chatPermissionsLevel == 2) {
        $('#deleteConversationBtn').css('display', 'block')
        $('#leaveConversationBtn').css('display', 'none')
        $('#editConversationBtn').css('display', 'block')
        $("#editConversationName").removeAttr('disabled')
    } else if (chatPermissionsLevel == 1) {
        $('#deleteConversationBtn').css('display', 'none')
        $('#leaveConversationBtn').css('display', 'block')
        $('#editConversationBtn').css('display', 'block')
        $("#editConversationName").removeAttr('disabled')
    } else if (chatPermissionsLevel == 0) {
        $('#deleteConversationBtn').css('display', 'none')
        $('#leaveConversationBtn').css('display', 'block')
        $('#editConversationBtn').css('display', 'none')
        $("#editConversationName").attr('disabled', 'disabled')
    }
}

function getMembers(key) {
    chatMembers = [];
    var conversationName = $('.collection-item[data-chat = ' + key + ']').find('.title').html();
    var conversationIcon = $('.collection-item[data-chat = ' + key + ']').find('img').attr('src');

    $('#editConversationName').val(conversationName);
    $('#modalTitleEditConversation').html(conversationName);
    $('#editConversationImgDisplay').attr('src', conversationIcon);
    $('.conversation-member-collection').html('');

    var membersRef = firebase.database().ref('/conversations/' + key + '/participants/');
    membersRef.once('value', function (snapshot) {
        var count = 1;
        snapshot.forEach(function (childSnapshot) {
            memberCount++;
            firebase.database().ref('/conversations/' + key + '/participants/' + childSnapshot.key).once('value').then(function (snapshot) {
                getMembersInfo(childSnapshot.key, snapshot.val().owner, snapshot.val().manager, snapshot.val().color);
            }).then(function () {
                if (count >= snapshot.numChildren()) {
                    if (chatPermissionsLevel > 0) {
                        $('.conversation-member-collection').append('<li class="collection-item"><div><b>Add Member</b><a onclick="getFriendsList();" href="#addMemberModal" class="modal-trigger secondary-content"><i class="material-icons green-text">add_circle</i></a></div></li>');
                    }
                }
                count++;
            });
        });
    });
}

function addToEditCollection(childKey) {
    var managerChecked = '';
    var managerDisabled = '';
    var membersColor = getMembersColor(childKey);
    var removeMemberColor = 'red';
    var removeMemberHref = ' href="#!"';
    var removeMemberOnclick = 'onclick';
    if (getMembersIfManager(childKey)) {
        managerChecked = ' checked="checked"';
    }
    if (getMembersIfOwner(childKey) || childKey == userUid) {
        managerDisabled = ' disabled="disabled"';
        removeMemberColor = 'grey';
        removeMemberHref = '';
        removeMemberOnclick = '';
    }
    if (chatPermissionsLevel > 0) {

        colors = ["f44336", "e91e63", "9c27b0", "673ab7", "3f51b5", "2196f3", "03a9f4", "00bcd4", "009688", "4caf50", "8bc34a", "cddc39", "ffeb3b", "ffc107", "ff9800", "ff5722", "795548", "9e9e9e", "607d8b", "000000"];
        colorsCode = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "grey", "blue-grey", "black"];
        colorsNames = ["Red", "Pink", "Purple", "Deep Purple", "Indigo", "Blue", "Light Blue", "Cyan", "Teal", "Green", "Light Green", "Lime", "Yellow", "Amber", "Orange", "Deep Orange", "Brown", "Grey", "Blue Grey", "Black"];

        colorsOutput = '<option value="" disabled>Member Color</option>';
        cLen = colors.length;
        for (i = 0; i < cLen; i++) {
            if (colorsCode[i] == membersColor) {
                colorsOutput += "<option value='" + colorsCode[i] + "' selected data-icon='https://dummyimage.com/50x50/" + colors[i] + "/" + colors[i] + ".png' class='left circle'>" + colorsNames[i] + "</option>";
            } else {
                colorsOutput += "<option value='" + colorsCode[i] + "' data-icon='https://dummyimage.com/50x50/" + colors[i] + "/" + colors[i] + ".png' class='left circle'>" + colorsNames[i] + "</option>";
            }
        }

        $('.conversation-member-collection').append('<li class="collection-item">\
            <div>\
                <span>'+ getMembersDisplayName(childKey) + '</span>\
                <a'+ removeMemberHref + ' ' + removeMemberOnclick + '="removeMember(\'' + childKey + '\', \'' + getMembersDisplayName(childKey) + '\')" class="secondary-content"><i class="material-icons ' + removeMemberColor + '-text">\
                    remove_circle</i>\
                </a>\
                <span class="CheckBoxItem secondary-content">\
                    <input onchange="editManager(\''+ childKey + '\')" type="checkbox" id="ManagerCheckBox-' + childKey + '"' + managerChecked + managerDisabled + '/><label for="ManagerCheckBox-' + childKey + '">Manager</label>\
                </span>\
                <span class="CheckBoxItem secondary-content">\
                    <div class="input-field">\
                        <select id="memberColorSelect-' + childKey + '" onchange="editMemeberColor(\'' + childKey + '\')">\
                        '+ colorsOutput + '\
                        </select>\
                    </div>\
                </span>\
            </div>\
        </li>')
    } else if (chatPermissionsLevel < 1) {
        $('.conversation-member-collection').append('<li class="collection-item">\
            <div>\
                <span>'+ getMembersDisplayName(childKey) + '</span>\
            </div>\
        </li>')
    }
    $('select').material_select();
}

function getMembersInfo(uid, owner, manager, color) {
    var countMemeberAdd = 1;
    var membersDisplayNameRef = firebase.database().ref('users/' + uid);
    membersDisplayNameRef.once('value').then(function (snapshot) {
        var newChatMember = new chatMember(uid, owner, manager, snapshot.val().displayName, snapshot.val().photoURL, color);
        chatMembers.push(newChatMember);
    }).then(function () {
        addToEditCollection(uid)
        addMessagesPre();
    });
}

var countMemberAdd = 1;
function addMessagesPre() {
    if (countMemberAdd >= memberCount) {
        getMessages();
    }
    countMemberAdd++;
}

//activeChat
function editManager(uid) {
    var updates = {};
    if (getMembersIfManager(uid)) {
        updates['/conversations/' + activeChat + '/participants/' + uid + '/manager'] = false;
        updateChatMember(uid, null, false, null, null, null)
        return firebase.database().ref().update(updates);
    } else {
        updates['/conversations/' + activeChat + '/participants/' + uid + '/manager'] = true;
        updateChatMember(uid, null, true, null, null, null)
        return firebase.database().ref().update(updates);
    }
}

function editMemeberColor(uid) {
    var updates = {};
    updates['/conversations/' + activeChat + '/participants/' + uid + '/color'] = $('#memberColorSelect-' + uid).val();
    updateChatMember(uid, null, null, null, null, $('#memberColorSelect-' + uid).val())
    return firebase.database().ref().update(updates);
}

function chatMember(c_uid, c_owner, c_manager, c_displayName, c_photoURL, c_color) {
    this.uid = c_uid;
    this.owner = c_owner;
    this.manager = c_manager;
    this.displayName = c_displayName;
    this.photoURL = c_photoURL;
    this.color = c_color;
}

function getMembersDisplayName(uid) {
    return chatMembers.find(x => x.uid === uid).displayName;
}
function getMembersIfManager(uid) {
    return chatMembers.find(x => x.uid === uid).manager;
}
function getMembersIfOwner(uid) {
    return chatMembers.find(x => x.uid === uid).owner;
}
function getMembersColor(uid) {
    return chatMembers.find(x => x.uid === uid).color;
}
function getMembersImage(uid) {
    return chatMembers.find(x => x.uid === uid).photoURL;
}


function updateChatMember(uid, c_owner, c_manager, c_displayName, c_photoURL, c_color) {
    var updatingChatMember = chatMembers.find(x => x.uid === uid);
    if (c_owner != null) { updatingChatMember.owner = c_owner; }
    if (c_manager != null) { updatingChatMember.manager = c_manager; }
    if (c_displayName != null) { updatingChatMember.displayName = c_displayName; }
    if (c_photoURL != null) { updatingChatMember.photoURL = c_photoURL; }
    if (c_color != null) { updatingChatMember.color = c_color; }
}

function removeMember(uid, displayName) {
    var updates = {};
    updates['/conversations/' + activeChat + '/participants/' + uid] = null;
    updates['/users/' + uid + '/conversations/' + activeChat] = null;
    firebase.database().ref().update(updates).then(function () {
        Materialize.toast('Removed ' + displayName + ' from conversation.', 3000);
        getMembers(activeChat);
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });
}

var autocompleteData = [];
function addMemberAutocomplete() {
    autocompleteData = [];
    friendsList.forEach(friend => {
        if (friend.friends) {
            try {
                getMembersDisplayName(friend.uid)
            } catch (err) {
                autocompleteData[friend.displayName + " - " + friend.userid] = friend.photoURL;
            }
        }
    });

    $('input.autocomplete').autocomplete({
        data: autocompleteData,
        limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
        onAutocomplete: function (val) {
            // Callback function when value is autcompleted.
            addMemberToConversation(val);
        },
        minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
}

function addMemberToConversation(val) {
    var arr = val.split("-"); var userid = arr[1] + "-" + arr[2]; var userid = userid.slice(1);
    var uid = friendsList.find(x => x.userid === userid).uid;

    colorsCode = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "grey", "blue-grey", "black"];

    var updates = {};
    updates['/conversations/' + activeChat + '/participants/' + uid + '/owner'] = false;
    updates['/conversations/' + activeChat + '/participants/' + uid + '/manager'] = false;
    updates['/conversations/' + activeChat + '/participants/' + uid + '/color'] = colorsCode[Math.floor(Math.random() * colorsCode.length)];;
    updates['/users/' + uid + '/conversations/' + activeChat] = true;
    firebase.database().ref().update(updates).then(function () {
        getMembers(activeChat);
        Materialize.toast('Added ' + arr[0] + ' to conversation.', 3000);
        $('#addMemberDisplayName').val('');
        Materialize.updateTextFields();
        $('#addMemberModal').modal('close');
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });

}