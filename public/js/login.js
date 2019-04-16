
// on press enter in text fields
$('#passwordSignIn, #emailSignIn').keyup(function (e) {
    if (e.keyCode == 13) {
        signIn();
    }
});

// on sign in button press
$('#signInBtn').click(function () {
    signIn();
});

//process sign in
function signIn() {
    var email = $('#emailSignIn').val();
    var password = $('#passwordSignIn').val();

    if (email == '' || password == '') {
        Materialize.toast("Please enter email and password.", 4000)
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            Materialize.toast(error.message, 4000)
        });
    }
};

