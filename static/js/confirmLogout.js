/*
 * 	Created by: Li Xiangkai
 * 	Date:2017-02-14
 */

$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.tipObj = channel.objects.qTipObj;

        $('#cancel').on('click', function() {
            tipObj.wndClose();
        });

        $('#logout').on('click', function() {
            tipObj.wndLogoutClose();
        });

        tipObj.onHtmlReady();
    });
});
