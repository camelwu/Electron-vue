/**
 * Created by lixiaohu on 2017/4/24.
 */

var currentOsIsMac = /macintosh|mac os x/i.test(navigator.userAgent);

if (currentOsIsMac) {
    var styleSheet = document.createElement('link'),
        maxImg = document.createElement('img'),
        closeImg = document.createElement('img'),
        minImg = document.createElement('img');
    styleSheet.type = 'text/css';
    styleSheet.rel = 'stylesheet';
    styleSheet.href = '../css/public/mac-only.css';
    document.head.appendChild(styleSheet);
    styleSheet.onload = function() {
        console.log('load style');
    };
    maxImg.src = '../images/icon/全屏@2x.png';
    minImg.src = '../images/icon/关闭@2x.png';
    closeImg.src = '../images/icon/隐藏@2x.png';
}
