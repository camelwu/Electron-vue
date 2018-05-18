/*
 * Created by Li Xiangkai
 * Date:2017-01-19
 * 图片预览
 */
var groupId;
var msgId;
var next;
var pre;
var src_;
var imageWidth;
var imageHeight;
var initPercent;
var currentOsIsMac = /macintosh|mac os x/i.test(navigator.userAgent);
var percent;
var mouseIn = true;
var isLongImg = false;
var pictureInfo;
$(function() {
    var timer = null;

    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.imageObject = channel.objects.qimageViewerObject;
        window.publicObject = channel.objects.qWebPublicObj;
        console.log(channel.objects);

        $(window).resize(function() {
            if (currentOsIsMac) {
                initImg($('img').attr('src'));
            } else {
                $('#img').css({
                    'left': ($(window).width() - $('#img').width()) / 2,
                    'top': ($(window).height() - $('#img').height()) / 2
                });
            }
            $('#win').css({
                'height': $(window).height()
            });
        });
        imageObject.sig_imgWindowsLeave.connect(function() {
            mouseIn = false;
            if (timer) return;
            timer = setTimeout(function() {
                hideEditArea();
            }, 5000);
        });
        imageObject.sig_imgWindowsEnter.connect(function() {
            mouseIn = true;
            if (timer) return;
            timer = setTimeout(function() {
                hideEditArea();
            }, 5000);
        });

        // 窗口提示
        var timer_;
        $('#close').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('关闭');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        var timer_;
        $('#pre-small').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('上一张');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        var timer_;
        $('#next-small').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('下一张');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        var timer_;
        $('#save').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('保存');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        var timer_;
        $('#rorate').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('旋转');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 获取要预览的图片信息
        imageObject.GetPicInfo(function(img) {
            console.log('图片信息', img);
            pictureInfo = img;
            if (img.isPicDownloaded) {
                $('.loading-img').addClass('hideList');
                if (img.DownloadPicPath == '' && img.SendPicPath == '') {
                    $('#loading').removeAttr('style');
                } else if (img.DownloadPicPath == '') {
                    src_ = img.SendPicPath;
                    initImg(img.SendPicPath);
                } else {
                    src_ = img.DownloadPicPath;
                    initImg(img.DownloadPicPath);
                }
            } else {
                $('.loading-img').removeClass('hideList');
                console.log('weiwancheng');
            }
            msgId = img.msgId || '';
            groupId = img.gid || img.channelId || '';

            imageObject.getPreAndNext(groupId, msgId, 3, function(data) {
                console.log(data);
                if (data.pre != undefined) {
                    pre = data.pre;
                    $('#pre').show();
                    $('#pre-small').removeClass('disabled');
                } else {
                    $('#pre').hide();
                    $('#pre-small').addClass('disabled');
                }
                if (data.next != undefined) {
                    next = data.next;
                    $('#next').show();
                    $('#next-small').removeClass('disabled');
                } else {
                    $('#next').hide();
                    $('#next-small').addClass('disabled');
                }
            });
        });

        /* $('#pre,#next').css({'visibility':'hidden'});
         $('#pre,#next').hover(function(){
         $(this).css({'visibility':'visible'});
         }).mouseout(function(){
         $(this).css({'visibility':'visible'});
         }); */

        $('#pre,#pre-small').on('click', function() {
            if (pre) {
                imageObject.SwitchViewPic({
                    'groupId': pre.groupId,
                    'channelId': pre.channelid,
                    'msgId': pre.msgId,
                    'serFileName': pre.serFileName,
                    'fileExt': pre.fileExt,
                    'attachUrl': pre.attachUrl,
                    'imgIndex': pre.imgIndex,
                    'filePath': pre.filePath
                }, function(img) {
                    console.log('上一张', img);
                    pictureInfo = img;
                    if (img.isPicDownloaded) {
                        src_ = img.DownloadPicPath;
                        // current = 0;
                        $('#img').css('transform', 'rotate(' + current + 'deg)');
                        initImg(img.DownloadPicPath);
                    } else {
                        $('.loading-img').removeClass('hideList');
                        console.log('weiwancheng');
                    }

                });
                imageObject.getPreAndNext(pre.groupId || pre.channelid || '', pre.msgId || '', 3, function(data) {
                    console.log(data);
                    if (data.pre != undefined) {
                        pre = data.pre;
                        $('#pre').show();
                        $('#pre-small').removeClass('disabled');
                    } else {
                        pre = undefined;
                        $('#pre').hide();
                        $('#pre-small').addClass('disabled');
                    }
                    if (data.next != undefined) {
                        next = data.next;
                        $('#next').show();
                        $('#next-small').removeClass('disabled');
                    } else {
                        next = undefined;
                        $('#next').hide();
                        $('#next-small').addClass('disabled');
                    }
                });
            }
        });
        $('#next,#next-small').on('click', function() {
            if (next) {
                imageObject.SwitchViewPic({
                    'groupId': next.groupId,
                    'channelId': next.channelid,
                    'msgId': next.msgId,
                    'serFileName': next.serFileName,
                    'fileExt': next.fileExt,
                    'attachUrl': next.attachUrl,
                    'imgIndex': next.imgIndex,
                    'filePath': next.filePath
                }, function(img) {
                    console.log('下一张', img);


                    pictureInfo = img;
                    if (img.isPicDownloaded) {
                        src_ = img.DownloadPicPath;
                        // current = 0;
                        $('#img').css('transform', 'rotate(' + current + 'deg)');
                        initImg(img.DownloadPicPath);
                    }else {
                        $('.loading-img').removeClass('hideList');
                        console.log('weiwancheng');
                    }

                });
                imageObject.getPreAndNext(next.groupId || next.channelid || '', next.msgId || '', 3, function(data) {
                    console.log(data);
                    if (data.pre != undefined) {
                        pre = data.pre;
                        $('#pre').show();
                        $('#pre-small').removeClass('disabled');
                    } else {
                        pre = undefined;
                        $('#pre').hide();
                        $('#pre-small').addClass('disabled');
                    }
                    if (data.next != undefined) {
                        next = data.next;
                        $('#next').show();
                        $('#next-small').removeClass('disabled');
                    } else {
                        next = undefined;
                        $('#next').hide();
                        $('#next-small').addClass('disabled');
                    }
                });
            }
        });

        $(document).on('keydown', function(e) {
            if (e.keyCode === 37) {
                $('#pre-small').click();
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                showEditArea();
            } else if (e.keyCode === 39) {
                $('#next-small').click();
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                showEditArea();
            }
        });

        if (currentOsIsMac) {
            $('#img').on('dblclick', function() {
                var width = $('#img').width();
                var height = $('#img').height();
                var winWidth = $('#win').width();
                var winHeight = $('#win').height();
                if (isLongImg) {
                    if ($('#img').height() > $('#win').height()) {
                        percent = Math.floor($('#win').height() / imageHeight * 100);
                        setImageSize({
                            clientX: $('#win').width() / 2,
                            clientY: $('#win').height() / 2
                        }, imageWidth * $('#win').height() / imageHeight, $('#win').height());
                    } else {
                        percent = Math.floor($('#win').width() / imageWidth * 100);
                        setImageSize({
                            clientX: $('#win').width() / 2,
                            clientY: $('#win').height() / 2
                        }, $('#win').width(), imageHeight * $('#win').width() / imageWidth);
                    }
                    $('.percent').html(percent + '%');
                    return;
                }
                if (percent === 100 && width < winWidth && height < winHeight) {
                    if (width / height > winWidth / winHeight) {
                        $('#img').css({
                            'width': winWidth,
                            'height': winWidth * height / width,
                            'left': 0,
                            'top': (winHeight - winWidth * height / width) / 2
                        });
                    } else if (width / height < winWidth / winHeight) {
                        $('#img').css({
                            'width': width * winHeight / height,
                            'height': winHeight,
                            'left': (winWidth - width * winHeight / height) / 2,
                            'top': 0
                        });
                    } else {
                        $('#img').css({
                            'width': winWidth,
                            'height': winHeight,
                            'left': 0,
                            'top': 0
                        });
                    }
                    percent = Math.floor($('#img').width() / imageWidth * 100);
                } else if (percent < 100) {
                    percent = 100;
                    setImageSize({
                        clientX: $('#win').width() / 2,
                        clientY: $('#win').height() / 2
                    }, imageWidth, imageHeight);
                } else {
                    initImg($('img').attr('src'));
                }
                $('.percent').html(percent + '%');
            });
        }

        // 保存
        $('#save').on('click', function() {
            if (src_ != undefined && src_ != '') {
                imageObject.SaveAs(src_);
            }
        });

        // 大图下载成功通知
        imageObject.sig_downloadImgSuccess.connect(function(data) {
            var img = pictureInfo;
            img.transformation = data.transformation;
            console.log('大图下载成功', data);
          if (img.DownloadPicPath == '') {
                src_ = img.SendPicPath;
                initImg(img.SendPicPath);
            } else {
                src_ = img.DownloadPicPath;
                initImg(img.DownloadPicPath);
            }
        });

        imageObject.sig_imgShow.connect(function() {
            console.log('view image window');

            $('.loading-img').removeClass('hideList');
            $('#img').addClass('hideList');

            imageObject.GetPicInfo(function(img) {
                console.log('图片信息', img);
                showEditArea();
                pictureInfo = img;
                if (img.isPicDownloaded) {
                    $('.loading-img').addClass('hideList');
                    if (img.DownloadPicPath == '' && img.SendPicPath == '') {
                        $('#loading').removeAttr('style');
                    } else if (img.DownloadPicPath == '') {
                        src_ = img.SendPicPath;
                        initImg(img.SendPicPath);
                    } else {
                        src_ = img.DownloadPicPath;
                        initImg(img.DownloadPicPath);
                    }
                } else {
                    $('.loading-img').removeClass('hideList');
                    console.log('weiwancheng');
                }
                msgId = img.msgId || '';
                groupId = img.gid || img.channelId || '';

                imageObject.getPreAndNext(groupId, msgId, 3, function(data) {
                    console.log(data);
                    if (data.pre != undefined) {
                        pre = data.pre;
                        $('#pre').show();
                        $('#pre-small').removeClass('disabled');
                    } else {
                        $('#pre').hide();
                        $('#pre-small').addClass('disabled');
                    }
                    if (data.next != undefined) {
                        next = data.next;
                        $('#next').show();
                        $('#next-small').removeClass('disabled');
                    } else {
                        $('#next').hide();
                        $('#next-small').addClass('disabled');
                    }
                });
            });
        });

        $(window).mouseup(function(e) {
            if (e.which == 1) {
                imageObject.stopMove();
            }
            mousedown = false;
        });

        $('#close').on('click', function() {
            $('#img').addClass('hideList');
            $('#img').attr('src', '');
            hideEditArea();
            clearTimeout(timer_);
            setTimeout(function() {
                imageObject.wndClose();
            }, 30);
        });
        $('#min').on('click', function() {
            clearTimeout(timer_);
            imageObject.wndMin();
        });
        $('#max').on('click', function() {
            clearTimeout(timer_);
            imageObject.wndFullScreen();
            if ($('#max').hasClass('ori')) {
                $('#max').removeClass('ori');
            } else {
                $('#max').addClass('ori');
            }
        });
    });

    // 图片缩放
    $('#win').mousewheel(function(e, delta) {
        if (currentOsIsMac) {
            var moveX = e.deltaX,
                moveY = e.deltaY,
                top = parseInt($('#img').css('top')),
                left = parseInt($('#img').css('left'));

            top = (top + moveY > 0 || top + moveY + $('#img').height() < $('#win').height()) ? top : top + moveY;
            left = (left - moveX > 0 || left - moveX + $('#img').width() < $('#win').width()) ? left : left - moveX;

            $('#img').css({
                top: top,
                left: left
            });
            return;
        }
        if (delta > 0) {
            _zoomIn(e);
        } else {
            _zoomOut(e);
        }

        /* var newWidth=this.offsetWidth;
         var newHeight=this.offsetHeight;

         this.style.left=oldLeft-scaleX*(newWidth-oldWidth)+"px";
         this.style.top=oldTop-scaleY*(newHeight-oldHeight)+"px"; */
    });

    $('#zoom-in').on('click', function() {
        _zoomIn({
            clientX: $('#win').width() / 2,
            clientY: $('#win').height() / 2
        });
    });

    $('#zoom-out').on('click', function() {
        _zoomOut({
            clientX: $('#win').width() / 2,
            clientY: $('#win').height() / 2
        });
    });
    $(document).on('keydown', function(e) {
        if (e.keyCode === 187 && e.metaKey) {
            $('#zoom-in').click();
        }
    });
    $(document).on('keydown', function(e) {
        if (e.keyCode === 189 && e.metaKey) {
            $('#zoom-out').click();
        }
    });

    if (currentOsIsMac) {
        $('#win').mousemove(_throttle(mouseMove, 300));
    }

    $('#view-img-top-bar').dblclick(function() {
        imageObject.wndMax();
    });

    // 图片拖拽
    var mousedown = false;
    var mouseXBegin;
    var mouseYBegin;
    $('#view-img-top-bar').mousedown(function(e) {
        if (e.which == 1) {
            mousedown = true;
            mouseXBegin = e.pageX;
            mouseYBegin = e.pageY;
        }

        if (e.target.id === 'min') {
            mousedown = false;
        } else if (e.target.id === 'max') {
            mousedown = false;
        } else if (e.target.id === 'close') {
            mousedown = false;
        }

        return false;
    });
    $('#view-img-top-bar').mousemove(function(e) {
        if (mousedown) {
            if ($('#max').length === 0 || !$('#max').hasClass('ori')) {
                imageObject.startMove(e.screenX, e.screenY);
            }
        }
        return false;
    });
    $('#win').mousedown(function(e) {
        if (e.which == 1) {
            mousedown = true;
            mouseXBegin = e.pageX;
            mouseYBegin = e.pageY;
        }
        if (e.target.className === 'iconn-pre') {
            mousedown = false;
        } else if (e.target.className === 'iconn-next') {
            mousedown = false;
        } else if (e.target.className === 'iconn-separator') {
            mousedown = false;
        } else if (e.target.className === 'iconn-zoom-out') {
            mousedown = false;
        } else if (e.target.className === 'percent') {
            mousedown = false;
        } else if (e.target.className === 'iconn-zoom-in') {
            mousedown = false;
        } else if (e.target.className === 'iconn-save') {
            mousedown = false;
        } else if (e.target.className === 'iconn-rotate') {
            mousedown = false;
        }
    });
    $(document).mousemove(function(e) {
        if (mousedown == true) {
            x = e.pageX - mouseXBegin;
            y = e.pageY - mouseYBegin;
            endX = parseInt($('#img').css('left').replace('px', '')) + x;
            endY = parseInt($('#img').css('top').replace('px', '')) + y;

            if (current == 0 || current == 180) {
                if ($('#img').width() <= $(window).width() && $('#img').height() <= $(window).height()) {
                    if ($('#max').length === 0 || !$('#max').hasClass('ori')) {
                        imageObject.startMove(e.screenX, e.screenY);
                    }
                }
                if ($('#img').width() <= $(window).width() && $('#img').height() > $(window).height() &&
                    document.getElementById('img').offsetTop <= 0 &&
                    (document.getElementById('img').offsetTop + $('#img').height()) >= $(window).height()) {
                    $('#img').css({
                        'top': endY
                    });
                    if (document.getElementById('img').offsetTop > 0) {
                        $('#img').css({
                            'top': 0
                        });
                    }
                    if ((document.getElementById('img').offsetTop + $('#img').height()) < $(window).height()) {
                        $('#img').css({
                            'top': $(window).height() - $('#img').height()
                        });
                    }
                }
                if ($('#img').width() > $(window).width() && $('#img').height() <= $(window).height() &&
                    document.getElementById('img').offsetLeft <= 0 &&
                    (document.getElementById('img').offsetLeft + $('#img').width()) >= $(window).width()) {
                    $('#img').css({
                        'left': endX
                    });
                    if (document.getElementById('img').offsetLeft > 0) {
                        $('#img').css({
                            'left': 0
                        });
                    }
                    if ((document.getElementById('img').offsetLeft + $('#img').width()) < $(window).width()) {
                        $('#img').css({
                            'left': $(window).width() - $('#img').width()
                        });
                    }
                }
                if ($('#img').width() > $(window).width() && $('#img').height() > $(window).height() &&
                    document.getElementById('img').offsetLeft <= 0 &&
                    (document.getElementById('img').offsetLeft + $('#img').width()) >= $(window).width() &&
                    document.getElementById('img').offsetTop <= 0 &&
                    (document.getElementById('img').offsetTop + $('#img').height()) >= $(window).height()) {
                    $('#img').css({
                        'left': endX,
                        'top': endY
                    });
                    if (document.getElementById('img').offsetTop > 0) {
                        $('#img').css({
                            'top': 0
                        });
                    }
                    if ((document.getElementById('img').offsetTop + $('#img').height()) < $(window).height()) {
                        $('#img').css({
                            'top': $(window).height() - $('#img').height()
                        });
                    }
                    if (document.getElementById('img').offsetLeft > 0) {
                        $('#img').css({
                            'left': 0
                        });
                    }
                    if ((document.getElementById('img').offsetLeft + $('#img').width()) < $(window).width()) {
                        $('#img').css({
                            'left': $(window).width() - $('#img').width()
                        });
                    }
                }
            } else {
                if ($('#img').width() <= $(window).height() && $('#img').height() <= $(window).width()) {
                    if ($('#max').length === 0 || !$('#max').hasClass('ori')) {
                        imageObject.startMove(e.screenX, e.screenY);
                    }
                }
                if ($('#img').width() <= $(window).height() && $('#img').height() > $(window).width() &&
                    document.getElementById('img').offsetLeft + $('#img').width() / 2 <= $('#img').height() / 2 &&
                    $(window).width() - document.getElementById('img').offsetLeft - $('#img').width() / 2 <= $('#img').height() / 2) {
                    $('#img').css({
                        'left': endX
                    });
                    if (document.getElementById('img').offsetLeft + $('#img').width() / 2 > $('#img').height() / 2) {
                        $('#img').css({
                            'left': $('#img').height() / 2 - $('#img').width() / 2
                        });
                    }
                    if ($(window).width() - document.getElementById('img').offsetLeft - $('#img').width() / 2 > $('#img').height() / 2) {
                        $('#img').css({
                            'left': $(window).width() - $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                }
                if ($('#img').width() > $(window).height() && $('#img').height() <= $(window).width() &&
                    document.getElementById('img').offsetTop + $('#img').height() / 2 <= $('#img').width() / 2 &&
                    document.getElementById('img').offsetTop + $('#img').height() / 2 + $('#img').width() / 2 >= $(window).height()) {
                    $('#img').css({
                        'top': endY
                    });
                    if (document.getElementById('img').offsetTop + $('#img').height() / 2 > $('#img').width() / 2) {
                        $('#img').css({
                            'top': $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                    if (document.getElementById('img').offsetTop + $('#img').height() / 2 + $('#img').width() / 2 < $(window).height()) {
                        $('#img').css({
                            'top': $(window).height() - $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                }
                if ($('#img').width() > $(window).height() && $('#img').height() > $(window).width() &&
                    document.getElementById('img').offsetLeft + $('#img').width() / 2 <= $('#img').height() / 2 &&
                    $(window).width() - document.getElementById('img').offsetLeft - $('#img').width() / 2 <= $('#img').height() / 2 &&
                    document.getElementById('img').offsetTop + $('#img').height() / 2 <= $('#img').width() / 2 &&
                    document.getElementById('img').offsetTop + $('#img').height() / 2 + $('#img').width() / 2 >= $(window).height()) {
                    $('#img').css({
                        'left': endX,
                        'top': endY
                    });
                    if (document.getElementById('img').offsetLeft + $('#img').width() / 2 > $('#img').height() / 2) {
                        $('#img').css({
                            'left': $('#img').height() / 2 - $('#img').width() / 2
                        });
                    }
                    if ($(window).width() - document.getElementById('img').offsetLeft - $('#img').width() / 2 > $('#img').height() / 2) {
                        $('#img').css({
                            'left': $(window).width() - $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                    if (document.getElementById('img').offsetTop + $('#img').height() / 2 > $('#img').width() / 2) {
                        $('#img').css({
                            'top': $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                    if (document.getElementById('img').offsetTop + $('#img').height() / 2 + $('#img').width() / 2 < $(window).height()) {
                        $('#img').css({
                            'top': $(window).height() - $('#img').width() / 2 - $('#img').height() / 2
                        });
                    }
                }
            }
            mouseXBegin = mouseXBegin + x;
            mouseYBegin = mouseYBegin + y;
        }
        return false;
    });

    function mouseMove(e) {
        if (!mouseIn) {
            return;
        }
        var y = e.clientY,
            height = $('#win').height();
        if (y <= height * 0.2 || y >= height * 0.8) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            showEditArea();
        } else {
            if (timer) return;
            timer = setTimeout(function() {
                hideEditArea();
            }, 5000);
        }
    }

    function showEditArea() {
        $('#view-img-top-bar').removeClass('hide');
        $('.edit-area').removeClass('hide');
    }
    function hideEditArea() {
        $('#view-img-top-bar').addClass('hide');
        $('.edit-area').addClass('hide');
        timer = null;
    }
});

var initHeight;
var initWidth;
function initImg(src) {
    src += '?temp=' + Math.random();
    initPercent = undefined;
    var img = new Image();
    img.src = src;
    current = 0;
    // img.src = $('#img').attr('src');
    console.time('统计时间');

    img.onload = function() {
        $('.loading-img').addClass('hideList');
        $('#img').removeClass('hideList');
        var height = imageHeight = img.height;
        var width = imageWidth = img.width;
        switch (pictureInfo.transformation) {
            case 0:
                current = 0;
                break;
            case 3:
                current = 180;
                break;
            case 4:
                current = 90;
                break;
            case 7:
                current = 270;
                break;
            default:
                current = 0;
                break;
        }
        //$('.loading-img').addClass('hideList')
        console.timeEnd('统计时间');
        console.time('getdata');

        rotateImg(current);
        initSize();

        if (currentOsIsMac) {
            if (imageHeight / imageWidth >= 2 && imageHeight > window.screen.height * 0.88) {
                isLongImg = true;
                $('#img').css({
                    'width': $('#win').width(),
                    'height': 'auto',
                    'left': 0,
                    'top': 0
                });
            } else {
                isLongImg = false;
            }
            percent = Math.floor($('#img').width() / imageWidth * 100);
            $('.percent').html(percent + '%');
        }

        $('#img').attr('src', src);
    };
}

var current = 0;
function rotateImg(r) {
    current = typeof r === 'undefined' ? (current + 90) % 360 : r;
    $('#img').css('transform', 'rotate(' + current + 'deg)');
    initSize();
}

function initSize() {
    var height = imageHeight,
        width = imageWidth,
        winHeight = $('#win').height(),
        winWidth = $('#win').width();
    if (current == 0 || current == 180) {
        if (height < winHeight && width < winWidth) {
            $('#img').css({
                'left': (winWidth - width) / 2,
                'top': (winHeight - height) / 2,
                'height': height,
                'width': width
            });
            if (initHeight == undefined && initWidth == undefined) {
                initHeight = height;
                initWidth = width;
            }
        } else {
            if (width / height > winWidth / winHeight) {
                $('#img').css({
                    'width': winWidth,
                    'height': winWidth * height / width,
                    'left': 0,
                    'top': (winHeight - winWidth * height / width) / 2
                });
            } else if (width / height < winWidth / winHeight) {
                $('#img').css({
                    'width': width * winHeight / height,
                    'height': winHeight,
                    'left': (winWidth - width * winHeight / height) / 2,
                    'top': 0
                });
            } else {
                $('#img').css({
                    'width': winWidth,
                    'height': winHeight,
                    'left': 0,
                    'top': 0
                });
            }
        }
    } else {
        if (width < winHeight && height < winWidth) {
            $('#img').css({
                'width': width,
                'height': height,
                'left': (winWidth - width) / 2,
                'top': 0 - (height - winHeight) / 2
            });
        } else {
            if (width / height > winWidth / winHeight) {
                if (width >= winHeight) {
                    $('#img').css({
                        'width': winHeight,
                        'height': parseInt(winHeight * height / width),
                        'left': (winWidth - winHeight) / 2,
                        'top': (winHeight - winHeight * height / width) / 2
                    });
                } else {
                    $('#img').css({
                        'width': width,
                        'height': height,
                        'left': (winWidth - width) / 2,
                        'top': (winHeight - height) / 2
                    });
                }
            } else if (width / height < winWidth / winHeight) {
                if (width >= winHeight) {
                    if (winHeight * height / width >= winWidth) {
                        $('#img').css({
                            'height': winWidth,
                            'width': parseInt(winWidth * width / height),
                            'left': (winWidth - winWidth * width / height) / 2,
                            'top': 0 - (winWidth - winHeight) / 2
                        });
                    } else {
                        $('#img').css({
                            'height': parseInt(winHeight * height / width),
                            'width': winHeight,
                            'left': (winWidth - winHeight) / 2,
                            'top': 0 - (winHeight * height / width - winHeight) / 2
                        });
                    }
                } else {
                    if (height >= winWidth) {
                        $('#img').css({
                            'height': winWidth,
                            'width': width,
                            'left': (winWidth - width) / 2,
                            'top': 0 - (winWidth - winHeight) / 2
                        });
                    } else {
                        $('#img').css({
                            'height': height,
                            'width': width,
                            'left': (winWidth - width) / 2,
                            'top': 0 - (height - winHeight) / 2
                        });
                    }
                }
            } else {
                $('#img').css({
                    'height': parseInt(winHeight * height / width),
                    'width': winHeight,
                    'left': (winWidth - winHeight) / 2,
                    'top': (winHeight - winHeight * height / width) / 2
                });
            }
        }
    }
}

function setPercent(flag) {
    if (flag) {
        if (percent >= 1 && percent < 3) {
            percent = 3;
        } else if (percent >= 3 && percent < 6) {
            percent = 6;
        } else if (percent >= 6 && percent < 12) {
            percent = 12;
        } else if (percent >= 12 && percent < 25) {
            percent = 25;
        } else if (percent >= 25 && percent < 900) {
            percent = 25 * (Math.floor(percent / 25) + 1);
        } else {
            return;
        }
    } else {
        if (percent > 1 && percent <= 3) {
            percent = 1;
        } else if (percent > 3 && percent <= 6) {
            percent = 3;
        } else if (percent > 6 && percent <= 12) {
            percent = 6;
        } else if (percent > 12 && percent <= 25) {
            percent = 12;
        } else if (percent > 25 && percent <= 900) {
            percent = 25 * (Math.ceil(percent / 25) - 1);
        } else {
            return;
        }
    }
    $('.percent').html(percent + '%');
}

function _zoomIn(e) {
    var newWidth = $('#img').width() * 1.1;
    var newHeight = $('#img').height() * 1.1;

    if (currentOsIsMac) {
        setPercent(true);
        newWidth = imageWidth * percent / 100;
        newHeight = imageHeight * percent / 100;
    }
    setImageSize(e, newWidth, newHeight);
}

function _zoomOut(e) {
    var newWidth = $('#img').width() * 0.9;
    var newHeight = $('#img').height() * 0.9;

    if (currentOsIsMac) {
        setPercent(false);
        newWidth = imageWidth * percent / 100;
        newHeight = imageHeight * percent / 100;
    } else {
        if ($('#img').width() < 30 || $('#img').height() < 30) {
            return;
        }
    }
    setImageSize(e, newWidth, newHeight);
}

function setImageSize(e, newWidth, newHeight) {
    var image_ = document.getElementById('img');
    var oldWidth = $('#img').width();
    var oldHeight = $('#img').height();
    var oldLeft = image_.offsetLeft;
    var oldTop = image_.offsetTop;

    var scaleX = (e.clientX - oldLeft) / oldWidth;// 比例
    var scaleY = (e.clientY - oldTop) / oldHeight;

    $('#img').css({
        'width': newWidth,
        'height': newHeight
    });
    if (current == 0 || current == 180) {
        if ($('#img').width() < $(window).width() && $('#img').height() < $(window).height()) {
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': ($(window).height() - $('#img').height()) / 2
            });
        }
        if ($('#img').width() < $(window).width() && $('#img').height() >= $(window).height()) {
            var newHeight = image_.offsetHeight;
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': oldTop - scaleY * (newHeight - oldHeight) < 0 ? oldTop - scaleY * (newHeight - oldHeight) : 0
            });
        }
        if ($('#img').width() >= $(window).width() && $('#img').height() < $(window).height()) {
            var newWidth = image_.offsetWidth;
            $('#img').css({
                'left': oldLeft - scaleX * (newWidth - oldWidth) < 0 ? oldLeft - scaleX * (newWidth - oldWidth) : 0,
                'top': ($(window).height() - $('#img').height()) / 2
            });
        }
        if ($('#img').width() >= $(window).width() && $('#img').height() >= $(window).height()) {
            var newWidth = $('#img').width();
            var newHeight = $('#img').height();

            image_.style.left = oldLeft - scaleX * (newWidth - oldWidth) + 'px';
            image_.style.top = oldTop - scaleY * (newHeight - oldHeight) + 'px';
            if (document.getElementById('img').offsetLeft >= 0) {
                $('#img').css('left', 0);
            }
            if ($('#img').width() + document.getElementById('img').offsetLeft - $(window).width() <= 0) {
                $('#img').css('left', $(window).width() - $('#img').width());
            }
            if ($('#img').height() + document.getElementById('img').offsetTop - $(window).height() <= 0) {
                $('#img').css('top', $(window).height() - $('#img').height());
            }
            if (document.getElementById('img').offsetTop >= 0) {
                $('#img').css('top', 0);
            }
        }
    } else {
        if ($('#img').width() < $(window).height() && $('#img').height() < $(window).width()) {
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': ($(window).height() - $('#img').height()) / 2
            });
        }
        if ($('#img').width() >= $(window).height() && $('#img').height() < $(window).width()) {
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': ($(window).height() - $('#img').height()) / 2
            });
        }
        if ($('#img').width() < $(window).height() && $('#img').height() >= $(window).width()) {
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': ($(window).height() - $('#img').height()) / 2
            });
        }
        if ($('#img').width() >= $(window).height() && $('#img').height() >= $(window).width()) {
            $('#img').css({
                'left': ($(window).width() - $('#img').width()) / 2,
                'top': ($(window).height() - $('#img').height()) / 2
            });
            var newWidth = $('#img').width();
            var newHeight = $('#img').height();

            image_.style.left = oldLeft - scaleX * (newWidth - oldWidth) + 'px';
            image_.style.top = oldTop - scaleY * (newHeight - oldHeight) + 'px';
            if (document.getElementById('img').offsetLeft + ($('#img').width() - $('#img').height()) / 2 > 0) {
                $('#img').css('left', -($('#img').width() - $('#img').height()) / 2);
            }
            if (document.getElementById('img').offsetLeft < $(window).width() - ($('#img').width() + $('#img').height()) / 2) {
                $('#img').css('left', $(window).width() - ($('#img').width() + $('#img').height()) / 2);
            }
            if (document.getElementById('img').offsetTop + ($('#img').height() - $('#img').width()) / 2 > 0) {
                $('#img').css('top', ($('#img').width() - $('#img').height()) / 2);
            }
            if (document.getElementById('img').offsetTop < $(window).height() - ($('#img').width() + $('#img').height()) / 2) {
                $('#img').css('top', $(window).height() - ($('#img').width() + $('#img').height()) / 2);
            }
        }
    }
}
