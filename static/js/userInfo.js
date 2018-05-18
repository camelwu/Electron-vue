/*
 *  Created by Li Xiangkai
 *  Date:2017-01-22
 *  个人详情弹窗
 */

var userInfo_;

$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.userInfoObject = channel.objects.qMemberInfoObject;
        window.publicObject = channel.objects.qWebPublicObj;
        window.mainObject = channel.objects.qMainObject;
        $(window).blur(function() {
			// 关闭弹窗
            userInfoObject.CloseWnd();
        });

        userInfoObject.getMemberInfo(function(data) {
            // initUserInfo(data);
            console.log('个人信息',data)
            if (data.staffName) {
                initUserInfo(data);
            } else {
                initOtherCompony(data)
            }

            mainObject.getOnlineState(data.imid,function(){
                console.log('在线请求发送',data.imid);
            })

        });
        
        // 1-在线；2-离开；3-忙碌；4-请勿打扰；5-隐身；6-离线
        mainObject.sigOnlineState.connect(function(data){
            console.log('在线状态回调',data);
            if (data[0].pc === 1) {
                $('.pcOnlineState').removeClass('hideList');
            }
        })

        // 断网通知和重连通知
        mainObject.sigDisconnectNotify.connect(function(errorCode) {
            console.log('断网', errorCode, userInfo_);
            $('.pcOnlineState').addClass('hideList');
        });
        mainObject.sigConnectNotify.connect(function(code) {
            console.log('重连', code);
            var data_ = JSON.parse(code);
            if (data_.ResponseErrcode == 0) {
                mainObject.getOnlineState(userInfo_.imid,function(){
                    console.log('在线请求发送',userInfo_.imid);
                })
            }
        });

		// 发起会话，将个人数据传回主窗口
        $('#btn').on('click', function() {
            if (userInfo_.bActivated) {
                userInfoObject.switchToMainWnd(userInfo_);
            }
        });
    });


    let copyData = [[{
        text: '复制',
        func: () => {
            document.execCommand('Copy', 'false', null);
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }]];
    $('#detail-message p').smartMenu(copyData, {
        name: '复制'
    });

    $('#detail-message').on('mousedown', 'p', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    documentSelectElement(this.childNodes[i]);
                    return;
                } else if (this.childNodes[i].tagName === 'A') {
                    documentSelectElement(this.childNodes[i].childNodes[0]);
                    return;
                }
            }
        }
    });

    $('#staffName').smartMenu(copyData, {
        name: '复制'
    });

    $('#staffName').on('mousedown', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    documentSelectElement(this.childNodes[i]);
                    return;
                } else if (this.childNodes[i].tagName === 'A') {
                    documentSelectElement(this.childNodes[i].childNodes[0]);
                    return;
                }
            }
        }
    });
});

/**
 * 常用联系人点击事件
 * 1常用联系人列表删除人员，2取消选中状态，3详情页面恢复默认
 */
$(document).on('click', '.star-contact-inactive', function() {
    $('.star-contact-inactive').addClass('hideList');
    $('#active-status').show();
    let oaId = _userInfo.id;
    mainObject.addStarContact(oaId);
});
$(document).on('click', '#active-status', function() {
    $('.star-contact-inactive').removeClass('hideList');
    $('#active-status').hide();
    let oaId = _userInfo.id;
    mainObject.delStarContact(oaId);
});
// 窗口提示
var timer_;
$(document).on('mouseover', '.star-contact-inactive', function() {
    timer_ = setTimeout(function() {
        publicObject.setTip('设为星标联系人');
    }, 800);
}).on('mouseout', function() {
    window.clearTimeout(timer_);
    publicObject.hideTip();
});
$(document).on('mouseover', '#active-status', function() {
    timer_ = setTimeout(function() {
        publicObject.setTip('取消星标联系人');
    }, 800);
}).on('mouseout', function() {
    window.clearTimeout(timer_);
    publicObject.hideTip();
});

//电脑在线
$(document).on('mouseover', '.pcOnlineState', function() {
    timer_ = setTimeout(function() {
        publicObject.setTip('电脑在线');
    }, 800);
}).on('mouseout', function() {
    window.clearTimeout(timer_);
    publicObject.hideTip();
});

function initOtherCompony(userInfo) {
    console.log('个人详情数据', userInfo);
    $('#status').attr('style', 'display:none;');
    $('.star-contact-inactive').addClass('hideList');
    $('.personal-detail').addClass('hideList');
    $('.other-compony').removeClass('hideList');

    $('#nickName').html(getNickName(userInfo.tempName));
    $('#nickName').attr('style', 'background:' + getNickNameColorToLocal() + ';');
    $('#staffName').html(userInfo.tempName);
    userInfoObject.OnHtmlReady();
}

/**
 * 初始化页面数据
 * @param userInfo
 */
let _userInfo;
function initUserInfo(userInfo) {
    $('.other-compony').addClass('hideList');
    console.log('个人详情数据', userInfo);
	 _userInfo = userInfo;
    if (userInfo.beMySelf == true) {
        $('.star-contact-inactive').addClass('hideList');
    }
	// if(userInfo.beMySelf == true){
	// 	$('#footer').hide();
	// 	$('#detail-message').css('max-height','275px');
	// }else{
	// 	$('#footer').removeAttr('style');
	// 	$('#detail-message').css('max-height','210px');
	// }
    $('#footer').removeAttr('style');
    $('#detail-message').css('max-height', '210px');
    userInfo_ = userInfo;
    $('#staffName').html(userInfo.staffName);
    $('#nickName').html(getNickName(userInfo.staffName));
    $('#nickName').attr('style', 'background:' + getNickNameColor(userInfo.id) + ';');
    $('#phone').html('<em class="iconn-20"></em>' + userInfo.mobile);
    $('#mail').html('<em class="iconn-42"></em>' + '<a href="mailto:' + userInfo.email + '">' + userInfo.email + '</a>');


    $('#dept').html('<em class="iconn-4"></em>' + userInfo.deptName);
    $('#duty').html('<em class="iconn-43"></em>' + userInfo.dutyName);
    if (userInfo.isStarContact) {
        $('#active-status').show();
        $('.star-contact-inactive').addClass('hideList');
    }

    if (userInfo.bActivated) {
        $('#status').attr('style', 'display:none;');
        $('#btn').removeClass('disabled');
    } else {
        $('#status').removeAttr('style');
        $('#btn').addClass('disabled');
    }

    publicObject.getMemberParttimeInfoByOaid(userInfo.id, function(data) {
        console.log('兼职信息', data);
        if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
                var temp = '<p style="margin-top:5px;"><em class="iconn-4"></em>' + data[i].deptInfo + '</p>' +
					'<p><em class="iconn-43"></em>' + data[i].dutyName + '</p style="margin-bottom:5px;">';
                $('#partTime').append(temp);
            }
            $('#partTime').show();


            let copyData = [[{
                text: '复制',
                func: () => {
                    document.execCommand('Copy', 'false', null);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                }
            }]];


            $('#partTime p ').smartMenu(copyData, {
                name: '复制'
            });

            $('#partTime').on('mousedown', 'p', function(e) {
                if (e.which == 3) {
                    for (var i = 0; i < this.childNodes.length; i++) {
                        if (this.childNodes[i].nodeType === 3) {
                            documentSelectElement(this.childNodes[i]);
                            return;
                        } else if (this.childNodes[i].tagName === 'A') {
                            documentSelectElement(this.childNodes[i].childNodes[0]);
                            return;
                        }
                    }
                }
            });
        }
        userInfoObject.OnHtmlReady();
    });
}


