$('#displayNameEdit').keyup(function (e) {
    if (e.keyCode == 13) {
        saveProfle();
    }
});
function saveProfle() {
    var displayName = $('#displayNameEdit').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var profileImgUrl = $('#profileImgDisplayEdit').attr('src');
    if (displayName.length < 3) {
        Materialize.toast('Display name is too short.', 4000)
    } else {
        // save settings
        firebase.database().ref('users/' + userUid).update({
            displayName: displayName,
            photoURL: profileImgUrl
        });
        $('#profileModal').modal('close');
    }
};

$('#profileImgEdit').on('click', function () {
    $('#profileImgInputEdit').trigger('click');
});

// edit profile image
document.getElementById('profileImgInputEdit').addEventListener('change', function (event) {
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
            $('#profileImgDisplayEdit').attr("src", canvas.toDataURL());
        };
        fileReader.src = URL.createObjectURL(event.target.files[0]);
    }
});