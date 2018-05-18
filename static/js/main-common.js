/*
 *  Created by Li Xiangkai
 *  Date:2017-01-13
 *  Instructions:
 *  	PC主窗口通用结构，包括qt对象初始化，回调绑定，页面事件绑定，页面通用动作等
 */

function setWinMaxSize() {
    windowSize = true;
    $('#winMax').removeClass('iconn-45').addClass('winOri');
}

function setWinMinSize() {
    windowSize = false;
    $('#winMax').addClass('iconn-45').removeClass('winOri');
}

var readyNum = 0;
var groupIdWhenUnVisible = '';
var openNewConversation = false;
var appIsVisible = true;
var chatSession = [];
var noticeCardMsg = {};
var initApplicationMessageList = false;
var applicationMessageNum = 0;
var scrollToApplication = false;
var applicationMessageConfig = {
    refreshing: false,
    timeArr: [],
    needTimeSign: false
};
var getChannelListFailedConfig = {
    failed: false,
    timer: null,
    times: 0,
    reconnectedFlag: 0
};

$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.mainObject = channel.objects.qMainObject;
        window.publicObject = channel.objects.qWebPublicObj;
        window.qFileTransferObj = channel.objects.qFileTransferObj;
        window.menuObject = channel.objects.qMenuObject;
        window.appSetObject = channel.objects.qAppsetObj;
		/* window.maindlg_channel=channel.objects.maindlg_channel; */

        if (currentOsIsMac) {
            console.log($('#right-top, #im-left, #im-config, .right-con, .right-list, #im-more, .chat-title, .con-title').addClass('mac-resize'));
        }

		// -----------------和qt相关的通用绑定---------------------------

		// 获取当前登录用户的信息
        mainObject.GetMyInfo(function(data) {
            console.log('我的信息', data);
            window.localStorage.myinfo = data;
            myInfo = data;
            initMyInfo(data);
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
            window.VueApp.$store.dispatch('getMyInfo', _deepClone(data));
        });

        // 获取环境
        publicObject.isShowNavigation(function({status, environment}) {
            window.VueApp.$store.dispatch('setEnvironment', environment);

            // 增加大数据统计代码
            if (environment === 'pre') { // 预生产环境
                loadScript('http://js.uatplus.com/sitemonitor/bigdata-mbp.js');
            } else if (environment === 'pro') { // 生产环境
                loadScript('http://js.gomein.net.cn/sitemonitor/bigdata-mbp.js');
            }
        });

        mainObject.sigIsMaxmized.connect(function() {
            console.log('sigIsMaxmized');
            setWinMaxSize();
        });

        //解散企业回调
        mainObject.sig_enterpriseDissolutionNotify.connect(function(data){
            console.log(data);
            window.VueApp.$dismiss({
                message: '您所在的企业“'+data+'”已被管理员解散，请退出登录',
                confirmText: '退出登录',
                confirmFn() {
                    window.VueApp.$api.showLogoutDlg();
                }
            })
        })

        // 用户选择文件列表回调
        qFileTransferObj.sigSelectedFilePath.connect(function(arr) {
            console.log('插入文件: ', arr);
            insertFile(arr);
        });

        // 用户选择文件列表回调
        qFileTransferObj.sigStatus.connect(function(gid, msgid, status) {
            console.log('状态回调: ', gid, msgid, status);
            fileUtil2.changeState(gid, msgid, status);
            fileDeleted(gid, msgid, status);
        });

		// 用户下载文件回调
        qFileTransferObj.sigProgress.connect(function(gid, msgid, total, processSize) {
            // console.log('下载回调: ', gid, msgid, total, processSize);
            fileUtil2.downloadCallback(msgid, processSize, total);
            console.log(total, processSize);
            fileProgress(msgid, total, processSize);
        });

		// 用户下载完成文件回调
        qFileTransferObj.sigFinish.connect(function(gid, msgid, type, path) {
            console.log('下载完成回调: ', gid, msgid, type, path);
            fileUtil2.finishCallback(msgid, path, type, gid);
            fileFinish(msgid, type, path);
        });

		// 用户错误回调
        qFileTransferObj.sigError.connect(function(gid, msgid, code) {
            console.log('错误回调: ', gid, msgid, code);
            fileUtil2.errorCallback(msgid, gid);
            fileError(msgid, code);
        });

        appSetObject.sigInvolkeSucceed.connect(function(data) {
            console.log('检查更新', data);
            window.VueApp.$store.commit('SET_UPDATE_STATUS', data);
        });

        // 应用页面未读数
        mainObject.sigGetPublishBubble.connect(function(data) {
            console.log('应用页面未读数', data);
            // window.VueApp.$store.dispatch('setApplicationUnreadNum', data);
        });

        // 应用页面通知
        mainObject.sigPublishBubbleChanged.connect(function(data) {
            console.log('应用通知', data);
            window.VueApp.$store.dispatch('receiveApplicationNotify', data);
        });

        // 应用动态配置
        var PublishBubbleImgData;
        PublishBubbleImgData = {
            width:91,
            height:91
        }
        mainObject.getAppInfoList(PublishBubbleImgData)

        mainObject.sig_getAppInfoList.connect(function(data) {
            console.log('应用动态回调***', data);
            window.VueApp.$store.dispatch('setApplicationOfficialApp', data);
        });



        // 获取应用卡片信息
        mainObject.sigGetNoticeCardMessage.connect(function(data) {
            noticeCardMsg = JSON.parse(data);
            if (noticeCardMsg.code !== 0){
                return;
            }
            console.log('sigGetNoticeCardMessage', noticeCardMsg);
            noticeCardMsg = Object.assign({
                GroupId: 'applicationMessage',
                MsgSendName: '工作通知',
                GroupType: 'applicationMessage',
                MsgTime: myformatMsgTime(noticeCardMsg.data.newMessage.sendTime, true),
                MsgTimellong: noticeCardMsg.data.newMessage.sendTime.toString(),
                MsgType: '1',
                MsgContent: noticeCardMsg.data.newMessage.title,
                SessionTopmark: '0',
                SessionisMute: noticeCardMsg.data.module.isReceive ? '0' : '1',
                Status: '1',
                UnreadmsgCount: noticeCardMsg.data.count.toString()
            }, noticeCardMsg);
            if (noticeCardMsg.isDeleate) {
                if (noticeCardMsg.data.count === 0) {
                    return;
                }
                mainObject.setNoticeCardMessageDelete(false, '');
            }
            chatSession.unshift(noticeCardMsg);
            chatSession.sort((item1, item2) => {
                return parseInt(item2.MsgTimellong) - parseInt(item1.MsgTimellong)
            });
            initSession(chatSession);
        });

        // 获取应用页面message列表
        mainObject.sigGetNoticeOfApplicationMessageList.connect(function(data) {
            console.log('sigGetNoticeOfApplicationMessageList', JSON.parse(data));
            renderApplicationMessageList(JSON.parse(data).data.list, initApplicationMessageList);
            initApplicationMessageList = true;
        });

        // 工作通知更新信号
        mainObject.sigNoticeOfApplicationMessage.connect(function(data) {
            var card = JSON.parse(JSON.parse(data).extra);
            // var msg = card.newMessage;
            // var count = card.count;
            console.log('sigNoticeOfApplicationMessage', card);
            addNewApplicationMessage(card);

            var config = {
                groupId: 'applicationMessage',
                extra: '{"isMsgBlocked": ' + (card.module.isReceive ? 0 : 1) + '}'
            };
            setSessionMuteNotify(config);
        });

        // 应用通知上报已读回调
        mainObject.sigNoticeCardReadMessageResult.connect(function(data) {
            // console.log('sigNoticeCardReadMessageResult', data);
        })

        // 应用通知免打扰设置回调
        mainObject.sigNoticeCardDisturbResult.connect(function(data) {
            var config = {
                groupId: 'applicationMessage',
                extra: '{"isMsgBlocked": ' + (JSON.parse(data).data.module.isReceive ? 0 : 1) + '}'
            };
            setSessionMuteNotify(config);
        });

        // 应用通知删除回调
        mainObject.sigNoticeCardDeleteResult.connect(function(data) {
            console.log('sigNoticeCardDeleteResult', data)
        });

        // 刷新回调
        mainObject.sigRefreshOrgAndContactFinishedNotify.connect(function(data) {
            refreshisfinished = true;
            if (data == true) {
                $('.freshIng').addClass('hideList');
                $('#global-context-menu').addClass('hideList');
                $('#global-context-menu div').addClass('hideList');
                $('.refreshing-dept-context-menu').addClass('hideList');
                $('.freshSuccess').removeClass('hideList');
                setTimeout(function() {
                    $('.freshSuccess').addClass('hideList');
                }, 2000);
            } else if (data == false) {
                $('.freshIng').addClass('hideList');
                $('.freshError').removeClass('hideList');
            }
            console.log(data, '刷新ok');
        });

        // 用户移动端撤回后桌面端撤回回调

		// 添加群声音弹窗回调
        mainObject.sigShowAddDialog.connect(function(data) {
            console.log(data);
            membersWindow(data);
        });

        // mac取消全屏通知
        mainObject.sigCancelWindowMaxSize.connect(function() {
            if (windowSize === true) {
                windowSize = false;
                $('#winMax').removeClass('winOri');
                mainObject.setMaxNormal(false);
                mainObject.wndEnlarge(windowSize);
                $(this).addClass('iconn-45');
            }
        });

        // 刷新失败重试
        $('#contacts-content div.freshError').on('click', 'span.refreshAgain', function() {
            refreshDept();
            $('.freshError').addClass('hideList');
        });

        // 刷新失败关闭
        $('#contacts-content div.freshError').on('click', 'span.freshErrorClosed', function() {
            $('.freshError').addClass('hideList');
        });

		// 窗口拖动
        var moving = false;
        $('#im-left, #right-top, .channel-title, .con-title, .contacts-title, #members-list-title, .application-content-title').mousedown(function(e) {
            if (e.which == 1) {
                mainObject.startMove(e.screenX, e.screenY);
                moving = true;
            }
        }).mouseup(function(e) {
            if (e.which == 1) {
                mainObject.stopMove();
                $('#im-left,#right-top').removeClass('pointer');
                moving = false;
            }
        }).mousemove(function(e) {
            if (e.which == 1 && moving) {
                $('#im-left,#right-top').addClass('pointer');
            }
        });

	    $('#right-top').mouseenter(function(e) {
            mainObject.enter_topbar();
        }).mouseleave(function(e) {
            mainObject.leave_topbar();
        });

        $('.con-title').mouseenter(function(e) {
            mainObject.enter_topbar();
        }).mouseleave(function(e) {
            mainObject.leave_topbar();
        });

        $('.contacts-title').mouseenter(function(e) {
            mainObject.enter_topbar();
        }).mouseleave(function(e) {
            mainObject.leave_topbar();
        });


		// 禁止子元素产生拖动
        var imLeftChildren = $('#im-left').children();
        var rightTopChildren = $('#right-top').children();
        $(imLeftChildren).mousedown(function(e) {
	    	e.stopPropagation();
        }).mouseup(function(e) {
            e.stopPropagation();
        });
        $(rightTopChildren).mousedown(function(e) {
	    	e.stopPropagation();
        }).mouseup(function(e) {
            e.stopPropagation();
        });

		// 窗口最大化最小化关闭
        $('#winMin').on('click', function(e) {
            clearTimeout(timer_);
            mainObject.wndMin();
        });
        $('#winClose').on('click', function(e) {
            clearTimeout(timer_);
            mainObject.wndClose();
        });
        $('#winMax').on('click', function(e) {
            clearTimeout(timer_);
            if (windowSize == false) {
			    windowSize = true;
                $('#winMax').addClass('winOri');
			    mainObject.setMaxNormal(true);
                mainObject.wndEnlarge(windowSize);
                $(this).removeClass('iconn-45');
            } else {
			    windowSize = false;
                $('#winMax').removeClass('winOri');
			    mainObject.setMaxNormal(false);
                mainObject.wndEnlarge(windowSize);
                $(this).addClass('iconn-45');
            }
        });

		// 窗口提示
        var timer_;
        $('#app').on('mouseout', function() {
            clearTimeout(timer_);
        });

        $(document).on('mouseover', '.star-contact-active', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('取消星标联系人');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });


        $(document).on('mouseover', '.star-contact-inactive2', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('设为星标联系人');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $(document).on('mouseover', '.iconn-application', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('应用中心');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        $(document).on('mouseover', '#im-more', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('更多');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        $(document).on('mouseover', '.star-contact-active2', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('取消星标联系人');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 阻止操作栏和发送栏鼠标拖动会改变输入区光标位置
        $(document).on('mousemove', '.val-title, btn-box', function(e) {
            e.preventDefault();
        })

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
        $('#winMax').on('mouseover', function() {
            if (windowSize == false) {
                timer_ = setTimeout(function() {
                    publicObject.setTip('最大化');
                }, 800);
            } else {
                timer_ = setTimeout(function() {
                    publicObject.setTip('还原');
                }, 800);
            }
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#im-chat em').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('消息');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#im-contact em').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('通讯录');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#im-config em').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('设置');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#selectFace').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('选择表情');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#selectPic').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('发送图片');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#selectFile').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('发送文件');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#sendAcknowledgementMsg').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('发送回执');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('.search-btn').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('发起群聊');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });
        $('#iconn-icon-list').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('查看文件');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });


        $('#im-channel').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('频道');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });


        $('.iconn-icon-close').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('关闭文件列表');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        $('#chat-title').on('mouseover', function() {
            var html = $(this).html();
            var offsetWidth = this.offsetWidth;
            var boxWidth = $('#chatArea').width() - 20;
            if (html != '' && offsetWidth > boxWidth) {
                timer_ = setTimeout(function() {
                    publicObject.setTip(html);
                }, 800);
            }
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        $('#faces').on('mouseover', 'img', function() {
            let $this = $(this);
            timer_ = setTimeout(function() {
                publicObject.setTip($this.attr('tips'));
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 屏幕截图
        $('#printScreen').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('屏幕截图(Alt+S)');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 搜索联系人tips
        $('.search-members-show').on('mouseover', 'li', function() {
            var data = $(this).data();
            timer_ = setTimeout(function() {
                publicObject.setTip(data.deptName + ' ' + data.dutyName);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 搜索群组tips
        $('.search-groups-show').on('mouseover', 'li', function() {
            var data = $(this).data();
            timer_ = setTimeout(function() {
                publicObject.setTip(data.groupName);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 群聊搜索联系人tips
        $('#search-personList').on('mouseover', 'li', function() {
            var deptname = $(this).attr('deptname');
            var dutyname = $(this).attr('dutyname');
            timer_ = setTimeout(function() {
                publicObject.setTip(deptname);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // //群聊常用联系人tips
        $('#contact-personList').on('mouseover', 'li', function() {
            var deptname = $(this).attr('deptname');
            var dutyname = $(this).attr('dutyname');
            timer_ = setTimeout(function() {
                publicObject.setTip(deptname);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 群聊部门树tips
        $('#groupTree-personList').on('mouseover', 'li', function() {
            var deptname = $(this).attr('deptname');
            var dutyname = $(this).attr('dutyname');
            timer_ = setTimeout(function() {
                publicObject.setTip(deptname);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 单聊联系人部门和职务tips
        $('#chat-deptAndDuty').on('mouseover', function() {
            var deptAndDuty = $(this).find('.deptAndDutyContent').html();
            deptAndDuty = replaceAll(deptAndDuty, '&amp;', '&');
            timer_ = setTimeout(function() {
                publicObject.setTip(deptAndDuty);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 文件列表文件名tip
        $('#file-list-ul').on('mouseover', '.file-name', function() {
            var fileName = $(this).attr('fileName');
            timer_ = setTimeout(function() {
                publicObject.setTip(fileName);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        //电脑在线
        $('.pcOnlineState').on('mouseover', function() {
            timer_ = setTimeout(function() {
                publicObject.setTip('电脑在线');
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        // 文件回发
        $('.fileSendReturn .filename').on('mouseover', function() {
            timer_ = setTimeout(function() {
                let name = $('.fileSendReturn .filename').html();
                publicObject.setTip(name);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

        $('.fileSendReturn .localtion').on('mouseover', function() {
            timer_ = setTimeout(function() {
                let localtion = $('.fileSendReturn .localtion').html();
                publicObject.setTip(localtion);
            }, 800);
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });


        $('#msgArea').on('mouseover', '.list-text ', function() {
           // console.log(this);
            if ($(this).attr('data-msgtype') == 6) {
                let name = $(this).find('.icon-wrapper').attr('data-file-name');
                // console.log(name)
                timer_ = setTimeout(function() {
                    publicObject.setTip(name);
                }, 800);
            }
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });


        let copyData = [[{
            text: '复制',
            func: () => {
                document.execCommand('Copy', 'false', null);
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }]];
        $('#group-name').smartMenu(copyData, {
            name: '复制'
        });

        $('#group-name').on('mousedown', function(e) {
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

        $('#group-bulletin').smartMenu(copyData, {
            name: '复制'
        });

        $('#group-bulletin').on('mousedown', function(e) {
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

        $('.application-message-list').on('scroll', function(e) {
            if ($('.application-message-list').scrollTop() === 0 && parseInt($('.application-message-list-new .num').html()) > 0) {
                console.log('application-message-list-scroll', e, $('.application-message-list').scrollTop());
                refreshApplicationMessage();
            }
        });

        $('.application-message-list').on('click', '.application-message-list-more a', function() {
            loadMoreApplicationMessage();
            $('.application-message-list-more').remove();
        });
        /**
         * 绑定session事件
         */
        // 绑定click事件
        $('#session').on('click', 'li', function() {
            if (!$('.im-chat').hasClass('active')) {
                $('.im-chat').click();
            }
            $('.search-list .right-con').addClass('hideList');
            $('#search').find('.iconn-11').addClass('hideList');
            openSession(this);
            var sessionData = $(this).data();
            $('#file-btn').data(sessionData);

            // //在线离线请求
            // $('.pcOnlineState').addClass('hideList');
            // if (sessionData.GroupType == 1) {
            //     var imId = ""
            //     var myImId = myInfo.imUserid.toString();
            //     var imAry = sessionData.GroupId.split('_');
            //     if (imAry[0] == imAry[1]) {
            //         imId = imAry[0];
            //     } else {
            //         for (var i=0; i<imAry.length; i++) {
            //             if (myImId !== imAry[i]) {
            //                 imId = imAry[i]
            //             }
            //         }
            //     }
            //     mainObject.getOnlineState(imId,function(){
            //         console.log('在线请求发送',imId);
            //     })
            // }
        });

        // 1-在线；2-离开；3-忙碌；4-请勿打扰；5-隐身；6-离线
        mainObject.sigOnlineState.connect(function(data){
            console.log('在线状态回调',data);
            var imId = ""
            var myImId = myInfo.imUserid.toString();
            var imAry = typeof (CHATOBJ.groupId) === 'string'?CHATOBJ.groupId.split('_'):'';
            if (imAry[0] == imAry[1]) {
                imId = imAry[0];
            } else {
                for (var i=0; i<imAry.length; i++) {
                    if (myImId !== imAry[i]) {
                        imId = imAry[i]
                    }
                }
            }
            if (imId == data[0].userId) {
                if (data[0].pc === 1) {
                    $('.pcOnlineState').removeClass('hideList');
                } else {
                    $('.pcOnlineState').addClass('hideList');
                }
            }
        })

        // 绑定右键菜单
        $('#session').on('contextmenu', 'li', function() {
            openGlobalContextMenu('session', this.id.replace('session-', ''));
        });

        // 查询回执消息已读未读人员
       /* mainObject.sigGetReadAndUnReadMembers.connect(function (readedObj,unreadObj) {
			console.log('查询回执消息已读人员列表',readedObj);
			console.log('查询回执消息未读人员列表',unreadObj);
            acknowledgeFnObj2.getMemberlistCallback(readedObj.users,unreadObj.users);
        }) */


        mainObject.sigDelStarContactNotify.connect(function(obj) {
            console.log('删除星标联系人', obj);
            if (obj.ResponseErrcode === 0) {
                mainObject.getContact();
            } else {
                showToast();
            }
        });
        mainObject.sigAddStarContactNotify.connect(function(obj) {
            console.log('增加星标联系人', obj);
            if (obj.ResponseErrcode === 0) {
                mainObject.getContact();
            } else {
                showToast();
            }
        });

        mainObject.sigGetUnReadCountResult.connect(function(obj) {
            console.log('查询回执消息已读读人数量', obj);
            acknowledgeFnObj.GetUnReadCountResultCallback(obj);
        });
        // 已读消息通知
        mainObject.sigGetMsgPeerReaded.connect(function(obj) {
            console.log('已读消息通知', obj);
            // console.log('已读消息通知',obj);
            acknowledgeFnObj.GetMsgPeerReadedCallback(obj);
        });

        mainObject.sigClickOnTheTray.connect(function(sessionid, isChannel) {
            console.log('双击托盘', sessionid, isChannel);
           /*  if (!openNewConversation) {
                 openNewConversation = true;
                 return;
             } */
             // openUnreadSenssion();
            // window.VueApp.$store.dispatch('openUnreadChannelOrSenssion');
            var data = {
                sessionid: sessionid,
                type: isChannel ? '3' : '2'
            };
            window.VueApp.$store.dispatch('openMsgBoxChannelOrSession', data);
        });

        mainObject.sigRevolkeMessageReturn.connect(function(bRet, gid, msgid) {
            console.log('chehui -----------', bRet);
            if (bRet) {
                RevokeMsgUtil.revoke({
                    fromUid: myInfo.imUserid,
                    nickName: myInfo.myname,
                    GroupId: gid,
                    msgId: msgid,
                    optTime: '',
                    extra: ''
                });
            } else {
                // 撤回失败
                // TODO
                console.error('撤回失败');
            }
        });
        /**
         * 主动撤回消息回调
         */
        mainObject.sigissueRevokeMsgNotify.connect(function(obj) {
            RevokeMsgUtil.revoke(obj);
        });
        /* senderId, nickName, GroupId,MsgId,optTime,extra */
		// 断网通知和重连通知
        mainObject.sigDisconnectNotify.connect(function(errorCode) {
            console.log('断网', errorCode, CHATOBJ);
            var text = '',
                data = false;
            if (errorCode === 110002) {
                $('#no-wifi').find('span').html('当前网络不可用');
                text = '当前网络不可用';
                window.VueApp.$store.dispatch('changeConnectedStatus', {data, text});
            } else {
                $('#no-wifi').find('span').html('正在恢复消息服务...');
                text = '正在恢复消息服务...';
                window.VueApp.$store.dispatch('changeConnectedStatus', {data, text});
            }
            $('#no-wifi').removeClass('hideList');
            $('#channel-content .right-list').addClass('noWifi');
            $('#chat-content .right-list').addClass('noWifi');

            if (CHATOBJ && CHATOBJ.groupType == 1) {
                $('.pcOnlineState').addClass('hideList');
            }
        });
        mainObject.sigConnectNotify.connect(function(code) {
            console.log('重连', code);
            var text = '',
                data = true;
            var data_ = JSON.parse(code);
            if (data_.ResponseErrcode == 0) {
                window.VueApp.$store.dispatch('changeConnectedStatus', {data: true, text: ''});
                $('#no-wifi').addClass('hideList');
                $('#members-list').addClass('hideList');
                $('#group-detail').addClass('hideList');
                $('#channel-detail').addClass('hideList');
                $('#contacts-detail').addClass('hideList');
                $('#channel-content .right-list').removeClass('noWifi');
                $('#chat-content .right-list').removeClass('noWifi');
                mainObject.getSession();
                mainObject.getGroupList();
                mainObject.getContact();
                mainObject.getOrg();
                mainObject.InitGeneralsetTomainDlg();
                mainObject.getPublishNoticeBubble();
                appSetObject.getUpdateStatus();
                mainObject.getNoticeCardMessage();

                if (CHATOBJ && CHATOBJ.groupType == 1) {
                    var imId = ""
                    var myImId = myInfo.imUserid.toString();
                    var imAry = CHATOBJ.groupId.split('_');
                    if (imAry[0] == imAry[1]) {
                        imId = imAry[0];
                    } else {
                        for (var i=0; i<imAry.length; i++) {
                            if (myImId !== imAry[i]) {
                                imId = imAry[i]
                            }
                        }
                    }
                    mainObject.getOnlineState(imId,function(){
                        console.log('在线请求发送',imId);
                    })
                } else if (CHATOBJ && CHATOBJ.groupType == 'applicationMessage') {
                    refreshApplicationMessage();
                }
            }
        });

		// 互踢通知
        mainObject.sigKickoutNotify.connect(function() {
            console.log('账号被踢');
            mainObject.showKickoutDialog();
        });

		// 消息快捷键通用设置回调
        mainObject.sigSendMsghotkeyNotify.connect(function(key) {
            console.log('快捷键设置', key);
            window.VueApp.$store.dispatch('setHotKey', key);
            // window.VueApp.$store.dispatch('')
            // 输入框keydown解绑，重新绑定新的快捷键
            $('#input-content').unbind('keydown.sigSendMsghotkey');
            if (key == 0) {
                $('#input-content').on('keydown.sigSendMsghotkey', function(e) {
                    if (e.keyCode == 13 && !$('.aiteMemberList').hasClass('hideList')) {
                        e.preventDefault();
                        $('.aiteMemberList li.active').click();
                        return;
                    }
                    if (!currentOsIsMac && e.ctrlKey && e.keyCode == 13) {
                        var oldScrollHeight = $('#input-content')[0].scrollHeight;
                        var oldScrollTop = $('#input-content').scrollTop();
                        $('#input-content').blur();
                        var a = $('.edit-box').html();
                        insertImg('\r\n');
                        if (a.lastIndexOf('\n') !== a.length - 1) {
                            insertImg('\r\n');
                        }

                        var newScrollHeight = $('#input-content')[0].scrollHeight;
                        $('#input-content').scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
                    } else if (currentOsIsMac && e.metaKey && e.keyCode == 13) {
                        var oldScrollHeight = $('#input-content')[0].scrollHeight;
                        var oldScrollTop = $('#input-content').scrollTop();
                        $('#input-content').blur();
                        var a = $('.edit-box').html();
                        insertImg('\r\n');
                        if (a.lastIndexOf('\n') !== a.length - 1) {
                            insertImg('\r\n');
                        }

                        var newScrollHeight = $('#input-content')[0].scrollHeight;
                        $('#input-content').scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
                    } else if (e.keyCode === 13) {
                        e.preventDefault();
                        sendMsg();
                    }
					// 粘贴截图等ctrl+v操作
                    if (currentOsIsMac) {
                        if (e.metaKey && e.keyCode == 86) {
                            e.preventDefault();
                            mainObject.getClipboardInfo(function(data) {
                                pasteToInput(data);
                            });
                        }
                    } else {
                        if (e.ctrlKey && e.keyCode == 86) {
                            e.preventDefault();
                            mainObject.getClipboardInfo(function(data) {
                                pasteToInput(data);
                            });
                        }
                    }
                });
            } else if (key == 1) {
                $('#input-content').on('keydown.sigSendMsghotkey', function(e) {
                    if (e.keyCode == 13 && !$('.aiteMemberList').hasClass('hideList')) {
                        e.preventDefault();
                        $('.aiteMemberList li.active').click();
                        return;
                    }
                    if (!currentOsIsMac && e.ctrlKey && e.keyCode == 13) {
                        e.preventDefault();
                        sendMsg();
                    } else if (currentOsIsMac && e.metaKey && e.keyCode == 13) {
                        e.preventDefault();
                        sendMsg();
                    } else if (e.keyCode === 13) {
                        e.preventDefault();
                        var oldScrollHeight = $('#input-content')[0].scrollHeight;
                        var oldScrollTop = $('#input-content').scrollTop();
                        $('#input-content').blur();
                        var a = $('.edit-box').html();
                        insertImg('\r\n');
                        if (a.lastIndexOf('\n') !== a.length - 1) {
                        insertImg('\r\n');
                    }

                        var newScrollHeight = $('#input-content')[0].scrollHeight;
                        $('#input-content').scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
                    }
                    // 粘贴截图等ctrl+v操作
                    if (currentOsIsMac) {
                        if (e.metaKey && e.keyCode == 86) {
                            e.preventDefault();
                            mainObject.getClipboardInfo(function(data) {
                                pasteToInput(data);
                            });
                        }
                    } else {
                        if (e.ctrlKey && e.keyCode == 86) {
                            e.preventDefault();
                            mainObject.getClipboardInfo(function(data) {
                                pasteToInput(data);
                            });
                        }
                    }
                });
            }
        });

		// 消息提示音通知
        mainObject.sigOpenMsgSoundNotify.connect(function(data) {
            console.log('消息提示音', data);
            soundOpen = data;
        });

        mainObject.sigIsWindowVisible.connect(function(data) {
            // console.log('visible', data ,222);
            window.VueApp.$store.dispatch('setWindowVisibility', data);
            if (data === true && appIsVisible === false && CHATOBJ.groupId && window.VueApp.$store.state.status.globalStatus === 'chat') {
                if (typeof messageBoxOBJ.sessionid === 'undefined') {
                    openSession($('#session-' + CHATOBJ.groupId), false);
                }
            } else if (data === false){
                messageBoxOBJ = {};
            }

            appIsVisible = data;
        });

		// -------------------聊天功能区------------------



		// 会话列表
        mainObject.siggetSession.connect(function(data) {
            chatSession = JSON.parse(data);
            initSession(JSON.parse(data));
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });

		// 离线消息数
        mainObject.sigOfflineCountChangedNotify.connect(function(data) {
            initOfflineMsgNum(JSON.parse(data));
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });
		// 特殊消息通知
        mainObject.siggetSpecialMassageCount.connect(function(data) {
            console.log('特殊消息数量', data);
            setSessionSpecialMessageMap(data);
            initSessionSpecialMessage();
        });

		// 消息回包
        mainObject.sig_sendmsgSuccess.connect(function(data) {
            ackMsg(data);
        });

		// 接收消息
        mainObject.sig_recvMsg.connect(function(data) {
            data.SessionisMute = data.Shield ? 1 : 0;
            setTimeout(function() {
                setTimeout(function() {
                    receiveMsg(data);
                }, 0);
            }, 0);
        });

		// 选择图片
        $('#selectPic').on('click', function() {
            window.clearTimeout(timer_);
            mainObject.OpenFileDialog();
        });


		// 选择文件
        $('#selectFile').on('click', function() {
            window.clearTimeout(timer_);
            qFileTransferObj.selectFiles();
        });

        // 选择截图
        $('#printScreen').on('click', function() {
            window.clearTimeout(timer_);
            publicObject.loadScreenShot();
        });

        // 截图完后回调
        publicObject.sigScreenShot.connect(function(data) {
            console.log(data);
            pasteToInput(data);
        });

		// 撤回消息功能
        mainObject.sigissueRevokeMsgNotify.connect(function(data) {
            console.log(data);
            fileRecall(data);
        });

		// 群主转让通知
        mainObject.sigChangeMgerNoticeMsgNotify.connect(function(data) {
            console.log(data);
            transferGroup(data);
            // transferGroupHolder(data)
        });

        // 扫码加群
        mainObject.sigScanQRJoinGroupMsgNotify.connect(function(data) {
            console.log(data);
            scanQRJoinGroup(data);
            // beInvitedIntoGroup(data);
        });


		// 删除群成员回调
        mainObject.sigQuitGroupNoticeMsgNotify.connect(function(data) {
            console.log('删除群成员', data);
            deleteGroupMember(data);
        });

		// 创建、添加、删除、解散、退出、修改、扫码失败回调
        mainObject.sigInvolkeFailed.connect(function(data) {
            console.log(data);
            showToast(data);
        });


        // 点解列表按钮划出文件列表
        $('#file-btn').on('click', function(e) {
            e.stopPropagation();
            if (!$('.krightmenu').hasClass('hideList')) {
                $('.krightmenu').addClass('hideList');
            }
            $('#file-list-ul').data('pageNum', 0);
            $('#file-list-ul').html('');
            if (filesListOpen == false) {
                $('#btn-wrapper').removeClass('off').addClass('on');
                $('#file-list').removeClass('off').addClass('on').stop().animate({'right': '70'});
                var sessionData = $(this).data();
                // 获得右侧文件列表
                qFileTransferObj.getFileList(sessionData.GroupId, 0, 20, function(data) {
                    console.log(data);
                    console.log(sessionData);
                    showFileList(data, sessionData);
                    var child = $('#file-list-ul').find('li');
                    if (child.length == 0) {
                        $('#file-list').find('div.prompt').removeClass('hideList');
                        $('#file-list').find('div.prompt-record').removeClass('hideList');
                    } else {
                        $('#file-list').find('div.prompt').addClass('hideList');
                        $('#file-list').find('div.prompt-record').addClass('hideList');
                    }
                });
                filesListOpen = true;
            } else {
                $('#btn-wrapper').removeClass('on').addClass('off');
                $('#file-list').stop().animate({'right': '-390px'}, function() {
                    $(this).addClass('off');
                    $('#file-list-ul').empty();
                });
                filesListOpen = false;
            }
        });


		// 列表滚动加载
        $('#file-list-ul').mousewheel(function(e, delta) {
            var sessionData = $('#file-btn').data();
            var scrollTop = $('.file-list-wrapper').scrollTop();
            var clientHeight = $('.file-list-wrapper').height();
            var scrollHeight = $(this)[0].scrollHeight;
            console.log(scrollTop, clientHeight, scrollHeight);
            console.log(scrollTop + clientHeight >= scrollHeight);
            if (scrollTop + clientHeight >= scrollHeight) {
                if (delta < 0) {
                	var pageNum = $('#file-list-ul').data('pageNum') + 1;
                    console.log(pageNum);
                    console.log(sessionData);
                    qFileTransferObj.getFileList(sessionData.GroupId, pageNum, 20, function(data) {
                        showFileList(data, sessionData);
                        if (!data.length) return;
                        $('#file-list-ul').data('pageNum', pageNum);
                    });
                }
            }
        });


		// 文件列表收发完成回调
        function fileFinish(msgid, type, path) {
		    var statusIcon = $('#file-list-ul li div.status-icon a').filter('[msgid="' + msgid + '"]');
        	if (type == 1) {
                if (path == '') {
                    statusIcon.attr('status', '0');
                    statusIcon.attr('msgStatus', '1');
                    statusIcon.parent().siblings('a.status-text').html('未下载');
                    // var fileTotal = statusIcon.attr('fileSize');
                    var fileStatusClass = statusIcon.attr('statusTodo');
                    statusIcon.attr('statusTodo', 'statusToUnDownLoad');
                    statusIcon.removeClass(fileStatusClass).addClass('statusToUnDownLoad');
                    // statusIcon.parent().siblings('div.center').find('.data-size').html(fileTotal);
                }else{
                    statusIcon.attr('fpath', path);
                    statusIcon.attr('status', '2');
                    statusIcon.parent().siblings('a.status-text').html('已发送');
                    var fileTotal = statusIcon.attr('fileSize');
                    var fileStatusClass = statusIcon.attr('statusTodo');
                    statusIcon.attr('statusTodo', 'statusTofinished');
                    statusIcon.removeClass(fileStatusClass).addClass('statusTofinished');
                    statusIcon.parent().siblings('div.center').find('.data-size').html(fileTotal);
                }
        } else {
            statusIcon.attr('fpath', path);
            statusIcon.attr('status', '2');
            statusIcon.parent().siblings('a.status-text').html('已下载');
            var fileTotal = statusIcon.attr('fileSize');
            var fileStatusClass = statusIcon.attr('statusTodo');
            statusIcon.attr('statusTodo', 'statusTofinished');
            statusIcon.removeClass(fileStatusClass).addClass('statusTofinished');
            statusIcon.parent().siblings('div.center').find('.data-size').html(fileTotal);
        }
        }

        // 文件列表预览已被删除回调
        function fileDeleted(gid, msgid, status) {
            var statusIcon = $('#file-list-ul li div.status-icon a').filter('[msgid="' + msgid + '"]');
            if (status == 101) {
                statusIcon.parent().siblings('div').find('div.file-deleted').removeClass('hide');
                statusIcon.attr('status', '101');
                statusIcon.parent().siblings('a.status-text').html('已删除');
            }
        }

        // 文件列表收发错误回调
        function fileError(msgid, code) {
            if (code) {
                var btn = $('#file-list-ul li div.status-icon a').filter('[msgid="' + msgid + '"]');
                var sendId = btn.attr('senderimid');
                if (sendId == myInfo.imUserid) {
                    btn.attr('status', '100');
                    var fileStatusClass = btn.attr('statusTodo');
                    btn.attr('statusTodo', 'statusToSend');
                    btn.removeClass(fileStatusClass).addClass('statusToSend');
                    btn.parent().siblings('a.status-text').html('发送失败');
                    btn.parent().siblings('a.status-text').addClass('statusRedFont');
                } else {
                    btn.attr('status', '100');
                    var fileStatusClass = btn.attr('statusTodo');
                    btn.attr('statusTodo', 'statusToUnDownLoad');
                    btn.removeClass(fileStatusClass).addClass('statusToUnDownLoad');
                    btn.parent().siblings('a.status-text').html('下载失败');
                    btn.parent().siblings('a.status-text').addClass('statusRedFont');
                }
            }
        }

        // 文件发送/下载进度回调
        function fileProgress(msgid, total, processSize) {
            if (processSize > 0) {
            	var fileTotal = bytesToSize(total);
            	var fileProcessSize = bytesToSize(processSize);
                $('#file-list-ul li div.status-icon a').filter('[msgid="' + msgid + '"]').parent().siblings('div.center').find('.data-size').html(fileProcessSize + '/' + fileTotal);
            }
        }

        // 文件列表撤回回调
        function fileRecall(data) {
            console.log(data);
            var MsgId = data.MsgId;
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').html('已撤回');
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').attr('status', '103');

            var a = $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').parent();
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').parent().off();
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').parent().removeClass('.file-list .file-list-wrapper .file-list-ul .file-item:hover .status-con');
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').siblings('div.center').find('div.no-see').removeClass('hide');
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').siblings('div.img').find('div.shadow-recall').removeClass('hide');
            console.log($('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').siblings('div.center').find('div.no-see'));
            console.log(a);
            $('#file-list-ul li a').filter('[msgid="' + MsgId + '"]').parent().addClass('status-con-hide');
        }

		// 右侧文件列表展示
        function showFileList(data, sessionData) {
        	var height = (parseInt($('.file-list').css('height')) - 50) + 'px';
            $('.file-list-wrapper').css('height', height);
            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    var fileName = data[i].fname;
                    var sendTime = formatMsgTime(data[i].sendtime, true);
                    var	fileSize = bytesToSize(data[i].fsize);
                    var	sender = data[i].sender;
                    var	status = validityDate(data[i].sendtime, data[i].FileStatus);
                    var msgStatus = data[i].status;
                    var	senderImId = data[i].senderImId;
                    var fileTypeName = getFileType(fileName);
                    var imgSrc = getFileThumbnailSrc(fileTypeName);
                    var from = data[i].from;
                    var isExist = data[i].IsExist;
                    var orHide = status == 3 ? '' : 'hide';
                    var statusTodo;
                    var statusRedFont = status == 100 ? 'statusRedFont' : '';
                    var progressSize = bytesToSize(data[i].progressSize);
                    var msgid = data[i].msgid;
                    var pauseHide;
                    if (sender.length > 4) {
                        sender = sender.substring(0, 4) + '...';
                    }
                    if (status == 4) {
                        fileSize = progressSize + '/' + fileSize;
                        pauseHide = '';
                    } else {
                        fileSize = bytesToSize(data[i].fsize);
                        pauseHide = 'hide';
                    }
                    var fromType = parseInt(from / 1000000);  // 0 ios  1 Android  2 桌面端
                    if (senderImId == myInfo.imUserid) {
                            if (fromType == 2) {
                                if (status == 1) {
                                    statusTodo = 'statusTopause';
                                } else if (status == 2) {
                                    statusTodo = 'statusTofinished';
                                } else if (status == 3) {
                                    statusTodo = 'statusToNone';
                                } else if (status == 4) {
                                    statusTodo = 'statusToSend';
                                    if (msgStatus == 1) {
                                        statusTodo = 'statusToUnDownLoad';
                                    }
                                } else if (status == 100) {
                                    statusTodo = 'statusToSend';
                                    if (msgStatus == 1) {
                                        statusTodo = 'statusToUnDownLoad';
                                    }
                                } else if (status == 0 && msgStatus == 0) {
                                    statusTodo = 'statusToSend';
                                } else if (status == 0 && msgStatus == 1) {
                                    statusTodo = 'statusToUnDownLoad';
                                }
                            } else {
                                if (status == 0) {
                                    statusTodo = 'statusToUnDownLoad';
                                } else if (status == 1) {
                                    statusTodo = 'statusTopause';
                                } else if (status == 2) {
                                    statusTodo = 'statusTofinished';
                                } else if (status == 3) {
                                    statusTodo = 'statusToNone';
                                } else if (status == 4) {
                                    statusTodo = 'statusToUnDownLoad';
                                } else if (status == 100) {
                                    statusTodo = 'statusToUnDownLoad';
                                } else if (status == 0 && msgStatus == 0) {
                                    statusTodo = 'statusToSend';
                                } else if (status == 0 && msgStatus == 1) {
                                    statusTodo = 'statusToUnDownLoad';
                                }
                            }
                    } else {
                        if (status == 0) {
                            statusTodo = 'statusToUnDownLoad';
                        } else if (status == 1) {
                            statusTodo = 'statusTopause';
                        } else if (status == 2) {
                            statusTodo = 'statusTofinished';
                        } else if (status == 3) {
                            statusTodo = 'statusToNone';
                        } else if (status == 4) {
                            statusTodo = 'statusToUnDownLoad';
                        } else if (status == 100) {
                            statusTodo = 'statusToUnDownLoad';
                        }
                    }
                    var temp = '<li class="file-item clearfix">' +
						'<div class="img">' +
						'<img src="../images/file/' + imgSrc + '56@2x.png" alt="">' +
						'<div class="shadow">' +
						'<canvas class="canvas" width="56" height="56">' +
						'不支持canvas' +
						'</canvas>' +
						' </div>' +
						'<div class="prompt-content file-pause ' + pauseHide + '">' +
						'已暂停' +
						'</div>' +
                        '<div class="prompt-content file-overdue ' + orHide + '">' +
                        '已过期' +
                        '</div>' +
                        '<div class="prompt-content file-deleted  hide">' +
                        '已删除' +
                        '</div>' +
						'<div class="shadow shadow-recall hide"></div>' +
						'<!--图标遮罩 <div class="shadow shadow-recall"></div>-->' +
						'</div>' +
						'<div class="center">' +
						'<h2 class="file-name" fileName="' + fileName + '" >' + fileName +
						'</h2>' +
						'<div class="down-wrapper">' +
						'<span class="data-size">' + fileSize + '</span>' +
						'<span class="name">' + sender + '</span>' +
						'<span class="time">' + sendTime +
						'</span>' +
						'</div>' +
						'<div class="no-see hide">' +
						'<div class="line"></div>' +
						'<div class="line"></div>' +
						'</div>' +
						'</div>' +
                        '<div class="status-con status-icon hideList" >' +
                        '<a href="javascript:;" class="status-todo ' + statusTodo + '" statusTodo="' + statusTodo + '" gid="' + sessionData.GroupId + '" status="' + data[i].FileStatus + '" msgStatus="' + msgStatus + '" senderImId="' + data[i].senderImId + '" msgid="' + data[i].msgid + '" fpath="' + data[i].fpath + '" fileSize="' + fileSize + '" fid="' + data[i].fid + '" from="' + data[i].from + '" >' +
                        '</a>' +
                        '<a href="javascript:;" class="status-more statusTodoMore" data-msgtype="6" data-sendtime="' + data[i].sendtime + '"  gid="' + sessionData.GroupId + '" status="' + data[i].FileStatus + '" senderImId="' + data[i].senderImId + '"  fpath="' + data[i].fpath + '" fileName="' + fileName + '" fileSize="' + fileSize + '" from="' + data[i].from + '" >' +
                        '</a>' +
                        '</div>' +
						'<a href="javascript:;" class="status-con status-text ' + statusRedFont + '" >' + fileStatus(status, senderImId, from, isExist, msgStatus) + '</a>' +
						'</li>';
                    $('#file-list-ul').append(temp);
                    if (status == 4) {
                        canvasUtils.setState({
                            processSize: data[i].progressSize,
                            total: data[i].fsize,
                            msgid: msgid
                        });
                    }
                }
            } else {

            }

            // canvasShadow()
        }

        $('#file-list-ul').on('click', 'li a.status-todo', function() {
            downloadFile(this);
        });

        $('#file-list-ul').on('mouseenter', 'li', function() {
            var html = $(this).find('a').html();
            var filesSenderImId = $(this).find('a').attr('senderImId');
            var filesStatus = $(this).find('a').attr('status');
            $(this).find('a.status-text').addClass('hideList');
            $(this).find('div.status-icon').removeClass('hideList');
        }).on('mouseleave', 'li', function() {
            var filesSenderImId = $(this).find('a').attr('senderImId');
            var filesStatus = $(this).find('a').attr('status');
            $(this).find('a.status-text').removeClass('hideList');
            $(this).find('div.status-icon').addClass('hideList');
            if (filesSenderImId == myInfo.imUserid) {

            } else if (filesSenderImId !== myInfo.imUserid) {

            }
        });

        // 文件列表hover图片预先加载
        var openHoverImg = document.createElement('img'),
            sendHoverImg = document.createElement('img'),
            downLoadHoverImg = document.createElement('img'),
            pauseHoverImg = document.createElement('img'),
            pauseImg = document.createElement('img'),
            moreTodoHoverImg = document.createElement('img');
        openHoverImg.src = '../images/file/icon打开hover@2x.png';
        sendHoverImg.src = '../images/file/icon文件上传hover@2x.png';
        downLoadHoverImg.src = '../images/file/icon文件下载hover@2x.png';
        pauseImg.src = '../images/file/icon文件暂停@2x.png';
        pauseHoverImg.src = '../images/file/icon文件暂停hover@2x.png';
        moreTodoHoverImg.src = '../images/file/icon更多hover@2x.png';


        function downloadFile(files) {
            var filesStatus = $(files).attr('status');
            var msgStatus = $(files).attr('msgStatus');
            var filesMsgid = $(files).attr('msgid');
            var filesFpath = $(files).attr('fpath');
            var filesSenderImId = $(files).attr('senderImId');
            var filesGid = $(files).attr('gid');
            var filesFrom = $(files).attr('from');
            var fileStatusClass = $(files).attr('statusTodo');
            var filesName = $(files).siblings('a.status-more').attr('filename') || '';
            var fromType = parseInt(filesFrom / 1000000);
            var fid = $(files).attr('fid');
            var fileSize = $(files).attr('fileSize');
            var msgs = [];
            if (filesSenderImId == myInfo.imUserid) {
            	if (fromType == 2) {
                if (filesStatus == 1) {
                    qFileTransferObj.pause(filesGid, filesMsgid);
                    $(files).parent().siblings('div').find('div.file-pause').removeClass('hide');
                    if (msgStatus == 1) {
                        $(files).attr('status', '4');
                        $(files).attr('statusTodo', 'statusToUnDownLoad');
                        $(files).removeClass(fileStatusClass).addClass('statusToUnDownLoad');
                        $(files).parent().siblings('a.status-text').html('暂停下载');
                    } else {
                        $(files).attr('status', '4');
                        $(files).attr('statusTodo', 'statusToSend');
                        $(files).removeClass(fileStatusClass).addClass('statusToSend');
                        $(files).parent().siblings('a.status-text').html('暂停发送');
                    }

                } else if (filesStatus == 4) {
                    if (msgStatus == 1) {
                        qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                        $(files).parent().siblings('div').find('div.file-pause').addClass('hide');
                        $(files).attr('status', '1');
                        $(files).attr('statusTodo', 'statusTopause');
                        $(files).removeClass(fileStatusClass).addClass('statusTopause');
                        $(files).parent().siblings('a.status-text').html('下载中');
                    } else {
                        if (filesFpath == '' && msgStatus == 0){
                            var msg = {
                                'msgid': filesMsgid,
                                'msgtype': 6,
                                'groupid': filesGid,
                                'grouptype': CHATOBJ.groupType,
                                'filePath': filesFpath,
                                'senderid': filesSenderImId,
                                'fid': fid,
                                'fname': filesName,
                                'fsize': fileSize
                            };
                        } else {
                            var msg = {
                                'msgid': filesMsgid,
                                'msgtype': 6,
                                'groupid': filesGid,
                                'grouptype': CHATOBJ.groupType,
                                'filePath': filesFpath,
                                'senderid': filesSenderImId
                                };
                        }
                        msgs.push(msg);
                        mainObject.sendMessageList(msgs);
                        $(files).parent().siblings('div').find('div.file-pause').addClass('hide');
                        $(files).attr('status', '1');
                        $(files).attr('statusTodo', 'statusTopause');
                        $(files).removeClass(fileStatusClass).addClass('statusTopause');
                        $(files).parent().siblings('a.status-text').html('发送中');
                    }

                } else if (filesStatus == 100) {
                    if (msgStatus == 1) {
                        qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                        $(files).parent().siblings('div').find('div.file-pause').addClass('hide');
                        $(files).attr('status', '1');
                        $(files).attr('statusTodo', 'statusTopause');
                        $(files).removeClass(fileStatusClass).addClass('statusTopause');
                        $(files).parent().siblings('a.status-text').html('下载中');
                    } else {
                        var msg = {
                        'msgid': filesMsgid,
                        'msgtype': 6,
                        'groupid': filesGid,
                        'grouptype': CHATOBJ.groupType,
                        'filePath': filesFpath,
                        'senderid': filesSenderImId
                        };
                        msgs.push(msg);
                        mainObject.sendMessageList(msgs);
                        $(files).attr('status', '1');
                        $(files).attr('statusTodo', 'statusTopause');
                        $(files).removeClass(fileStatusClass).addClass('statusTopause');
                        $(files).parent().siblings('a.status-text').html('发送中');
                        $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
                    }

                } else if (filesStatus == 2) {
                    if (msgStatus == 1) {
                        qFileTransferObj.preveiwFile(filesGid, filesMsgid, filesFpath);
                        $(files).attr('statusTodo', 'statusTofinished');
                        $(files).removeClass(fileStatusClass).addClass('statusTofinished');
                        $(files).parent().siblings('a.status-text').html('已下载');
                    } else {
                        qFileTransferObj.preveiwFile(filesGid, filesMsgid, filesFpath);
                        $(files).attr('statusTodo', 'statusTofinished');
                        $(files).removeClass(fileStatusClass).addClass('statusTofinished');
                        $(files).parent().siblings('a.status-text').html('已发送');
                    }
                } else if (filesStatus == 0 && msgStatus == 0) {
                    var msg = {
                        'msgid': filesMsgid,
                        'msgtype': 6,
                        'groupid': filesGid,
                        'grouptype': CHATOBJ.groupType,
                        'filePath': filesFpath,
                        'senderid': filesSenderImId,
                        'fid': fid,
                        'fname': filesName,
                        'fsize': fileSize
                    };
                    msgs.push(msg);
                    mainObject.sendMessageList(msgs);
                    $(files).attr('status', '1');
                    $(files).attr('statusTodo', 'statusTopause');
                    $(files).removeClass(fileStatusClass).addClass('statusTopause');
                    $(files).parent().siblings('a.status-text').html('发送中');
                    $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
                } else if (filesStatus == 0 && msgStatus == 1) {
                    qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                    $(files).attr('status', '1');
                    $(files).attr('statusTodo', 'statusTopause');
                    $(files).removeClass(fileStatusClass).addClass('statusTopause');
                    $(files).parent().siblings('a.status-text').html('下载中');
                    $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
                }
            } else {
            		if (filesStatus == 0) {
                qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                $(files).attr('status', '1');
                $(files).attr('statusTodo', 'statusTopause');
                $(files).removeClass(fileStatusClass).addClass('statusTopause');
                $(files).parent().siblings('a.status-text').html('下载中');
            		} else if (filesStatus == 1) {
                qFileTransferObj.pause(filesGid, filesMsgid);
                $(files).parent().siblings('div').find('div.file-pause').removeClass('hide');
                $(files).attr('status', '4');
                $(files).attr('statusTodo', 'statusToUnDownLoad');
                $(files).removeClass(fileStatusClass).addClass('statusToUnDownLoad');
                $(files).parent().siblings('a.status-text').html('暂停下载');
            } else if (filesStatus == 4) {
                qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                $(files).parent().siblings('div').find('div.file-pause').addClass('hide');
                $(files).attr('status', '1');
                $(files).attr('statusTodo', 'statusTopause');
                $(files).removeClass(fileStatusClass).addClass('statusTopause');
                $(files).parent().siblings('a.status-text').html('下载中');
            } else if (filesStatus == 100) {
                qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                $(files).attr('status', '1');
                $(files).attr('statusTodo', 'statusTopause');
                $(files).removeClass(fileStatusClass).addClass('statusTopause');
                $(files).parent().siblings('a.status-text').html('下载中');
                $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
            } else if (filesStatus == 2) {
                qFileTransferObj.preveiwFile(filesGid, filesMsgid, filesFpath);
                $(files).attr('statusTodo', 'statusTofinished');
                $(files).removeClass(fileStatusClass).addClass('statusTofinished');
                $(files).parent().siblings('a.status-text').html('已下载');
            }else if (filesStatus == 0 && msgStatus == 0) {
                var msg = {
                    'msgid': filesMsgid,
                    'msgtype': 6,
                    'groupid': filesGid,
                    'grouptype': CHATOBJ.groupType,
                    'filePath': filesFpath,
                    'senderid': filesSenderImId
                };
                msgs.push(msg);
                mainObject.sendMessageList(msgs);
                $(files).attr('status', '1');
                $(files).attr('statusTodo', 'statusTopause');
                $(files).removeClass(fileStatusClass).addClass('statusTopause');
                $(files).parent().siblings('a.status-text').html('发送中');
                $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
            } else if (filesStatus == 0 && msgStatus == 1) {
                qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                $(files).attr('status', '1');
                $(files).attr('statusTodo', 'statusTopause');
                $(files).removeClass(fileStatusClass).addClass('statusTopause');
                $(files).parent().siblings('a.status-text').html('下载中');
                $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
            }
            }
            } else {
                if (filesStatus == 0) {
                    qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                    $(files).attr('status', '1');
                    $(files).attr('statusTodo', 'statusTopause');
                    $(files).removeClass(fileStatusClass).addClass('statusTopause');
                    $(files).parent().siblings('a.status-text').html('下载中');
                } else if (filesStatus == 1) {
                    qFileTransferObj.pause(filesGid, filesMsgid);
                    $(files).parent().siblings('div').find('div.file-pause').removeClass('hide');
                    $(files).attr('status', '4');
                    $(files).attr('statusTodo', 'statusToUnDownLoad');
                    $(files).removeClass(fileStatusClass).addClass('statusToUnDownLoad');
                    $(files).parent().siblings('a.status-text').html('暂停下载');
                } else if (filesStatus == 4) {
                    qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                    $(files).parent().siblings('div').find('div.file-pause').addClass('hide');
                    $(files).attr('status', '1');
                    $(files).attr('statusTodo', 'statusTopause');
                    $(files).removeClass(fileStatusClass).addClass('statusTopause');
                    $(files).parent().siblings('a.status-text').html('下载中');
                } else if (filesStatus == 100) {
                    qFileTransferObj.downloadFile(filesGid, filesMsgid, filesFpath, filesName);
                    $(files).attr('status', '1');
                    $(files).attr('statusTodo', 'statusTopause');
                    $(files).removeClass(fileStatusClass).addClass('statusTopause');
                    $(files).parent().siblings('a.status-text').html('下载中');
                    $(files).parent().siblings('a.status-text').removeClass('statusRedFont');
                } else if (filesStatus == 2) {
                    qFileTransferObj.preveiwFile(filesGid, filesMsgid, filesFpath);
                    $(files).attr('statusTodo', 'statusTofinished');
                    $(files).removeClass(fileStatusClass).addClass('statusTofinished');
                    $(files).parent().siblings('a.status-text').html('已下载');
                } else if (filesStatus == 3) {

            }
            }
        }


        /**
         * 搜索功能
         */
        var $searchInp = $('#search').find('.search-input');

        $searchInp.on('contextmenu', function(e) {
            e.stopPropagation();
            // if (e.which == 3) {
            //     setTimeout(() =>{
            //        window.event = e;
            //         showSearchRightMenu($searchInp.val(), window.getSelection().toString(), this);
            //     },0)
            //
            //     e.preventDefault();
            // }
        });
       $searchInp.on('focus', startSearch);

        $searchInp.on('blur', function() {
           setTimeout(searchBlur, 0)
        });

        function searchBlur() {
            $('.search-val').removeClass('search-val-highLight');
            $searchInp.removeClass('input-highLight');
            $('#deleteIcon').removeClass('input-highLight');
            if ($searchInp.val().trim() === '') {
                $searchInp.val('联系人、频道、群聊');
            }
            $searchInp.css({'padding': '6px 0px 6px 30px', 'font-size': '12px', 'color': '#B5B5B5', 'width': '116px'});
            $('#search').find('.iconn-21').removeClass('hideList');
        }



        $(document).on('keydown', function(e) {
        	if (!$('.search-list .right-list').hasClass('hideList')) {
        	    var sel = document.getSelection();
        	    if ($(sel.focusNode).hasClass('edit-container') || $(sel.focusNode).hasClass('edit-box')) {
        	        return;
                }
                var active = document.querySelector('.search-list li.active');
                if (e.keyCode === 40) {
                    e.preventDefault();
                    if (active.nextElementSibling) {
                        $(active).removeClass('active');
                        $(active.nextElementSibling).addClass('active');
                    } else if ($(active).parent().hasClass('search-members-show') && $('.search-channels-show').find('li').length) {
                        $('.search-channels-show').find('li')[0].className = 'active';
                        $(active).removeClass('active');
                    } else if ($(active).parent().hasClass('search-channels-show') && $('.search-groups-show').find('li').length) {
                        $('.search-groups-show').find('li')[0].className = 'active';
                        $(active).removeClass('active');
                    }
                    active = document.querySelector('.search-list li.active');
                    if ($(active).parent().hasClass('search-members-show')) {
                        if (active.offsetTop > $('.search-list').find('.right-list').scrollTop() + $('.search-list').find('.right-list').height() - active.clientHeight) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop + document.querySelector('.search-header').clientHeight - $('.search-list .right-list').height() + active.clientHeight);
                        }
                    } else if ($(active).parent().hasClass('search-channels-show')) {
                        if (active.offsetTop + active.clientHeight + $('.search-members').height() + document.querySelector('.search-header').clientHeight + 3 >= $('.search-list').find('.right-list').scrollTop() + $('.search-list').find('.right-list').height()) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop + $('.search-members').height() + 9 + document.querySelector('.search-header').clientHeight - $('.search-list').find('.right-list').height() + active.offsetHeight);
                        }
                    } else if ($(active).parent().hasClass('search-groups-show')) {
                        if (active.offsetTop + active.clientHeight + $('.search-members').height() + $('.search-channels').height() + document.querySelector('.search-header').clientHeight + 3 >= $('.search-list').find('.right-list').scrollTop() + $('.search-list').find('.right-list').height()) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop + $('.search-members').height() + $('.search-channels').height() + 21 + document.querySelector('.search-header').clientHeight - $('.search-list').find('.right-list').height() + active.offsetHeight);
                        }
                    }
                }
                if (e.keyCode === 38) {
                    e.preventDefault();
                    if (active.previousElementSibling) {
                        $(active).removeClass('active');
                        $(active.previousElementSibling).addClass('active');
                    } else if ($(active).parent().hasClass('search-groups-show') && $('.search-channels-show').find('li').length) {
                        $('.search-channels-show').find('li')[$('.search-channels-show').find('li').length - 1].className = 'active';
                        $(active).removeClass('active');
                    } else if ($(active).parent().hasClass('search-channels-show') && $('.search-members-show').find('li').length) {
                        $('.search-members-show').find('li')[$('.search-members-show').find('li').length - 1].className = 'active';
                        $(active).removeClass('active');
                    }
                    active = document.querySelector('.search-list li.active');
                    if ($(active).parent().hasClass('search-members-show')) {
                        if (active.offsetTop < $('.search-list').find('.right-list').scrollTop()) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop);
                        }
                    } else if ($(active).parent().hasClass('search-channels-show')) {
                        if (active.offsetTop + document.querySelector('.search-header').clientHeight + 3 + $('.search-members').height() < $('.search-list').find('.right-list').scrollTop()) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop + 3 + $('.search-members').height());
                        }
                    } else if ($(active).parent().hasClass('search-groups-show')) {
                        if (active.offsetTop + document.querySelector('.search-header').clientHeight + 3 + $('.search-members').height() + $('.search-channels').height() < $('.search-list').find('.right-list').scrollTop()) {
                            $('.search-list').find('.right-list').scrollTop(active.offsetTop + 3 + $('.search-members').height() + $('.search-channels').height());
                        }
                    }
                }
                if (e.keyCode === 13) {
                        $('.search-list li.active').click();
                        $searchInp.blur();
                }
            }
        });

        $('#search .iconn-11').on('mousedown', function() {
            $searchInp.val('联系人、频道、群聊');
            $('#search .iconn-11').addClass('hideList');
            endSearch(true);
        });

        $searchInp.bind('input propertychange', function() {
            var val = $(this).val().trim();
            if (!$('.search-groups-collapse').hasClass('hideList')) {
                $('.search-groups-collapse').click();
            }
            if (!$('.search-members-collapse').hasClass('hideList')) {
                $('.search-members-collapse').click();
            }
            if (!$('.search-channels-collapse').hasClass('hideList')) {
                $('.search-channels-collapse').click();
            }
            $('.search-members .search-header').css({top: 0});
            $('.search-groups .search-header').css({top: 0});
            $('.search-channels .search-header').css({top: 0});
            if (!val) {
                $('.search-list .right-list').addClass('hideList');
                $('#search').find('.iconn-11').addClass('hideList');
                return;
            } else {
                $('.search-list .right-list').removeClass('hideList');
                $('#search').find('.iconn-11').removeClass('hideList');
            }
            if (val.length > 0) {
                $('.search-members-show').html('');
                $('.search-groups-show').html('');
                $('.search-channels-show').html('');
                $('.search-members').data('pageNumber', 0);
                $('.search-members-expand').addClass('hideList');
                mainObject.searchAddressBook(val, 0, 3, function(data) {
                    console.log('搜索', val, 0, data);
                    if (data.totalcount > 3) {
                        $('.search-members-total').text('(' + data.totalcount + ')');
                        $('.search-members-expand').removeClass('hideList');
                    } else {
                        $('.search-members-total').text('');
                        $('.search-members-expand').addClass('hideList');
                    }
                    initSearchMembersList(data.user, true);
                });
                $('.search-groups').data('pageNumber', 0);
                $('.search-groups-expand').addClass('hideList');
                mainObject.searchGroupName(val, 0, 3, function(data) {
                    console.log('搜索', val, 0, data);
                    if (data.totalcount > 3) {
                        $('.search-groups-total').text('(' + data.totalcount + ')');
                        $('.search-groups-expand').removeClass('hideList');
                    } else {
                        $('.search-groups-total').text('');
                        $('.search-groups-expand').addClass('hideList');
                    }
                    initSearchGroupsList(data.group, true);
                });
                $('.search-channels').data('pageNumber', 0);
                $('.search-channels-expand').addClass('hideList');
                mainObject.searchChannelName(val, 0, 3, function(data) {
                    console.log('搜索', val, 0, data);
                    if (data.totalcount > 3) {
                        $('.search-channels-total').text('(' + data.totalcount + ')');
                        $('.search-channels-expand').removeClass('hideList');
                    } else {
                        $('.search-channels-total').text('');
                        $('.search-channels-expand').addClass('hideList');
                    }
                    initSearchChannelsList(data.Channel, true);
                });
            } else {
                endSearch();
            }
        });

        $('.search-list').find('.right-list').on('scroll', loadMoreSearch);

        $('.search-show').on('mouseover', 'li', function() {
        	if (!$(this).hasClass('active')) {
            $('.search-show li.active').removeClass('active');
            $(this).addClass('active');
        }
        });

        $('.search-show').on('click', 'li', function() {
            setTimeout(() => {
                if ($(this).data().groupId) {
                    var groupId = $(this).data().groupId;
                    newConversation($(this).data(), true, function() {
                        $('#session').parent().scrollTop(document.querySelector('#session-' + groupId).offsetTop);
                    });
                    endSearch(true);
                } else if ($(this).data().ChannelId) {
                    window.VueApp.$store.dispatch('setGlobalStatus', 'channel');
                    var channels = window.VueApp.$store.state.channels.channelSessionList;
                    var currentChannelSession;
                    for (var i = 0; i < channels.length; i++) {
                        if (channels[i].ChannelId === $(this).data().ChannelId) {
                            currentChannelSession = channels[i];
                            break;
                        }
                    }
                    window.VueApp.$store.dispatch('setCurrentChannelSession', currentChannelSession);
                    endSearch(true);
                } else {
                    var groupId = '';
                    var imId = $(this).data().imid;
                    if (imId > myInfo.imUserid) {
                        groupId = myInfo.imUserid + '_' + imId;
                    } else if (imId < myInfo.imUserid) {
                        groupId = imId + '_' + myInfo.imUserid;
                    } else {
                        groupId = imId + '_' + myInfo.imUserid;
                    }
                    if ($(this).data().bActivated) {
                        newConversation($(this).data(), true, function() {
                            $('#session').parent().scrollTop(document.querySelector('#session-' + groupId).offsetTop);
                        });
                    } else {
                        showContactDetail2(this);
                        endSearch();
                        $searchInp.val('联系人、频道、群聊');
                        $('#search').find('.iconn-11').addClass('hideList');
                    }
                }
            }, 200);
        });

        $('.search-members-expand').on('click', function() {
            $('.search-members-collapse').removeClass('hideList');
            $('.search-members-expand').addClass('hideList');
            $('.search-members').attr('data-expand', 1);
        	var val = $searchInp.val().trim();
            mainObject.searchAddressBook(val, 0, 20, function(data) {
                console.log('搜索', val, 0, data);
                initSearchMembersList(data.user, true);
            });
        });

        $('.search-groups-expand').on('click', function() {
            $('.search-groups-collapse').removeClass('hideList');
            $('.search-groups-expand').addClass('hideList');
            $('.search-groups').attr('data-expand', 1);
            var val = $searchInp.val().trim();
            mainObject.searchGroupName(val, 0, 20, function(data) {
                console.log('搜索', val, 0, data);
                initSearchGroupsList(data.group, true);
            });
        });

        $('.search-channels-expand').on('click', function() {
            $('.search-channels-collapse').removeClass('hideList');
            $('.search-channels-expand').addClass('hideList');
            $('.search-channels').attr('data-expand', 1);
            var val = $searchInp.val().trim();
            mainObject.searchChannelName(val, 0, 20, function(data) {
                console.log('搜索', val, 0, data);
                initSearchChannelsList(data.Channel, true);
            });
        });

        $('.search-members-collapse').on('click', function() {
            $('.search-members-collapse').addClass('hideList');
            $('.search-members-expand').removeClass('hideList');
            $('.search-members .search-header').css({top: 0});
            $('.search-members').attr('data-expand', 0);
            $('.search-members').data('pageNumber', 0);
            var val = $searchInp.val().trim();
            $('.search-members-expand').addClass('hideList');
            mainObject.searchAddressBook(val, 0, 3, function(data) {
                console.log('搜索', val, 0, data);
                if (data.totalcount > 3) {
                    $('.search-members-total').text('(' + data.totalcount + ')');
                    $('.search-members-expand').removeClass('hideList');
                }
                initSearchMembersList(data.user, true);
            });
        });

        $('.search-groups-collapse').on('click', function() {
            $('.search-groups-collapse').addClass('hideList');
            $('.search-groups-expand').removeClass('hideList');
            $('.search-groups .search-header').css({top: 0});
            $('.search-groups').attr('data-expand', 0);
            $('.search-groups').data('pageNumber', 0);
            var val = $searchInp.val().trim();
            $('.search-groups-expand').addClass('hideList');
            mainObject.searchGroupName(val, 0, 3, function(data) {
                console.log('搜索', val, 0, data);
                if (data.totalcount > 3) {
                    $('.search-groups-total').text('(' + data.totalcount + ')');
                    $('.search-groups-expand').removeClass('hideList');
                }
                initSearchGroupsList(data.group, true);
            });
        });

        $('.search-channels-collapse').on('click', function() {
            $('.search-channels-collapse').addClass('hideList');
            $('.search-channels-expand').removeClass('hideList');
            $('.search-channels .search-header').css({top: 0});
            $('.search-channels').attr('data-expand', 0);
            $('.search-channels').data('pageNumber', 0);
            var val = $searchInp.val().trim();
            $('.search-channels-expand').addClass('hideList');
            mainObject.searchChannelName(val, 0, 3, function(data) {
                console.log('搜索', val, 0, data);
                if (data.totalcount > 3) {
                    $('.search-channels-total').text('(' + data.totalcount + ')');
                    $('.search-channels-expand').removeClass('hideList');
                }
                initSearchChannelsList(data.Channel, true);
            });
        });


        function initSearchMembersList(data, flag) {
        	$('.search-members-show').html('');
        	if (!data.length) {
            $('.search-members-show').html('<div style="margin-top: 14px; text-align: center;color: #999;">暂无搜索数据</div>');
        } else {
            addSearchMembersItem(data, flag);
        }
        }

        function initSearchGroupsList(data, flag) {
            $('.search-groups-show').html('');
            if (!data.length) {
                $('.search-groups-show').html('<div style="margin-top: 14px; text-align: center;color: #999;">暂无搜索数据</div>');
            } else {
                addSearchGroupsItem(data, flag);
            }
        }

        function initSearchChannelsList(data, flag) {
            $('.search-channels-show').html('');
            if (!data.length) {
                $('.search-channels-show').html('<div style="margin-top: 14px; text-align: center;color: #999;">暂无搜索数据</div>');
            } else {
                addSearchChannelsItem(data, flag);
            }
        }

        function loadMoreSearch(node) {
            var node = node.currentTarget;
            var SH = $('.search-members').height();
            var ST = $(node).scrollTop();
            var CH = $(node).height();
            var GH = $('.search-groups').height();
            var NH = $('.search-channels').height();
            // console.log(SH, ST, CH, GH,NH,document.querySelector('.search-groups').offsetTop,document.querySelector('.search-channels').offsetTop);
            if (document.querySelector('.search-groups').offsetTop < ST) {
                // $('.search-groups .search-header').addClass('search-header-fixed');
                $('.search-groups .search-header').css({top: ST - SH - NH - 20});
            } else if (document.querySelector('.search-channels').offsetTop < ST) {
                $('.search-channels .search-header').css({top: ST - SH - 10});
                $('.search-groups .search-header').css({top: 0});
            } else {
                $('.search-groups .search-header').css({top: 0});
                $('.search-channels .search-header').css({top: 0});
                $('.search-members .search-header').css({top: ST});
            }
            if ($('.search-members').attr('data-expand') === '1') {
                if (SH <= ST + CH + 50) {
                	console.log('load members');
                    var pageNumber = $('.search-members').data().pageNumber + 1,
                        val = $('#search').find('input').val();
                    mainObject.searchAddressBook(val, pageNumber, 20, function(data) {
                        if (!data.user || !data.user.length) {
                            $('.search-members').attr('data-expand', 0);
                            return;
                        }
                        addSearchMembersItem(data.user);
                        $('.search-members').data('pageNumber', pageNumber);
                    });
                }
            }
            if ($('.search-groups').attr('data-expand') === '1') {
                if (SH + GH + NH <= ST + CH + 50) {
                	console.log('load group');
                    var pageNumber = $('.search-groups').data().pageNumber + 1,
                        val = $('#search').find('input').val();
                    mainObject.searchGroupName(val, pageNumber, 20, function(data) {
                        if (!data.group || !data.group.length) {
                            $('.search-groups').attr('data-expand', 0);
                            return;
                        }
                        addSearchGroupsItem(data.group);
                        $('.search-groups').data('pageNumber', pageNumber);
                    });
                }
            }
            if ($('.search-channels').attr('data-expand') === '1') {
                if (SH + NH <= ST + CH + 50) {
                    console.log('load channels');
                    var pageNumber = $('.search-channels').data().pageNumber + 1,
                        val = $('#search').find('input').val();
                    mainObject.searchChannelName(val, pageNumber, 20, function(data) {
                        if (!data.Channel || !data.Channel.length) {
                            $('.search-channels').attr('data-expand', 0);
                            return;
                        }
                        addSearchChannelsItem(data.Channel);
                        $('.search-channels').data('pageNumber', pageNumber);
                    });
                    console.log(pageNumber);
                }
            }
        }

        function addSearchMembersItem(data, flag) {
            var fragment = document.createDocumentFragment();
            data.forEach(function(item, index) {
                var active = !item.bActivated ? '<span class="search-status">未激活</span>' : '';
                var temp = document.createElement('li');
            	if (flag && index === 0 && $('.search-list').find('.active').length === 0) {
            		temp.className = 'active';
                }
                temp.innerHTML = '<div class="list-name" style="background:' + getNickNameColor(item.oaId) + ';">' + getNickName(item.MsgSendName) + '</div>' +
                    '<div class="list-text">' +
                    '<div class="nameAndDuty">' +
                    '<span class="search-name search-members-name">' +
                    (checkNameLength(item.MsgSendName)).replace(new RegExp(item.HighLightString, 'gi'), '<strong class="key">$&</strong>') +
                    '</span>' +
                    '<span class="search-duty">' +
                    (item.SearchMobile ? ('<strong class="key">' + item.mobile + '</strong>') : item.dutyName) +
                    '</span>' +
                    '</div>' +
                    active +
                    '</div>';
                $(temp).data({
                    groupType: item.GroupType,
                    staffName: item.MsgSendName,
                    groupName: item.GroupName,
                    sessionTopmark: item.SessionTopmark,
                    id: item.oaId,
                    oaId: item.oaId,
                    imid: item.imId,
                    bActivated: item.bActivated,
                    deptName: item.deptName,
                    dutyName: item.dutyName
                });
                fragment.appendChild(temp);
            });
            $('.search-members-show').append(fragment);
        }


        function addSearchGroupsItem(data, flag) {
            var fragment = document.createDocumentFragment();
            data.forEach(function(item, index) {
                var groupName = item.GroupName || item.initname;
                var temp = document.createElement('li');
                if (flag && index === 0 && $('.search-list').find('.active').length === 0) {
                    temp.className = 'active';
                }
                temp.innerHTML = '<div class="list-name" style="background:' + getNickNameColor(Math.abs(hashCode(item.GroupID))) + ';"><em class="iconn-46"></em></div>' +
                    '<div class="list-text search-group-name">' +
                    '<span class="search-name" >' +
                    groupName.replace(new RegExp(item.HighLightString, 'gi'), '<strong class="key">$&</strong>') +
                    '</span>' +
                    '</div>';
                $(temp).data({
                    groupId: item.GroupID,
                    groupName: groupName,
                    groupType: 2
                });
                fragment.appendChild(temp);
            });
            $('.search-groups-show').append(fragment);
        }

        function addSearchChannelsItem(data, flag) {
            var fragment = document.createDocumentFragment();
            data.forEach(function(item, index) {
                var ChannelName = item.ChannelName || item.initname;
                var temp = document.createElement('li');
                if (flag && index === 0 && $('.search-list').find('.active').length === 0) {
                    temp.className = 'active';
                }
                temp.innerHTML = '<div class="list-name" style="background:' + getNickNameColor(Math.abs(hashCode(item.ChannelId))) + ';"><img src="../images/icon/Group4Copy7@2x.png" class="channel-icon"></div>' +
                    '<div class="list-text search-channel-name">' +
                    '<span class="search-name" title="' + ChannelName + '">' +
                    ChannelName.replace(new RegExp(item.HighLightString.trim(), 'gi'), '<strong class="key">$&</strong>') +
                    '</span>' +
                    '</div>';
                $(temp).data({
                    ChannelId: item.ChannelId,
                    ChannelName: ChannelName,
                    Type: item.type
                });
                fragment.appendChild(temp);
            });
            $('.search-channels-show').append(fragment);
        }

		// 发起群聊
        // var btnLeft=($('#app').width()-$('#group-chat-member').width())/2+340+"px";
        // var btnLeft=($('#app').width()-$('#group-chat-member').width())/2+"px";
        // $('#group-chat-member').css('left',btnLeft);
        $('#search').siblings('a.search-btn').on('click', function(e) {
            $('#search-personList').addClass('hideList');
            $('#group-chat-member .group-chat-search').find('input').val('');
            var selectPeopleList = $('#selectList-name').children().length;
            $('.selectedNumber').html(selectPeopleList);
            $('#group-chat-member .group-chat-search').find('.icon-searchPerson').css('left', '296px');
            $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
            $('#group-chat-member .group-chat-button .btn-confirm').off();
            e.stopPropagation();
            createOrAdd = 'create';
            if (groupChatOpen == false) {
                $('#group-chat-member').removeClass('hideList');
                groupChatOpen = true;
                $('#myContacts2').removeAttr('selectedLength');
                $('#myContacts2').removeAttr('selectedAryImid');
                $('.selectList-count').find('strong').removeClass('redColor');
                $groupChatSearchInp.focus();
                mainObject.getGroupConfig();
            } else {
                $('#group-chat-member').addClass('hideList');
                groupChatOpen = false;
            }
        });
        $('#group-chat-member').on('click', function(e) {
            e.stopPropagation();
        });


		// 获得图片路径
        mainObject.sigGetOpenFilePath.connect(function(data) {
            console.log(/* "图片路径"+ */data);
            insertPic(data);
        });

		// 注册从用户详情发起会话的参数回调
        mainObject.sig_switchToMain.connect(function(data) {
            data.groupType = 1;
            newConversation(data, true);
        });

		// 被邀请加入群通知
        mainObject.sigInvitedJoinGroupNoticeMsgNotify.connect(function(data) {
            beInvitedIntoGroup(data);
        });

		// 解散群通知
        mainObject.sigDisbandGroupNoticeMsgNotify.connect(function(data) {
            disbandGroup(data);
        });

		// 被踢出群通知
        mainObject.sigQuitGroupNoticeMsgNotify.connect(function(data) {
            quitOrKickoutGroup(data);
        });

		// 修改群信息通知
        mainObject.sigEditGroupNoticeMsgNotify.connect(function(data) {
            console.log('修改群信息回调', data);
            var extra = JSON.parse(data.extra);
		    if (extra.groupName) {
                editGroupInfoNotify(data);
                editgroup(data);
            } else if (typeof (extra.isMsgBlocked) !== 'undefined') {
                setSessionMuteNotify(data);
            } else if (typeof (extra.stickies) !== 'undefined') {
                setSesseionTop({
                    ResponseErrcode: extra.stickies,
                    groupId: data.groupId
                });
            }
        });

        // 免打扰通知
        mainObject.sigSetSheildNotify.connect(function(data) {
            console.log('设置免打扰通知:', data);
            setSessionMuteNotify({
                groupId: data.groupId,
                extra: '{"isMsgBlocked": ' + data.ResponseErrcode + '}'
            });
        });

		// 移动端未读信息回调通知
        mainObject.sigSyncUnreadMassageCount.connect(function(data) {
            syncUnreadMassageCount(data);
        });

		// 置顶状态通知
        mainObject.sigSetSesssionTop.connect(function(data) {
            setSesseionTop(data);
        });

		// 删除会话通知
        mainObject.sigDelSessionItem.connect(function(data) {
            deleteSession(data);
        });

		// 双击托盘通知
        mainObject.sigDoubleclickSysTray.connect(function(data) {
            console.log('托盘双击');
            openChat();
        });

        // 未读盒子通知
        mainObject.sigMessageBoxSingleUnreadMsgOpen.connect(function(data) {
            console.log('消息盒子',data,111);
            messageBoxOBJ = data;
            window.VueApp.$store.dispatch('openMsgBoxChannelOrSession', data);
        });

		// 语音播放完成通知
        mainObject.sigPlayFinish.connect(function(groupId, msgId) {
		    window.VueApp.$store.dispatch('soundPlayFinish', {channelId: groupId, msgId});
            soundPlayFinish(groupId, msgId);
        });

		// 点击消息区头像打开个人详情
        $('#msgArea').on('click', '.list-name', function() {
            var imId = $(this).attr('imId');
            var staffname = $(this).attr('data-staff-name') || '';
            setNickNameColorToLocal(this.style.background);
            mainObject.showMemberInfo(2, imId, staffname);
            // let color = this.style.background

            //mainObject.showMemberInfo(3, staffname);
        });

		// 打开地图
        $('#msgArea').on('click', '.map', function() {
            var x = $(this).attr('x');
            var y = $(this).attr('y');
            var positionName = $(this).attr('positionName');
            publicObject.showGeneralDlg(104);
            publicObject.initGeneralDlg({ 'GeneralDlgId': 104, 'x': x, 'y': y, 'positionName': positionName});
        });


		// -------------------联系人功能区--------------------

		// 部门
        mainObject.sig_getOrg.connect(function(data) {
            window.VueApp.$store.dispatch('getOrg', JSON.parse(data).data.dept);
            initDeptTree(JSON.parse(data).data.dept);
            initDeptTree2(JSON.parse(data).data.dept);
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });

		// 我的群组
        mainObject.siggetGroupList.connect(function(json) {
            initMyGroup(json);
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });

		// 常用联系人
        mainObject.siggetContact.connect(function(data) {
            window.VueApp.$store.dispatch('getStarContact', data);
            initMyContacts(data);
            initMyContacts2(data);
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });

		// 群详情中的群成员
        mainObject.siggetGroupMembers.connect(function(data) {
            initGroupMembers(data);
			// initAiteGroupMembersCallback(data);
            aiteObj.getSerchListCallback(data);
            readyNum += 1;
            if (readyNum == 7) {
                mainObject.OnHtmlReady();
            }
        });

		// -------------------频道功能区-------------------------


		// 我的频道
        mainObject.sigGetChannelInfoList.connect(function(data) {
            console.log('频道通讯录回调', data);
            initMyChannel(data);
        });

        // 获取频道失败
        mainObject.sigGetChannelListFailed.connect(function(flag) {
            VueApp.$store.state.channels.finishInit = true;
            getChannelListFailedConfig.failed = true;
            VueApp.$store.state.channels.getChannelListFailed = true;
            if (getChannelListFailedConfig.times++ <= 3) {
                console.log('sigGetChannelListFailed', getChannelListFailedConfig.times);
                if (flag === 1) {
                    getChannelListFailedConfig.reconnectedFlag = 1;
                }
                clearTimeout(getChannelListFailedConfig.timer);
                getChannelListFailedConfig.timer = setTimeout(() => {
                    mainObject.getChannelListInfo(getChannelListFailedConfig.reconnectedFlag);
                    console.log('getChannelListInfo');
                }, Math.ceil(getChannelListFailedConfig.times / 2) * 5000);
            } else {
                getChannelListFailedConfig.times = 0;
            }
        });

        // 频道管理员修改回调
        mainObject.sigTransferChannelAdminResult.connect((flag) =>{
            console.log('频道管理员修改回调', flag);
            window.VueApp.$store.dispatch('transferChannelAdmin', flag);
            if(flag) {
                window.VueApp.$toast('转让成功!');
                window.VueApp.$store.commit('changeLinkBorderIndex', 1);
            } else {
                window.VueApp.$toast('转让失败!');
            }

        });

        // 获取频道会话列表
        mainObject.sigGetSessionChannelInfoList.connect(function(data, flag) {
            console.log('频道会话列表', _deepClone(data), flag);
            window.VueApp.$store.dispatch('getChannels', {channels: data, flag});
            getChannelListFailedConfig.reconnectedFlag = 0;
            getChannelListFailedConfig.failed = false;
            getChannelListFailedConfig.times = 0;
            getChannelListFailedConfig.timer = null;
        });

        mainObject.sig_sendChannelMsgReal.connect(function(data) {
            console.log('发送消息回调', data);
            window.VueApp.$store.dispatch('sendChannelMsgSuccess', data);
        });

        // 获取历频道史消息
        mainObject.sig_getChannelMsgListReal.connect(function(data, channelId) {
            console.log('历史消息', _deepClone(data), channelId);
            // if (data.length) {
            window.VueApp.$store.dispatch('getChannelMsgList', {data, channelId});
            // }
        });

        // 收到消息
        mainObject.sig_recvChannelMsgReal.connect(function(data) {
            console.log('收到消息', _deepClone(data));
            window.VueApp.$store.dispatch('receiveChannelMsg', data);
        });

        // 获取频道特殊消息list
        mainObject.sig_getChannelSpecialMsgListReal.connect(function(data) {
            console.log('频道特殊消息列表', _deepClone(data));
            window.VueApp.$store.dispatch('getChannelSpecialMsgList', data);
        });

        // 点赞回调
        mainObject.sig_suePraiseMsgSyncReal.connect(function(data) {
            console.log('点赞回调', _deepClone(data));
            window.VueApp.$store.dispatch('receiveMsgPraisedSignal', data);
        });

        // 获取频道成员
        mainObject.sigGetChannelMembers.connect(function(data, channelId) {
            // console.log('--公共部分：频道成员--:',data, channelId);
            var arr = [];
            var guestObj = {};
            var guestArr = [];
            for (let k of Object.keys(data)) {
                if (data[k].length) {
                    data[k][0].firstLetter = k;
                    arr.push(...data[k]);
                    guestObj[k] = [];
                    data[k].forEach(item => {
                        if (item.listType === 1) {
                            guestObj[k].push(item);
                        }
                    })
                }
            }
            for (let k of Object.keys(guestObj)) {
                if (guestObj[k].length) {
                    guestObj[k][0].firstLetterGuest = k;
                    guestArr.push(...guestObj[k]);
                }
            }
            // console.log(guestObj, guestArr);
            var channelInfo = $('.new-channel-conversation').data();
            if (channelInfo && channelInfo.ChannelId === channelId) {
                // $('#members-no-record').addClass('hideList');
                initChannelMembers(data, channelId);
                initChannelCondition(channelInfo,guestArr);
                initChannelConditionList(channelInfo,guestArr)
                $('#channel-detail-title').find('p').html(channelInfo.ChannelName + '(' + arr.length + '人)');
            }
            window.VueApp.$store.dispatch('getChannelMembers', {members: arr, channelId, count: arr.length, guests: guestArr});
        });

		// 获取群聊配置信息回调
        mainObject.sigGetGroupChatConfig.connect(function(data) {
            console.log(_deepClone(data));
            var groupCapacity = data.groupCapacity - 1;
            $('.selectTotalNumber').html(groupCapacity);
        });

        // 获取回执消息已读未读列表
        mainObject.sig_channelOrUnReadResult.connect(function(data) {
            console.log(data);
            window.VueApp.$store.commit('GET_UNREAD_LIST', data);
        });

        // 同步已读状态
        mainObject.sig_readSeqNotify.connect(function(data) {
            window.VueApp.$store.commit('SYNC_UNREAD_MSG', data);
        });

        // 撤回消息回调
        mainObject.sig_delChannelMsgReal.connect(function(data) {
            console.log(data);
            if (data.nReason !== 200000) {
                window.VueApp.$toast({
                    message: '撤回失败',
                    success: false
                });
            } else {
                window.VueApp.$toast('撤回成功！');
                window.VueApp.$store.dispatch('deleteMessage', data);
            }
        });

        // 删除消息通知
        mainObject.sig_delMsgNotify.connect(function(data) {
            console.log('删除消息通知', _deepClone(data));
            window.VueApp.$store.dispatch('deleteMessage', data);
        });

        // 频道各种失败回调
            /* ChannelSetting_Desc = 1,
            ChannelSetting_Notice= 2,
            ChannelSetting_CommonMsgRemind= 3,
            ChannelSetting_NewMsgRemind= 4,
            ChannelSetting_ChannelTop= 5
             ChannelSetting_DelChannel,7
             ChannelSetting_AddSpecialStaffs,8
             ChannelSetting_DelSpecialStaffs,9
             ChannelSetting_EditChannel，10 */

        mainObject.SigChannelSettingFailed.connect(function(data, data1) {
            console.log('失败设置通知', data, data1);
            let str = '修改失败，请稍后重试';
            if (data === 5) {
                return;
            } else if (data === 7 || data === 8 || data === 9 || data === 10) {
                str = data1 || '修改失败，请稍后重试';
            }
            window.VueApp.$toast({message: str, success: false});
        });

        mainObject.sigChannelSettingSuccessed.connect(function(data, data1) {
            console.log('sigChannelSettingSuccessed', data, data1);
            let str = '';
            if (data === 7) {
                return;
            }
            if (data1 === '') {
                if (data === 7) {
                    str = '退出频道成功';
                } else if (data === 8) {
                    str = '添加成功';
                } else if (data === 9) {
                    str = '移除成功';
                } else if (data === 10) {
                    return;
                }
                window.VueApp.$toast({message: str, success: true});
            } else {
                str = data1 || '修改失败，请稍后重试';
                window.VueApp.$toast({message: str, success: false});
            }
        });

        // 上传下载 进度回调
        mainObject.sig_fileUpDownChannelProcess.connect(function(data) {
            // console.log(data);
            if (!data.channelId) {
                data.channelId = '596c7b7bf8c01202a25c4c85';
            }
            window.VueApp.$store.dispatch('fileUpDownChannelProcess', data);
        });
        // 上传wancheng 回调
        mainObject.sig_fileUpChannelReal.connect(function(data) {
            console.log('上传wancheng 回调', data);
            window.VueApp.$store.dispatch('fileUpChannelReal', data);
        });

        // 下载wancheng 回调
        mainObject.sig_fileDownloadChannelReal.connect(function(data) {
            console.log('下载wancheng 回调', data);
            if (!data.channelId) {
                data.channelId = '596c7b7bf8c01202a25c4c85';
            }
            window.VueApp.$store.dispatch('fileDownloadChannelReal', data);
        });


        // 频道预览文件回调
        qFileTransferObj.sigChannelStatus.connect(function(channelId, msgId, FileStatus) {
            console.log('状态回调: ', channelId, msgId, FileStatus);
            window.VueApp.$store.dispatch('sigChannelStatus', {channelId, msgId, FileStatus});
        });


	  mainObject.sig_reportMsgSyncNotify.connect(function(data) {
	      // console.log('回执已读通知', _deepClone(data));
          window.VueApp.$store.commit('READ_ACK_MSG', data);
      });

		// mainObject.OnHtmlReady();
        mainObject.getSession();
        mainObject.getGroupList();
        mainObject.getContact();
        mainObject.getChannelListInfo(0);
        mainObject.getOrg();
        mainObject.InitGeneralsetTomainDlg();
        mainObject.getPublishNoticeBubble();
        appSetObject.getUpdateStatus();
        mainObject.getNoticeCardMessage();
    });

	// ---------------------页面通用------------------------

    $('#im-channel').on('click', function(e) {
        endSearch(true);
        $(this).find('strong.im-the-font').addClass('font-active');
        $('#im-chat').find('strong.im-the-font').removeClass('font-active');
        $('#im-contact').find('strong.im-detail-font').removeClass('font-active');
    });

	// 功能区切换
    $('#im-chat').on('click', function() {
        $(this).find('strong.im-the-font').addClass('font-active');
        $('#im-channel').find('strong.im-the-font').removeClass('font-active');
        $('#im-contact').find('strong.im-detail-font').removeClass('font-active');
		// $(this).addClass('active');
		// $('#im-contact').removeClass('active');
        $('#chat-content').removeClass('hideList');
        $('#contacts-content').addClass('hideList');
        if (CHATOBJ.groupId) {
            openSession($('#session-' + CHATOBJ.groupId), false);
        } else {
            mainObject.setMsgReaded('', false);
        }

        // 取消搜索状态
        endSearch(true);
    });
    $('#im-contact').on('click', function() {
        $(this).find('strong.im-detail-font').addClass('font-active');
        $('#im-channel').find('strong.im-the-font').removeClass('font-active');
        $('#im-chat').find('strong.im-the-font').removeClass('font-active');
		// $(this).addClass('active');
		// $('#im-chat').removeClass('active');
        $('#contacts-content').removeClass('hideList');
        // $('#chat-content').addClass('hideList');

        /* $('#btn-wrapper').removeClass('on').addClass('off');
        $('#file-list').stop().animate({'right':'-390px'},function () {
            $(this).addClass('off')
            $("#file-list-ul").empty()
        });

        filesListOpen = false; */

		// 取消搜索状态
        endSearch(true);
    });
	// 设置窗口
    $('#im-config').on('click', function() {
        mainObject.showAppsetDialog();
    });

    //更多
    // $('#im-more').on('click',function(){

    // });

    $('#selectFace').on('click', function(e) {
        e.stopPropagation();
        if (faceOpen == false) {
            $('#emoji').removeClass('hideList');
            faceOpen = true;
        } else {
            $('#emoji').addClass('hideList');
            faceOpen = false;
        }
    });

    $('#app').on('click', function(e) {
		// 关闭表情
        $('#emoji').addClass('hideList');
        faceOpen = false;
		// 关闭弹窗
		// mainObject.hideMemberInfodlg();

		// 关闭文件列表
        $('#file-list').on('click', function(e) {
            e.stopPropagation();
        });
        if (filesListOpen == true) {
            $('#btn-wrapper').removeClass('on').addClass('off');
            $('#file-list').stop().animate({'right': '-390px'}, function() {
                $(this).addClass('off');
                $('#file-list-ul').empty();
            });
            filesListOpen = false;
        }


		// 关闭发起群聊
        /* $('#selectList-name').children().remove()
        $('#all-personList').addClass('hideList')
        $('#groupTree-personList').addClass('hideList')
        $('#contact-personList').addClass('hideList')
        $('#search-personList').addClass('hideList')
        $('#group-chat-member').addClass('hideList')
        $('#group-chat-member .group-chat-search').find('input').val('')
        $('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px')
        groupChatOpen=false;
        var selectPeopleList=$('#selectList-name').children().length
        $('.selectedNumber').html(selectPeopleList)
        $('#group-chat-member .group-chat-button .btn-confirm').css('background','rgba(62,136,247,0.20)')
        $('#group-chat-member .group-chat-button .btn-confirm').off()
        $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
        $('.addPersonBtn').find('p').css({'color':"#4590E4"})
        $('.group-chat-addressList').animate({
            scrollTop: '0px'
        }, 1000); */

        // 关闭群详情删除按钮
        $('#group-detail-members ul li').find('img').addClass('hideList');
        $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员@2x.png');
        $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
        oldSrc = $('.deletePersonBtn').find('img').attr('src');
        groupDelMemberOpen = false;

		// 隐藏toast
        if ($('.global-toast').length > 0 && !$('.global-toast').hasClass('hide')) {
            clearTimeout($('.global-toast').timer);
            $('.global-toast').addClass('hide');
        }


        if (!$('.exit-group-modal').hasClass('hide') && event.target.className !== 'exit-group-modal' &&
				$(event.target).parent('.exit-group-modal').length === 0) {
            $('.exit-group-modal').addClass('hide');
        }

        $('.search-list .right-con').addClass('hideList');

		// 关闭群详情添加按钮
        /* $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
        $('.addPersonBtn').find('p').css({'color':"#4590E4"}) */
        /* $('#group-chat-member').addClass('hideList') */
        groupAddMemberOpen = false;
    });

    // 点击弹框里非表情区域不关闭弹窗
    $('#emoji').on('click', function(e) {
        if (e.target.tagName !== 'IMG') {
            e.stopPropagation();
        }
    });

    $('.search-list .right-con').on('click', function(e) {
        e.stopPropagation();
    });

    // 右键关闭文件列表
    $(window).on('contextmenu', function() {
        if (filesListOpen == true) {
            $('#btn-wrapper').removeClass('on').addClass('off');
            $('#file-list').stop().animate({'right': '-390px'}, function() {
                $(this).addClass('off');
                $('#file-list-ul').empty();
            });
            filesListOpen = false;
        }
    });

    $(window).blur(function(e) {
		// 关闭表情
        $('#emoji').addClass('hideList');
        faceOpen = false;

		// 关闭文件列表
        $('#file-list').on('click', function(e) {
            e.stopPropagation();
        });
        if (filesListOpen == true) {
            $('#btn-wrapper').removeClass('on').addClass('off');
            $('#file-list').stop().animate({'right': '-390px'}, function() {
                $(this).addClass('off');
                $('#file-list-ul').empty();
            });
            filesListOpen = false;
        }

        // 关闭右键文件菜单
        if (!$('.krightmenu').hasClass('hideList')) {
            $('.krightmenu').addClass('hideList');
        }

        // 关闭发起群聊
        /* $('#selectList-name').children().remove()
        $('#all-personList').addClass('hideList')
        $('#groupTree-personList').addClass('hideList')
        $('#contact-personList').addClass('hideList')
        $('#search-personList').addClass('hideList')
        $('#group-chat-member').addClass('hideList')
		$('#group-chat-member .group-chat-search').find('input').val('')
		$('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px')
        groupChatOpen=false;
        var selectPeopleList=$('#selectList-name').children().length
        $('.selectedNumber').html(selectPeopleList)
        $('#group-chat-member .group-chat-button .btn-confirm').css('background','rgba(62,136,247,0.20)')
        $('#group-chat-member .group-chat-button .btn-confirm').off()
		 $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
		 $('.addPersonBtn').find('p').css({'color':"#4590E4"})
		 $('.group-chat-addressList').animate({
		 scrollTop: '0px'
		 }, 1000);
        */
    });

    $(window).resize(function() {
        var winHeight = $(window).height();
        $('#members-scroll').height(winHeight - 200);
        $('#contacts-detail-infos').height(winHeight - 302);
        $('#group-detail-members').height(winHeight - 357);
        $('#group-detail-info').height(winHeight - 325);
        // var btnLeft=($('#app').width()-$('#group-chat-member').width())/2+"px";
        // $('#group-chat-member').css('left',btnLeft);

        // 单聊联系人部门和职务
        /* $('#chat-title').css("width",$('#chat-title').attr('width')+'px')
        $('.right').css("width",$('.right').attr('width')+'px') */
        var chatTitleWidth = $('#chat-title').attr('width');
        var rightTitleWidth = $('.global-win-control').attr('width');
        var allTitleWidth = $('.con-title').width();
        var deptAndDutyContentWidth = allTitleWidth - chatTitleWidth - rightTitleWidth - 120;
        $('.deptAndDutyContent').css('max-width', deptAndDutyContentWidth + 'px');
        var deptAndDutyContentHtml = $('#chat-deptAndDuty .deptAndDutyContent').html();
        $('#chat-deptAndDuty .deptAndDutyContent').html(deptAndDutyContentHtml);

        // 关闭文件列表
        $('#file-list').on('click', function(e) {
            e.stopPropagation();
        });
        if (filesListOpen == true) {
            $('#btn-wrapper').removeClass('on').addClass('off');
            $('#file-list').stop().animate({'right': '-390px'}, function() {
                $(this).addClass('off');
                $('#file-list-ul').empty();
            });
            filesListOpen = false;
        }

        // 关闭右键文件菜单
        if (!$('.krightmenu').hasClass('hideList')) {
            $('.krightmenu').addClass('hideList');
        }


        // 关闭发起群聊
        /* $('#selectList-name').children().remove()
        $('#all-personList').addClass('hideList')
        $('#groupTree-personList').addClass('hideList')
        $('#contact-personList').addClass('hideList')
        $('#search-personList').addClass('hideList')
        $('#group-chat-member').addClass('hideList')
        $('#group-chat-member .group-chat-search').find('input').val('')
        $('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px')
        groupChatOpen=false;
        var selectPeopleList=$('#selectList-name').children().length
        $('.selectedNumber').html(selectPeopleList)
        $('#group-chat-member .group-chat-button .btn-confirm').css('background','rgba(62,136,247,0.20)')
        $('#group-chat-member .group-chat-button .btn-confirm').off()

        $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
        $('.addPersonBtn').find('p').css({'color':"#4590E4"})
        $('.group-chat-addressList').animate({
            scrollTop: '0px'
        }, 1000); */
    });

	// --------------------聊天功能区-------------------------

	// 输入区失去焦点时记录光标
    $('#input-content').blur(function() {
        var selObj = document.getSelection();
        var selRange = selObj.getRangeAt(0);
        rangeMap.put(CHATOBJ.groupId, {'sel': selObj, 'range': selRange});
		// console.log('blur',rangeMap);
		// sel = selObj;
		// range = selRange;
        commonAiteObj.updateRelAndSel(selObj, selRange);
    });

    document.getElementById('input-content').addEventListener('click', function() {
        var selObj = document.getSelection();
        var selRange = selObj.getRangeAt(0);
        rangeMap.put(CHATOBJ.groupId, {'sel': selObj, 'range': selRange});
        // console.log('blur',rangeMap);
       // sel = selObj;
        // range = selRange;
        commonAiteObj.updateRelAndSel(selObj, selRange);
    });
    document.getElementById('input-content').addEventListener('keyup', function() {
        var selObj = document.getSelection();
        var selRange = selObj.getRangeAt(0);
        rangeMap.put(CHATOBJ.groupId, {'sel': selObj, 'range': selRange});
        // console.log('blur',rangeMap);
        // sel = selObj;
        // range = selRange;
        commonAiteObj.updateRelAndSel(selObj, selRange);
    });

    $('#sendBtn').on('click', function() {
        sendMsg();
    });

    $('#chat-title').on('click', function() {
        showGroupInfo();
    });

	/* $('#msgArea').on('scroll','.con-list',function(){
		sendReceipt();
	}); */

    initEmoji();

	// ---------------------联系人功能区-------------------------

	// 展开或折叠我的群组及常用联系人
    $('#myGroup').on('click', function() {
        if (myGroupOpen == false) {
            $(this).find('em').addClass('iconn-26');
            $('#myGroup-content').removeClass('hideList');
            myGroupOpen = true;
        } else {
            $(this).find('em').removeClass('iconn-26');
            $('#myGroup-content').addClass('hideList');
            myGroupOpen = false;
            $('#myGroup').css({'position': 'relative', 'top': 0});
            $('#contacts-content .right-list').scrollTop(0);
        }
    });
    $('#myContacts').on('click', function() {
        if (myContactsOpen == false) {
            $(this).find('em').addClass('iconn-26');
            $('#myContacts-content').removeClass('hideList');

            myContactsOpen = true;
        } else {
            $(this).find('em').removeClass('iconn-26');
            $('#myContacts-content').addClass('hideList');
            myContactsOpen = false;
            $('#myContacts-content').css({'position': 'relative', 'top': 0});
            $('#contacts-content .right-list').scrollTop($('#myGroup').parent().height());
        }
    });

    $('#myChannel').on('click', function() {
        if (myChannelOpen == false) {
            $(this).find('em').addClass('iconn-26');
            $('#myChannel-content').removeClass('hideList');

            myChannelOpen = true;
        } else {
            $(this).find('em').removeClass('iconn-26');
            $('#myChannel-content').addClass('hideList');
            myChannelOpen = false;
        }
    });

	// 发起群聊搜索点击
    var $groupChatSearchInp = $('#group-chat-member .group-chat-search').find('input');
    $groupChatSearchInp.on('focus', startGroupChatSearch);
    $groupChatSearchInp.on('blur', endGroupChatSearch);
    $('#group-chat-member .icon-searchPerson').on('click', function() {
        $groupChatSearchInp.focus();
        startGroupChatSearch();
    });

    $groupChatSearchInp.on('contextmenu', function (e) {
        e.stopPropagation()
    })

    // 群聊搜索框变化绑定
    $groupChatSearchInp.bind('input propertychange', function() {
        var val = $(this).val().trim();
        if (!val) {
            $('#search-personList').addClass('hideList');
            return;
        } else {
            $('#search-personList').removeClass('hideList');
        }
        if (val.length > 0) {
            $groupChatSearchInp.data('pageNumber', 0);
            mainObject.getSearchUserByAddPage(val, '0', 0, 20, function(data) {
                console.log('群聊搜索', val, '0', 0, data);
                initGroupChatSearchList(data);
            });
           /* $('#session-no-record').addClass('hideList');
            if ($('#im-chat').hasClass('active')) {
                $('.name-show').addClass('hideList');
                $('#chat-content .search-show').removeClass('hideList');
            } else {
                $('#contacts-content .search-show').removeClass('hideList');
                $('.group-show').addClass('hideList')
            } */
            $('#all-personList').addClass('hideList');
            $('#groupTree-personList').addClass('hideList');
            $('#contact-personList').addClass('hideList');
            $('#search-personList').removeClass('hideList');
        } else {
            $groupChatSearchInp.removeAttr('placeholder');
            $groupChatSearchInp.parent().find('.icon-searchPerson').css('left', '6px');
        }
    });

    // 群聊搜索向下滚动

    $('#search-personList').parent().on('scroll', loadMoreGroupChatSearch);


    // 聚焦后
    function startGroupChatSearch() {
        DEPT.continue_ = false;
        if ($groupChatSearchInp.val().trim() == '') {
            $groupChatSearchInp.attr('placeholder', '');
            $groupChatSearchInp.parent().find('.icon-searchPerson').css('left', '6px');
            $('#search-personList').html('');
        } else {
            /* $('#search').find('.iconn-11').removeClass('hideList');
            $('.group-show').addClass('hideList');
            $('.name-show').addClass('hideList');
            $('.search-show').removeClass('hideList'); */
        }
        $groupChatSearchInp.parent().find('.icon-searchPerson').css('left', '6px');
        $('#search-personList').removeClass('hideList');
    }

    // 失焦后
    function endGroupChatSearch() {
        if ($groupChatSearchInp.val().trim() == '') {
            $groupChatSearchInp.removeAttr('placeholder');
            $groupChatSearchInp.parent().find('.icon-searchPerson').css('left', '296px');
            $('#search-personList').addClass('hideList');
            $('#searchNoData').addClass('hideList');
        }
        $groupChatSearchInp.removeAttr('placeholder');
    }

    // 初始化群聊搜索列表
    function initGroupChatSearchList(data) {
        $('#search-personList').html('');
        $('#searchNoData').addClass('hideList');
        $('#contactNoData').addClass('hideList');
        $('#treeNoData').addClass('hideList');
        if (!data.length) {
            $('#searchNoData').removeClass('hideList');
        } else {
            addGroupChatSearchItem(data);
        }
    }

    // 群聊搜素展示
    function addGroupChatSearchItem(data) {
        for (var i = 0; i < data.length; i++) {
            var orDisabled = data[i].bActivated ? '' : 'data-disabled="disabled"';
            var orColor = data[i].bActivated ? '' : 'style="color:rgba(0,0,0,0.2)"';
            var Name = data[i].bActivated ? 'name="' + data[i].MsgSendName + '"' : '';
            var ImId = data[i].bActivated ? 'imid="' + data[i].imId + '"' : '';
            var backImg = data[i].bActivated ? 'pitch-active-div' : 'pitch-unactive-div';
            var deptname = data[i].deptName;
            var dutyname = data[i].dutyName;
            if (data[i].imId == myInfo.imUserid) {
                orDisabled = 'data-disabled="disabled"';
                backImg = 'pitch-selected-div pitch-active-div';
                ImId = '';
            }

            if (i == 0) {
            	var activeClass = 'class="active"';
            } else {
                activeClass = '';
            }

            // 反勾选
            var addPersonBtn = $('#myContacts2').attr('selectedLength');
            if (addPersonBtn) {
                var addPersonBtnData = $('#myContacts2').attr('selectedAryImid').split(',');
                for (var j = 0; j < addPersonBtnData.length; j++) {
                    if (addPersonBtnData[j] == data[i].imId) {
                        orDisabled = 'data-disabled="disabled"';
                        backImg = 'pitch-selected-div pitch-active-div';
                        ImId = '';
                    }
                }
            }

            var temp = '<li ' + activeClass + ' ' + orDisabled + Name + ' ' + ImId + ' deptname="' + deptname + '" dutyname="' + dutyname + '" >' +
                '<span ' + orColor + '>' + data[i].MsgSendName.replace(new RegExp(data[i].HighLightString, 'gi'), '<strong class="key">$&</strong>') + '</span>' +
                '<p ' + orColor + '>' + data[i].dutyName + '</p>' +
                '<div class="' + backImg + '"' + ' ' + '' + orDisabled + '></div>' +
                '<em></em>' +
                '</li>';

            /* if (i === 0 && $('#search-personList').find('.active').length === 0) {
                temp.className = 'active';
            } */

            $('.group-chat-personList').find('.search-personList').append(temp);

            var nameAry = $('#selectList-name').children();
            if (nameAry.length > 0) {
                for (var j = 0; j < nameAry.length; j++) {
                    if ($(nameAry[j]).attr('imid') == data[i].imId) {
                        $('#search-personList li[imid="' + data[i].imId + '"]').find('div').attr('checked', true);
                        $('#search-personList li[imid="' + data[i].imId + '"]').find('div')[0].checked = true;
                        $('#search-personList li[imid="' + data[i].imId + '"]').find('div').addClass('pitch-on-div');
                    }
                }
            }
        }
    }

    // 发起群聊键盘事件
    $(document).on('keydown', function(e) {
        if (!$('.search-personList').hasClass('hideList')) {
            var activePerson = document.querySelector('.search-personList li.active');
            if (e.keyCode === 40) {
                e.preventDefault();
                if (activePerson.nextElementSibling) {
                    $(activePerson).removeClass('active');
                    $(activePerson.nextElementSibling).addClass('active');
                }
                activePerson = document.querySelector('.search-personList li.active');
                if (activePerson.offsetTop > $('.group-chat-personList').scrollTop() + $('.group-chat-personList').height() - activePerson.clientHeight) {
                    $('.group-chat-personList').scrollTop(activePerson.offsetTop - $('.group-chat-personList').height() + activePerson.clientHeight);
                }
            }
            if (e.keyCode === 38) {
                e.preventDefault();
                if (activePerson.previousElementSibling) {
                    $(activePerson).removeClass('active');
                    $(activePerson.previousElementSibling).addClass('active');
                }
                activePerson = document.querySelector('.search-personList li.active');

                if (activePerson.offsetTop < $('.group-chat-personList').scrollTop()) {
                    $('.group-chat-personList').scrollTop(activePerson.offsetTop);
                }
            }
            if (e.keyCode === 13) {
                $('.search-personList li.active').click();
                $groupChatSearchInp.select();
            }
        }
    });

    // 发起群聊搜索加载更多
    function loadMoreGroupChatSearch() {
        var $searchPersonListPare = $('#search-personList');
        var SH = $searchPersonListPare[0].offsetHeight;
        var ST = $searchPersonListPare.parent().scrollTop();
        var CH = $searchPersonListPare.parent().height();
        if (!$searchPersonListPare.hasClass('hideList')) {
            if (SH <= ST + CH) {
                var pageNumber = $groupChatSearchInp.data().pageNumber + 1,
                    val = $groupChatSearchInp.val();
                mainObject.getSearchUserByAddPage(val, '0', pageNumber, 20, function(data) {
                    console.log('加载群聊搜索', val, '0', 0, data);
                    if (!data || !data.length) return;
                    addGroupChatSearchItem(data);
                    $groupChatSearchInp.data('pageNumber', pageNumber);
                });
            }
        }
    }

	// 发起群聊常用联系人
    $('#myContacts2').on('click', function() {
        $('#groupTree-personList').find('li').remove();
        $('#groupTree-personList').addClass('hideList');
        $('#search-personList').addClass('hideList');
        $('#contact-personList').removeClass('hideList');
        $('#all-personList').removeClass('hideList');

        $('#all-personList').find('div').attr('checked', false);
        $('#all-personList').find('div')[0].checked = false;
        $('#all-personList').find('div').removeClass('pitch-on-div');

        $('#all-personList').find('div').removeClass('pitch-selected-div');
        $('#all-personList').find('div').removeAttr('data-disabled');
        $('#all-personList').removeAttr('data-disabled');

        $('#group-chat-member .group-chat-search').find('input').val('');
        $('#group-chat-member .group-chat-search').find('.icon-searchPerson').css('left', '296px');

        $('#contact-personList div').attr('checked', false);
        $('#contact-personList div').each(function() {
            $(this)[0].checked = false;
            $(this).removeClass('pitch-on-div');
        });
        $('#contact-personList div[data-disabled="disabled"]').each(function() {
            $(this)[0].checked = false;
            $(this).removeClass('pitch-on-div');
        });
        $('#contact-personList div[data-disabled="disabled"]').attr('checked', false);

        var nameAry = $('#selectList-name').children();
        var contactAry = $('#contact-personList').children();
        $('#searchNoData').addClass('hideList');
        $('#contactNoData').addClass('hideList');
        $('#treeNoData').addClass('hideList');
        if (!contactAry.length) {
            $('#contactNoData').removeClass('hideList');
            $('#all-personList').addClass('hideList');
        }

        if (nameAry.length > 0) {
            for (var j = 0; j < nameAry.length; j++) {
            	for (var i = 0; i < contactAry.length; i++) {
            		var contactImid = $(contactAry[i]).attr('imid');
                if ($(nameAry[j]).attr('imid') == contactImid) {
                    $('#contact-personList li[imid="' + contactImid + '"]').find('div').attr('checked', true);
                    $('#contact-personList li[imid="' + contactImid + '"]').find('div')[0].checked = true;
                    $('#contact-personList li[imid="' + contactImid + '"]').find('div').addClass('pitch-on-div');
                }
            }
            }
            var activeLength = $('#contact-personList').find('div.pitch-active-div').length;
            var pitchLength = $('#contact-personList').find('div.pitch-on-div').length;
            console.log(activeLength, pitchLength);
            if (activeLength == pitchLength && activeLength > 0) {
                $('#all-personList').find('div').attr('checked', true);
                $('#all-personList').find('div')[0].checked = true;
                $('#all-personList').find('div').addClass('pitch-on-div');
            } else if (activeLength !== pitchLength) {
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').removeClass('pitch-on-div');
            }
        }


        // 添加常用联系人反勾选
        for (var i = 0; i < contactAry.length; i++) {
        	var oaId = $(contactAry[i]).attr('id');
            if ($('#' + oaId).data().bActivated == true) {
        		var imId = $('#' + oaId).data().imId;
                $(contactAry[i]).attr('imid', imId);
                $(contactAry[i]).removeAttr('data-disabled');
                $(contactAry[i]).find('div').removeAttr('data-disabled');
                $(contactAry[i]).find('div').attr('checked', false);
                $(contactAry[i]).find('div')[0].checked = false;
                $(contactAry[i]).find('div').removeClass('pitch-selected-div');
            }
        }

        var addPersonBtn = $('#myContacts2').attr('selectedLength');
        if (addPersonBtn) {
        	var addPersonBtnData = $('#myContacts2').attr('selectedAryImid').split(',');
            for (var j = 0; j < addPersonBtnData.length; j++) {
                for (var i = 0; i < contactAry.length; i++) {
                    var contactImid = $(contactAry[i]).attr('imid');
                    if (addPersonBtnData[j] == contactImid) {
                        $('#contact-personList li[imid="' + contactImid + '"]').find('div').attr('checked', false);
                        $('#contact-personList li[imid="' + contactImid + '"]').find('div')[0].checked = false;
                        $('#contact-personList li[imid="' + contactImid + '"]').find('div').addClass('pitch-selected-div');
                        $('#contact-personList li[imid="' + contactImid + '"]').find('div').attr('data-disabled', 'disabled');
                        $('#contact-personList li[imid="' + contactImid + '"]').attr('data-disabled', 'disabled');
                        $('#contact-personList li[imid="' + contactImid + '"]').removeAttr('imid');
                    }
                }
            }
            var activeLength = $('#contact-personList').find('div.pitch-active-div').length;
            var selectedLength = $('#contact-personList').find('div.pitch-selected-div').length;
            console.log(activeLength, pitchLength);
            if (activeLength == selectedLength && activeLength > 0) {
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').addClass('pitch-selected-div');
                $('#all-personList').find('div').attr('data-disabled', 'disabled');
                $('#all-personList').attr('data-disabled', 'disabled');
            } else if (activeLength !== selectedLength) {
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').removeClass('pitch-on-div');
                $('#all-personList').find('div').removeClass('pitch-selected-div');
                $('#all-personList').find('div').removeAttr('data-disabled');
                $('#all-personList').removeAttr('data-disabled');
            }
        }
    });

    // 点击群组子选项
    $('#groupTree-personList').on('click', 'li:not([data-disabled="disabled"])', function() {
        if ($(this).find('div').attr('checked')) {
            $(this).find('div').attr('checked', false);
            $(this).find('div')[0].checked = false;
            $(this).find('div').removeClass('pitch-on-div');
        } else {
            $(this).find('div').attr('checked', true);
            $(this).find('div')[0].checked = true;
            $(this).find('div').addClass('pitch-on-div');
        }
        var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
        var pitchLength = $('#groupTree-personList').find('div.pitch-on-div').length;
        if (activeLength == pitchLength) {
            $('#all-personList').find('div').attr('checked', true);
            $('#all-personList').find('div')[0].checked = true;
            $('#all-personList').find('div').addClass('pitch-on-div');
        } else {
            $('#all-personList').find('div').attr('checked', false);
            $('#all-personList').find('div')[0].checked = false;
            $('#all-personList').find('div').removeClass('pitch-on-div');
        }
        var selectedLength = $('#groupTree-personList').find('div.pitch-selected-div').length;
        if (selectedLength > 0 && activeLength == pitchLength + selectedLength) {
            $('#all-personList').find('div').attr('checked', true);
            $('#all-personList').find('div')[0].checked = true;
            $('#all-personList').find('div').addClass('pitch-on-div');
        } else if (selectedLength > 0 && activeLength !== pitchLength + selectedLength) {
            $('#all-personList').find('div').attr('checked', false);
            $('#all-personList').find('div')[0].checked = false;
            $('#all-personList').find('div').removeClass('pitch-on-div');
        }
        var checkNum = $('#groupTree-personList').find('div').length;
        var checkedNum = $('#groupTree-personList').find("div[checked='checked']").length;
        var unCheckNum = $('#groupTree-personList').find('div[disabled]').length;
        if (checkNum == unCheckNum + checkedNum) {
            $('#all-personList').find('div')[0].checked = true;
        } else {
            $('#all-personList').find('div')[0].checked = false;
        }
        selectPersonList($(this).find('div'));
    });

    // 点击联系人子选项
    $('#contact-personList').on('click', 'li:not([data-disabled="disabled"])', function() {
        if ($(this).find('div').attr('checked')) {
            $(this).find('div').attr('checked', false);
            $(this).find('div')[0].checked = false;
            $(this).find('div').removeClass('pitch-on-div');
        } else {
            $(this).find('div').attr('checked', true);
            $(this).find('div')[0].checked = true;
            $(this).find('div').addClass('pitch-on-div');
        }
        var activeLength = $('#contact-personList').find('div.pitch-active-div').length;
        var pitchLength = $('#contact-personList').find('div.pitch-on-div').length;
        if (activeLength == pitchLength) {
            $('#all-personList').find('div').attr('checked', true);
            $('#all-personList').find('div')[0].checked = true;
            $('#all-personList').find('div').addClass('pitch-on-div');
        } else {
            $('#all-personList').find('div').attr('checked', false);
            $('#all-personList').find('div')[0].checked = false;
            $('#all-personList').find('div').removeClass('pitch-on-div');
        }
        var selectedLength = $('#contact-personList').find('div.pitch-selected-div').length;
        if (selectedLength > 0 && activeLength == pitchLength + selectedLength) {
            $('#all-personList').find('div').attr('checked', true);
            $('#all-personList').find('div')[0].checked = true;
            $('#all-personList').find('div').addClass('pitch-on-div');
        } else if (selectedLength > 0 && activeLength !== pitchLength + selectedLength) {
            $('#all-personList').find('div').attr('checked', false);
            $('#all-personList').find('div')[0].checked = false;
            $('#all-personList').find('div').removeClass('pitch-on-div');
        }
        var checkNum = $('#contact-personList').find('div').length;
        var checkedNum = $('#contact-personList').find("div[checked='checked']").length;
        var unCheckNum = $('#contact-personList').find('div[disabled]').length;
        if (checkNum == unCheckNum + checkedNum) {
            $('#all-personList').find('div')[0].checked = true;
        } else {
            $('#all-personList').find('div')[0].checked = false;
        }
        selectPersonList($(this).find('div'));
    });

    $('#search-personList').on('click', 'li:not([data-disabled="disabled"])', function() {
        if ($(this).find('div').attr('checked')) {
            $(this).find('div').attr('checked', false);
            $(this).find('div')[0].checked = false;
            $(this).find('div').removeClass('pitch-on-div');
        } else {
            $(this).find('div').attr('checked', true);
            $(this).find('div')[0].checked = true;
            $(this).find('div').addClass('pitch-on-div');
        }

        selectPersonList($(this).find('div'));
    });


    // 点击全部
    $('#all-personList').on('click', function() {
        if ($(this).find('div').attr('checked')) {
            $(this).find('div').attr('checked', false);
            $(this).find('div')[0].checked = false;
            $(this).find('div').removeClass('pitch-on-div');
        } else {
            $(this).find('div').attr('checked', true);
            $(this).find('div')[0].checked = true;
            $(this).find('div').addClass('pitch-on-div');
        }
    	if ($(this).find('div')[0].checked == true) {
        	// 群组
        $('#groupTree-personList div').attr('checked', true);
        $('#groupTree-personList div').each(function() {
            $(this)[0].checked = true;
            $(this).addClass('pitch-on-div');
        });
        $('#groupTree-personList div[data-disabled="disabled"]').each(function() {
            $(this)[0].checked = false;
            $(this).removeClass('pitch-on-div');
        });
        $('#groupTree-personList div[data-disabled="disabled"]').attr('checked', false);
			// 联系人
        $('#contact-personList div').attr('checked', true);
        $('#contact-personList div').each(function() {
            $(this)[0].checked = true;
            $(this).addClass('pitch-on-div');
        });
        $('#contact-personList div[data-disabled="disabled"]').each(function() {
            $(this)[0].checked = false;
            $(this).removeClass('pitch-on-div');
        });
        $('#contact-personList div[data-disabled="disabled"]').attr('checked', false);
    } else {
    		// 群组
        if ($('#groupTree-personList').children().length > 0) {
            $('#groupTree-personList div').attr('checked', false);
            $('#groupTree-personList div').each(function() {
                $(this)[0].checked = false;
                $(this).removeClass('pitch-on-div');
            });
            $('#groupTree-personList div[data-disabled="disabled"]').each(function() {
                $(this)[0].checked = false;
                $(this).removeClass('pitch-on-div');
            });
            $('#groupTree-personList div[data-disabled="disabled"]').attr('checked', false);
        }

			// 联系人
        if ($('#contact-personList').children().length > 0) {
            $('#contact-personList div').attr('checked', false);
            $('#contact-personList div').each(function() {
                $(this)[0].checked = false;
                $(this).removeClass('pitch-on-div');
            });
            $('#contact-personList div[data-disabled="disabled"]').each(function() {
                $(this)[0].checked = false;
                $(this).removeClass('pitch-on-div');
            });
            $('#contact-personList div[data-disabled="disabled"]').attr('checked', false);
        }
    }
        selectPersonList($(this).find('div'));
    });

    // 选择名字反选
    $('#selectList-name').on('click', 'li', function() {
        var imId = $(this).attr('imid');
        console.log($('#groupTree-personList li[imid="' + imId + '"]'));
        $(this).remove();

		// 群组通讯录反选
        if ($('#groupTree-personList li[imid="' + imId + '"]').length > 0) {
            $('#groupTree-personList li[imid="' + imId + '"]').find('div').attr('checked', false);
            $('#groupTree-personList li[imid="' + imId + '"]').find('div')[0].checked = false;
            $('#groupTree-personList li[imid="' + imId + '"]').find('div').removeClass('pitch-on-div');

            var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
            var pitchLength = $('#groupTree-personList').find('div.pitch-on-div').length;
            if (activeLength !== pitchLength) {
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').removeClass('pitch-on-div');
            }
        }

		// 常用联系人反选
        if ($('#contact-personList li[imid="' + imId + '"]').length > 0) {
            $('#contact-personList li[imid="' + imId + '"]').find('div').attr('checked', false);
            $('#contact-personList li[imid="' + imId + '"]').find('div')[0].checked = false;
            $('#contact-personList li[imid="' + imId + '"]').find('div').removeClass('pitch-on-div');

            var activeLength1 = $('#contact-personList').find('div.pitch-active-div').length;
            var pitchLength1 = $('#contact-personList').find('div.pitch-on-div').length;
            if (activeLength1 !== pitchLength1) {
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').removeClass('pitch-on-div');
            }
        }

		// 搜索人反选
        if ($('#search-personList li[imid="' + imId + '"]').length > 0) {
            $('#search-personList li[imid="' + imId + '"]').find('div').attr('checked', false);
            $('#search-personList li[imid="' + imId + '"]').find('div')[0].checked = false;
            $('#search-personList li[imid="' + imId + '"]').find('div').removeClass('pitch-on-div');
        }

        var selectPeopleList = $('#selectList-name').children().length;
        $('.selectedNumber').html(selectPeopleList);
        if (selectPeopleList == 0) {
            $('.group-chat-selectList').find('div.selectList-delMsg').removeClass('hideList');
            $('.rubbish-btn i').css('color', '#cccccc');
            $('.rubbish-btn .rubbish  img').attr('src', '../images/icon/选择-删除不可用@2x.png');
            $('.selectedNumber').html(selectPeopleList);
        }
        confirmGroupChat(selectPeopleList);
    });

	// 选择群组人员
    function selectPersonList(person) {
		// 点击子选项
        if ($(person).parent().get(0).tagName == 'LI' && $(person)[0].checked == true && $(person).parent().length > 0) {
            var temp = '<li name="' + $(person).parent().attr('name') + '" imid="' + $(person).parent().attr('imid') + '">' + $(person).parent().attr('name') + '</li>';
            var aryLi = $('#selectList-name').children();
            if (aryLi.length == 0) {
                $('#selectList-name').append(temp);
            } else {
                var aryLi = $('#selectList-name').children();
                var aryLiImId = [];
                for (var i = 0; i < aryLi.length; i++) {
                    var IdNum = $(aryLi[i]).attr('imid');
                    aryLiImId.push(IdNum);
                }
                var tempImId = $(temp).attr('imid');
                var addPerson = aryLiImId.every(function(aryLiImId) {
                    return aryLiImId !== tempImId;
                });
                if (addPerson) {
                    $('#selectList-name').append(temp);
                }
            }
        } else if ($(person)[0].checked == false) {
            var delId = $(person).parent().attr('imid');
            $('#selectList-name').find('li[imid="' + delId + '"]').remove();
        }
		// 点击全部
        if ($(person).parent().get(0).tagName == 'DIV' && $(person)[0].checked == true) {
            var allLi = $('#groupTree-personList li[imid]');
            var itemLi = $('#groupTree-personList').find('div');
            console.log(allLi);
            var aryLi = $('#selectList-name').children();
            if (allLi.length > 0) {
                if (aryLi.length == 0) {
                    for (var i = 0; i < allLi.length; i++) {
                        var temp = '<li name="' + $(allLi[i]).attr('name') + '" imid="' + $(allLi[i]).attr('imid') + '">' + $(allLi[i]).attr('name') + '</li>';
                        $('#selectList-name').append(temp);
                    }
                } else {
                    var aryLiImId = [];
                    for (var i = 0; i < aryLi.length; i++) {
                        console.log($(aryLi[i]).attr('imid'));
                        var IdNum = $(aryLi[i]).attr('imid');
                        aryLiImId.push(IdNum);
                    }
                    for (var i = 0; i < allLi.length; i++) {
                        var temp = '<li name="' + $(allLi[i]).attr('name') + '" imid="' + $(allLi[i]).attr('imid') + '">' + $(allLi[i]).attr('name') + '</li>';
                        var tempImId = $(temp).attr('imid');
                        var addPerson = aryLiImId.every(function(aryLiImId) {
                            return aryLiImId !== tempImId;
                        });
                        if (addPerson) {
                            $('#selectList-name').append(temp);
                        }
                    }
                }
            } else if (allLi.length <= 0 && itemLi.length == 0) {
                var allContactLi = $('#contact-personList li[imid]');
                var aryLi = $('#selectList-name').children();
                if (aryLi.length == 0) {
                    for (var i = 0; i < allContactLi.length; i++) {
                        var temp = '<li name="' + $(allContactLi[i]).attr('name') + '" imid="' + $(allContactLi[i]).attr('imid') + '">' + $(allContactLi[i]).attr('name') + '</li>';
                        $('#selectList-name').append(temp);
                    }
                } else {
                    var aryLiImId = [];
                    for (var i = 0; i < aryLi.length; i++) {
                        console.log($(aryLi[i]).attr('imid'));
                        var IdNum = $(aryLi[i]).attr('imid');
                        aryLiImId.push(IdNum);
                    }
                    for (var i = 0; i < allContactLi.length; i++) {
                        var temp = '<li name="' + $(allContactLi[i]).attr('name') + '" imid="' + $(allContactLi[i]).attr('imid') + '">' + $(allContactLi[i]).attr('name') + '</li>';
                        var tempImId = $(temp).attr('imid');
                        var addPerson = aryLiImId.every(function(aryLiImId) {
                            return aryLiImId !== tempImId;
                        });
                        if (addPerson) {
                            $('#selectList-name').append(temp);
                        }
                    }
                }
            }
        } else if ($(person).parent().get(0).tagName == 'DIV' && $(person)[0].checked == false) {
            var groupTreeList = $('#groupTree-personList li[imid]');
            var nameList = $('#selectList-name').children();
            if (groupTreeList.length > 0) {
            	for (var i = 0; i < groupTreeList.length; i++) {
            		for (var j = 0; j < nameList.length; j++) {
            			if ($(groupTreeList[i]).attr('imid') == $(nameList[j]).attr('imid')) {
                $(nameList[j]).remove();
            }
            }
            }
            } else {
                var contactTreeList = $('#contact-personList li[imid]');
                var nameList = $('#selectList-name').children();
                for (var i = 0; i < contactTreeList.length; i++) {
                    for (var j = 0; j < nameList.length; j++) {
                        if ($(contactTreeList[i]).attr('imid') == $(nameList[j]).attr('imid')) {
                            $(nameList[j]).remove();
                        }
                    }
                }
            }
            /* $('#selectList-name').children().remove() */
        }
        if ($('#selectList-name').children().length) {
            $('.group-chat-selectList').find('div.selectList-delMsg').addClass('hideList');
            $('.rubbish-btn i').css('color', '#4A4C5B');
            $('.rubbish-btn .rubbish  img').attr('src', '../images/icon/选择-删除@2x.png');
        } else {
            $('.group-chat-selectList').find('div.selectList-delMsg').removeClass('hideList');
            $('.rubbish-btn i').css('color', '#cccccc');
            $('.rubbish-btn .rubbish  img').attr('src', '../images/icon/选择-删除不可用@2x.png');
        }

        var selectPeopleList = $('#selectList-name').children().length;
        $('.selectedNumber').html(selectPeopleList);
        var selectPeopleListALLNum = $('.selectTotalNumber').html();
        confirmGroupChat(selectPeopleList);
        clearRubbish(selectPeopleList);
    }

    function clearRubbish(selectPeopleList) {
        if (selectPeopleList && selectPeopleList > 0) {
            $('.rubbish-btn').on('click', function() {
                $('.selectList-count').find('strong').removeClass('redColor');
                $('#selectList-name').children().remove();
                $('.group-chat-selectList').find('div.selectList-delMsg').removeClass('hideList');
                $('.rubbish-btn i').css('color', '#cccccc');
                $('.rubbish-btn .rubbish  img').attr('src', '../images/icon/选择-删除不可用@2x.png');
                $('.selectedNumber').html($('#selectList-name').children().length);
                $('.group-chat-personList ul li[imid]').find('div').attr('checked', false);
                $('.group-chat-personList ul li[imid]').find('div')[0].checked = false;
                $('.group-chat-personList ul li[imid]').find('div').removeClass('pitch-on-div');
                $('#all-personList').find('div').attr('checked', false);
                $('#all-personList').find('div')[0].checked = false;
                $('#all-personList').find('div').removeClass('pitch-on-div');
                $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
                $('#group-chat-member .group-chat-button .btn-confirm').off();
                console.log($('.group-chat-personList ul li[imid]').length);
            });
        }
    }

    $('#group-detail-info-btn').on('click', function() {
        $(this).addClass('active');
        $('#group-detail-members-btn').removeClass('active');
        $('#group-detail-members').addClass('hideList');
        $('#group-detail-info').removeClass('hideList');
        $('#group-detail').find('a.btn-send').removeClass('hideList');
    });

    $('#group-detail-members-btn').on('click', function() {
        $(this).addClass('active');
        $('#group-detail-info-btn').removeClass('active');
        $('#group-detail-info').addClass('hideList');
        $('#group-detail-members').removeClass('hideList');
    });

    $('#channel-detail-info-btn').on('click', function() {
        $(this).addClass('active');
        $('#channel-detail-members-btn').removeClass('active');
        $('#channel-detail-members').addClass('hideList');
        $('#channel-detail-info').removeClass('hideList');
    });

    $('#channel-detail-members-btn').on('click', function() {
        $(this).addClass('active');
        $('#channel-detail-info-btn').removeClass('active');
        $('#channel-detail-info').addClass('hideList');
        $('#channel-detail-members').removeClass('hideList');
    });

    $(document).on('dragover', function(e) {
        e.preventDefault();
    });

    $(document).on('drop', function(e) {
        e.preventDefault();
    });

    $(document).on('dragstart', 'img', function(e) {
        e.preventDefault();
    });

    /**
     * 修改群名称
     */
    $('#group-detail-info .edit').on('click', function() {
        $(this).parent().find('#group-name').addClass('hide');
        $(this).parent().find('.group-name-input').removeClass('hide');
        $('.group-name-input').val($('#group-name').text());
        // $(this).parent().find(".group-name-input").val(txtVal);
        $(this).parent().find('.group-name-input').focus().select();
        if ($('#group-' + groupDetailObj.groupId).data().isInitName) {
            $(this).parent().find('.group-name-input').val('');
        }
    });
    var beforeInput = '';
    $('.group-name-input').on('focus', function() {
        beforeInput = $(this).val();
    });
    $('.group-name-input').on('blur', function() {
    	setTimeout(() => {
        if (!($(this).val().trim() === '' || $(this).val() == beforeInput)) {
            	$(this).parent().find('#group-name').removeClass('hide');
            	$(this).addClass('hide');
            mainObject.changeGroupName({
                'groupId': groupDetailObj.groupId,
                'groupName': this.value,
                'capacity': 100
            });
        } else {
            $(this).parent().find('#group-name').removeClass('hide');
            $(this).addClass('hide');
        }
    }, 300);
    });

    // 删除成员显隐
    var oldSrc;
    $('.detail-membersList').on('click', 'div.deletePersonBtn', function(e) {
        e.stopPropagation();
        if (groupDelMemberOpen == false) {
            $('#group-detail-members ul li').find('img').removeClass('hideList');
            $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员－hover／click@2x.png');
            $('.deletePersonBtn').find('p').css({'color': '#3E89F7'});
            oldSrc = $('.deletePersonBtn').find('img').attr('src');
            groupDelMemberOpen = true;
        } else {
            $('#group-detail-members ul li').find('img').addClass('hideList');
            $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员@2x.png');
            $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
            oldSrc = $('.deletePersonBtn').find('img').attr('src');
            groupDelMemberOpen = false;
        }
    });

    // 删除群成员按钮hover
    $('.detail-membersList').on('mouseover', 'div.deletePersonBtn', function(e) {
        oldSrc = $('.deletePersonBtn').find('img').attr('src');
        $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员－hover@2x.png');
        $('.deletePersonBtn').find('p').css({'color': '#3E89F7'});
    }).on('mouseout', function(e) {
        $('.deletePersonBtn').find('img').attr('src', oldSrc);
        $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
    });

    // 添加群成员显示
    $('.detail-membersList').on('click', 'div.addPersonBtn', function(e) {
        e.stopPropagation();

        // 主页面限制
        var groupMembersNums = $('#group-detail-members ul').find('li').length;
        if (groupMembersNums >= 100) {
            showToast({ReturnMsg: '该群已满，不能再加入新成员'});
            return;
        }

        $('#search-personList').addClass('hideList');
        $('#group-chat-member .group-chat-search').find('input').val('');
        var selectPeopleList = $('#selectList-name').children().length;
        $('.selectedNumber').html(selectPeopleList);
        $('#group-chat-member .group-chat-search').find('.icon-searchPerson').css('left', '296px');
        $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
        $('#group-chat-member .group-chat-button .btn-confirm').off();

        createOrAdd = 'add';
        var selectedLength = $(this).siblings('li[imid]').length - 1;
        if (selectedLength <= 99) {
            if (groupAddMemberOpen == false) {
                $('.selectList-count').find('strong').removeClass('redColor');
                var selectedAry = $(this).siblings('li[imid]');
                var selectedGid = $(this).siblings('li[imid]').attr('groupid');
                var selectedAryImid = [];
                for (var i = 0; i < selectedAry.length; i++) {
                    selectedAryImid.push($(selectedAry[i]).attr('imid'));
                }
                var groupChatObj = {
                    selectedLength: selectedLength,
                    selectedAryImid: selectedAryImid
                };
                $('#myContacts2').attr('selectedLength', selectedLength);
                $('#myContacts2').attr('selectedAryImid', selectedAryImid);
                $('#myContacts2').attr('selectedGid', selectedGid);
                console.log(selectedLength, selectedAry, selectedAryImid);
                var oldselectTotalNumber = 99;
                var newselectTotalNumber = oldselectTotalNumber - selectedLength;
                if (newselectTotalNumber && newselectTotalNumber > 0) {
                    $('.selectTotalNumber').html(newselectTotalNumber);
                } else if (newselectTotalNumber == 0) {
                    $('.selectTotalNumber').html(newselectTotalNumber);
                }
                /* $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员－hover／click@2x.png')
                $('.addPersonBtn').find('p').css({'color':"#3E89F7"}) */
                $('#group-chat-member').removeClass('hideList');
                $groupChatSearchInp.focus();
                groupAddMemberOpen = true;
            } else {
                /* $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
                $('.addPersonBtn').find('p').css({'color':"#4590E4"})
                $('#group-chat-member').addClass('hideList') */
                groupAddMemberOpen = false;
                $('.group-chat-addressList').animate({
                    scrollTop: '0px'
                }, 1000);
            }
        }
    });

	// 添加群成员按钮hover
    var oldSrc2;
    $('.detail-membersList').on('mouseover', 'div.addPersonBtn', function(e) {
        oldSrc2 = $('.addPersonBtn').find('img').attr('src');
        $('.addPersonBtn').find('img').attr('src', '../images/icon/添加群成员－hover@2x.png');
        $('.addPersonBtn').find('p').css({'color': '#3E89F7'});
    }).on('mouseout', function(e) {
        $('.addPersonBtn').find('img').attr('src', oldSrc2);
        $('.addPersonBtn').find('p').css({'color': '#4590E4'});
    });

    // 弹窗添加群成员显示
    function membersWindow(data) {
        $('#search-personList').addClass('hideList');
        $('#group-chat-member .group-chat-search').find('input').val('');
        var selectPeopleList = $('#selectList-name').children().length;
        $('.selectedNumber').html(selectPeopleList);
        $('#group-chat-member .group-chat-search').find('.icon-searchPerson').css('left', '296px');
        $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
        $('#group-chat-member .group-chat-button .btn-confirm').off();
        createOrAdd = 'add';
        var selectedLength = data.selectedLength;
        if (selectedLength <= 99) {
            if (groupAddMemberOpen == false) {
                $('.selectList-count').find('strong').removeClass('redColor');
                var selectedAry = data.imId;
                var selectedGid = data.groupId;
                var selectedAryImid = [];
                for (var i = 0; i < selectedAry.length; i++) {
                    selectedAryImid.push(selectedAry[i]);
                }

                $('#myContacts2').attr('selectedLength', selectedLength);
                $('#myContacts2').attr('selectedAryImid', selectedAryImid);
                $('#myContacts2').attr('selectedGid', selectedGid);
                console.log(selectedLength, selectedAry, selectedAryImid);
                var oldselectTotalNumber = 99;
                var newselectTotalNumber = oldselectTotalNumber - selectedLength;
                if (newselectTotalNumber && newselectTotalNumber > 0) {
                    $('.selectTotalNumber').html(newselectTotalNumber);
                } else if (newselectTotalNumber == 0) {
                    $('.selectTotalNumber').html(newselectTotalNumber);
                }

                $('#group-chat-member').removeClass('hideList');
                $groupChatSearchInp.focus();
                groupAddMemberOpen = true;
            }/* else{

                $('#group-chat-member').addClass('hideList')
                groupAddMemberOpen=false
                $('.group-chat-addressList').animate({
                    scrollTop: '0px'
                }, 1000);
            } */
        }
    }

    /**
     * 联系人滚动吸顶
     * 由于此处群组等可展开，所以每项的高度不固定，无法用常规fix固定，只能通过相对定位去做，并且每次scroll时去查找最新的tp1,2,3
     */
    $('#contacts-content .right-list').on('scroll', function() {
        let ST = this.scrollTop;
        // let titleTop = tit.offsetTop;
        let tp1 = document.querySelector('#myGroup').parentNode.offsetTop;
        let tp2 = document.querySelector('#myContacts').parentNode.offsetTop;
        let tp3 = document.querySelector('#deptTree').offsetTop;
        // console.log(tp1,tp2, tp3);
        // console.log(ST);
        if (ST === 0) {
            // console.log('恢复初始状态');
            $('#deptTree').find('ul').children(':first').css({'position': 'relative', 'top': 0});
            $('#myContacts').css({'position': 'relative', 'top': 0});
            $('#myGroup').css({'position': 'relative', 'top': 0});
            return;
        }
        if (tp3 < ST) { // 国美互联网公司
            // console.log('国美互联网公司');
            $('#deptTree').find('ul').children(':first').css({'position': 'relative', 'top': ST - tp3, 'z-index': 2, 'background-color': '#fff'});
            $('#myContacts').css({'position': 'relative', 'top': 0});
            $('#myGroup').css({'position': 'relative', 'top': 0});
        } else if (tp2 < ST && tp3 > ST) { // 常用联系人
           // console.log('常用联系人');
            $('#deptTree').find('ul').children(':first').css({'position': 'relative', 'top': 0});
            $('#myContacts').css({'position': 'relative', 'top': ST - tp2, 'z-index': 2, 'background-color': '#fff'});
            $('#myGroup').css({'position': 'relative', 'top': 0});
        } else if (tp1 < ST && tp2 > ST) { // 我的群组
           // console.log('我的群组');
            $('#deptTree').find('ul').children(':first').css({'position': 'relative', 'top': 0});
            $('#myContacts').css({'position': 'relative', 'top': 0});
            $('#myGroup').css({'position': 'relative', 'top': ST - tp1, 'z-index': 2, 'background-color': '#fff'});
        }
    });


    /**
     * 右键消息菜单
     */
   /* $('#msgArea').on('mouseenter', '.list-text ', function (e) {
        console.log(e.currentTarget);
        let hasFail = $(this).find('em').hasClass('iconn-34');
        let a = '-35px';
        let b = '-70px';
        if($(this).parent().hasClass('list-left')){
            a = '35px';
            b = '70px';
        }

        let obj = {'display':'block','left':a};
        if(hasFail){
            obj = {'display':'block','left':b};
        }

        //文件
        let hasIconWrapper = $(this).find('div.icon-wrapper').get(0);
        let hasIconWrapperHidelist = $(this).find('div.icon-wrapper').hasClass('hideList');
        if(hasIconWrapper){
            if(!hasIconWrapperHidelist){
                obj = {'display':'block','left':b};
            }else{
                obj = {'display':'block','left':a};
            }
        }
        //debugger
        $(this).find('.hove').css(obj);
        //组装右键菜单
        getRightMenu(this);
    }); */

/*    $('#msgArea').on('mouseleave', '.list-text ', function (e) {
        console.log('out')
        $(this).find('.hove').css({'display':'none'});
    });

    $(document).on('click','.hove',function (e) {
        e.stopPropagation();
        console.log(e.currentTarget);
        console.log(e);
        $('.rightmenu').removeClass('hideList');
        $('.rightmenu').css({
            left: e.clientX,
            top: e.clientY
        });
    })
    $(document).on('click',function (e) {
        $('.rightmenu').addClass('hideList');
    })

    function getRightMenu(tar){
        console.log($(tar).parent().data());
    } */
  /*  let copyData = [[{
        text:"复制2",
        func: (e) => {
            //console.log(e);
        }
    }]];
    $('#msgArea .list-text').smartMenu(copyData, {
        name: "复制2"
    });
    $('#msgArea').on('mousedown','.list-text', function (e) {
        if (3 == e.which) {
            console.log(this)
        }
    }) */


    // 群成员详情显示
    $('#group-detail-members').on('click', 'li', function(e) {
        e.stopPropagation();
        var imId = $(this).attr('imId');
        var staffName = $(this).attr('data-staff-name');
        setNickNameColorToLocal($(this).find('.im-name')[0].style.background)
        mainObject.showMemberInfo(2, imId, staffName);
    });

    // 群成员详情显示
    $('#channel-detail-members').on('click', 'li', function(e) {
        e.stopPropagation();
        var imId = $(this).attr('imid');

        // var staffName = $(this).attr('data-staff-name');
        mainObject.showMemberInfo(2, imId, '');
    });

    $('#channel-detail-members').on('click', 'li p.condition-leter ', function(e) {
        e.stopPropagation();
    });


// 点击发起群聊

    function confirmGroupChat(selectPeopleList) {
        var selectPeopleListALLNum = $('.selectTotalNumber').html();
        if (selectPeopleList <= selectPeopleListALLNum && selectPeopleList > 0) {
            $('#group-chat-member .group-chat-button .btn-confirm').css('background', '#3E89F7');
            $('.selectList-count').find('strong').removeClass('redColor');

            $('#group-chat-member .group-chat-button .btn-confirm').on('click', function() {
                var selectPeopleAry = $('#selectList-name').children();
                var allSelectImId = [];
                var allSelectGid = $('#myContacts2').attr('selectedGid');
                for (var i = 0; i < selectPeopleAry.length; i++) {
                    allSelectImId.push($(selectPeopleAry[i]).attr('imid'));
                }
                allSelectImId.unshift((myInfo.imUserid).toString());
                allSelectImId = allSelectImId.join(',');
                var allSelectNum = Number($('.selectTotalNumber').html());
                var allSelectLength = allSelectImId.split(',');
                console.log(selectPeopleAry.length, allSelectLength.length);
        	if (createOrAdd == 'create' && selectPeopleAry.length > 0 && selectPeopleAry.length < allSelectLength.length) {
            var createData = {
                capacity: allSelectNum,
                memberIds: allSelectImId
            };
            mainObject.createGroupChat(createData);
        } else if (createOrAdd == 'add' && selectPeopleAry.length > 0 && selectPeopleAry.length < allSelectLength.length) {
            var addData = {
                groupId: allSelectGid,
                memberIds: allSelectImId
            };
        		mainObject.addGroupMembers(addData);
        }

                $('#selectList-name').children().remove();
            /* $('#groupTree-personList').children().remove()
            $('#contact-personList').children().remove()
            $('#search-personList').children().remove() */
                $('#all-personList').addClass('hideList');
                $('#groupTree-personList').addClass('hideList');
                $('#contact-personList').addClass('hideList');
                $('#search-personList').addClass('hideList');
                $('#group-chat-member').addClass('hideList');
                groupChatOpen = false;
            });
        } else if (selectPeopleList > selectPeopleListALLNum) {
            $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
            $('.selectList-count').find('strong').addClass('redColor');
            $('#group-chat-member .group-chat-button .btn-confirm').off();
        } else if (selectPeopleList == 0) {
            $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
            $('.selectList-count').find('strong').removeClass('redColor');
            $('#group-chat-member .group-chat-button .btn-confirm').off();
        }
    }

// 点击取消发起群聊
    $('#group-chat-member .group-chat-button .btn-cancel').on('click', function() {
        $('#selectList-name').children().remove();
        /* $('#groupTree-personList').children().remove()
        $('#contact-personList').children().remove()
        $('#search-personList').children().remove() */
        $('#all-personList').addClass('hideList');
        $('#groupTree-personList').addClass('hideList');
        $('#contact-personList').addClass('hideList');
        $('#search-personList').addClass('hideList');
        $('#group-chat-member').addClass('hideList');
        $('.allNoData').addClass('hideList');
        $('#group-chat-member .group-chat-search').find('input').val('');
        $('#group-chat-member .group-chat-search').find('.icon-searchPerson').css('left', '296px');
        groupChatOpen = false;
        var selectPeopleList = $('#selectList-name').children().length;
        $('.selectedNumber').html(selectPeopleList);
        $('#group-chat-member .group-chat-button .btn-confirm').css('background', 'rgba(62,136,247,0.20)');
        $('#group-chat-member .group-chat-button .btn-confirm').off();
        $('.addPersonBtn').find('img').attr('src', '../images/icon/添加群成员@2x.png');
        $('.addPersonBtn').find('p').css({'color': '#4590E4'});
        $('#group-chat-member').addClass('hideList');
        groupAddMemberOpen = false;
        $('.group-chat-addressList').animate({
            scrollTop: '0px'
        }, 1000);
    });

	// 删除群成员提示通知
    function deleteGroupMember(data) {
        var groupHoldId = data.fromUid;
        var groupHoldName = data.fromName;
        var groupId = data.groupId;
        var kickedUids = data.kickedUids;
        var kickedNames = data.kickedNames;
        let kickedNamesWithDunhao = kickedNames.replace(/,/g, '、');
        var htmlTemp = '';
        var textTemp = '';
        var timeTemp = formatMsgTime(data.optTime);
        var tempTime = '';
        if (lastMsgTimeMap.get(data.groupId) == undefined) {
            var now = new Date().getTime();
            tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
            lastMsgTimeMap.put(data.groupId, now);
        } else {
            var now = new Date().getTime();
            if (now - lastMsgTimeMap.get(data.groupId) >= 5 * 60 * 1000) {
                tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                lastMsgTimeMap.put(data.groupId, now);
            } else {
                tempTime = '';
            }
        }
        $('#group-' + groupId).data().groupName = data.groupName;
        if($('#session-' + groupId).length > 0){
            $('#session-' + groupId).data().GroupName = data.groupName;
        }
        if (groupHoldId == myInfo.imUserid) {
            textTemp = '你将' + kickedNamesWithDunhao + '移出了群聊';
        } else if (kickedUids == myInfo.imUserid) {
            textTemp = '你已被移出了群聊';
        } else if (groupHoldId !== myInfo.imUserid && kickedUids !== myInfo.imUserid) {
            if (kickedUids === '') {
                textTemp = groupHoldName + '退出了群聊';
            } else {
                textTemp = groupHoldName + '将' + kickedNamesWithDunhao + '移出了群聊';
            }
        }
        if (topNum == 0) {
            $('#session').children().first().before($('#session-' + groupId));
        } else {
            $('#session').children().eq(topNum - 1).after($('#session-' + groupId));
        }
        htmlTemp = tempTime + '' +
			'<div class="list-revoke clearfix">' +
			'<span class="text-wrapper">' + textTemp + '</span>' +
			'</div>';
        $('#msgArea-' + groupId + ' #msg').append(htmlTemp);
        $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
        $('#session-' + groupId).find('p').find('em').addClass('hideList');
        $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
        var group = {
            'groupId': data.groupId,
            'groupName': data.groupName,
            'groupType': 2
        };
        newConversation(group, false);
        var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
        var st = $('#msgArea-' + groupId).scrollTop();
        if (msgHeight - st < 800) {
            $('#msgArea-' + groupId).scrollTop(msgHeight);
        }
    };

    // 修改群名称提示
    function editgroup(data) {
        var groupHoldId = data.fromUid;
        var groupHoldName = data.fromName;
        var groupContent = data.content;
        var groupId = data.groupId;
        var htmlTemp = '';
        var textTemp = '';
        var timeTemp = formatMsgTime(data.optTime);
        var tempTime = '';
        if (lastMsgTimeMap.get(data.groupId) == undefined) {
            var now = new Date().getTime();
            tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
            lastMsgTimeMap.put(data.groupId, now);
        } else {
            var now = new Date().getTime();
            if (now - lastMsgTimeMap.get(data.groupId) >= 5 * 60 * 1000) {
                tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                lastMsgTimeMap.put(data.groupId, now);
            } else {
                tempTime = '';
            }
        }
        $('#session-' + groupId).data().GroupName = JSON.parse(data.extra).groupName;
        $('#group-' + groupId).data({isInitName: false});
        if (groupHoldId == myInfo.imUserid) {
            textTemp = '你修改群名为' + groupContent;
        } else {
            textTemp = groupHoldName + '修改群名为' + groupContent;
        }
        if (topNum == 0) {
            $('#session').children().first().before($('#session-' + groupId));
        } else {
            $('#session').children().eq(topNum - 1).after($('#session-' + groupId));
        }
        var group = {
            'groupId': groupId,
            'groupName': groupContent,
            'groupType': 2
        };
        newConversation(group, false);
        htmlTemp = tempTime + '' +
            '<div class="list-revoke clearfix">' +
            '<span class="text-wrapper">' + replaceAll(textTemp, '&', '&amp;') + '</span>' +
            '</div>';
        $('#msgArea-' + groupId + ' #msg').append(htmlTemp);
        $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
        $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
        var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
        var st = $('#msgArea-' + groupId).scrollTop();
        if (msgHeight - st < 800) {
            $('#msgArea-' + groupId).scrollTop(msgHeight);
        }
        if (groupDetailObj != undefined && groupId === groupDetailObj.groupId) {
            $('#group-detail-info').find('#group-name').html($('.group-name-input').value);
            $('#group-detail-title p').html(this.value);
        }
    };
});

/**
 * 初始化我的登录信息
 * @param data
 */
function initMyInfo(data) {
    $('#myInfo').attr('style', 'background:' + getNickNameColor(data.myid) + ';');
    $('#myInfo').html(getNickName(data.myname));
}

function startSearch() {
    var $searchInp = $('#search').find('.search-input');
    $('.search-val').addClass('search-val-highLight');
    $searchInp.addClass('input-highLight');
    $('#deleteIcon').addClass('input-highLight');
    if ($searchInp.val().trim() == '联系人、频道、群聊') {
        $searchInp.val('');
        $('.search-members-collapse').addClass('hideList');
        $('.search-members-expand').removeClass('hideList');
        $('.search-groups-collapse').addClass('hideList');
        $('.search-groups-expand').removeClass('hideList');
        $('.search-members').attr('data-expand', 0);
        $('.search-groups').attr('data-expand', 0);
    } else {
        $('#search').find('.iconn-11').removeClass('hideList');
        $('.search-list .right-list').removeClass('hideList');
    }
    $('#search').find('.iconn-21').addClass('hideList');
    $searchInp.css({'padding': '6px 0px 6px 12px', 'font-size': '14px', 'color': '#323232', 'width': '134px'});

}



function showSearchRightMenu(hasContent, isSelected, ele){
    currentInput =AllINPUT.SEARCH
    openGlobalContextMenu('search', null, null, null, null, hasContent, isSelected, ele)
};

function endSearch(flag) {
    var $searchInp = $('#search').find('.search-input');
    if ($searchInp.val().trim() == '') {
        $('#search').find('.iconn-11').addClass('hideList');
        $searchInp.val('联系人、频道、群聊');
    }
    $searchInp.css({'padding': '6px 0px 6px 30px', 'font-size': '12px', 'color': '#B5B5B5', 'width': '116px'});
    $('#search').find('.iconn-21').removeClass('hideList');
    $('.search-list .right-list').addClass('hideList');
    if (flag) {
        $searchInp.val('联系人、频道、群聊');
        $('.search-list .right-con').addClass('hideList');
        $('#search').find('.iconn-11').addClass('hideList');
    }
    $('.search-members .search-header').css({top: 0});
    $('.search-groups .search-header').css({top: 0});

    $('.search-groups-collapse').addClass('hideList');
    $('.search-groups-expand').addClass('hideList');
    $('.search-members-collapse').addClass('hideList');
    $('.search-members-expand').addClass('hideList');
}

function getFaceEng(face) {
    for (var i in facesMap) {
        if (facesMap[i] === face) return i;
    }
}

function showToast(config) {
    clearTimeout($('.global-toast').timer);
    var config = config || {};
    var message = config.ReturnMsg || '请求失败';
    var duration = config.duration || 2000;
    var success = config.success || false;
    if ($('.global-toast').length === 0) {
        var ele = document.createElement('div');
        ele.className = 'global-toast hide';
        ele.innerHTML = '<span><img class="toast-icon" src="../images/icon/warning@2x.png" alt=""></span><span class="toast-body"></span>';
        if (success) {
            ele.innerHTML = '<span><img class="toast-icon" src="../images/icon/成功复制@2x.png" alt=""></span><span class="toast-body"></span>';
        }
        document.querySelector('#app').appendChild(ele);
    }
    $('.global-toast').removeClass('hide');
    $('.global-toast').find('.toast-body').text(message);
    $('.global-toast').css({
        'margin-left': document.querySelector('.global-toast').clientWidth / -2,
        'margin-top': document.querySelector('.global-toast').clientHeight / -2
    });
    $('.global-toast').timer = setTimeout(function() {
        $('.global-toast').addClass('hide');
    }, duration);
}
