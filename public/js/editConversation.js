function editConversation(key) {
    var editConversationName = $('#editConversationName').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var editConversationIcon = $('#editConversationImgDisplay').attr('src');
    if (editConversationName.length < 3) {
        Materialize.toast('Display name is too short.', 4000)
    } else {
        var updates = {};
        updates['/conversations/' + key + '/title'] = editConversationName;
        updates['/conversations/' + key + '/icon'] = editConversationIcon;
        $('#editConversationModal').modal('close');
        $('#chat-title').html(editConversationName);
        $('#modalTitleEditConversation').html(editConversationName);
        $('#chat-key').html(key);
        switchConversation(key,false);
        return firebase.database().ref().update(updates);
    }
}

$('#editConversationImg').on('click', function () {
    if (chatPermissionsLevel > 0) {
        $('#editConversationImgInput').trigger('click');
    }
});

// edit profile image
document.getElementById('editConversationImgInput').addEventListener('change', function (event) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");

    var file = event.target.files[0];
    var fileReader = new FileReader();
    if (file.type.match('image')) {
        var fileReader = new Image;
        fileReader.onload = function () {
            var width = fileReader.width;
            var height = fileReader.height;
            canvas.width = canvas.height = 250;
            //ctx.drawImage(fileReader,0,0,iwScaled,ihScaled);
            ctx.drawImage(
                fileReader,
                width > height ? (width - height) / 2 : 0,
                height > width ? (height - width) / 2 : 0,
                width > height ? height : width,
                width > height ? height : width,
                0, 0,
                250, 250
            );
            $('#editConversationImgDisplay').attr("src", canvas.toDataURL());
        };
        fileReader.src = URL.createObjectURL(event.target.files[0]);
    }
});

function deleteConversation(){
    var updates = {};
    chatMembers.forEach(member => {
        updates['/users/' + member.uid + '/conversations/' + activeChat] = null;
    });
    updates['/conversations/' + activeChat] = null;
    firebase.database().ref().update(updates).then(function () {
        $('.messages').html('');
        $("#message").attr('disabled','disabled')
        $('#chat-title').html('');
        $('#chat-key').html('');
        $('.manage-conversation-more').css('display', 'none')
        $(".collection-item[data-chat = " + activeChat + "]").remove();
        $('#editConversationModal').modal('close');
        Materialize.toast('Conversation ' + activeChat + ' deleted.', 3000);
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });
}

function leaveConversation() {
    var updates = {};
    updates['/users/' + userUid + '/conversations/' + activeChat] = null;
    updates['/conversations/' + activeChat + '/participants/' + userUid] = null;``
    firebase.database().ref().update(updates).then(function () {
        $('.messages').html('');
        $("#message").attr('disabled','disabled')
        $('#chat-title').html('');
        $('#chat-key').html('');
        $('.manage-conversation-more').css('display', 'none')
        $(".collection-item[data-chat = " + activeChat + "]").remove();
        $('#editConversationModal').modal('close');
        Materialize.toast('Left Conversation' + activeChat + '.', 3000);
    }).catch(function (error) {
        Materialize.toast('An error occurred.', 3000);
    });
}