$('#attachImageBtn').on('click', function () {
    if (activeChat != "") {
        $('#attachImgInput').trigger('click');
    }
});

// edit profile image
document.getElementById('attachImgInput').addEventListener('change', function (event) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");

    var maxW = 250;
    var maxH = 200;

    var file = event.target.files[0];
    var fileReader = new FileReader();
    if (file.type.match('image')) {
        var fileReader = new Image;
        fileReader.onload = function () {
            var iw = fileReader.width;
            var ih = fileReader.height;
            var scale = Math.min((maxW / iw), (maxH / ih));
            var iwScaled = iw * scale;
            var ihScaled = ih * scale;
            canvas.width = iwScaled;
            canvas.height = ihScaled;
            ctx.drawImage(fileReader,0,0,iwScaled,ihScaled);

            var message = '<img src="' + canvas.toDataURL() + '" /><br><span>'+file.name+'</span>';
            var messageRef = firebase.database().ref('conversations/' + activeChat + '/messages');
            messageRef.push({
                message: message,
                timeStamp: moment().unix(),
                sender: userUid
            }).off();

        };
        fileReader.src = URL.createObjectURL(event.target.files[0]);
    }
});