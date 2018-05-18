/*
 * Li Xiangkai
 * Date: 2017-01-12
 */
var accounts = new Map();
var logining = false;
$(function() {
    var rememberData;
	// 注册qt全局对象及回调
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.loginObject = channel.objects.qloginObject;
        window.publicObject = channel.objects.qWebPublicObj;
        window.qDownloadPhoneVersionObject = channel.objects.qDownloadPhoneVersionObject;

        loginObject.sigLoadData.connect(function(data){
            $('#login-loading').find('p').html('数据加载中')
        });

		// 记住密码数据回调
        loginObject.sigOnHtmlReadyRes.connect(function(Res, Value) {
            var data = JSON.parse(Res);
            var isAutoLogin = Value;
            if (data.length != 0) {
                var arr = [];
                for (var i = 0; i < data.length; i++) {
                    arr.push(data[i].sid);
                    accounts.put(data[i].sid, data[i]);
                }
                accounts.put('accounts', arr);
                rememberData = data[0];
            }
            initRemember(data, isAutoLogin);
        });

		// 登录结果状态码
        loginObject.sigLoginRes.connect(function(Res) {
			// alert(Res);
            console.log(Res);
            var resData = JSON.parse(Res);
            if (resData.ResponseErrcode !== '0') {
                logining = false;
            }
            if (resData.ResponseErrcode == 0) {
				// 登录成功，不做处理，等待数据回调
            } else if (resData.ResponseErrcode == 12001) {
                showTip('手机号与密码不匹配，请重新输入');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 12002) {
                showTip('手机号码不存在，请重新输入');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -2) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3000)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -3) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3001)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -4) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3002)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -10) {
                showTip('网络连接异常，请检查网络状态');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -11) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3003)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == -110) {
                showTip('非国美互联网员工，请先登录移动端体验');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 100) {
                showTip('该用户不存在');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 2000) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2000)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 2001) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2001)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 2002) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2002)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 2003) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2003)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (resData.ResponseErrcode == 2004) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2004)');
                $('#login-loading').attr('style', 'display:none;');
            } else {
                showTip('系统出现错误，请稍候重试(ErrorCode:3004)');
                $('#login-loading').attr('style', 'display:none;');
            }
        });
        loginObject.sigDisconnectNotify.connect(function(errorCode) {
            console.log('断网');
            if (errorCode == -10) {
                showTip('网络连接异常，请检查网络状态');
                $('#login-loading').attr('style', 'display:none;');
            } else if (errorCode == 2005) {
                showTip('系统出现错误，请稍候重试(ErrorCode:2005)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (errorCode == -2) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3000)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (errorCode == -3) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3001)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (errorCode == -4) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3002)');
                $('#login-loading').attr('style', 'display:none;');
            } else if (errorCode == -11) {
                showTip('系统出现错误，请稍候重试(ErrorCode:3003)');
                $('#login-loading').attr('style', 'display:none;');
            } else {
                showTip('系统出现错误，请稍候重试(ErrorCode:3004)');
                $('#login-loading').attr('style', 'display:none;');
            }
            $('#login-loading').attr('style', 'display:none;');
        });

        //登录页弹出二维码下载页
        $('.login-download-phone').click(function(){
            window.qDownloadPhoneVersionObject.showDownloadPhoneVersionDlg();
        })

	    // 窗体拖动

        $('body').mousedown(function(e) {
            if (e.which == 1) {
                window.loginObject.startMove(e.screenX, e.screenY);
            }
        }).mouseup(function(e) {
            if (e.which == 1) {
                window.loginObject.stopMove();
            }
        });

		// 子元素不触发拖动
	    $('#winMin,#winClose,#login-name,#login-form,#fl,#fr').mousedown(function(e) {
	    	e.stopPropagation();
    });

		// 最小化和关闭
        $('#winClose').click(function() {
            clearTimeout(timer_);
            loginObject.wndClose();
        });
        $('#winMin').click(function() {
            clearTimeout(timer_);
            loginObject.wndMin();
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

		// 激活账号和找回密码
        $('#activateAccount').click(function() {
            publicObject.openUrl(2, '');
        });
        $('#retrievePassword').click(function() {
            publicObject.openUrl(1, '');
        });

        //注册企业
        $('#registeredEnterprise').click(function(){
            publicObject.openUrl(0, 'https://work.gomeplus.com/pages/createCompany/createCompany.html');
        });

		// 聚焦禁用输入法
        $('#password').on('focus', function() {
            publicObject.disableIME();
        });

		// 失焦启用输入法
        $('#password').on('blur', function() {
            publicObject.enableIME();
        });

		// 页面准备完成显示窗口
        window.loginObject.onHtmlReady();
    });

	// 禁止右键菜单
	/* $('#win_box').contextMenu(function(){
		return false;
	}); */

	// 页面逻辑
    $('body').on('keyup', function(e) {
        if (e.keyCode == '13') {
            login();
        }
    });
    $('#loginBtn').on('click', function() {
        login();
    });
    $('#rememberPwd_').on('click', function() {
        if ($('#rememberPwd').hasClass('icon10')) {
            $('#rememberPwd').removeClass('icon10');
            $('#autoLogin').removeClass('icon10');
        } else {
            $('#rememberPwd').addClass('icon10');
        }
    });
    $('#autoLogin_').on('click', function() {
        if ($('#autoLogin').hasClass('icon10')) {
            $('#autoLogin').removeClass('icon10');
        } else {
            $('#autoLogin').addClass('icon10');
            $('#rememberPwd').addClass('icon10');
        }
    });
    $('#clearUsername').on('click', function() {
        matcheAccountFailInLocal(true);
    });
    $('#username').on('keyup', function(e) {
        if (e.keyCode != '13') {
            var username = $('#username').val();
            if (matcheAccountSucessInLocal(username)) {
                var account_ = accounts.get(username);
                formatLoginName(account_);
                formatmemerypwdBtnAndAutoLogin(account_);
            } else {
                matcheAccountFailInLocal(false);
            }
		/* if(username == rememberData.sid){
			$('#login-name').html(getNickName(rememberData.name));
			$('#login-name').attr('style','background:'+ getNickNameColor(rememberData.oaId) +';');
			if(rememberData.memerypwd == 1){
				$('#password').val(rememberData.password);
				$('#loginBtn').addClass('active');
				$('#rememberPwd').addClass('iconn-10');
			}
		}else{
			$('#login-name').html('Aeromind');
			$('#login-name').removeAttr('style');
			$('#password').val('');
			$('#loginBtn').removeClass('active');
			$('#rememberPwd').removeClass('iconn-10');
		} */
            if (username != '') {
                $('#clearUsername').addClass('active');
            } else {
                $('#clearUsername').removeClass('active');
                $('#loginBtn').removeClass('active');
            }
            if ($('#password').val().replace(/\s/g, '') != '' && username.replace(/\s/g, '') != '') {
                $('#loginBtn').addClass('active');
            }
        }
    });
    $('#password').on('keyup', function() {
        var password = $('#password').val();
        if (password != '' && $('#username').val().replace(/\s/g, '') != '') {
            $('#loginBtn').addClass('active');
        } else {
            $('#loginBtn').removeClass('active');
        }
    });
	/* $('#username,#password').on('keydown',function(e){
		if (e.keyCode == "13") {
			login();
		}
	}); */
});
/**
 * 匹配本地账户成功
 * @param clearCount 是否点击右侧清空账户
 */
 // 文件列表hover图片预先加载
        var loginNameImg = document.createElement('img');
        loginNameImg.src = '../images/public/桌面端登录.png';
        var downloadHoverImg = document.createElement('img');
        downloadHoverImg.src = '../images/public/移动版－hover@2x.png';
function matcheAccountFailInLocal(clearCount) {
    $('#login-name').html('');
    $('#login-name').removeAttr('style').addClass('login-images');
    $('#password').val('');
    $('#loginBtn').removeClass('active');
    $('#rememberPwd').removeClass('icon10');
    $('#autoLogin').removeClass('icon10');
    if (clearCount) {
        $('#username').val('');
        $('#clearUsername').removeClass('active');
        $('#pop-warning').hide();
    }
}
/**
 * 匹配本地账户成功
 */
function matcheAccountSucessInLocal(username) {
    return accounts.get('accounts') != undefined && accounts.get('accounts').indexOf(username) != -1;
}
/**
 * 匹配账户成功后 格式化登录名
 */
function formatLoginName(account_) {
    $('#login-name').html(getNickName(account_.name));
    $('#login-name').attr('style', 'background:' + getNickNameColor(account_.oaId) + ';').removeClass('login-images');
}
/**
 * 匹配账户成功后 格式化自动登录
 */
function formatmemerypwdBtnAndAutoLogin(account_) {
    if (account_.memerypwd == 1) {
        $('#password').val(account_.password);
        $('#loginBtn').addClass('active');
        $('#rememberPwd').addClass('icon10');
    } else {
        $('#password').val('');
        $('#loginBtn').removeClass('active');
        $('#rememberPwd').removeClass('icon10');
    }

    if (account_.autolgn === '1') {
        $('#autoLogin').addClass('active');
    } else {
        $('#autoLogin').removeClass('icon10');
    }
}


/**
 * 登录
 */
function login() {
    if (!logining) {
        logining = true;
    } else {
        return;
    }
    console.log('logining');
    var check = checkParam();
    if (check == true) {
        $('#login-loading').removeAttr('style');
        var remember;
        var autoLogin;
        if ($('#rememberPwd').hasClass('icon10')) {
            remember = 1;
        } else {
            remember = 0;
        }
        if ($('#autoLogin').hasClass('icon10')) {
            autoLogin = 1;
        } else {
            autoLogin = 0;
        }

        var username = $('#username').val();
        var password = $('#password').val();

        var data = '{"name":"' + username + '","password":"' + password + '","memerypwd":"' + remember + '","autolgn":"' + autoLogin + '"}';
        loginObject.login(data);
    }
}

/**
 * 记住密码初始化
 * @param data
 */
function initRemember(data, loginmethod) {
    console.log(data);
    if (data.length != 0) {
        var rememberData = data[0];
        $('#login-name').html(getNickName(rememberData.name));
        $('#login-name').attr('style', 'background:' + getNickNameColor(rememberData.oaId) + ';').removeClass('login-images');
        $('#username').val(rememberData.sid);
        $('#clearUsername').addClass('active');
        if (rememberData.memerypwd == 1) {
            $('#password').val(rememberData.password);
            $('#loginBtn').addClass('active');
            $('#rememberPwd').addClass('icon10');
            if (rememberData.autolgn == 1) {
                $('#autoLogin').addClass('icon10');
            }
            if (rememberData.autolgn == 1 && loginmethod == 1) {
                login();
            }
        }
    }
}

/**
 * 显示登录提示
 * @param Str
 */
function showTip(Str) {
    $('#pop-warning').html(Str);
    $('#pop-warning').removeAttr('style');
}

/**
 * 校验登录参数
 */
function checkParam() {
    if ($('#username').val().replace(/\s/g, '') == '') {
        showTip('请输入手机号');
        logining = false;
        return false;
    }
    if ($('#password').val().replace(/\s/g, '') == '') {
        showTip('请输入密码');
        logining = false;
        return false;
    }
    if ($('#password').val().length < 6 || $('#password').val().length > 20) {
        showTip('密码长度6-20位');
        logining = false;
        return false;
    }
    return true;
}
