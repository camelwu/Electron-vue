$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        console.log(channel.objects);
        window.modifyPwdObj = channel.objects.qModifyPasswd;

        $('#confirm').on('click', function() {
            modifyPwdObj.wndLogoutClose();
        });

        modifyPwdObj.onHtmlReady();
    });
});
