

function displayUserInfo(uid){
    console.log(uid);
    $('#userInfoTitle').text(getMembersDisplayName(uid));
    $('#userInfoImage').attr("scr",getMembersImage(uid));
    firebase.database().ref('/users/' + uid).once('value', function (snapshot) {
        $('#usersId').html("User ID: " + snapshot.val().userID);
        $('#userInfoProfileImg').attr('src', snapshot.val().photoURL);
    });

    $('#userInfo').modal('open')

}