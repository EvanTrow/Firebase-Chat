// on press enter in text fields
$('#emailSignUp, #displayName, #password2SignUp, #passwordSignUp').keyup(function (e) {
    if (e.keyCode == 13) {
        signUp();
    }
});

$('#signUpBtn').click(function () {
    signUp();
});

var database = firebase.database();

function signUp() {
    var pass1 = $('#passwordSignUp').val();
    var pass2 = $('#password2SignUp').val();
    var email = $('#emailSignUp').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var displayName = $('#displayName').val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var profileImgUrl = $('#profileImgDisplay').attr('src');

    if (pass1 !== pass2) {
        Materialize.toast("Passwords Don't Match.", 4000)
    } else if (pass1 == '' || email == '' || displayName == '') {
        Materialize.toast("Please Complete All Fields.", 4000)
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, pass1).then(function (user) {
            //Here if you want you can sign in the user
            var newuserid = userid();
            firebase.database().ref('users/' + user.uid).set({
                displayName: displayName,
                photoURL: profileImgUrl,
                userID: newuserid
            });
        }).catch(function (error) {
            Materialize.toast(error.message, 4000)
        });
    }
}

function userid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var returnData = s4() + '-' + s4();
    return returnData.toUpperCase();
}

$('#profileImgSignUp').on('click', function () {
    $('#profileImgInput').trigger('click');
});
// sign up profile image
document.getElementById('profileImgInput').addEventListener('change', function (event) {
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
            $('#profileImgDisplay').attr("src", canvas.toDataURL());
        };
        fileReader.src = URL.createObjectURL(event.target.files[0]);
    }
});