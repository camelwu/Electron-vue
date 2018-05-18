/*
 * 	Created by: hu yue
 * 	Date:2017-09-13
 */


$(function(){
	new QWebChannel(qt.webChannelTransport, function(channel) {
        window.DownloadPhoneVersionObject  = channel.objects.qDownloadPhoneVersionObject;
        window.appSetObject = channel.objects.qAppsetObj;

        //关闭窗口
       $('.code-head').find('a.closedWin').click(function(e){
          e.stopPropagation();
       		console.log('关闭二维码');
          setTimeout(() => {
       		   DownloadPhoneVersionObject.CloseWnd();
          }, 100);
       });

       //窗体拖动
       $('#codeWindow').mousedown(function(e) {
            if (e.which == 1) {
                DownloadPhoneVersionObject.startMove(e.screenX, e.screenY);
            }
        }).mouseup(function(e) {
            if (e.which == 1) {
                DownloadPhoneVersionObject.stopMove();
            }
        });

    });
});