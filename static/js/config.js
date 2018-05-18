/*
 * Created by Li Xiangkai
 * Date: 2017-01-17
 * 设置窗口
 */
var keyWinFlag = false;
var config;
var autoRunning;
var myInfo;
var tipFlag;
var hotkeyArr = [];
$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.appSetObject = channel.objects.qAppsetObj;
        window.publicObject = channel.objects.qWebPublicObj;
        var currentOsIsMac = /macintosh|mac os x/i.test(navigator.userAgent);


        if (currentOsIsMac) {
            $('.enter-send span').html('Return发送,Command+Return换行');
            $('.enter-crlf span').html('Return换行,Command+Return发送');
        }


        let updateFlag = false;
        appSetObject.sigInvolkeSucceed.connect(function(data) {
        	// 用户主动 触发 检查更新
            console.log(123);
            if (updateFlag) {
                updateFlag = false;
                if (!data) {
                    $('.alreadynew').addClass('animateshow');
				 }
            }
            // 定时器 更新
            if (data) {
                $('.update').find('i').removeClass('hideList');
                $('#about-us').find('i').removeClass('hideList');
            }
        });

        // 检查更新
        $('.update span').on('click', function() {
            console.log(11111);
            updateFlag = true;
            appSetObject.checkUpdate();
        });
        // i konw
        $('.alreadynew .iknow').on('click', function() {
            $('.alreadynew').removeClass('animateshow');
        });

        // 用户协议
        $('.user-agree-text').on('click', function() {
        	publicObject.openUrl(0, 'https://work.gomeplus.com/agreement.html');
        });

        // 隐私政策
        $('.user-secret-text').on('click', function() {
            publicObject.openUrl(0, 'https://work.gomeplus.com/privacy.html');
        });


		// 获取当前用户信息
        appSetObject.getCurrentUserInfo(function(userInfo) {
            console.log('个人信息', userInfo);
            $('#myNickName').html(getNickName(userInfo.staffName));
            $('#myNickName').attr('style', 'background:' + getNickNameColor(userInfo.id) + ';');
            $('#myName').html(userInfo.staffName);
            $('#modify-tip').html('您正在为' + userInfo.mobile + '修改密码');
            myInfo = userInfo;
        });
        appSetObject.getAppversion(version => $('#appName').html(`当前版本 ${version}`));
		// 获取通用设置
        appSetObject.getgeneralsettings(1, function(data) {
            console.log('通用设置', data);
            if (data) {
                config = data;
                if (data.autolgn == true) {
                    $('#autoLogin').addClass('icon10');
                } else {
                    $('#autoLogin').removeClass('icon10');
                }
                if (data.MsgSound == true) {
                    $('#soundTip').addClass('icon10');
                } else {
                    $('#soundTip').removeClass('icon10');
                }
				// 快捷键
                if (data.MsgHotkey == 1) {
                    $('.enter-send em').addClass('icon9').removeClass('icon10');
                    $('.enter-crlf em').addClass('icon10').removeClass('icon9');
                } else {
                    $('.enter-send em').addClass('icon10').removeClass('icon9');
                    $('.enter-crlf em').addClass('icon9').removeClass('icon10');
                }
            }
        });
		// 开机启动
        appSetObject.getglobalsettings(1, function(data) {
            console.log('开机启动', data);
            autoRunning = data;
            if (data.RegAppBoot) {
                $('#autoRunning').addClass('icon10');
            } else {
                $('#autoRunning').removeClass('icon10');
            }
        });

		// 修改密码回调
        appSetObject.sigmodifyPasswd.connect(function(data) {
            console.log('修改密码', data);
            if (data.ResponseErrcode == 0) {
                publicObject.showGeneralDlg(102);
				// appSetObject.logout();
            } else {
                if (data.ResponseErrstr != '') {
                    $('#error-tip').html(data.ResponseErrstr).show();
                } else {
                    $('#error-tip').html('密码修改失败，请稍后再试').show();
                }
            }
        });


        // 快捷键
        appSetObject.signalHotKey.connect(function(type, data, flag) {
            console.log('快捷键', type, data, flag);
            if (type === 0) {
                if (data === '无' || data === 'no') {
                    $('.hotkey-print-screen label').html('点击设置快捷键').addClass('disabled');
                } else {
                    $('.hotkey-print-screen label').html(data).removeClass('disabled');
                }
                if (!flag) {
                    $('.hotkey-print-screen .conflict').removeClass('hide');
                } else {
                    $('.hotkey-print-screen .conflict').addClass('hide');
                }
                hotkeyArr[0] = data;
            } else if (type === 1) {
                if (data === '无' || data === 'no') {
                    $('.hotkey-open-window label').html('点击设置快捷键').addClass('disabled');
                } else {
                    $('.hotkey-open-window label').html(data).removeClass('disabled');
                }
                if (!flag) {
                    $('.hotkey-open-window .conflict').removeClass('hide');
                } else {
                    $('.hotkey-open-window .conflict').addClass('hide');
                }
                hotkeyArr[1] = data;
            }
        });

        appSetObject.signalIsCheckConflict.connect(function(data) {
            console.log('冲突检测', data);
            data ? $('.check-hotkey em').removeClass('icon9').addClass('icon10') : $('.check-hotkey em').removeClass('icon10').addClass('icon9');
            hotkeyArr[2] = data;
        });

        appSetObject.sigFileReceivedPath.connect(function(data, defaultSrc) {
            console.log('文件保存路径', data);
            $('#actives-select-w').val(data);
            if (data === defaultSrc) {
                $('#actives-select').find('span').html('Aeromind');
            } else {
				// console.log(data.charAt(data.length-1))
                let testLastLetter = data.charAt(data.length - 1);
                if (testLastLetter == '/' || testLastLetter == '\\') {
                    data = data.substring(0, data.length - 1);
                }

                var msgroute = data.substring(data.lastIndexOf('/') + 1);
                console.log(msgroute);
                $('#actives-select').find('span').html(msgroute);
            }
        });

		// 窗体拖动
        $('#right-top').mousedown(function(e) {
            if (e.which == 1) {
                appSetObject.startMove(e.screenX, e.screenY);
            }
        }).mouseup(function(e) {
            if (e.which == 1) {
                appSetObject.stopMove();
            }
        });
        $('#set-left').mousedown(function(e) {
            if (e.which == 1) {
                appSetObject.startMove(e.screenX, e.screenY);
            }
        }).mouseup(function(e) {
            if (e.which == 1) {
                appSetObject.stopMove();
            }
        });

        appSetObject.onHtmlReady();
    });

	// 缩小窗口
    $('#winMin').on('click', function(e) {
        clearTimeout(timer_);
        e.stopPropagation();
        appSetObject.wndMin();
    });
	// 关闭窗口
    $('#winClose').on('click', function(e) {
        clearTimeout(timer_);
        e.stopPropagation();
        $('.alreadynew').removeClass('animateshow');
        setTimeout(() => {
            appSetObject.wndClose();
        }, 100);
    });

	// 窗口提示
    var timer_;
    $('#winMin').on('mouseover', function() {
        timer_ = setTimeout(function() {
            publicObject.setTip('最小化');
        }, 800);
    }).on('mouseout', function() {
        window.clearTimeout(timer_);
        publicObject.hideTip();
    });
    $('#winClose').on('mouseover', function() {
        timer_ = setTimeout(function() {
            publicObject.setTip('关闭');
        }, 800);
    }).on('mouseout', function() {
        window.clearTimeout(timer_);
        publicObject.hideTip();
    });

	// 阻止子元素拖动窗口
    $('#winMin').mousedown(function(e) {
        e.stopPropagation();
    });
    $('#winClose').mousedown(function(e) {
        e.stopPropagation();
    });
    $('#set-left').find('li').mousedown(function(e) {
        e.stopPropagation();
    });

	// 退出登录
    $('#logout_btn').on('click', function() {
        appSetObject.showLogoutDlg();
    });


	// 展开文件管理
    if (currentOsIsMac) {
        // mac版本
        let msgManage = true;
        $('#common-set-content').find('.msg-m').removeClass('hide');
        $('#mag-select').on('click', function(e) {
            if (msgManage) {
                e.stopPropagation();
                $(this).toggleClass('open');
                $(this).find('.down').css('transform', 'rotate(180deg)');
                msgManage = false;
            } else {
                msgManage = true;
                e.stopPropagation();
                $(this).toggleClass('open');
                $(this).find('.down').css('transform', 'rotate(0deg)');
            }
        });
    } else {
    	console.log('-----------');
        // windows
        $('#common-set-content').find('.msg-w').removeClass('hide');
        $('#mag-w-but').on('click', function(e) {
            e.stopPropagation();
            appSetObject.setFileReceivedPath();
        });
    }

    $('#select-other').on('click', function() {
        appSetObject.setFileReceivedPath();
    });


	// 文件路径右键复制
/*    let copyData = [[{
        text:"复制",
        func: () => {
			let txt = $('#actives-select-w').val();
            $('.for-copy-path').html(txt);
            documentSelectElement2($('.for-copy-path')[0])
            document.execCommand("Copy","false",null);
        }
    }]];
    $('#actives-select-w').smartMenu(copyData, {
        name: "复制"
    });

    $('#actives-select-w').on('mousedown', function (e) {
        if (3 == e.which) {
            documentSelectElement(this)
        }
    }) */
    $('#actives-select-w').on('click', function(e) {
        documentSelectElement(this);
    });
    function documentSelectElement2(element) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNode(element);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function documentSelectElement(element) {
        element.focus();
        element.select();
    }


	// 设置快捷键
    $('.enter-send').on('click', function() {
        $(this).find('em').removeClass('icon9').addClass('icon10');
        $('.enter-crlf').find('em').removeClass('icon10').addClass('icon9');
        config.MsgHotkey = 0;
        appSetObject.generalsettings(1, config, function(result) {
            console.log(result);
        });
    });
    $('.enter-crlf').on('click', function() {
        $(this).find('em').removeClass('icon9').addClass('icon10');
        $('.enter-send').find('em').removeClass('icon10').addClass('icon9');
        config.MsgHotkey = 1;
        appSetObject.generalsettings(1, config, function(result) {
            console.log(result);
        });
    });
    $('.hotkey-print-screen label').on('click', function() {
        appSetObject.showHotKeySetDlg(0, hotkeyArr[0]);
    });
    $('.hotkey-open-window label').on('click', function() {
        appSetObject.showHotKeySetDlg(1, hotkeyArr[1]);
    });
    $('.check-hotkey').on('click', function() {
        appSetObject.isCheckConflict(!hotkeyArr[2]);
    });
    $('.hotkey-print-screen .iconn-11').on('click', function() {
        appSetObject.clearHotKey(0);
    });
    $('.hotkey-open-window .iconn-11').on('click', function() {
        appSetObject.clearHotKey(1);
    });
    $('.default-hotkey').on('click', function() {
        appSetObject.resetHotKey();
        config.MsgHotkey = 0;
        appSetObject.generalsettings(1, config, function(result) {
            console.log(result);
        });
        $('.enter-send em').addClass('icon10').removeClass('icon9');
        $('.enter-crlf em').addClass('icon9').removeClass('icon10');
    });

    $('#autoLogin_').on('click', function() {
        if ($('#autoLogin').hasClass('icon10')) {
            $('#autoLogin').removeClass('icon10');
            config.autolgn = false;
        } else {
            $('#autoLogin').addClass('icon10');
            config.autolgn = true;
        }
        appSetObject.generalsettings(1, config, function(result) {
            console.log(result);
        });
    });
    $('#autoRunning_').on('click', function() {
        if ($('#autoRunning').hasClass('icon10')) {
            $('#autoRunning').removeClass('icon10');
            autoRunning.RegAppBoot = false;
        } else {
            $('#autoRunning').addClass('icon10');
            autoRunning.RegAppBoot = true;
        }
        appSetObject.globalsettings(1, autoRunning, function(result) {
            console.log(result);
        });
    });
    $('#soundTip_').on('click', function() {
        if ($('#soundTip').hasClass('icon10')) {
            $('#soundTip').removeClass('icon10');
            config.MsgSound = false;
        } else {
            $('#soundTip').addClass('icon10');
            config.MsgSound = true;
        }
        appSetObject.generalsettings(1, config, function(result) {
            console.log(result);
        });
    });

	// -----------------修改密码-------------------
    $('#clearOldPwd').on('click', function() {
        $(this).parent().find('input').val('');
        $(this).attr('style', 'display:none;');
        $('#old-pwd').removeClass('error');
        if (errorArr.indexOf('原密码错误') != -1) {
            errorArr.splice(errorArr.indexOf('原密码错误'), 1);
        }
        showTip();
    });
    $('#clearNewPwd').on('click', function() {
        $(this).parent().find('input').val('');
        $(this).attr('style', 'display:none;');
        $('#new-pwd').removeClass('error');
        if (errorArr.indexOf('密码长度6-20位') != -1) {
            errorArr.splice(errorArr.indexOf('密码长度6-20位'), 1);
        }
        if (errorArr.indexOf('密码不能包含中文') != -1) {
            errorArr.splice(errorArr.indexOf('密码不能包含中文'), 1);
        }
        showTip();
    });
    $('#clearConfirmPwd').on('click', function() {
        $(this).parent().find('input').val('');
        $(this).attr('style', 'display:none;');
        $('#confirm-pwd').removeClass('error');
        if (errorArr.indexOf('两次密码不一致') != -1) {
            errorArr.splice(errorArr.indexOf('两次密码不一致'), 1);
        }
        showTip();
    });
    $('#old-pwd,#new-pwd,#confirm-pwd').blur(function() {
        checkParam();
    });
    $('#old-pwd,#new-pwd,#confirm-pwd').on('keydown', function() {
        $(this).parent().find('a').removeAttr('style');
    });

    $('#confirmModify').on('click', function() {
        checkParam();
        var oldPwd = $('#old-pwd').val().trim();
        var newPwd = $('#new-pwd').val().trim();
        var confirmPwd = $('#confirm-pwd').val().trim();
        if (errorArr.length == 1 && oldPwd != '' &&
				newPwd != '' && confirmPwd != '') {
            appSetObject.modifyPasswd({
                'OldPasswd': oldPwd,
                'NewPasswd': newPwd
            });
        }
    });
});

var errorArr = [''];
/**
 * 校验修改密码参数
 */
function checkParam() {
    var oldPwd = $('#old-pwd').val().trim();
    var newPwd = $('#new-pwd').val().trim();
    var confirmPwd = $('#confirm-pwd').val().trim();
    if (newPwd != '' && confirmPwd != '') {
        if (newPwd != confirmPwd) {
            $('#confirm-pwd').addClass('error');
            if (errorArr.indexOf('两次密码不一致') == -1) {
                errorArr.push('两次密码不一致');
            }
        } else {
            $('#confirm-pwd').removeClass('error');
            if (errorArr.indexOf('两次密码不一致') != -1) {
                errorArr.splice(errorArr.indexOf('两次密码不一致'), 1);
            }
        }
    }
    if (newPwd != '') {
        if (newPwd.length < 6 || newPwd.length > 20) {
            $('#new-pwd').addClass('error');
            if (errorArr.indexOf('密码长度6-20位') == -1) {
                errorArr.push('密码长度6-20位');
            }
        } else {
            var reg = reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
            if (reg.test(newPwd)) {
                $('#new-pwd').addClass('error');
                if (errorArr.indexOf('密码不能包含中文') == -1) {
                    errorArr.push('密码不能包含中文');
                }
            } else {
                $('#new-pwd').removeClass('error');
                if (errorArr.indexOf('密码长度6-20位') != -1) {
                    errorArr.splice(errorArr.indexOf('密码长度6-20位'), 1);
                }
                if (errorArr.indexOf('密码不能包含中文') != -1) {
                    errorArr.splice(errorArr.indexOf('密码不能包含中文'), 1);
                }
            }
        }
    }
    if (oldPwd != '') {
        appSetObject.checkPasswd(oldPwd, function(result) {
            console.log('旧密码检查结果', result);
            if (result == false) {
                $('#old-pwd').addClass('error');
                if (errorArr.indexOf('原密码错误') == -1) {
                    errorArr.push('原密码错误');
                }
            } else {
                $('#old-pwd').removeClass('error');
                if (errorArr.indexOf('原密码错误') != -1) {
                    errorArr.splice(errorArr.indexOf('原密码错误'), 1);
                }
            }
            showTip();
        });
    } else {
        showTip();
    }
}

/**
 * 显示修改密码提示
 */
function showTip() {
    if (errorArr[errorArr.length - 1] != '') {
        $('#error-tip').html(errorArr[errorArr.length - 1]);
        $('#error-tip').removeAttr('style');
    } else {
        $('#error-tip').attr('style', 'display:none;');
        $('#error-tip').html('');
    }
}

/**
 * 切换设置目录
 */
function switchSet(menu) {
    $(menu).find('a').addClass('active');
    $(menu).siblings().find('a').removeClass('active');
    $('#right-con').children().attr('style', 'display:none;');
    $('#' + $(menu).attr('id') + '-content').removeAttr('style');
}
