var enableConversationImgEdit = false;
var chatPermissionsLevel = 0;

function switchConversation(key, selected) {
    if ($(".collection-item[data-chat = " + key + "]").hasClass('active-conversation') && selected) {
        return false;
    } else {
        chatPermissionsLevel = 0;
        memberCount = 0;
        countMemberAdd = 1;
        enableConversationImgEdit = false;
        chatMembers = [];
        activeChat = key;
        var conversationName = $('.collection-item[data-chat = ' + key + ']').find('.title').html();
        var conversationIcon = $('.collection-item[data-chat = ' + key + ']').find('img').attr('src');
        $('.collection .collection-item').removeClass('active-conversation');
        $('.messages').html('');
        $('.collection-item[data-chat = ' + key + ']').addClass('active-conversation');
        $('#chat-title').html(conversationName);
        $('#chat-key').html(key);
        $("#message").removeAttr('disabled')
        $('.manage-conversation-more').css('display', 'block')
        $('#editConversationBtn').attr('onclick', 'editConversation(\'' + key + '\')');
        $('#conversationEdit').attr('onclick', 'getMembers(\'' + key + '\'); setUpConversationEditor(); Materialize.updateTextFields();');

        // snapshot.val().owner  snapshot.val().manager

        var userPermissions = firebase.database().ref('/conversations/' + key + '/participants/' + userUid);
        userPermissions.once('value').then(function (snapshot) {
            if (snapshot.val().manager == true) {
                chatPermissionsLevel = 1;
                if (snapshot.val().owner == true) {
                    chatPermissionsLevel = 2;
                }
            }
            setUpConversationEditor();
            getMembers(key);
            Materialize.updateTextFields();
        });
    }
}