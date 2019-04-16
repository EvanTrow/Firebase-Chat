
// on sign out click
$('#signOutBtn, #signoutMobile').click(function () {
    signOut();
});

// process sign out
function signOut() {
    firebase.auth().signOut().then(function () {
        $("#signin-signup-page").css("display", "block");
        $("#account, #signOutBtn, #accountMobile, #signoutMobile").css("display", "none");
        $("#messages-page").css("display", "none");
        $('.messages').html('');
        $("#message").attr('disabled','disabled')
        $('#chat-title').html('');
        $('#chat-key').html('');
        $('.conversation-collection').html('');
        $('.manage-conversation-more').css('display', 'none')

    }, function (error) {
        
    });
}
