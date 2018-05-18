/*
 * 	Created by: Li Xiangkai
 * 	Date:2017-02-14
 */

$(function() {
    var time = date_format(new Date().getTime(), 'yyyy-MM-dd HH:mm:ss');
    var msg = '您的账号已于' + time + '在其他设备上登录。如果这不是您的操作，请及时修改登录密码。';
    $('#tip-msg').append(msg);

    new QWebChannel(qt.webChannelTransport, function(channel) {
        console.log(channel.objects);
        window.tipObj = channel.objects.qTipObj;
        window.publicObject = channel.objects.qWebPublicObj;

        $('#confirm,#winClose').on('click', function() {
            tipObj.wndLogoutClose();
        });

		// 窗口提示
        var timer_;
        $('#winClose').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('关闭');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        tipObj.onHtmlReady();
    });
});
