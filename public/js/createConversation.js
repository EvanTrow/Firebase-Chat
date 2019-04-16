function createConversation() {
    var newConversationName = $('#newConversationName').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var newConversationIcon = $('#newConversationImgDisplay').attr('src');
    if (newConversationName.length < 3) {
        Materialize.toast('Display name is too short.', 4000)
    } else {
        var conversationUID = guid();
        
        colorsCode = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "grey", "blue-grey", "black"];
        var updates = {};
        updates['/conversations/' + conversationUID + '/title'] = newConversationName;
        updates['/conversations/' + conversationUID + '/icon'] = newConversationIcon;
        updates['/conversations/' + conversationUID + '/participants/' + userUid + '/owner'] = true;
        updates['/conversations/' + conversationUID + '/participants/' + userUid + '/manager'] = true;
        updates['/conversations/' + conversationUID + '/participants/' + userUid + '/color'] = colorsCode[Math.floor(Math.random()*colorsCode.length)];;
        updates['/users/' + userUid + '/conversations/' + conversationUID] = true;
        $('#newConversationModal').modal('close');
        $('#newConversationName').val('');
        $('#newConversationImgDisplay').attr('src', 'img/defaulfConversationIcon.png');
        return firebase.database().ref().update(updates);
    }

}

$('#newConversationImg').on('click', function () {
    $('#newConversationImgInput').trigger('click');
});

// edit profile image
document.getElementById('newConversationImgInput').addEventListener('change', function (event) {
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
            $('#newConversationImgDisplay').attr("src", canvas.toDataURL());
        };
        fileReader.src = URL.createObjectURL(event.target.files[0]);
    }
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + '-' + s4() + '-' + s4() + '-' + s4();
}