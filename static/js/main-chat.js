/*
 *  Created by Li Xiangkai
 *  Date:2017-01-13
 *  Instructions:
 *  	PC主窗口聊天功能结构，包括会话列表，收发消息等
 */

/**
 * 初始化会话列表
 */
function initSession(sessionList) {
    console.log('本地会话列表', sessionList,CHATOBJ);
    $('.chat-session-loading').addClass('hideList');

    $('#session').html('');
    topNum = 0;

    if (sessionList.length != 0) {
        $('#session-no-record').addClass('hideList');
        var totalNum = 0;
        for (var i = 0; i < sessionList.length; i++) {
            var avatarColor;
            var avatarContent;
            var name;
            var msgContent = '';
            var statusIcon = '<em id="send-status" class="iconn-34 hideList"></em>';
            if (sessionList[i].Status == 0) {
                statusIcon = '<em id="send-status" class="iconn-34"></em>';
            }
            if (sessionList[i].MsgType == 1 || sessionList[i].MsgType == 100001 || sessionList[i].MsgType == 100002 || sessionList[i].MsgType == 100003 || sessionList[i].MsgType == -100) {
                $('#decode').text(sessionList[i].MsgContent);
                msgContent = $('#decode').html();
            } else if (sessionList[i].MsgType == 2) {
                msgContent = '[语音]';
            } else if (sessionList[i].MsgType == 3) {
                msgContent = '[图片]';
            } else if (sessionList[i].MsgType == 5) {
                msgContent = '[位置]';
            } else if (sessionList[i].MsgType == 6) {
                msgContent = '[文件]';
            }
            var muteIcon = '<span class="iconn-mute hideList"></span>';
            var numberTemp = '<span class="num hideList"></span>';
            if (sessionList[i].SessionisMute == 1) {
                if (sessionList[i].UnreadmsgCount > 0) {
                    numberTemp = '<span class="num numsmall"></span>';
                }
                muteIcon = '<span class="iconn-mute"></span>';
            } else {
                if (sessionList[i].UnreadmsgCount > 0 && sessionList[i].UnreadmsgCount <= 999) {
                    numberTemp = '<span class="num">' + sessionList[i].UnreadmsgCount + '</span>';
                    totalNum += parseInt(sessionList[i].UnreadmsgCount);
                }
                if (sessionList[i].UnreadmsgCount > 999) {
                    numberTemp = '<span class="num">999+</span>';
                    totalNum += parseInt(sessionList[i].UnreadmsgCount);
                }
            }
            if (sessionList[i].GroupType == 1) {
                if (sessionList[i].MsgType == -100) {
                    if (!(msgContent == '你撤回了一条消息')) {
                        msgContent = '对方撤回了一条消息';
                    }
                }

                if (sessionList[i].SessionTopmark == 1) {
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" topTime="' + sessionList[i].SessionTopTime + '" isTop="' + sessionList[i].SessionTopmark + '"' +
                        ' msgTime="' + sessionList[i].MsgTimellong + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        '<span class="top"></span>' + numberTemp + '<div class="list-name" style="background:' + getNickNameColor(sessionList[i].oaId) + ';">' +
                        getNickName(sessionList[i].MsgSendName) +
                        '</div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].MsgSendName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].MsgSendName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + msgContent + '</span></p>' +
                        muteIcon + '</div></li>';
                    if (topNum == 0) {
                        $('#session').prepend(temp);
                    } else {
                        $('#session').children().eq(topNum - 1).after(temp);
                    }
                    topNum += 1;
                } else {
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" msgTime="' + sessionList[i].MsgTimellong + '" topTime="0"' +
                        ' isTop="' + sessionList[i].SessionTopmark + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        numberTemp + '<div class="list-name" style="background:' + getNickNameColor(sessionList[i].oaId) + ';">' +
                        getNickName(sessionList[i].MsgSendName) +
                        '</div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].MsgSendName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].MsgSendName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + msgContent + '</span></p>' + muteIcon + '</div></li>';
                    $('#session').append(temp);
                }
                // $('#session-' + sessionList[i].GroupId).find('.session-name').css({maxWidth: $('.list-text').width() - $('#session-' + sessionList[i].GroupId).find('.time').width() - 20});
                $('#session-' + sessionList[i].GroupId).data(sessionList[i]);
            } else if (sessionList[i].GroupType == 2) {
                if (sessionList[i].SessionTopmark == 1) {
                    var colon = sessionList[i].MsgType == -100 ? '' : ': ';
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" topTime="' + sessionList[i].SessionTopTime + '"' +
                        ' msgTime="' + sessionList[i].MsgTimellong + '" isTop="' + sessionList[i].SessionTopmark + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        '<span class="top"></span>' + numberTemp +
                        '<div class="list-name" style="background:' + getNickNameColor(Math.abs(hashCode(sessionList[i].GroupId))) + ';">' +
                        '<em class="iconn-46"></em></div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].GroupName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].GroupName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + sessionList[i].MsgSendName + colon + msgContent + '</span></p>' + muteIcon + '</div></li>';
                    if (topNum == 0) {
                        $('#session').prepend(temp);
                    } else {
                        $('#session').children().eq(topNum - 1).after(temp);
                    }
                    topNum += 1;
                } else {
                    var colon = sessionList[i].MsgType == -100 ? '' : ': ';
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" msgTime="' + sessionList[i].MsgTimellong + '" topTime="0"' +
                        ' isTop="' + sessionList[i].SessionTopmark + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        numberTemp +
                        '<div class="list-name" style="background:' + getNickNameColor(Math.abs(hashCode(sessionList[i].GroupId))) + ';">' +
                        '<em class="iconn-46"></em></div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].GroupName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].GroupName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + sessionList[i].MsgSendName + colon + msgContent + '</span></p>' + muteIcon + '</div></li>';
                    $('#session').append(temp);
                }
                // $('#session-' + sessionList[i].GroupId).find('.session-name').css({maxWidth: $('.list-text').width() - $('#session-' + sessionList[i].GroupId).find('.time').width() - 20});
                $('#session-' + sessionList[i].GroupId).data(sessionList[i]);
            } else {
                if (sessionList[i].SessionTopmark == 1) {
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" topTime="' + sessionList[i].SessionTopTime + '" isTop="' + sessionList[i].SessionTopmark + '"' +
                        ' msgTime="' + sessionList[i].MsgTimellong + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        '<span class="top"></span>' + numberTemp + '<div class="list-name list-name-application">' +
                        '</div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].MsgSendName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].MsgSendName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-text">' + msgContent + '</span></p>' +
                        muteIcon + '</div></li>';
                    if (topNum == 0) {
                        $('#session').prepend(temp);
                    } else {
                        $('#session').children().eq(topNum - 1).after(temp);
                    }
                    topNum += 1;
                } else {
                    var temp = '<li id="session-' + sessionList[i].GroupId + '" class="session-' + sessionList[i].GroupId + '" ' +
                        ' number="' + sessionList[i].UnreadmsgCount + '" msgTime="' + sessionList[i].MsgTimellong + '" topTime="0"' +
                        ' isTop="' + sessionList[i].SessionTopmark + '" isMute="' + sessionList[i].SessionisMute + '" msgId="' + sessionList[i].msgId + '">' +
                        numberTemp + '<div class="list-name list-name-application" >' +
                        '</div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(sessionList[i].MsgSendName) + '</span><span class="time">' + sessionList[i].MsgTime + '</span></h2>' +
                        // + '<h2>'+sessionList[i].MsgSendName+'<span class="time">'+sessionList[i].MsgTime+'</span></h2>'
                        '<p>' + statusIcon + '<span class="session-text">' + msgContent + '</span></p>' + muteIcon + '</div></li>';
                    $('#session').append(temp);
                }
                // $('#session-' + sessionList[i].GroupId).find('.session-name').css({maxWidth: $('.list-text').width() - $('#session-' + sessionList[i].GroupId).find('.time').width() - 20});
                $('#session-' + sessionList[i].GroupId).data(sessionList[i]);
            }

            if (sessionList[i].GroupType == 1) {
                var unReadBoxData = {
                    'type': sessionList[i].GroupType,
                    'id': sessionList[i].oaId,
                    'name': sessionList[i].MsgSendName,
                    'sessionid': sessionList[i].GroupId,
                    'unreadmsgcount': sessionList[i].SessionisMute === '1'? '0' :sessionList[i].UnreadmsgCount,
                    'sendTime': sessionList[i].MsgTimellong
                }
            } else if (sessionList[i].GroupType == 2) {
                var unReadBoxData = {
                    'type': sessionList[i].GroupType,
                    'id': sessionList[i].GroupId,
                    'name': sessionList[i].GroupName,
                    'sessionid': sessionList[i].GroupId,
                    'unreadmsgcount': sessionList[i].SessionisMute === '1'? '0' :sessionList[i].UnreadmsgCount,
                    'sendTime': sessionList[i].MsgTimellong
                }
            } else {
                var unReadBoxData = {
                    'type': 4,
                    'id': 'applicationMessage',
                    'name': '',
                    'sessionid': 'applicationMessage',
                    'unreadmsgcount': sessionList[i].SessionisMute === '1'? '0' :sessionList[i].UnreadmsgCount,
                    'sendTime': sessionList[i].MsgTimellong
                }
            }
            mainObject.messageBoxUnreadMsgSet(unReadBoxData);
        }
        // 更新左侧菜单未读消息数
        $('#im-chat').attr('number', totalNum);
        if (totalNum > 0 && totalNum <= 999) {
            $('#im-chat').find('span').html(totalNum).removeClass('hideList');
        }
        if (totalNum > 999) {
            $('#im-chat').find('span').html('999+').removeClass('hideList');
        }
        mainObject.setMacBadge(totalNum.toString(), false);
    } else {
        $('#session-no-record').removeClass('hideList');
    }

    var isNoSession = sessionList.every(function(sessionList) {
        return sessionList.GroupId != CHATOBJ.groupId
    })

    if(isNoSession){
        $('#msg-no-record').removeClass('hideList');
        $('#chatArea').addClass('hideList');
        CHATOBJ = {};
    }

    if ($('#msgArea .con-list').length > 0) {
        setTimeout(function() {
            var id = $('#msgArea .con-list:not(.hideList)')[0].id.replace('msgArea', 'session');
            $('#msgArea').html('');
            openSession($('.name-list #' + id)[0]);
        }, 0);
    }
}

/**
 * 设置置顶状态通知
 * @param data
 */
function setSesseionTop(data) {
    console.log('设置置顶状态', data);
    if (data.ResponseErrcode !== 0) {
        $('#session-' + data.groupId).prepend('<span class="top"></span>');
        var data_ = $('#session-' + data.groupId).data();
        if (data_.SessionTopmark === 1) {
            return;
        }
        console.log('set session top');
        data_.SessionTopmark = 1;
        $('#session-' + data.groupId).data(data_);
        $('#session').children().first().before($('#session-' + data.groupId));
        topNum += 1;
        $('#session-' + data.groupId).attr('topTime', data.ResponseErrcode);
        $('#session-' + data.groupId).attr('isTop', 1);
    } else {
        $('#session-' + data.groupId).attr('isTop', 0);
        $('#session-' + data.groupId).children().remove('.top');
        var data_ = $('#session-' + data.groupId).data();
        if (data_.SessionTopmark === 0) {
            return;
        }
        console.log('set session top');
        data_.SessionTopmark = 0;
        $('#session-' + data.groupId).data(data_);
        var children = $('#session').children();
        children.splice(0, topNum);
        var thisMsgTime = $('#session-' + data.groupId).attr('msgTime');
        if (thisMsgTime == undefined) {
            children.first().before($('#session-' + data.groupId));
        } else {
            for (var i = 0; i < children.length; i++) {
                var msgTime = $(children[i]).attr('msgTime');
                if (thisMsgTime >= msgTime) {
                    $(children[i]).before($('#session-' + data.groupId));
                    break;
                }
                $(children[i]).after($('#session-' + data.groupId));
            }
        }
        topNum -= 1;
    }
}

/**
 * 设置免打扰状态通知
 * @param data
 */

function setSessionMuteNotify(data) {
    console.log(data,$('#session-' + data.groupId).data())
    if ($('#session-' + data.groupId).length === 0) {
        return;
    }
    var sessionData = $('#session-' + data.groupId).data();
    var isMsgBlocked = JSON.parse(data.extra).isMsgBlocked;
    var groupId = data.groupId;
    var num_ = parseInt($('#session-' + groupId).attr('number'));
    $('#session-' + groupId).attr('isMute', isMsgBlocked);
    var data_ = $('#session-' + groupId).data();
    if (data_.SessionisMute === isMsgBlocked.toString()) {
        return;
    }
    data_.SessionisMute = isMsgBlocked.toString();
    $('#session-' + groupId).data(data_);

    if (isMsgBlocked === 0) { // 取消免打扰
        $('#session-' + groupId).find('.iconn-mute').addClass('hideList');
        if (num_ > 0 && num_ <= 999) {
            $('#session-' + groupId).find('.num').html(num_).removeClass('hideList').removeClass('numsmall');
        } else if (num_ > 999) {
            $('#session-' + groupId).find('.num').html('999+').removeClass('hideList').removeClass('numsmall');
        } else {
            $('#im-chat').find('.num').html('0').addClass('hideList');
        }
        var total = parseInt($('#im-chat').attr('number')) + num_;
        $('#im-chat').attr('number', total);
        if (total > 0 && total <= 999) {
            $('#im-chat').find('.num').html(total).removeClass('hideList');
        } else if (total > 999) {
            $('#im-chat').find('.num').html('999+').removeClass('hideList');
        } else {
            $('#im-chat').find('.num').html('0').addClass('hideList');
        }
        if (sessionData.GroupType == 1) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.oaId,
                'name': sessionData.MsgSendName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': $('#session-' + groupId).attr('number') || 0,
                'sendTime': sessionData.MsgTimellong
            }
        } else if (sessionData.GroupType == 2) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.GroupId,
                'name': sessionData.GroupName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': $('#session-' + groupId).attr('number') || 0,
                'sendTime': sessionData.MsgTimellong
            }
        } else {
            var unReadBoxData = {
                'type': 4,
                'id': 'applicationMessage',
                'name': '',
                'sessionid': 'applicationMessage',
                'unreadmsgcount': $('#session-' + groupId).attr('number') || 0,
                'sendTime': sessionData.MsgTimellong
            }
        }
        console.log('未读数上报',unReadBoxData)
        mainObject.messageBoxUnreadMsgSet(unReadBoxData);
        mainObject.setMacBadge(total.toString(), false);
    } else { // 设置免打扰
        $('#session-' + groupId).find('.num').html('').addClass('numsmall');
        num_ > 0 ? $('#session-' + groupId).find('.num').removeClass('hideList') : false;
        $('#session-' + groupId).find('.iconn-mute').removeClass('hideList');
        var total = parseInt($('#im-chat').attr('number')) - num_;
        $('#im-chat').attr('number', total);
        if (total > 0 && total <= 999) {
            $('#im-chat').find('.num').html(total).removeClass('hideList');
        } else if (total > 999) {
            $('#im-chat').find('.num').html('999+').removeClass('hideList');
        } else {
            $('#im-chat').find('.num').html('0').addClass('hideList');
        }
        if (sessionData.GroupType == 1) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.oaId,
                'name': sessionData.MsgSendName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': 0,
                'sendTime': sessionData.MsgTimellong
            }
        } else if (sessionData.GroupType == 2) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.GroupId,
                'name': sessionData.GroupName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': 0,
                'sendTime': sessionData.MsgTimellong
            }
        } else {
            var unReadBoxData = {
                'type': 4,
                'id': 'applicationMessage',
                'name': '',
                'sessionid': 'applicationMessage',
                'unreadmsgcount': 0,
                'sendTime': sessionData.MsgTimellong
            }
            mainObject.readedSeqIDReport('applicationMessage', -1);
        }
        console.log('未读数上报',unReadBoxData)
        mainObject.messageBoxUnreadMsgSet(unReadBoxData);
        mainObject.setMacBadge(total.toString(), false);
    }
}

/**
 * 删除会话
 */
function deleteSession(data) {
    console.log('删除会话', data);
    var sessionData = $('#session-' + data.GroupId).data();
    if ($('#session-' + data.GroupId).attr('isMute') === '0') {
        var _num_ = parseInt($('#session-' + data.GroupId).attr('number'));
        var total = parseInt($('#im-chat').attr('number')) - _num_;
        console.log(total, _num_);
        $('#im-chat').attr('number', total);
        if (total == 0) {
            $('#im-chat').find('span').html('0').addClass('hideList');
        }
        if (total > 0 && total <= 999) {
            $('#im-chat').find('span').html(total);
        }
        if (total > 999) {
            $('#im-chat').find('span').html('999+');
        }
        if (sessionData.GroupType == 1) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.oaId,
                'name': sessionData.MsgSendName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': 0,
                'sendTime': sessionData.MsgTimellong || 0
            }
        } else if (sessionData.GroupType == 2) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.GroupId,
                'name': sessionData.GroupName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': 0,
                'sendTime': sessionData.MsgTimellong || 0
            }
        }
        console.log('未读数上报',unReadBoxData)
        mainObject.messageBoxUnreadMsgSet(unReadBoxData);
        mainObject.setMacBadge(total.toString(), false);
    }
    if (data.ResponseErrcode == 0) {
        var top = $('#session-' + data.GroupId).data().SessionTopmark;
        if (top == 1) {
            topNum -= 1;
        }
        $('#session').children().remove('#session-' + data.GroupId);
        $('#msgArea').children().remove('#msgArea-' + data.GroupId);
        if ($('#session').children().length == 0) {
            $('#session-no-record').removeClass('hideList');
        }
        if (CHATOBJ.groupId === data.GroupId) {
            $('#msg-no-record').removeClass('hideList');
            $('#chatArea').addClass('hideList');
        }
    }
    if (data.GroupId === CHATOBJ.groupId) {
        CHATOBJ = {};
    }
}
function getOpenssionOrLoadmoreTemp(msg, hisLastMsgTime, insertPositionobj) {
    // 消息状态是否为发送成功
    var resendIcon = '';
    if (msg.status == 0) {
        resendIcon = '<em class="iconn-34" msgId="' + msg.msgId + '" onclick="resendMsg(this)"></em>';
    }

    var tempTime = '';

    // 是否为第一条时间
    if (msg.sendtime == hisLastMsgTime) {
        // 第一条时间
        tempTime = '<div class="list-time">' + formatMsgTime(hisLastMsgTime) + '</div>';
        insertPositionobj && insertPositionobj.insertPosition++;
    } else {
        // 不是第一条时间，大于5分钟显示一条
        if (msg.sendtime - hisLastMsgTime >= 5 * 60 * 1000) {
            tempTime = '<div class="list-time">' + formatMsgTime(msg.sendtime) + '</div>';
            hisLastMsgTime = msg.sendtime;
            insertPositionobj && insertPositionobj.insertPosition++;
        } else {
            var tempTime = '';
        }
    }

    var avatarName;
    var avatarColor;
    var senderClass;
    if (msg.senderId == myInfo.imUserid) {
        avatarName = '我';
        senderClass = 'list-right';
        avatarColor = getNickNameColor(myInfo.myid);
    } else {
        avatarName = getNickName(msg.staffName);
        senderClass = 'list-left';
        avatarColor = getNickNameColor(msg.id);
    }
    if (msg.msgType == 6) {
        senderClass += ' file-box ';
    }

    let msgContent = msgManger.getTemplate(JSON.parse(JSON.stringify(msg)), {
        type: msgManger.type.OPENSSION
    });
    let typeClass = msgManger.getTypeClass();
    let listText = msgManger.getListText();
    if (msg.status == 0) {
        var tempMsg = {};
        if (msg.msgtype == 1 || msg.msgtype == 100001 || msg.msgtype == 100002 || msg.msgtype === 100003) {
            tempMsg = {
                'msgid': msg.msgId, // 类型string
                'msgbody': msg.msgbody, // 类型string
                'msgtype': msg.msgtype, // 类型 int 1:文本 type2:表情 type3:图片
                'groupid': msg.groupid, // 类型stringa
                'grouptype': msg.grouptype, // 类型int
                'senderid': myInfo.imUserid, // 类型int
                'extra_aite_im_ids': msg.altUids
            };
        } else if (msg.msgtype == 3) {
            tempMsg = {
                'msgid': msg.msgId, // 类型string
                'msgbody': msg.msgbody, // 类型string
                'msgtype': msg.msgtype, // 类型 int 1:文本 type2:表情 type3:图片
                'groupid': msg.groupid, // 类型stringa
                'grouptype': msg.grouptype, // 类型int
                'senderid': myInfo.imUserid, // 类型int
                'picpath': msg.sourPath
            };
        }

        resendMsgMap.put(msg.msgId, tempMsg);
    }


    if (msg.msgtype == 6) {
        // 此处状态待修改 openssion

        let senderId = msg.senderId;
        let typename = '';
        let state = '';
        let type = Math.floor((msg.from / 1000000)) + '';
        let fileStatus = msg.FileStatus;
        let msgId = msg.msgId;
        let sendtime = msg.sendtime;
        let validitystate = validityDate(sendtime, msg.FileStatus);
        let orHide = validitystate == 3 ? '' : 'hide';
        if (senderId == myInfo.imUserid) { // 我发的
            if (type == PcSourceType && (typeof (msg.status) === 'undefined' || msg.status !== 1)) { // pc端
                uploadFu();
            } else {
                downloadFu();
            }
        } else {
            downloadFu();
        }

        function uploadFu() {
            if (fileStatus == 0) { // 未下载
                state = 'notdown';
                typename = 'iconn-icon-download';
            } else if (fileStatus == 1) { // 上传中
                state = 'uploading';
                typename = 'iconn-icon-stop';
            } else if (fileStatus == 2 && msg.status !== 0) { // 已经上传
                state = 'finish';
                typename = '';
            } else if (fileStatus == 3) { // 已经过期
                state = 'expire';
                typename = '';
            } else if (fileStatus == 4) { // 暂停
                state = 'pause';
                typename = 'iconn-icon-upload';
            } else if (fileStatus == 100 || msg.status === 0) { // 失败
                state = 'error';
                typename = 'iconn-34';
            }
        }

        function downloadFu() {
            if (fileStatus == 0) { // 未下载
                state = 'notdown';
                typename = 'iconn-icon-download';
            } else if (fileStatus == 1) { // 下载中
                state = 'downloading';
                typename = 'iconn-icon-stop';
            } else if (fileStatus == 2 && msg.status !== 0) { // 已经下载
                state = 'finish';
                typename = '';
            } else if (fileStatus == 3) { // 已经过期
                state = 'expire';
                typename = '';
            } else if (fileStatus == 4) { // 暂停
                state = 'pause';
                typename = 'iconn-icon-download';
            } else if (fileStatus == 100 || msg.status === 0) { // 下载失败
                state = 'error';
                typename = 'iconn-34';
            }
        }

        var hid = '';
        if (state == 'finish') {
            hid = ' hideList';
        }

        resendIcon = '' +
            '<div class="icon-wrapper ' + hid + '" data-expire="false" data-icon-wrapper-id=' + msgId + '  data-state=' + state + ' data-type=' + type + ' data-senderid= ' + msg.senderId + ' data-sendtime=' + sendtime + '  data-file-path="' + msg.fpath + '"  data-file-name="' + msg.fname + '">' +
            '<em class=' + typename + '></em>' +
            '</div>';
        if (orHide == '') { // 代表文件过期了
            resendIcon = '' +
                '<div class="icon-wrapper hideList"  data-expire="true" data-icon-wrapper-id=' + msgId + '  data-state=' + state + ' data-type=' + type + ' data-senderid= ' + msg.senderId + ' data-sendtime=' + sendtime + '  data-file-path="' + msg.fpath + '"  data-file-name="' + msg.fname + '">' +
                '<em class=' + typename + '></em>' +
                '</div>';
        }
    }

    var temp = '';

    if (msg.msgtype == 6) {
        temp = tempTime +
            '<div id="msg-' + msg.msgId + '" class="' + senderClass + ' clearfix" onclick>' +
            '<div imId="' + msg.imUserId + '" class="list-name" data-staff-name ="'+msg.staffName+'"  data-staff-id ="'+msg.id+'"  data-deptname ="'+msg.deptName+'" data-dutyname ="'+msg.dutyName+'" style="background:' + avatarColor + ';">' + avatarName + '</div>' +
            '<pre class="' + listText + typeClass + '" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"   data-msgtype="' + msg.msgtype + '"   data-senderid="' + msg.senderId + '"  data-status="' + msg.status + '"  data-sendtime="' + msg.sendtime + '">' + msgContent + resendIcon + '</pre>' +
            '</div>';
    } else if (msg.msgtype == -100) {
        temp = tempTime + replaceAll(msgContent, '&', '&amp;');
    } else {
        temp = tempTime + '<div id="msg-' + msg.msgId + '" class="' + senderClass + ' clearfix">' +
            '<div imId="' + msg.imUserId + '" class="list-name" data-staff-name ="'+msg.staffName+'"  data-staff-id ="'+msg.id+'"  data-deptname ="'+msg.deptName+'" data-dutyname ="'+msg.dutyName+'" style="background:' + avatarColor + ';">' + avatarName + '</div>' +
            '<pre class="' + listText + typeClass + '" onclick="playSound(this)"  data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"  data-msgtype="' + msg.msgtype + '"   data-senderid="' + msg.senderId + '"  data-status="' + msg.status + '"  data-sendtime="' + msg.sendtime + '">' + msgContent + resendIcon + '</pre></div>';
    }


    return temp;
}

function hasUnreadSenssion() {
    var unreadSenssion = $('#session').find('li').filter(function() {
        return $(this).attr('number') > 0;
    })[0];
    return unreadSenssion;
}
/**
 * 点击托盘后打开最近一个未读消息
 */
function openUnreadSenssion() {
    var unreadSenssion = hasUnreadSenssion();
    if (unreadSenssion) {
        $('#im-chat').click();
        openSession(unreadSenssion);
        var sessionData = $(unreadSenssion).data();
        $('#file-btn').data(sessionData);
    }
    return !!unreadSenssion;
}
function addCountToGroupName() {
    setTimeout(function() {
        mainObject.getGroupMemberCount({'GroupId': CHATOBJ.groupId}, function(data) {
            // console.log('群成员数量:', data);
            let count = data.GroupMemCount;
            let str = $('#chat-title').html();
            let retStr = chatTitleLength(str, count);
            console.log('群成员数量:', retStr);
            if (str.search(/\(\d+人\)/) === -1 && CHATOBJ.groupType == '2') {
                $('#chat-title').html(retStr).attr('count', count);
            }
        });
    }, 0);
}

/**
 * 点击盒子打开某一未读消息
 */
function openMsgBoxSession(sessionsId){
    var msgBoxSession = $('#session').find('li#session-' + sessionsId)[0];
    // $('#im-chat').click();
    openSession(msgBoxSession);
    var sessionData = $(msgBoxSession).data();
    $('#file-btn').data(sessionData);
    setTimeout(function(){
        if ($('#session-' + sessionsId).hasClass('active')) {
            var sessionTop = $('#session-' + sessionsId)[0].offsetTop;
            var sessionScrollTop = $('#session-' + sessionsId).parent().parent().scrollTop();
            var sessionHeight = $('#session-' + sessionsId)[0].offsetHeight;
            var sessionBoxHeight = $('#session-' + sessionsId).parent().parent()[0].offsetHeight;
            if (sessionTop < sessionScrollTop) {
                $('#session-' + sessionsId).parent().parent().scrollTop(sessionTop);
            }
            if ((sessionTop + sessionHeight) > (sessionScrollTop + sessionBoxHeight)) {
                var newTop = sessionTop + sessionHeight - sessionBoxHeight;
                $('#session-' + sessionsId).parent().parent().scrollTop(newTop);
            }
        }
    },300)
}

/**
 * 点击某个会话开始聊天
 * @param session
 */
function openSession(session, flag) {
    if ( $('.for-drag').length >0 ) {
        $('.for-drag').remove();
    }

    commonAiteObj.hideSerchList();
    /* publicObject.setTip('提示'); */

    console.log($(session).data());
    console.log('opensession---');
    // 关闭正在播放的 语音
    mainObject.StopVoiceMsg('', '');


    var sessionData = $(session).data();

    //在线离线请求
    $('.pcOnlineState').addClass('hideList');
    if (sessionData != undefined && sessionData.GroupType == 1) {
        var imId = ""
        var myImId = myInfo.imUserid.toString();
        var imAry = sessionData.GroupId.split('_');
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
    }

    publicObject.getGroupInfo($(session).data().GroupId, function(groupInfo) {
        console.log(groupInfo);
        if (groupInfo.GroupId === 'applicationMessage') {
            $(session).data().GroupName = '工作通知';
        } else {
            $(session).data().GroupName = groupInfo.groupName;
        }
    });
    $('#chatArea').removeClass('hideList');
    $('#msg-no-record').addClass('hideList');
    $('.con-val').removeClass('hideList');
    $('#input-content').focus();

    $(session).find('.session-list-announcement-notice').addClass('hideList');
    $(session).find('.session-list-at-notice').addClass('hideList');
    $(session).find('.session-list-acknowledge-notice').addClass('hideList');

    if (CHATOBJ.groupId != undefined) {
        // 草稿
        var html = $('#input-content').html().trim();
        if (html != '') {
            console.log('草稿', html);
            var msgArr = formatMsg().msgArr;
            if (msgArr) {
                console.log('草稿数据', msgArr);
                var draftHtml = '';
                var draftTrueHtml = '';
                for (var i = 0; i < msgArr.length; i++) {
                    draftHtml += msgArr[i].draft;
                    draftTrueHtml += msgArr[i].html;
                }
                var oldHtml = $('#session-' + CHATOBJ.groupId).find('p').find('.session-text').text();
                draftMap.put(CHATOBJ.groupId, {'draft': draftHtml, 'html': draftTrueHtml, 'oldHtml': oldHtml});
                $('#session-' + CHATOBJ.groupId).find('p').find('.red').removeClass('hideList');
                $('#session-' + CHATOBJ.groupId).find('p').find('.session-text').html(codeStr(draftHtml));
                $('#input-content').html('');
            }
        } else {
            // $('#session-'+CHATOBJ.groupId).find('p').html('');
            draftMap.put(CHATOBJ.groupId, undefined);
        }

        // 记录位置
        if ($('#msgArea-' + CHATOBJ.groupId)[0]) {
            var newMsgObj = newMsgTipMap.get(CHATOBJ.groupId);
            var oldScrollHeight = $('#msgArea-' + CHATOBJ.groupId)[0].scrollHeight;
            if (newMsgObj == undefined) {
                newMsgTipMap.put(CHATOBJ.groupId, {
                    'oldPosition': oldScrollHeight
                });
            } else {
                newMsgObj.oldPosition = oldScrollHeight;
                newMsgTipMap.put(CHATOBJ.groupId, newMsgObj);
            }
        }

        $('#currentMsgTip').text('').addClass('hideList');
        $('#session-' + CHATOBJ.groupId).attr('currentMsgNum', 0);
    }
    // console.log('first click',rangeMap);
    var draft_ = draftMap.get(sessionData.GroupId);
    if (draft_ != undefined) {
        var oldHtml = draft_.oldHtml;
        if (oldHtml != undefined) {
            $('#session-' + sessionData.GroupId).find('p').find('.session-text').html(codeStr(oldHtml));
            $('#session-' + sessionData.GroupId).find('p').find('.red').addClass('hideList');
        }
        $('#input-content').focus();

        $('#input-content').html(draft_.html);
        var obj = $('#input-content')[0];

        /* var inputContent = $('#input-content');
         range.selectNodeContents(inputContent); */
        // console.log('get',rangeMap);
        var sel_ = rangeMap.get(sessionData.GroupId).sel;
        console.log('rel', sel_);
        var range_ = rangeMap.get(sessionData.GroupId).range;
        console.log('range', range_);
        range_.collapse(false);
        sel_.removeAllRanges();
        sel_.addRange(range_);
        window.getSelection().setPosition(obj, obj.childNodes.length);
        draftMap.remove(sessionData.GroupId);
    }

    var lastChatGroupId = CHATOBJ.groupId;

    if (CHATOBJ.groupType === 'applicationMessage' && sessionData.GroupType === 'applicationMessage') {
        return;
    }

    // 对全局聊天变量进行赋值存储
    CHATOBJ = {
        'groupId': sessionData.GroupId,
        'groupType': sessionData.GroupType,
        'groupName': sessionData.GroupName
    };
    if (CHATOBJ.groupType == 1) {
        CHATOBJ.groupName = sessionData.MsgSendName;
        CHATOBJ.staffId = sessionData.oaId;
        CHATOBJ.imId = typeof (sessionData.MsgsenderId) !== 'undefined' ? sessionData.MsgsenderId : sessionData.imId || sessionData.imid;
    } else {
        CHATOBJ.staffId = undefined;
        CHATOBJ.imId = undefined;
    }

    mainObject.setCurrentSessionId(sessionData.GroupId);

    // 页面样式
    var siblings = $(session).siblings();
    $(siblings).removeClass('active');
    $(session).addClass('active');
    console.log('会话列表数据', sessionData);
    if (sessionData.GroupType == 1) {
        var newMsgSendName;
        if (sessionData.MsgSendName.length > 4) {
            newMsgSendName = sessionData.MsgSendName.substring(0, 4) + '...';
        } else {
            newMsgSendName = sessionData.MsgSendName;
        }
        $('#chat-title').html(newMsgSendName);
        var chatTitleWidth = $('#chat-title').width();
        var rightTitleWidth = $('.global-win-control').width();
        var allTitleWidth = $('.con-title').width();
        $('#chat-title').attr('width', chatTitleWidth);
        $('.global-win-control').attr('width', rightTitleWidth);
        var deptAndDutyContentWidth = allTitleWidth - chatTitleWidth - rightTitleWidth - 120;
        $('.deptAndDutyContent').css('max-width', deptAndDutyContentWidth + 'px');
        $('#chat-deptAndDuty .deptAndDutyContent').html(sessionData.deptName + ' ' + sessionData.dutyName);
        $('#chat-deptAndDuty').removeClass('hideList');
        if (sessionData.deptName == '' && sessionData.dutyName == '') {
            $('#chat-deptAndDuty').addClass('hideList');
        }
    } else if (sessionData.GroupType == 2) {
        $('#chat-title').html(codeStr(sessionData.GroupName));
        $('#chat-deptAndDuty').addClass('hideList');
        addCountToGroupName();
    } else if (sessionData.GroupType = 'applicationMessage') {
        $('#chat-title').html('工作通知');
        $('#chat-deptAndDuty').addClass('hideList');
    }


    // if (sessionData.GroupType === 'applicationMessage') {
    //     $('.application-message-list').removeClass('hideList');
    //     $('.file-btn-box').addClass('hideList');
    // } else {
    //     $('.application-message-list').addClass('hideList');
    //     $('.file-btn-box').removeClass('hideList');

    var children = $('#msgArea').children();
    $(children).addClass('hideList');

    $('.application-message-list-history .num').html(0);
    $('.application-message-list-history').addClass('hideList');
    $('.application-message-list-new').addClass('hideList');
    $('.application-message-list-new .num').html(0);
    $('#newMsgTip').addClass('hideList');
    $('#currentMsgTip').addClass('hideList');

    if (sessionData.GroupType === 'applicationMessage') {
        $('.application-message-list-area').html('');
        applicationMessageNum = 0;
        initApplicationMessageList = false;
        applicationMessageConfig.timeArr = [];
        applicationMessageConfig.needTimeSign = false;
        mainObject.getNoticeOfApplicationMessageList(noticeCardMsg.data.module.moduleName, 0, 0, myInfo.companyId, 1, 20);

        // 上报已读
        setTimeout(function() {
            console.log('上报工作通知已读', noticeCardMsg.data.module.messageIds.join(','));
            mainObject.setNoticeCardReadMessage(noticeCardMsg.data.module.moduleType, noticeCardMsg.data.module.messageIds.join(','));
            noticeCardMsg.data.module.messageIds = [];
            mainObject.readedSeqIDReport('applicationMessage', -1);
        }, 1000);

        $('.application-message-list').removeClass('hideList');
        $('.file-btn-box').addClass('hideList');
        var _num_ = parseInt($(session).attr('number'));
        if (_num_ > 0) {
            $('.application-message-list-history .num').html(_num_);
            // $('.application-message-list-history').removeClass('hideList');
            setUnreadMsg(_num_);
        }
    } else {
        applicationMessageConfig.refreshing = false;
        // 上报已读和最大seqId
        if (sessionData.MsgSeqId != undefined && $(session).attr('number') && $(session).attr('number') !== '0') {
            var groupId = sessionData.GroupId;
            var msgSeqId = sessionData.MsgSeqId;
            setTimeout(function() {
                mainObject.readedSeqIDReport(groupId, msgSeqId);
                mainObject.setMsgReaded(groupId, false);
            }, 0);
        }

        $('.application-message-list').addClass('hideList');
        $('.file-btn-box').removeClass('hideList');
        if ($('#msgArea-' + sessionData.GroupId).length == 0) {
            var temp = '<div id="msgArea-' + sessionData.GroupId + '"class="con-list" onscroll="sendReceiptAndHideTip(this)" onmousewheel="loadMore_(this)"><div id="msg"></div></div>';
            $('#msgArea').append(temp);

            // 默认加载20条历史消息
            mainObject.GetMsglist(sessionData.GroupId, 0, 20, function(data) {
                console.log('历史消息', data);

                if (data.length == 20) {
                    var temp = '<div class="list-more"><a href="javascript:;" onclick="loadMore()">查看更多消息</a></div>';
                    $('#msgArea-' + sessionData.GroupId + ' #msg').append(temp);
                    firstMsgTimeMap.put(sessionData.GroupId, data[data.length - 1].sendtime);
                }
                if (data != null && data.length != 0) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        // var hisLastMsgTime = i > 0 ? data[i - 1].sendtime : data[0].sendtime;
                        var hisLastMsgTime = i < data.length - 1 ? data[i + 1].sendtime : data[data.length - 1].sendtime;

                        if (data[i].msgtype === 100004) {
                            console.log('视频聊天消息');
                            continue;
                        }
                        $('#msgArea-' + sessionData.GroupId + ' #msg').append(getOpenssionOrLoadmoreTemp(data[i], hisLastMsgTime));
                    }
                    var list = receiptMap.get(CHATOBJ.groupId);
                    AcknowledgementMsgDone(list);


                    var msgHeight = $('#msgArea-' + sessionData.GroupId + ' #msg').height();
                    $('#msgArea-' + sessionData.GroupId).scrollTop(msgHeight);

                    var _num_ = parseInt($(session).attr('number'));
                    if (data != undefined && data.length != 0) {
                        if (_num_ != 0) {
                            if (_num_ <= 20) {
                                var firstMsg_ = data[_num_ - 1];
                                var msgId = firstMsg_.msgId;
                                var thisOffsetTop = document.getElementById('msg-' + msgId).offsetTop;
                                var thisScrollHeight = $('#msgArea-' + firstMsg_.groupid)[0].scrollHeight;
                                var clientHeight = $('#msgArea-' + firstMsg_.groupid).height();
                                if (thisScrollHeight - thisOffsetTop > clientHeight) {
                                    $('#newMsgTip').html(_num_ + '条未读消息').removeClass('hideList');
                                }
                                var obj = {
                                    'type': 0,
                                    'msgId': msgId,
                                    'position': thisOffsetTop,
                                    'unreadNum': _num_
                                };
                                newMsgTipMap.put(firstMsg_.groupid, obj);
                            } else {
                                $('#newMsgTip').html(_num_ + '条未读消息').removeClass('hideList');
                                var obj = {
                                    'type': 0,
                                    'unreadNum': _num_
                                };
                                newMsgTipMap.put(CHATOBJ.groupId, obj);
                            }
                        } else {
                            $('#newMsgTip').addClass('hideList');
                        }
                    }
                    setUnreadMsg(_num_);
                    // // 未读消息数
                    // $(session).attr('number', '0');
                    // if ($('#session-' + sessionData.GroupId).attr('isMute') === '0') {
                    //     $(session).find('.num').html('0').addClass('hideList');
                    //     var total = parseInt($('#im-chat').attr('number')) - _num_;
                    //     $('#im-chat').attr('number', total);
                    //     if (total == 0) {
                    //         $('#im-chat').find('span').html('0').addClass('hideList');
                    //     }
                    //     if (total > 0 && total <= 999) {
                    //         $('#im-chat').find('span').html(total);
                    //     }
                    //     if (total > 999) {
                    //         $('#im-chat').find('span').html('999+');
                    //     }
                    //     if (sessionData.GroupType == 1) {
                    //         var unReadBoxData = {
                    //             'type': sessionData.GroupType,
                    //             'id': sessionData.oaId,
                    //             'name': sessionData.MsgSendName,
                    //             'sessionid': sessionData.GroupId,
                    //             'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                    //             'sendTime': sessionData.MsgTimellong || 0
                    //         }
                    //     } else if (sessionData.GroupType == 2) {
                    //         var unReadBoxData = {
                    //             'type': sessionData.GroupType,
                    //             'id': sessionData.GroupId,
                    //             'name': sessionData.GroupName,
                    //             'sessionid': sessionData.GroupId,
                    //             'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                    //             'sendTime': sessionData.MsgTimellong || 0
                    //         }
                    //     }
                    //     console.log('未读数上报',unReadBoxData,$('#session-' + sessionData.GroupId).attr('number'))
                    //     mainObject.messageBoxUnreadMsgSet(unReadBoxData);
                    //     mainObject.setMacBadge(total.toString(), false);
                    // } else {
                    //     $(session).find('.num').addClass('hideList');
                    // }
                }
                // 查询回执消息的未读人数
                acknowledgeFnObj.queryMsgUnReadCount(CHATOBJ.groupId);
                if ($('#session-' + sessionData.GroupId).find('.session-text').html() === '') {
                    var msgBody = '';
                    if (data[0].msgtype == 1 || data[0].msgtype == 100001 || data[0].msgtype == 100002 || data[0].msgtype == 100003 || data[0].msgtype === -100) {
                        $('#decode').text(data[0].msgbody);
                        msgBody = $('#decode').html();
                    } else if (data[0].msgtype == 2) {
                        msgBody = '[语音]';
                    } else if (data[0].msgtype == 3) {
                        msgBody = '[图片]';
                    } else if (data[0].msgtype == 5) {
                        msgBody = '[位置]';
                    } else if (data[0].msgtype == 6) {
                        msgBody = '[文件]';
                    }

                    msgBody = data[0].msgtype === -100 ? msgBody : data[0].staffName + ': ' + msgBody;

                    // 更新msgId并移除发送中和失败的的icon
                    $('#session-' + data[0].groupid).attr('msgId', data[0].msgId);
                    $('#session-' + data[0].groupid).find('p').find('em').addClass('hideList');
                    $('#session-' + data[0].groupid).find('p').find('.red').addClass('hideList');
                    // 更新消息内容，消息消息时间
                    if (data[0].grouptype == 1) {
                        $('#session-' + data[0].groupid).find('p').find('.session-text').html(msgBody);
                    } else if (data[0].grouptype == 2) {
                        $('#session-' + data[0].groupid).find('p').find('.session-text').html(msgBody);
                    }
                    $('#session-' + data[0].groupid).attr('msgTime', data[0].sendtime);
                    $('#session-' + data[0].groupid).find('.time').html(date_format(data[0].sendtime, 'HH:mm'));
                }
            });


            // 新消息提示
            /*
             if(_num_ != 0){
             $('#newMsgTip').html(_num_ + '条新消息').attr('isFirst',1).removeClass('hideList');
             } */
        } else {
            $('#msgArea-' + sessionData.GroupId).removeClass('hideList');
            if (flag !== false && lastChatGroupId !== CHATOBJ.groupId) {
                setTimeout(function() {
                    var msgHeight = $('#msgArea-' + sessionData.GroupId + ' #msg').height();
                    $('#msgArea-' + sessionData.GroupId).scrollTop(msgHeight);
                }, 0);
            }
            var _num_ = parseInt($(session).attr('number'));
            var newMsgObj = newMsgTipMap.get(sessionData.GroupId);
            if (lastChatGroupId !== CHATOBJ.groupId && newMsgObj != undefined) {
                var oldPosition = newMsgObj.oldPosition;
                var newPosition = $('#msgArea-' + sessionData.GroupId)[0].scrollHeight;
                var clientHeight = $('#msgArea-' + sessionData.GroupId).height();
                if (newPosition - oldPosition > clientHeight) {
                    $('#newMsgTip').html(_num_ + '条未读消息').removeClass('hideList');
                    newMsgObj.type = 1;
                    newMsgObj.position = oldPosition;
                    newMsgTipMap.put(sessionData.GroupId, newMsgObj);
                }
            } else if (lastChatGroupId === CHATOBJ.groupId && newMsgObj != undefined && _num_ > 0 && $('#msgArea-' + sessionData.GroupId).height() < $('#msgArea-' + sessionData.GroupId + ' #msg').height()) {
                $('#currentMsgTip').html(_num_ + '条新消息').removeClass('hideList');
            }
            if (_num_ == 0) {
                $('#newMsgTip').addClass('hideList');
            }

            setUnreadMsg(_num_);

            // // 未读消息数
            // $(session).attr('number', '0');
            // if (!$('#session-' + sessionData.GroupId).attr('isMute') || $('#session-' + sessionData.GroupId).attr('isMute') === '0') {
            //     $(session).find('.num').html('0').addClass('hideList');
            //     var total = parseInt($('#im-chat').attr('number')) - _num_;
            //     console.log(total, _num_);
            //     $('#im-chat').attr('number', total);
            //     if (total == 0) {
            //         $('#im-chat').find('span').html('0').addClass('hideList');
            //     }
            //     if (total > 0 && total <= 999) {
            //         $('#im-chat').find('span').html(total);
            //     }
            //     if (total > 999) {
            //         $('#im-chat').find('span').html('999+');
            //     }
            //     if (sessionData.GroupType == 1) {
            //         var unReadBoxData = {
            //             'type': sessionData.GroupType,
            //             'id': sessionData.oaId,
            //             'name': sessionData.MsgSendName,
            //             'sessionid': sessionData.GroupId,
            //             'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
            //             'sendTime': sessionData.MsgTimellong || 0
            //         }
            //     } else if (sessionData.GroupType == 2) {
            //         var unReadBoxData = {
            //             'type': sessionData.GroupType,
            //             'id': sessionData.GroupId,
            //             'name': sessionData.GroupName,
            //             'sessionid': sessionData.GroupId,
            //             'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
            //             'sendTime': sessionData.MsgTimellong || 0
            //         }
            //     }
            //     console.log('未读数上报',unReadBoxData,$('#session-' + sessionData.GroupId).attr('number'))
            //     mainObject.messageBoxUnreadMsgSet(unReadBoxData);
            //     mainObject.setMacBadge(total.toString(), false);
            // } else {
            //     $(session).find('.num').addClass('hideList');
            // }
        }
    }

    function setUnreadMsg(_num_) {
        // 未读消息数
        $(session).attr('number', '0');
        if (!$('#session-' + sessionData.GroupId).attr('isMute') || $('#session-' + sessionData.GroupId).attr('isMute') === '0') {
            $(session).find('.num').html('0').addClass('hideList');
            var total = parseInt($('#im-chat').attr('number')) - _num_;
            console.log(total, _num_);
            $('#im-chat').attr('number', total);
            if (total == 0) {
                $('#im-chat').find('span').html('0').addClass('hideList');
            }
            if (total > 0 && total <= 999) {
                $('#im-chat').find('span').html(total);
            }
            if (total > 999) {
                $('#im-chat').find('span').html('999+');
            }
            if (sessionData.GroupType == 1) {
                var unReadBoxData = {
                    'type': sessionData.GroupType,
                    'id': sessionData.oaId,
                    'name': sessionData.MsgSendName,
                    'sessionid': sessionData.GroupId,
                    'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                    'sendTime': sessionData.MsgTimellong || 0
                }
            } else if (sessionData.GroupType == 2) {
                var unReadBoxData = {
                    'type': sessionData.GroupType,
                    'id': sessionData.GroupId,
                    'name': sessionData.GroupName,
                    'sessionid': sessionData.GroupId,
                    'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                    'sendTime': sessionData.MsgTimellong || 0
                }
            } else {
                var unReadBoxData = {
                    'type': 4,
                    'id': sessionData.GroupId,
                    'name': '',
                    'sessionid': sessionData.GroupId,
                    'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                    'sendTime': sessionData.MsgTimellong || 0
                }
            }
            console.log('未读数上报',unReadBoxData,$('#session-' + sessionData.GroupId).attr('number'));
            mainObject.messageBoxUnreadMsgSet(unReadBoxData);
            mainObject.setMacBadge(total.toString(), false);
        } else {
            $(session).find('.num').addClass('hideList');
        }
    }
    aiteObj.oldContStr = $('#input-content').text();
}
let searchEl = '';
function openGlobalContextMenu(module, groupId, msgId, groupType, imId, hasContent, isSelected, ele, imName, dutyname, deptname, staffId) {
    var event = window.event;
    searchEl = ele
    $('#global-context-menu div').addClass('hideList');
    if (module === 'session') {
        var $target = $('#session-' + groupId);
        var data = $target.data();
        var top = data.SessionTopmark != 0;
        var mute = data.SessionisMute !== '0';
        if (data.GroupId === 'applicationMessage') {
            $('.delete-application-message').removeClass('hideList');
            mute ? $('.cancel-application-message-mute').removeClass('hideList') : $('.set-application-message-mute').removeClass('hideList');
        } else {
            $('.delete-session-context-menu').removeClass('hideList');
            $('.delete-session-context-menu').attr('data-groupId', data.GroupId);
            if (data.GroupType === 2 || data.GroupType === '2') {
                mainObject.isGroupActivated(data.GroupId, function(flag) {
                    if (flag) {
                        $('.exit-group-context-menu').removeClass('hideList');
                        top ? $('.cancel-top-context-menu').removeClass('hideList') : $('.set-top-context-menu').removeClass('hideList');
                        mute ? $('.cancel-session-mute').removeClass('hideList') : $('.set-session-mute').removeClass('hideList');
                    }
                    var y = event.pageY + $('#global-context-menu').height() < $(document).height() ? event.pageY : event.pageY - $('#global-context-menu').height();
                    $('#global-context-menu').css({
                        left: event.pageX + 'px',
                        top: y + 'px'
                    });
                });
            } else {
                var chatIdAry = groupId.split('_');
                top ? $('.cancel-top-context-menu').removeClass('hideList') : $('.set-top-context-menu').removeClass('hideList');
                if (chatIdAry[0] !== chatIdAry[1]) {
                    mute ? $('.cancel-session-mute').removeClass('hideList') : $('.set-session-mute').removeClass('hideList');
                }
            }
        }
        $('#global-context-menu').removeClass('hideList');
    } else if (module === 'group') {
        $('.delete-session-context-menu').attr('data-groupId', groupId);
        $('#global-context-menu').removeClass('hideList');
        $('.exit-group-context-menu').removeClass('hideList');
    } else if (module === 'deptTree') {
        if (refreshisfinished == true) {
            $('#global-context-menu').removeClass('hideList');
            $('.refresh-dept-context-menu').removeClass('hideList');
        } else if (refreshisfinished == false) {
            $('#global-context-menu').removeClass('hideList');
            $('.refreshing-dept-context-menu').removeClass('hideList');
        }
    }else if (module === 'list-name') {
        if (groupType == 1) {
            return
        }
        if (imId == myInfo.imUserid) {
            $('#global-context-menu').addClass('hideList');
            return
        }
        $('.aite-chat-context-menu').attr('data-im-id', imId)
            .attr('data-im-name', imName)
            .attr('data-dutyname', dutyname)
            .attr('data-deptname', deptname)
            .attr('data-staff-id', staffId)
        $('#global-context-menu').removeClass('hideList');
        $('.aite-chat-context-menu').removeClass('hideList');
        $('.sendmsg-chat-context-menu').removeClass('hideList');
    }else if (module === 'search') {
        $('#global-context-menu').removeClass('hideList');

        if (hasContent.length === 0) {
            $('.select-all-chat-context-menu').addClass('unenable');
        } else {
            $('.select-all-chat-context-menu').removeClass('unenable');
        }
        if (isSelected.length === 0) {
            $('.copy-chat-context-menu').addClass('unenable');
        } else {
            $('.copy-chat-context-menu').removeClass('unenable');
        }


        $('.copy-chat-context-menu').removeClass('hideList');
        $('.cut-chat-context-menu').removeClass('hideList');
        $('.paste-chat-context-menu').removeClass('hideList');
        $('.select-all-chat-context-menu').removeClass('hideList');

    } else if (module === 'quiteChannel') {
        var channel = groupId;
        // console.log(window.VueApp, '-----------------------');
        var oaId = window.VueApp.$store.getters.oaId;
        var members = window.VueApp.$store.getters.members;
        var member;
        var currentMembers = members[channel.ChannelId];
        for (var i = 0; i < currentMembers.length; i++) {
            if (oaId === currentMembers[i].id) {
                member = currentMembers[i];
            }
        }
        $('#global-context-menu').removeClass('hideList');
        $('.guest-quit-channel').removeClass('hideList');
        var data = {
            oaId: oaId,
            isCovered: member.isCovered,
            adminId: channel.adminId,
            ChannelId: channel.ChannelId
        };
        $('.guest-quit-channel').data(data);
    }
    var y = event.pageY + $('#global-context-menu').height() < $(document).height() ? event.pageY : event.pageY - $('#global-context-menu').height();
    $('#global-context-menu').css({
        left: event.pageX + 'px',
        top: y + 'px'
    });
}


$(document).on('click', function(e) {
    var event = e || window.event;
    if (event && !$(event.target).hasClass('global-context-menu')) {
        $('#global-context-menu').addClass('hideList');
        $('#global-context-menu div').addClass('hideList');
        if ($(e.target).hasClass('refreshing-dept-context-menu')) {
            $('#global-context-menu').removeClass('hideList');
            $('.refreshing-dept-context-menu').removeClass('hideList');
        }
    }
});

$(document).on('contextmenu', '#myGroup-content li', function() {
    let domArray = document.querySelectorAll('.kright');
    [].forEach.call(domArray, dom => $(dom).addClass('hideList'));
    openGlobalContextMenu('group', this.id.replace('group-', ''));
});

$(document).on('contextmenu', '.deptTree li.tree-li-1', function() {
    let domArray = document.querySelectorAll('.kright');
    [].forEach.call(domArray, dom => $(dom).addClass('hideList'));
    openGlobalContextMenu('deptTree');
});

$(document).on('contextmenu', '#msg div.list-name', function() {

    openGlobalContextMenu('list-name',null, null,  CHATOBJ.groupType, $(this).attr('imid'),null, null,null, $(this).attr('data-staff-name'), $(this).attr('data-dutyname'), $(this).attr('data-deptname'), $(this).attr('data-staff-id'));
});

/**
 * 头像的右键的艾特
 */
function rightmenuAite() {
    var nameWidhAite = '@'+$('.aite-chat-context-menu').attr('data-im-name');
    var dpr = window.devicePixelRatio;
    publicObject.convertNameToPicture(nameWidhAite, dpr, function(obj) {
        var picHeight = obj.picHeight;
        if (dpr >= 2) {
            picHeight = picHeight / 2;
        }
        var height = picHeight + 'px';
        insertAitePic(obj.picPath, height, $('.aite-chat-context-menu').attr('data-im-id'), nameWidhAite)
    });
}
/**
 * 头像的右键的发起会话
 */
function rightmenuOpensession() {
    let groupId = getGroupId($('.aite-chat-context-menu').attr('data-im-id'), myInfo.imUserid);
    newConversation({
        imid: $('.aite-chat-context-menu').attr('data-im-id'),
        id: $('.aite-chat-context-menu').attr('data-staff-id'),
        staffName: $('.aite-chat-context-menu').attr('data-im-name'),
        groupType: 1,
        dutyName: $('.aite-chat-context-menu').attr('data-dutyname'),
        deptName: $('.aite-chat-context-menu').attr('data-deptname')
    }, true,  function() {
        $('#session').parent().scrollTop(document.querySelector('#session-' + groupId).offsetTop);
    })
}

/**
 * 搜索的右键的复制
 */
function searchCopy() {
    document.execCommand('Copy', 'false', null);
    console.log('复制');
}

/**
 * 搜索的右键的剪切
 */
function searchCut() {
    document.execCommand('Cut');
    console.log('执行剪切');
}
/**
 * 搜索的右键的粘贴
 */
function searchPaste() {
    console.log('执行粘贴');
    mainObject.getClipboardInfo(function(data) {
        pasteToInput(data);
    });
}
/**
 * 搜索的右键的全选
 */
function searchSelectAll() {
    console.log('执行全选');
    // _documentSelectElement()
    // documentSelectElement(searchEl)
    searchEl.focus();
    searchEl.select();
}
/*function documentSelectElement(element) {
    element.focus();
    element.select();
}
function _documentSelectElement(element) {
    var sel = window.getSelection();
    var range = document.createRange();
    range.selectNode(element);
    sel.removeAllRanges();
    sel.addRange(range);
}*/

/**
 * 右键另存为
 */
function copyFileToAnotherPath() {
    $('#global-context-menu').addClass('hideList');
    $('#global-context-menu div').addClass('hideList');
    var path = $('.copy-file-context-menu').data('filePath');
    setTimeout(function() {
        qFileTransferObj.saveAs(path);
    }, 100);
}

/**
 * 右键置顶
 */
function setSessionTop() {
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    menuObject.setSesssionTop({
        'groupId': groupId,
        'bTopSession': true
    });
}

/**
 * 右键取消置顶
 */
function cancelSessionTop() {
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    menuObject.setSesssionTop({
        'groupId': groupId,
        'bTopSession': false
    });
}

/**
 * 右键删除会话
 */
function contextMenuDeleteSession() {
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    menuObject.delSessionItem({
        'groupId': groupId
    });
}

/**
 * 右键退出群聊
 */
function openExitGroupModal() {
    event.stopPropagation();
    $('.exit-group-modal').removeClass('hide');
    $('#global-context-menu').addClass('hideList');
    $('#global-context-menu div').addClass('hideList');
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    $('.exit-group-modal').attr('groupId', groupId);
}

/**
 * 右键退出频道
 */
function guestQuitChannel() {
    event.stopPropagation();
    $('#global-context-menu').addClass('hideList');
    var data = $('.guest-quit-channel').data();
    if (data.oaId === data.adminId) {
        window.VueApp.$modal({
            message: '你目前是该频道管理员，请先转让管理员身份后再退出频道',
            confirmText: '转让',
            confirmFn() {
                // console.log('管理员 转让---------------------', window.VueApp.$store);

                window.VueApp.$store.commit('SHOW_SELECT_PEOPLE', {flag: true, channelId: data.ChannelId});
            }
        });
    } else {
        if (data.isCovered === 1) {
            window.VueApp.$modal({
                message: '当前你是筛选条件范围内的成员，不能退出此频道',
                confirmText: '确定',
                showCancel: false
            });
        } else {
            window.VueApp.$modal({
                message: '退出频道后，将不再接收此频道消息，确定退出？',
                confirmText: '确定',
                confirmFn() {
                    window.VueApp.$api.quitChannel(data.ChannelId, data.oaId);
                }
            });
        }

    }

}

/**
 * 右键刷新
 */
function refreshDept() {
    $('#global-context-menu').addClass('hideList');
    $('#global-context-menu div').addClass('hideList');
    $('.freshError').addClass('hideList');
    $('.freshIng').removeClass('hideList');
    mainObject.refreshOrgAndContact();
    refreshisfinished = false;
}

/**
 * 设置免打扰
 */

function setSessionMute() {
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    mainObject.setShield(groupId, false);
}

/**
 * 取消免打扰
 */

function cancelSessionMute() {
    var groupId = $('.delete-session-context-menu').attr('data-groupId');
    mainObject.setShield(groupId, true);
}

function exitGroup(groupId) {
    mainObject.quitGroup({'groupId': groupId});
    $('.exit-group-modal').addClass('hide');
}

$(document).on('click', '.exit-group-confirm', function() {
    exitGroup($('.exit-group-modal').attr('groupId'));
});

$(document).on('click', '.exit-group-cancel', function() {
    $('.exit-group-modal').addClass('hide');
});

function sendReceiptAndHideTip() {
    if ($('#msgArea-' + CHATOBJ.groupId).scrollTop() + $('#msgArea-' + CHATOBJ.groupId).height() === $('#msgArea-' + CHATOBJ.groupId).find('#msg').height() + 30) {
        $('#currentMsgTip').addClass('hideList');
    }

    // 判断并隐藏新消息提示
    var newMsgObj = newMsgTipMap.get(CHATOBJ.groupId);
    if (newMsgObj != undefined) {
        // 第一次打开
        if (newMsgObj.type == 0) {
            if (newMsgObj.unreadNum <= 20) {
                var scrollTop = $('#msgArea-' + CHATOBJ.groupId).scrollTop();
                if (scrollTop < newMsgObj.position) {
                    $('#newMsgTip').addClass('hideList');
                }
            } else {

            }
        }
        if (newMsgObj.type == 1) {
            var scrollTop = $('#msgArea-' + CHATOBJ.groupId).scrollTop();
            if (scrollTop < newMsgObj.position) {
                $('#newMsgTip').addClass('hideList');
            }
        }
    }
    var list = receiptMap.get(CHATOBJ.groupId);
    AcknowledgementMsgDone(list);
    // 发送回执
    /*    var list = receiptMap.get(CHATOBJ.groupId);
     if (list != undefined && list.length != 0) {
     for (var i = 0; i < list.length; i++) {
     var offsetTop = document.getElementById('msg-' + list[i].msgId).offsetTop;
     var scrollTop = $('#msgArea-' + CHATOBJ.groupId).scrollTop();
     var clientHeight = $('#msgArea-' + CHATOBJ.groupId).height();
     if (offsetTop >= scrollTop && offsetTop <= scrollTop + clientHeight) {
     console.log('回执: ' + list[i].msgId + ' 已经查看');
     mainObject.readedReport(CHATOBJ.groupId, list[i].msgId, list[i].senderId, list[i].seqId);
     list.splice(i, 1);
     i = i - 1;
     }
     }
     } */
}

function topFirstNew() {
    $('#newMsgTip').addClass('hideList');
    var newMsgObj = newMsgTipMap.get(CHATOBJ.groupId);

    if (newMsgObj != undefined) {
        // 第一次打开
        if (newMsgObj.type == 0) {
            if (newMsgObj.unreadNum <= 20) {
                $('#msgArea-' + CHATOBJ.groupId).scrollTop(newMsgObj.position - 24);
            } else {
                var pageSize = newMsgObj.unreadNum - 20;
                loadMoreMsg(CHATOBJ.groupId, pageSize, false);
            }
        }
        // 不是第一次打开
        if (newMsgObj.type == 1) {
            $('#msgArea-' + CHATOBJ.groupId).scrollTop(newMsgObj.position - 24);
        }
    }
}

function goToMsgAreaBottom() {
    var groupId = CHATOBJ.groupId;
    var msgArea = $('#msgArea-' + groupId);
    var num = parseInt($('#currentMsgTip').text());
    var list = msgArea.find('#msg > div').not('.list-time, list-more');
    var target = list[list.length - num];

    console.log(msgArea.find('#msg div').not('.list-time, list-more'));

    let firstMsgTopHeight = target.offsetTop;
    let firstMsgHeight = target.scrollHeight;
    let msgBoxHeight = msgArea[0].offsetHeight - 10;
    msgArea.scrollTop(firstMsgTopHeight - msgBoxHeight + firstMsgHeight);

    // msgArea.scrollTop($('#msgArea-' + groupId)[0].scrollHeight);
    $('#session' + groupId).attr('currentMsgNum', 0);
    $('#currentMsgTip').text('').addClass('hideList');
}

function loadMore_(msgArea) {
    var SH = $(msgArea)[0].scrollHeight;
    var ST = $(msgArea).scrollTop();
    var CH = $(msgArea).height();
    if (SH <= ST + CH + 20) {
        $('#currentMsgTip').addClass('hideList');
    }

    if (SH === ST + CH + 20) {
        $('#session-' + CHATOBJ.groupId).attr('currentmsgnum', 0);
    }
    var event = window.event;
    var scrollTop = $(msgArea).scrollTop();
    var wheelDelta = event.wheelDelta;
    if (scrollTop == 0 && wheelDelta > 0) {
        var more = $(msgArea).find('.list-more');
        if (more.length != 0 && more.css('display') != 'none') {
            loadMoreMsg(CHATOBJ.groupId, 20, true);
        }
    }
}

function loadMore() {
    loadMoreMsg(CHATOBJ.groupId, 20, true);
}

/**
 * 加载更多历史消息
 * @param groupId
 * @param pageSize
 * @param changeScroll
 */
function loadMoreMsg(groupId, pageSize, changeScroll) {
    $('#msgArea-' + groupId).find('.list-more').addClass('hideList');
    var firstTime = firstMsgTimeMap.get(groupId);
    var insertPositionobj = {
        insertPosition: 0
    };

    // 加载更多记录之前记录滚动条高度
    var oldScrollHeight = $('#msgArea-' + groupId)[0].scrollHeight;
    mainObject.GetMsglist(groupId, firstTime, pageSize, function(data) {
        if (data.length === 0) {
            return;
        }
        firstMsgTimeMap.put(groupId, data[data.length - 1].sendtime);
        if (data != undefined && data.length != 0) {
            $('#msgArea-' + groupId).find('.list-more').removeClass('hideList');
            // var hisLastMsgTime = data[data.length - 1].sendtime;
            for (var i = data.length - 1; i >= 0; i--) {
                var hisLastMsgTime = i < data.length - 1 ? data[i + 1].sendtime : data[data.length - 1].sendtime;

                if (data[i].msgtype === 100004) {
                    console.log('视频聊天消息');
                    continue;
                }

                $('#msgArea-' + groupId + ' #msg').children().eq(insertPositionobj.insertPosition).after(getOpenssionOrLoadmoreTemp(data[i], hisLastMsgTime, insertPositionobj));
                insertPositionobj.insertPosition += 1;
                // console.log(insertPositionobj);
            }
            if (changeScroll) {
                var newScrollHeight = $('#msgArea-' + groupId)[0].scrollHeight;
                $('#msgArea-' + groupId).scrollTop(newScrollHeight - oldScrollHeight);
            } else {
                if ($('#msgArea-' + groupId).find('.list-more').css('display') == 'none') {
                    $('#msgArea-' + groupId).scrollTop(0);
                } else {
                    $('#msgArea-' + groupId).scrollTop(40);
                }
            }
            var list = receiptMap.get(CHATOBJ.groupId);
            AcknowledgementMsgDone(list);
            // 判断回执可见


            // 修改新消息未读条数容器
            var newMsgObj = newMsgTipMap.get(CHATOBJ.groupId);
            if (newMsgObj != undefined) {
                if (newMsgObj.unreadNum > 20) {
                    newMsgObj.unreadNum = newMsgObj.unreadNum - data.length;
                }
                if (newMsgObj.unreadNum <= 20) {
                    var firstMsg = data[newMsgObj.unreadNum - 1];
                    var msgId = firstMsg.msgId;
                    var offsetTop = document.getElementById('msg-' + msgId).offsetTop;
                    newMsgObj.msgId = msgId;
                    newMsgObj.position = offsetTop;
                    newMsgTipMap.put(CHATOBJ.groupId, newMsgObj);
                }
            }
        } else {
            $('#msgArea-' + groupId).find('.list-more').addClass('hideList');
        }
        // 查询回执消息的未读人数
        acknowledgeFnObj.queryMsgUnReadCount(CHATOBJ.groupId);
    });
}


function _loadMoreApplicationMessage() {
    var SH = $('.application-message-list-area')[0].scrollHeight;
    var ST = $('.application-message-list').scrollTop();
    var CH = $('.application-message-list').height();
    var unReadApplicationNum = parseInt($('.application-message-list-history .num').html());
    if (unReadApplicationNum > 0 && unReadApplicationNum <= applicationMessageNum) {
        var target = $('.application-message-item')[unReadApplicationNum - 1];
        var top = target.offsetTop;
        var height = $(target).height() / 2;
        console.log(top + height - $('.application-message-list').height() , $('.application-message-list').scrollTop())
        if (top + height - $('.application-message-list').height() <= $('.application-message-list').scrollTop()) {
            $('.application-message-list-history .num').html('0');
            $('.application-message-list-history').addClass('hideList');
        }
    }
    if (SH <= ST + CH && $('.application-message-list-more').length > 0) {
        loadMoreApplicationMessage();
        $('.application-message-list-more').remove();
    }
}

/**
 * 加载更多应用消息
 */
function loadMoreApplicationMessage() {
    mainObject.getNoticeOfApplicationMessageList(noticeCardMsg.data.module.moduleName, 0, firstMsgTimeMap.get('applicationMessage') - 1, myInfo.companyId, 1, 20);
}


/**
 * 接收消息
 * @param msg
 */
function receiveMsg(msg) {
    // todo 文件处理
    var draft = draftMap.get(msg.groupid);
    if (draft != undefined) {
        draft.oldHtml = undefined;
    }
    draftMap.put(msg.groupid, draft);
    // if (CHATOBJ != undefined && msg.groupid == CHATOBJ.groupId) {

    if (appIsVisible && CHATOBJ != undefined && msg.groupid == CHATOBJ.groupId && window.VueApp.$store.state.status.globalStatus === 'chat') {
        mainObject.readedSeqIDReport(CHATOBJ.groupId, msg.msgSeqId);
        mainObject.setMsgReaded(CHATOBJ.groupId);
    }
    console.log('收到消息', msg);

    if (msg.msgtype == 100003 && groupDetailObj && groupDetailObj.groupId === msg.groupid) {
        $('#group-bulletin').text(msg.msgbody);
        $('#group-' + msg.groupid).data().groupBulletin[0].content = msg.msgbody;
    }
    $('#session-no-record').addClass('hideList');

    // 不存在该回话的chat area
    if ($('#session-' + msg.groupid).length == 0) {
        publicObject.getSessionInfo(msg.groupid, function(info) {
            var msgBody = '';
            var topMark = '';
            if (info.sessionTop == 1) {
                topMark = '<span class="top"></span>';
                topTime = info.sessionTopTime;
            } else {
                topTime = '0';
            }
            if (msg.msgtype == 1 || msg.msgtype == 100001 || msg.msgtype == 100002 || msg.msgtype === 100003) {
                $('#decode').text(msg.msgbody);
                msgBody = $('#decode').html();
            } else if (msg.msgtype == 2) {
                msgBody = '[语音]';
            } else if (msg.msgtype == 3) {
                msgBody = '[图片]';
            } else if (msg.msgtype == 5) {
                msgBody = '[位置]';
            } else if (msg.msgtype == 6) {
                msgBody = '[文件]';
            }
            var newNumber_ = 1;
            var newNumber = '<span class="num hideList">0</span>';
            var muteIcon = '<span class="iconn-mute hideList"></span>';
            if (info.SessionisMute === '1') {
                newNumber = '<span class="num numsmall"></span>';
                muteIcon = '<span class="iconn-mute"></span>';
            } else {
                if (msg.senderId != myInfo.imUserid) {
                    newNumber = '<span class="num">1</span>';
                }
            }
            // msg.SessionisMute = 0;
            if (msg.grouptype == 1) {
                var temp = '<li id="session-' + msg.groupid + '"' +
                    ' number="' + newNumber_ + '" msgTime="' + msg.sendtime + '"' +
                    'topTime="' + topTime + '" isTop="' + info.sessionTop + '" isMute="' + info.SessionisMute + '" msgId="' + msg.msgId + '">' +
                    topMark + newNumber + '<div class="list-name">' +
                    '</div><div class="list-text">' +
                    '<h2><span class="session-name"></span><span class="time">' + date_format(msg.sendtime, 'HH:mm') + '</span></h2>' +
                    '<p><em id="send-status" class="iconn-35 hideList"></em>' +
                    '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + msgBody + '</span></p>' +
                    muteIcon +
                    '</div></li>';
                if (info.sessionTop == 0) {
                    if (topNum == 0) {
                        $('#session').prepend(temp);
                    } else {
                        $('#session').children().eq(topNum - 1).after(temp);
                    }
                } else {
                    var children = $('#session').children();
                    for (var i = 0; i < children.length; i++) {
                        var topTime = $(children[i]).attr('topTime');
                        if (info.sessionTopTime > topTime) {
                            $(children[i]).before(temp);
                            break;
                        }
                    }
                }
                var sessionData = {
                    'GroupId': msg.groupid,
                    'GroupType': 1,
                    'MsgSeqId': msg.msgSeqId,
                    'GroupName': msg.groupname,
                    'oaId': info.oaId,
                    'MsgSendName': info.MsgSendName,
                    'SessionTopmark': info.sessionTop,
                    'imId': info.MsgsenderId,
                    'deptName': info.deptName,
                    'dutyName': info.dutyName,
                    'SessionisMute': info.SessionisMute,
                };
                // $('#session-'+msg.groupid).data(sessionData);
                // var receiveId = parseInt(msg.groupid.replace(myInfo.imUserid, '').replace('_', ''));
                // publicObject.getMemberInfoFromImId(receiveId, function (data) {
                $('#session-' + sessionData.GroupId).find('.list-name').css('background', getNickNameColor(info.oaId)).html(getNickName(info.MsgSendName));
                $('#session-' + sessionData.GroupId).find('.session-name').html(info.MsgSendName);
                sessionData.MsgSendName = info.MsgSendName;
                sessionData.oaId = info.oaId;
                sessionData.GroupName = info.MsgSendName;
                $('#session-' + msg.groupid).data(sessionData);
                // });
            }
            if (msg.grouptype == 2) {
                publicObject.getGroupInfo(msg.groupid, function(data) {
                    var temp = '<li id="session-' + msg.groupid + '"' +
                        ' number="' + newNumber_ + '" msgTime="' + msg.sendtime + '"' +
                        'topTime="' + topTime + '" isTop="' + info.sessionTop + '" isMute="' + info.SessionisMute + '" msgId="' + msg.msgId + '">' +
                        topMark + newNumber + '<div class="list-name" style="background:' + getNickNameColor(Math.abs(hashCode(msg.groupid))) + ';">' +
                        '<em class="iconn-46"></em>' +
                        '</div><div class="list-text">' +
                        '<h2><span class="session-name">' + codeStr(data.groupName) + '</span><span class="time">' + date_format(msg.sendtime, 'HH:mm') + '</span></h2>' +
                        '<p><em id="send-status" class="iconn-35 hideList"></em>' +
                        '<span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span><span class="session-text">' + msg.staffName + ': ' + msgBody + '</span></p>' +
                        muteIcon +
                        '</div></li>';
                    if (info.sessionTop == 0) {
                        if (topNum == 0) {
                            $('#session').prepend(temp);
                        } else {
                            $('#session').children().eq(topNum - 1).after(temp);
                        }
                    } else {
                        var children = $('#session').children();
                        for (var i = 0; i < children.length; i++) {
                            var topTime = $(children[i]).attr('topTime');
                            if (info.sessionTopTime > topTime) {
                                $(children[i]).before(temp);
                                break;
                            }
                        }
                    }
                    var sessionData = {
                        'GroupId': msg.groupid,
                        'GroupType': 2,
                        'MsgSeqId': msg.msgSeqId,
                        'MsgSendName': msg.staffName,
                        'GroupName': data.groupName,
                        'SessionTopmark': info.sessionTop,
                        'SessionisMute': info.SessionisMute
                    };
                    $('#session-' + msg.groupid).data(sessionData);
                });
            }
            if (msg.senderId != myInfo.imUserid) {
                var isMute = $('#session-' + msg.groupid).attr('isMute');
                // var muteIcon = '<span class="iconn-mute hideList"></span>';
                // var numberTemp = '<span class="num numsmall hideList"></span>';
                if (info.SessionisMute === '1') {
                    // numberTemp = '<span class="num numsmall"></span>';
                } else {
                    var total = parseInt($('#im-chat').attr('number')) + 1;
                    $('#im-chat').attr('number', total);
                    if (total > 0 && total <= 999) {
                        $('#im-chat').find('span').html(total).removeClass('hideList');
                    }
                    if (total > 999) {
                        $('#im-chat').find('span').html('999+').removeClass('hideList');
                    }
                    setTimeout(function(){
                        if (msg.grouptype == 1) {
                            var unReadBoxData = {
                                'type': msg.grouptype,
                                'id': msg.id,
                                'name': msg.staffName,
                                'sessionid': msg.groupid,
                                'unreadmsgcount': $('#session-' + msg.groupid).attr('number'),
                                'sendTime': msg.sendtime
                            }
                        } else if (msg.grouptype == 2) {
                            var unReadBoxData = {
                                'type': msg.grouptype,
                                'id': msg.groupid,
                                'name': $('#session-' + msg.groupid).data().GroupName,
                                'sessionid': msg.groupid,
                                'unreadmsgcount': $('#session-' + msg.groupid).attr('number'),
                                'sendTime': msg.sendtime
                            }
                        }
                        console.log('未读数上报',unReadBoxData)
                        mainObject.messageBoxUnreadMsgSet(unReadBoxData);
                    },10)
                    mainObject.setMacBadge(total.toString(), false);
                }
                if (msg.msgtype == 100001) {
                    $('#session-' + msg.groupid).find('.session-list-acknowledge-notice').removeClass('hideList');
                } else if (msg.msgtype == 100002) {
                    var atIdsArr = msg.altUids.split(',');
                    atIdsArr.forEach(function(id) {
                        if (parseInt(id) === myInfo.imUserid) {
                            $('#session-' + msg.groupid).find('.session-list-at-notice').removeClass('hideList');
                        }
                    });
                } else if (msg.msgtype == 100003) {
                    $('#session-' + msg.groupid).find('.session-list-announcement-notice').removeClass('hideList');
                }
            } else {
                $('#session-' + msg.groupid).find('num').addClass('hideList');
            }

            if (info.sessionTop == 0) {
                if (topNum == 0) {

                }
            }
        });
    } else {
        // 存在该回话的chat area

        // 更新seqId
        var sData = $('#session-' + msg.groupid).data();
        sData.MsgSeqId = msg.msgSeqId;
        $('#session-' + msg.groupid).data(sData);

        var msgBody = '';
        if (msg.msgtype == 1 || msg.msgtype == 100001 || msg.msgtype == 100002 || msg.msgtype == 100003) {
            $('#decode').text(msg.msgbody);
            msgBody = $('#decode').html();
        } else if (msg.msgtype == 2) {
            msgBody = '[语音]';
        } else if (msg.msgtype == 3) {
            msgBody = '[图片]';
        } else if (msg.msgtype == 5) {
            msgBody = '[位置]';
        } else if (msg.msgtype == 6) {
            msgBody = '[文件]';
        }

        // 更新msgId并移除发送中和失败的的icon
        $('#session-' + msg.groupid).attr('msgId', msg.msgId);
        $('#session-' + msg.groupid).find('p').find('em').addClass('hideList');
        $('#session-' + msg.groupid).find('p').find('.red').addClass('hideList');
        // 更新消息内容，消息消息时间
        if (msg.grouptype == 1) {
            $('#session-' + msg.groupid).find('p').find('.session-text').html(msgBody);
        } else if (msg.grouptype == 2) {
            $('#session-' + msg.groupid).find('p').find('.session-text').html(msg.staffName + ': ' + msgBody);
        }
        $('#session-' + msg.groupid).attr('msgTime', msg.sendtime);
        $('#session-' + msg.groupid).find('.time').html(date_format(msg.sendtime, 'HH:mm'));
        // 改变顺序
        var isTop = $('#session-' + msg.groupid).attr('isTop');
        if (isTop == 0) {
            if (topNum == 0) {
                $('#session').children().first().before($('#session-' + msg.groupid));
            } else {
                $('#session').children().eq(topNum - 1).after($('#session-' + msg.groupid));
            }
        }
        // 更新消息未读数量
        // if (CHATOBJ.groupId != msg.groupid && msg.senderId != myInfo.imUserid) {
        if (msg.senderId !== myInfo.imUserid && (!appIsVisible || (appIsVisible && CHATOBJ.groupId != msg.groupid) || (appIsVisible && window.VueApp.$store.state.status.globalStatus !== 'chat'))) {
            var num_ = parseInt($('#session-' + msg.groupid).attr('number')) + 1;
            $('#session-' + msg.groupid).attr('number', num_);
            if ($('#session-' + msg.groupid).attr('isMute') === '1') {
                $('#session-' + msg.groupid).find('.num').html('').removeClass('hideList').addClass('numsmall');
            } else {
                if (num_ > 0 && num_ <= 999) {
                    $('#session-' + msg.groupid).find('.num').html(num_).removeClass('numsmall').removeClass('hideList');
                } else if (num_ > 999) {
                    $('#session-' + msg.groupid).find('.num').html('999+').removeClass('numsmall').removeClass('hideList');
                }
                var total = parseInt($('#im-chat').attr('number')) + 1;
                $('#im-chat').attr('number', total);
                if (total > 0 && total <= 999) {
                    $('#im-chat').find('.num').html(total).removeClass('hideList');
                } else if (total > 999) {
                    $('#im-chat').find('.num').html('999+').removeClass('hideList');
                }
                if (sData.GroupType == 1) {
                    var unReadBoxData = {
                        'type': sData.GroupType,
                        'id': sData.oaId,
                        'name': sData.MsgSendName,
                        'sessionid': sData.GroupId,
                        'unreadmsgcount': $('#session-' + sData.GroupId).attr('number'),
                        'sendTime': msg.sendtime
                    }
                } else if (sData.GroupType == 2) {
                    var unReadBoxData = {
                        'type': sData.GroupType,
                        'id': sData.GroupId,
                        'name': sData.GroupName,
                        'sessionid': sData.GroupId,
                        'unreadmsgcount': $('#session-' + sData.GroupId).attr('number'),
                        'sendTime': msg.sendtime
                    }
                }
                console.log('未读数上报',unReadBoxData)
                mainObject.messageBoxUnreadMsgSet(unReadBoxData);
                mainObject.setMacBadge(total.toString(), false);
            }
            if (msg.msgtype == 100001) {
                $('#session-' + msg.groupid).find('.session-list-acknowledge-notice').removeClass('hideList');
            } else if (msg.msgtype == 100002) {
                var atIdsArr = msg.altUids.split(',');
                atIdsArr.forEach(function(id) {
                    if (parseInt(id) === myInfo.imUserid) {
                        $('#session-' + msg.groupid).find('.session-list-at-notice').removeClass('hideList');
                    }
                });
            } else if (msg.msgtype == 100003) {
                $('#session-' + msg.groupid).find('.session-list-announcement-notice').removeClass('hideList');
            }
        }

        if ($('#msgArea-' + msg.groupid).length != 0) {
            var tempTime = '';
            if (lastMsgTimeMap.get(msg.groupid) == undefined) {
                lastMsgTimeMap.put(msg.groupid, msg.sendtime);
                tempTime = '<div class="list-time">' + formatMsgTime(msg.sendtime) + '</div>';
            } else {
                if (msg.sendtime - lastMsgTimeMap.get(msg.groupid) >= 5 * 60 * 1000) {
                    tempTime = '<div class="list-time">' + formatMsgTime(msg.sendtime) + '</div>';
                    lastMsgTimeMap.put(msg.groupid, msg.sendtime);
                } else {
                    tempTime = '';
                }
            }

            let avatarName = getNickName(msg.staffName);
            let senderClass = 'list-left';
            let avatarColor = getNickNameColor(msg.id);
            if (msg.senderId == myInfo.imUserid) {
                avatarName = '我';
                senderClass = 'list-right';
                avatarColor = getNickNameColor(myInfo.myid);
            }
            /* if (msg.msgtype = 100001) {

             } */
            let msgContent = msgManger.getTemplate(msg, {
                type: msgManger.type.RECEIVEMSG
            });
            let typeClass = msgManger.getTypeClass();
            let listText = msgManger.getListText();

            var temp = '';
            if (msg.msgtype == 6) {
                var senderId = msg.senderId;
                var typename = '';
                var state = '';
                var type = Math.floor((msg.from / 1000000)) + '';
                var fileStatus = msg.FileStatus;
                var msgId = msg.msgId;
                var sendtime = msg.sendtime;

                if (fileStatus == 0) { // 未下载  收到的 即时消息 基本只有这一种情况 如果出现其他情况则状态有问题
                    state = 'notdown';
                    typename = 'iconn-icon-download';
                } else {
                    state = 'notdown';
                    typename = 'iconn-icon-download';
                    console.error('未下载  收到的 即时消息 基本只有这一种情况 如果出现其他情况则状态有问题');
                }

                var fileStateIcon = '' +
                    '<div class="icon-wrapper" data-icon-wrapper-id=' + msgId + ' data-state=' + state + ' data-type=' + type + '  data-sendtime=' + sendtime + '   data-senderid= "' + msg.senderId + '" data-file-name="' + msg.fname + '">' +

                    '<em class=' + typename + '></em>' +
                    '</div>';
                temp = tempTime +
                    '<div id="msg-' + msg.msgId + '" class="' + senderClass + ' clearfix">' +
                    '<div imId="' + msg.imUserId + '" class="list-name" data-staff-name ="'+msg.staffName+'" data-staff-id ="'+msg.id+'" data-deptname ="'+msg.deptName+'" data-dutyname ="'+msg.dutyName+'" style="background:' + avatarColor + ';">' + avatarName + '</div>' +
                    '<pre class="' + listText + typeClass + '"  data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '" data-msgtype="' + msg.msgtype + '"  data-senderid="' + msg.senderId + '"  data-status="' + msg.status + '"  data-sendtime="' + msg.sendtime + '">' + msgContent + fileStateIcon + '</pre>' +
                    '</div>';
            } else {
                temp = tempTime + '<div id="msg-' + msg.msgId + '" class="' + senderClass + ' clearfix">' +
                    '<div imId="' + msg.imUserId + '" class="list-name" data-staff-name ="'+msg.staffName+'"  data-staff-id ="'+msg.id+'" style="background:' + avatarColor + ';">' + avatarName + '</div>' +
                    '<pre class="' + listText + typeClass + '" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '" onclick="playSound(this)"   data-msgtype="' + msg.msgtype + '"   data-senderid="' + msg.senderId + '"  data-status="' + msg.status + '"  data-sendtime="' + msg.sendtime + '">' + msgContent + '</pre></div>';
            }


            var msgHeight = $('#msgArea-' + msg.groupid)[0].scrollHeight;
            var st = $('#msgArea-' + msg.groupid).scrollTop();
            var hhhh = $('#msgArea-' + msg.groupid).height();
            if (appIsVisible && (msgHeight - st <= hhhh + 20 || (msg.senderId === myInfo.imUserid && CHATOBJ.groupId === msg.groupid))) {
                setTimeout(function() {
                    $('#msgArea-' + msg.groupid).scrollTop(msgHeight);
                }, 0);
            } else {
                var currentMsgNum = 0;
                if ($('#session-' + msg.groupid).attr('currentMsgNum')) {
                    currentMsgNum = parseInt($('#session-' + msg.groupid).attr('currentMsgNum')) + 1;
                } else {
                    currentMsgNum = 1;
                }
                $('#session-' + msg.groupid).attr('currentMsgNum', currentMsgNum);
                if (msg.senderId != myInfo.imUserid) {
                    $('#currentMsgTip').text(currentMsgNum + '条新消息').removeClass('hideList');
                }
            }

            $('#msgArea-' + msg.groupid + ' #msg').append(temp);

            // 判断可见并发送回执消息
            if (msg.groupid == CHATOBJ.groupId) {
                var list = receiptMap.get(msg.groupid);
                AcknowledgementMsgDone(list);
            }
        }
        if ($('#session-' + msg.groupid).hasClass('active')) {
            var sessionTop = $('#session-' + msg.groupid)[0].offsetTop;
            var sessionScrollTop = $('#session-' + msg.groupid).parent().parent().scrollTop();
            if (sessionTop < sessionScrollTop) {
                $('#session-' + msg.groupid).parent().parent().scrollTop(sessionTop);
            }
        }
    }
    // 查询回执消息的未读人数
    acknowledgeFnObj.queryMsgUnReadCount(msg.groupid);
}

/**
 * 收到新通知消息
 * @param message
 */
function addNewApplicationMessage(card) {
    var msg = card.newMessage;
    var count = card.count;
    var module = card.module;
    if ($('#session-' + 'applicationMessage').length === 0) {
        mainObject.getSession();
        mainObject.getNoticeCardMessage();
    } else {
        if (count === parseInt($('#session-applicationMessage').attr('number'))) {
            return;
        }
        if (count === 0) {
            $('.application-message-list-new').addClass('hideList');
            mainObject.readedSeqIDReport('applicationMessage', -1);
        } else {
            noticeCardMsg.data.module.messageIds = module.messageIds;
        }
        $('#session-applicationMessage').find('p').find('.session-text').html(msg.title);
        $('#session-applicationMessage').find('.time').html(date_format(msg.sendTime, 'HH:mm'));

        if (topNum == 0) {
            $('#session').children().first().before($('#session-applicationMessage'));
        } else {
            $('#session').children().eq(topNum - 1).after($('#session-applicationMessage'));
        }

        var old_num_ = parseInt($('#session-applicationMessage').attr('number'));
        var num_ = count;
        $('#session-applicationMessage').attr('number', num_);
        if ($('#session-applicationMessage').attr('isMute') === '1') {
            if (num_ > 0) {
                $('#session-applicationMessage').find('.num').html('').removeClass('hideList').addClass('numsmall');
            } else {
                $('#session-applicationMessage').find('.num').html('').addClass('hideList');
            }
        } else {
            if (num_ > 0 && num_ <= 999) {
                $('#session-applicationMessage').find('.num').html(num_).removeClass('numsmall').removeClass('hideList');
            } else if (num_ > 999) {
                $('#session-applicationMessage').find('.num').html('999+').removeClass('numsmall').removeClass('hideList');
            } else {
                $('#session-applicationMessage').find('.num').html('').removeClass('numsmall').addClass('hideList');
            }
            var total = parseInt($('#im-chat').attr('number')) + num_ - old_num_;
            $('#im-chat').attr('number', total);
            if (total > 0 && total <= 999) {
                $('#im-chat').find('.num').html(total).removeClass('hideList');
            } else if (total > 999) {
                $('#im-chat').find('.num').html('999+').removeClass('hideList');
            } else {
                $('#im-chat').find('.num').html('').addClass('hideList');
            }
            var unReadBoxData = {
                'type': 4,
                'id': 'applicationMessage',
                'name': '',
                'sessionid': 'applicationMessage',
                'unreadmsgcount': $('#session-applicationMessage').attr('number'),
                'sendTime': msg.sendTime
            }
            console.log('未读数上报',unReadBoxData)
            mainObject.messageBoxUnreadMsgSet(unReadBoxData);
            mainObject.setMacBadge(total.toString(), false);
        }
        if (CHATOBJ.groupId === 'applicationMessage') {
            if (count === 0) {
                $('.application-message-list-new').addClass('hideList').find('.num').html(count);
            } else {
                $('.application-message-list-new').removeClass('hideList').find('.num').html(count);
            }
        }
    }
}

/**
 * 回执消息是否已经查看
 * @param node
 */
function AcknowledgementMsgDone(list) {
    // if (msg.groupid == CHATOBJ.groupId) {
    // var list = receiptMap.get(msg.groupid);

    if (list != undefined && list.length != 0) {
        for (var i = 0; i < list.length; i++) {
            var offsetTop = document.getElementById('msg-' + list[i].msgId).offsetTop;
            var scrollTop = $('#msgArea-' + CHATOBJ.groupId).scrollTop();
            var clientHeight = $('#msgArea-' + CHATOBJ.groupId).height();
            if (offsetTop >= scrollTop && offsetTop <= scrollTop + clientHeight) {
                console.log('回执: ' + list[i].msgId + ' 已经查看');
                // 把当前消息设置为已读状态，
                mainObject.readedReport(CHATOBJ.groupId, list[i].msgId, list[i].senderId, list[i].seqId);
                list.splice(i, 1);
                i = i - 1;
            }
        }
    }
    // }
}

/**
 * 播放语音消息
 * @param node
 */
function playSound(node) {
    if (!$(node).hasClass('voice')) {
        return;
    }
    node = node.children[0];
    // 移除消息未播放过的样式
    $(node).siblings().addClass('hideList');

    var msgId = $(node).parent().parent().attr('id').replace('msg-', '');

    // 判断消息状态是否为播放中，如果播放中停止播放
    if ($(node).find('.iconn-2').css('display') != 'none') {
        $(node).find('.iconn-2').addClass('hideList');
        $(node).find('.voice-box').removeClass('hide');
        mainObject.PlayVoiceMsg(CHATOBJ.groupId, msgId, '');
    } else {
        $(node).find('.iconn-2').removeClass('hideList');
        $(node).find('.voice-box').addClass('hide');
        mainObject.StopVoiceMsg(CHATOBJ.groupId, msgId, '');
    }
}

// 语音播放完成
function soundPlayFinish(groupId, msgId) {
    console.log('语音播放完成', groupId, msgId);
    $('#msgArea-' + groupId).find('#msg-' + msgId).find('.iconn-2').removeClass('hideList');
    $('#msgArea-' + groupId).find('#msg-' + msgId).find('.voice-box').addClass('hide');
}

/**
 * 将图片aite 插入到输入框
 * @param img
 */
function insertAitePic(path, height, imId, imName) {
    if ($('#im-chat').hasClass('active')) {
        var inputContent = $('#input-content');
    } else {
        var inputContent = $('.channel-input-container');
    }

    var oldScrollHeight = inputContent[0].scrollHeight;
    var oldScrollTop = inputContent.scrollTop();

     var html = '<img class="input-msg-aite" src="' + path + '" height="'+height+'" im-id="'+imId+'" data-aite-name="'+imName+'">';

     insertImg(html);

    setTimeout(function() {
        var newScrollHeight = inputContent[0].scrollHeight;
        inputContent.scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
    }, 10);
}
/**
 * 将图片插入到输入框
 * @param img
 */
function insertPic(img) {
    if ($('#im-chat').hasClass('active')) {
        var inputContent = $('#input-content');
    } else {
        var inputContent = $('.channel-input-container');
    }

    var oldScrollHeight = inputContent[0].scrollHeight;
    var oldScrollTop = inputContent.scrollTop();
    for (var i = 0; i < img.length; i++) {
        var html = '<img class="input-img" src="' + img[i].path + '" data-picwidth="' + (img[i].width || img[i].picwidth) + '" data-picheight="' + (img[i].height || img[i].picheight) + '" data-picsize="' + (img[i].picsize || 0) + '" ondblclick ="viewInputImg(this)" >';

        insertImg(html);
    }
    setTimeout(function() {
        var newScrollHeight = inputContent[0].scrollHeight;
        inputContent.scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
    }, 10);
}

/**
 * 将表情插入到输入框
 * @param face
 */
function insertFace(face) {
    var html = '<img class="input-face" src="' + $(face).attr('src') + '">';
    insertImg(html);
}

/**
 * 将文件插入到输入框
 * @param files
 */
function insertFile(files) {
    var tempImgArray = [];// 存放选中的图片
    var oldScrollHeight = $('#input-content')[0].scrollHeight;
    var oldScrollTop = $('#input-content').scrollTop();
    for (var i = 0; i < files.length; i++) {
        var file = files[i],
            name = file.name,
            filePath = file.path || '',
            fileName = formatFileName(getFileNameWidthType(name)),
            fileAllName = getFileNameWidthType(name),
            fileType = getFileType(name),
            imgSrc = getFileThumbnailSrc(fileType),
            fileSize = file.size,
            options = null,
            needToDownload = false;

        try {
            options = JSON.parse(file.path);
            fileAllName = options.fname;
            fileName = formatFileName(fileAllName);
            fileType = getFileType(fileAllName);
            imgSrc = getFileThumbnailSrc(fileType);
            fileSize = options.fsize;
            needToDownload = true;
        } catch (e) {
            console.log(e);
        }

        if (fileImgType.includes(fileType.toUpperCase())) {
            tempImgArray.push(file);
            continue;
        }
        var chooseId = 'chooseId_' + i;
        var canvas = document.createElement('canvas');
        var canvasImg = new Image();
        canvasImg.src = '../images/file/' + imgSrc + '40@2x.png';
        var times = 2;
        canvas.width = 100 * times;
        canvas.height = 63 * times;
        var config = {filePath, canvasImg, canvas, fileName, fileAllName, imgSrc, fileSize, fileType, needToDownload, options};
        canvasImg.onload = (function({filePath, canvasImg, canvas, fileName, fileAllName, imgSrc, fileSize, fileType, needToDownload, options}) {
            return function() {
                var img = new Image();
                var ctx = canvas.getContext('2d');

                // ctx.drawImage(canvasImg, 30, 0, 40, 40);
                ctx.drawImage(canvasImg, 0, 0, 40 * times, 40 * times, 30 * times, 0, 40 * times, 40 * times);
                ctx.font = '28px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText(fileName, 50 * times, (56 + 4) * times, 100 * times);
                img.src = canvas.toDataURL();
                img.className = 'input-file';
                img.id = chooseId;
                img.setAttribute('data-path', encodeURI(filePath));
                img.setAttribute('data-filename', encodeURI(fileName));
                img.setAttribute('data-fileallname', fileAllName);
                img.setAttribute('data-picpath', encodeURI(imgSrc));
                img.setAttribute('data-size', fileSize);
                if (fileLimitType.includes(fileType.toUpperCase())) {
                    img.setAttribute('data-safe', false);
                } else {
                    img.setAttribute('data-safe', true);
                }
                if (needToDownload) {
                    img.setAttribute('data-need-to-download', 1);
                    img.setAttribute('data-fid', options.fid);
                    img.setAttribute('data-fname', options.fname);
                    img.setAttribute('data-fsize', options.fsize);
                }
                insertImg(img.outerHTML);
            };
        })(config);
    }
    setTimeout(function() {
        var newScrollHeight = $('#input-content')[0].scrollHeight;
        $('#input-content').scrollTop(newScrollHeight - oldScrollHeight + oldScrollTop);
    }, 10);

    // 将文件中的图片 按照图片类型插入
    tempImgArray.length && insertPic(tempImgArray);
}


/**
 * 格式化文件名称
 */
function formatFileName(filename) {
    var fileType = getFileType(filename),
        filenameTemp = filename.substring(0, filename.lastIndexOf('.') === -1 ? filename.length - 1 : filename.lastIndexOf('.'));
    fileType === '' ? false : fileType = '.' + fileType;
    if (filenameTemp.length > 5) {
        var tempStart = filenameTemp.substring(0, 2),
            tempEnd = filenameTemp.substr(-1, 1);
        return tempStart + '…' + tempEnd + fileType;
    } else {
        return filename;
    }
}

/**
 * 获取文件缩略图src
 */
function getFileThumbnailSrc(fileType) {
    var fileType = fileType.toLowerCase();
    for (var key in fileThumbnail) {
        if (fileThumbnail[key].includes(fileType)) {
            return fileThumbnailSrc[key];
        }
    }
    return fileThumbnailSrc['OTHER'];
}
/**
 * 获取文件背景颜色
 */
function getFileBgColorClassName(fileType) {
    var fileType = fileType.toLowerCase();
    for (var key in fileThumbnail) {
        if (fileThumbnail[key].includes(fileType)) {
            return fileBgColorClassNameObj[key];
        }
    }
    return fileBgColorClassNameObj['OTHER'];
}


function bindClickEvent(chooseId) {
    // var $item = $('.input-file');
    var $container = $('#input-content');
    $container.on('click', '#' + chooseId, function() {
        // console.log(this);
        documentSelectElement(this);
    });
}
function documentSelectElement(element) {
    var sel = window.getSelection();
    var range = document.createRange();
    range.selectNode(element);
    sel.removeAllRanges();
    sel.addRange(range);
}

function pasteToSearchInput(data) {
    for (var i = 0; i < data.length; i++) {
        var text = data[i].ClipboardInfo;
        if (data[i].ClipboardType == 1) {
            text = replaceAll(replaceAll(text, '<', '&lt;'), '>', '&gt;');
        } else if (data[i].ClipboardType == 3) {
            var html = data[i].ClipboardInfo.replace(/style="(\s|\S)*?"/g, '');
            html = html.replace(/<span(\s|\S)*?>/g, '').replace(/<\/span>/g, '');
            html = html.replace(/<br>/g, '');
            html = replaceAll(html, '<br class="Apple-interchange-newline">', '');
            var dom = document.createElement('div');
            text = dom.innerHTML = html;
        }
        console.log(text)
        insertSearchtext(text);
        // $('#search').find('input').val(text)
    }
}
// 输入框ctrl+v
function pasteToInput(data) {
    console.log(data);
    console.log(data[0].ClipboardType);
    if(currentInput === AllINPUT.SEARCH) {
        pasteToSearchInput(data)
        return
    }

    for (var i = 0; i < data.length; i++) {
        // 粘贴图片
        if (data[i].ClipboardType == 2) {
            var picInfo = '';
            try {
                picInfo = JSON.parse(data[i].ClipboardInfo);
            } catch (e) {
                picInfo = {picpath: data[i].ClipboardInfo};
            }
            var img = [{
                path: picInfo.picpath,
                picwidth: picInfo.picwidth,
                picheight: picInfo.picheight,
                picsize: picInfo.picsize
            }];
            $('#input-content').blur();
            insertPic(img);
        } else if (data[i].ClipboardType == 1) {
            var text = data[i].ClipboardInfo;
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // text = replaceAll(replaceAll(text, '<', '&lt;'), '>', '&gt;');
            insertImg(text);
        } else if (data[i].ClipboardType == 3) {
            var html = data[i].ClipboardInfo.replace(/style="(\s|\S)*?"/g, '');
            html = html.replace(/<span(\s|\S)*?>/g, '').replace(/<\/span>/g, '');
            html = html.replace(/<br>/g, '');
            html = replaceAll(html, '<br class="Apple-interchange-newline">', '');

            var dom = document.createElement('div');
            dom.innerHTML = html;
            // if (!$($(dom).find('pre')[0]).hasClass('list-left') && !$($(dom).find('pre')[0]).hasClass('list-right')) {
            //     html = html.replace(/<pre(\s|\S)*?>/g, '').replace(/<\/pre>/g, '');
            //     dom.innerHTML = html;
            // }
            if ($(dom).find('.list-left, .list-right').length > 0) {
                var domArr = $(dom).find('.list-text pre, .pop-image');
                html = '';
                for (var i = 0; i < domArr.length; i++) {
                    if (domArr[i].innerHTML.indexOf('<img class="pop-image"') !== -1) {
                        var path = /src="(\s|\S)*?"/.exec(domArr[i].innerHTML)[0].slice(5, -1);
                        if (path.indexOf('http') === 0) {
                            continue;
                        }
                        html += '<img class="input-img" src="' + domArr[i].childNodes[0].src.replace('file:///', '') + '">';
                    } else {
                        html += domArr[i].innerHTML.trim();
                        if (i < domArr.length - 1) {
                            html += '\r\n';
                        }
                    }
                }
                dom.innerHTML = html;
            }
            if ($(dom).find('.input-msg-aite').length > 0) {
                var atArr = dom.querySelectorAll('.input-msg-aite');
                for (var i = 0; i < atArr.length; i++) {
                    var textNode = document.createTextNode(atArr[i].getAttribute('data-aite-name'));
                    dom.replaceChild(textNode, atArr[i]);
                }
                html = dom.innerHTML;
            }

            if ($(dom).find('.list-full-name').length > 0) {
              /*  var atArr = dom.querySelectorAll('.list-full-name');
                for (var i = 0; i < atArr.length; i++) {
                    var textNode =  document.createTextNode(atArr[i].innerText);
                    dom.replaceChild(textNode, atArr[i]);
                } */
                html = dom.innerText;
            }
            if ($(dom).find('.acknowledge-content').length > 0) {
               /* var atArr = dom.querySelectorAll('.acknowledge-content');
                for (var i = 0; i < atArr.length; i++) {
                    var textNode =  document.createTextNode(atArr[i].innerText);
                    dom.replaceChild(textNode, atArr[i]);
                }
                html = dom.innerHTML; */
                html = dom.innerText;
            }

            if ($(dom).find('.text-msg').length > 0) {
             /*   var atArr = dom.querySelectorAll('.text-msg');
                for (var i = 0; i < atArr.length; i++) {
                    var textNode =  document.createTextNode(atArr[i].innerText);
                    dom.replaceChild(textNode, atArr[i]);
                } */
                html = dom.innerText;
            }


            if ($(dom).find('img').length > 0) {
                var imgArr = dom.querySelectorAll('img');
                for (var i = 0; i < imgArr.length; i++) {
                    if (!$(imgArr[i]).hasClass('input-img') && !$(imgArr[i]).hasClass('input-file') && !$(imgArr[i]).hasClass('input-face')) {
                        var textNode = document.createTextNode('');
                        imgArr[i].parentNode.replaceChild(textNode, imgArr[i]);
                    }
                }
                html = dom.innerHTML;
            }

            if ($(dom).find('.for-copy, #group-name, .gray, #group-bulletin, #channel-name, #channel-bulletin').length > 0) {
                html = dom.innerText;
            }


            if ($(dom).find('.input-AcknowledgementMsg').length > 0) {
                dom.removeChild(dom.querySelector('.input-AcknowledgementMsg'));
                html = dom.innerHTML;
            }
            if ($(dom).find('a').length > 0) {
                var urlArr = dom.querySelectorAll('a');
                for (var i = 0; i < urlArr.length; i++) {
                    if ($(urlArr[i]).hasClass('url-link')) {
                        var textNode = document.createTextNode(urlArr[i].innerHTML);
                        urlArr[i].parentNode.replaceChild(textNode, urlArr[i]);
                    }
                }
                html = dom.innerHTML;
            }
            if ($(dom).find('#staffName, #detail-message, #phone, #mail, #dept, #duty, #contacts-detail-name, #contacts-detail-phone, #contacts-detail-mail,#contacts-detail-dept, #contacts-detail-duty, .pop-title, .personal-detail, .my-detal, #group-detail-info, #group-name-small, #group-bulletin').length > 0) {
                var nickName = dom.querySelector('#nickName');
                var detailMessage = dom.querySelector('.gray');
                if (nickName) {
                    nickName.parentNode.removeChild(nickName);
                }
                if (detailMessage) {
                    detailMessage.parentNode.removeChild(detailMessage);
                }
                $('#decode').html('');
                $('#decode').append(dom);
                html = $('#decode').text();
                dom.innerHTML = html;
            }
            if ($(dom).find('table').length > 0) {
                var nameArr = dom.querySelectorAll('.im-name');
                for (var i = 0; i < nameArr.length; i++) {
                    nameArr[i].parentNode.removeChild(nameArr[i]);
                }
                $('#decode').html('');
                $('#decode').append(dom);
                html = $('#decode').text();
                dom.innerHTML = html;
            }
            html = html.replace(/<pre(\s|\S)*?>/g, '').replace(/<\/pre>/g, '');
            html = html.replace(/<a(\s|\S)*?>/g, '').replace(/<\/a>/g, '');
            // if ($(dom).find('img').length < 1) {
            //     $('#decode').html(html);
            //     html = $('#decode').text();
            // }
            insertImg(html);
        } else if (data[i].ClipboardType == 4) {
            var files = [{
                from: data[i].ClipboardFileFrom,
                name: data[i].ClipboardFileName,
                path: data[i].ClipboardInfo,
                size: data[i].ClipboardFileSize,
                status: data[i].ClipboardFileStatus
            }];
            insertFile(files);
        }
    }
    /* //粘贴图片
     if (data.ClipboardType == 2) {
     var img = [{
     'path': data.ClipboardInfo
     }];
     $('#input-content').blur();
     insertPic(img);
     } else if (data.ClipboardType == 1) {
     insertImg(data.ClipboardInfo);
     } else if (data.ClipboardType == 3) {
     var html = data.ClipboardInfo.replace(/style="(\s|\S)*?"/g, '').replace('</pre>', '').replace(/<pre(\s|\S)*?>/, '');
     if (html.indexOf('<img class="pop-image"') !== -1) {
     var path = /src="(\s|\S)*?"/.exec(html)[0].slice(5, -1);
     if (path.indexOf('http') === 0) {
     return;
     }
     var img = [{
     'path': path
     }];
     insertPic(img);
     } else {
     // $('#decode').html(html);
     // html = $('#decode').text();
     insertImg(html)
     }
     }else if(data.ClipboardType == 4){
     var files=[{
     from:data.ClipboardFileFrom,
     name:data.ClipboardFileName,
     path:data.ClipboardInfo,
     size:data.ClipboardFileSize,
     status:data.ClipboardFileStatus
     }]
     insertFile(files)
     } */
}

/**
 * 在搜索区执行粘贴
 * @param html
 */
function insertSearchtext(html) {
    console.log(html);
    var dthis = $('#search').find('.search-input');
    dthis.focus()
    var sel;
        // IE9 and non-IE
        sel = window.getSelection();
       // if (sel.getRangeAt && sel.rangeCount) {
        if (true) {


            // window.getSelection().setPosition($('#search').find('input')[0], $('#search').find('input')[0].childNodes.length);
            sel = window.getSelection();
            range = window.chatRange = sel.getRangeAt(0);

            range.deleteContents();
            //range.startContainer = $('#search').find('input')[0]
            //range.endContainer = $('#search').find('input')[0]
            //range.setStartAfter($('#search').find('input')[0])
           // range.insertNode($('#search').find('input')[0])
            var el = document.createElement('div');
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }

            range.insertNode(frag);
            debugger
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

}

/**
 * 在输入区插入img通用
 * @param html
 */
function insertImg(html) {
    console.log(html);
    var dthis = $('#input-content')[0];
    if (currentInput === AllINPUT.SEARCH) {
        dthis = $('#search').find('input');
    }
    var sel;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            if ($('#im-chat').hasClass('active')) {
                if ($(sel.anchorNode).hasClass('edit-box') || $(sel.anchorNode).parent().hasClass('edit-box')) {
                    range = window.chatRange = sel.getRangeAt(0);
                } else {
                    window.getSelection().setPosition(document.querySelector('.edit-box'), document.querySelector('.edit-box').childNodes.length);
                    sel = window.getSelection();
                    range = window.chatRange = sel.getRangeAt(0);
                }
            } else {
                if ($(sel.anchorNode).hasClass('input-container') || $(sel.anchorNode).parent().hasClass('input-container')) {
                    range = window.channelRange = sel.getRangeAt(0);
                } else {
                    window.getSelection().setPosition(document.querySelector('.channel-input-container'), document.querySelector('.channel-input-container').childNodes.length);
                    sel = window.getSelection();
                    range = window.channelRange = sel.getRangeAt(0);
                }
            }
            range.deleteContents();
            var el = document.createElement('div');
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }

            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();

                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != 'Control') {
        $(dthis).focus(); // 在非标准浏览器中 要先让你需要插入html的div 获得焦点
        ierange = document.selection.createRange();// 获取光标位置
        ierange.pasteHTML(html); // 在光标位置插入html 如果只是插入text 则就是fus.text="..."
        $(dthis).focus();
    }

    aiteObj.oldContStr = $('#input-content').text();// 更新old html
}
/**
 * 发送消息
 */
function sendMsg(isSendReturn, sendReturnFile) {
    clearTimeout(picTip);
    var msgObj = formatMsg();
    var msgArr = msgObj.msgArr;
    if (isSendReturn) {
        msgArr = sendReturnFile;
    }
    var msgLength = msgObj.msgLength;
    var picCount = 0,
        fileCount = 0,
        msgFileCount = 0;
    // var tempMsgId = [];
    var isAcknowledgementMsg = false;
    var acknowledgemsgmsgBody = '';
    if (!msgArr) {
        $('#too-much-pic').html('消息不能为空').removeClass('hideList');
        var picTip = setTimeout(function() {
            $('#too-much-pic').addClass('hideList');
        }, 2000);
        return;
    }

    if (msgLength > 2000) {
        $('#too-much-pic').html('最多发送2000字').removeClass('hideList');
        var picTip = setTimeout(function() {
            $('#too-much-pic').addClass('hideList');
        }, 2000);
        $('#input-content').html(msgObj.dom.innerHTML);
        return;
    }

    for (var i = 0; i < msgArr.length; i++) {
        if (msgArr[i].msgType == 3) {
            picCount += 1;
        } else if (msgArr[i].msgType == 6) {
            fileCount += 1;
        } else if (msgArr[i].msgType == 100001) { // 回执消息
            isAcknowledgementMsg = true;
            acknowledgemsgmsgBody = msgArr[i].msgBody.trim();
        }
    }
    // console.log('是否是回执消息，',isAcknowledgementMsg);
    if (isAcknowledgementMsg) {
        if (fileCount > 0 || picCount > 0) {
            $('#too-much-pic').html('回执消息只支持文本消息').removeClass('hideList');
            var picTip = setTimeout(function() {
                $('#too-much-pic').addClass('hideList');
            }, 2000);
            $('#input-content').html(msgObj.dom.innerHTML);
            return;
        }
        if (!acknowledgemsgmsgBody) {
            $('#too-much-pic').html('不能发送空回执消息！').removeClass('hideList');
            var picTip = setTimeout(function() {
                $('#too-much-pic').addClass('hideList');
            }, 2000);
            $('#input-content').html(msgObj.dom.innerHTML);
            return;
        }
    }

    if (msgArr.length === 0) {
        $('#too-much-pic').html('不能发送空回执消息！').removeClass('hideList');
        var picTip = setTimeout(function() {
            $('#too-much-pic').addClass('hideList');
        }, 2000);
        $('#input-content').html(msgObj.dom.innerHTML);
        return;
    }


    if (fileCount > 10) {
        $('#too-much-pic').html('最多支持10个文件一起发送').removeClass('hideList');
        var picTip = setTimeout(function() {
            $('#too-much-pic').addClass('hideList');
        }, 2000);
        $('#input-content').html(msgObj.dom.innerHTML);
        return;
    } else if (picCount > 10) {
        $('#too-much-pic').html('最多支持10个图片一起发送').removeClass('hideList');
        var picTip = setTimeout(function() {
            $('#too-much-pic').addClass('hideList');
        }, 2000);
        $('#input-content').html(msgObj.dom.innerHTML);
        return;
    } else {
        $('#too-much-pic').addClass('hideList');

        if (!msgArr.safe) {
            $('#too-much-pic').html('限制部分特殊文件格式如.COM .BAT等，请转换其他格式发送').removeClass('hideList');
            var picTip = setTimeout(function() {
                $('#too-much-pic').addClass('hideList');
            }, 2000);
            $('#input-content').html(msgObj.dom.innerHTML);
            return;
        }

        if (msgArr.overSize) {
            $('#too-much-pic').html('不允许发送500MB以上文件').removeClass('hideList');
            var picTip = setTimeout(function() {
                $('#too-much-pic').addClass('hideList');
            }, 2000);
            $('#input-content').html(msgObj.dom.innerHTML);
            return;
        }

        var msgs = [];
        if (msgArr.length != 0) {
            // 进行消息发送
            var result = '';
            for (var i = 0; i < msgArr.length; i++) {
                var tempTime = '';
                msgArr[i].html = msgArr[i].html.replace(/((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%()&:\/~\+#;\u4e00-\u9fa5]*[\w\-\@?^=%&\/~\+)#;\u4e00-\u9fa5])?/g, function(s, $1, index) {
                    if (s.indexOf('http://') != -1 || s.indexOf('https://') != -1) {
                        return '<a class="url-link" onclick="publicObject.openUrl(0,\'' + s + '\')">' + s + '</a>';
                    } else {
                        return '<a class="url-link" onclick="publicObject.openUrl(0,\'http://' + s + '\')">' + s + '</a>';
                    }
                });
                if (lastMsgTimeMap.get(CHATOBJ.groupId) == undefined) {
                    var now = new Date().getTime();
                    tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                    lastMsgTimeMap.put(CHATOBJ.groupId, now);
                } else {
                    var now = new Date().getTime();
                    if (now - lastMsgTimeMap.get(CHATOBJ.groupId) >= 5 * 60 * 1000) {
                        tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                        lastMsgTimeMap.put(CHATOBJ.groupId, now);
                    } else {
                        tempTime = '';
                    }
                }
                if (msgArr[i].msgType == 1) {
                    var msgId = Math.uuid();
                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': 1, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': msgArr[i].groupId || CHATOBJ.groupId, // 类型stringa
                        'grouptype': msgArr[i].groupType || CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid // 类型int
                    };
                    // status 0---发送成功         1---发送中        2---发送失败
                    var temp = tempTime + '<pre id="msg-' + msgId + '" status="1" class="list-right clearfix">' +
                        '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="' + myInfo.imUserid + '">我</div>' +
                        '<div class="list-text" data-msgtype="1" data-senderid="' + myInfo.imUserid + '"  data-status=""  data-sendtime="' + new Date().getTime() + '" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"><pre>' + msgArr[i].html + '</pre>' +
                        '<em class="loading" msgId="' + msgId + '" onclick="resendMsg(this)"><img src="../images/public/loading-ms.gif"></em></div></pre>';
                    result += temp;
                    msgs.push(msg);
                } else if (msgArr[i].msgType == 100002) { // @消息
                    var extra_aite_im_ids = msgArr[i].extra_aite_im_ids;
                    var msgId = Math.uuid();

                    var msgBody = msgArr[i].msgBody.replace(/(\[[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]+\]?)/g, function(s, $1, index) {
                        if (faces.indexOf(getFaceEng($1.replace('[', '').replace(']', ''))) != -1) {
                            return '<img class="input-face" src="../images/face/' + getFaceEng($1.replace('[', '').replace(']', '')) + '.png">';
                        } else {
                            return $1;
                        }
                    });
                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': msgArr[i].msgType, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': CHATOBJ.groupId, // 类型stringa
                        'grouptype': CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid, // 类型int
                        'extra_aite_im_ids': extra_aite_im_ids  // 字符串类型

                    };
                    // status 0---发送成功         1---发送中        2---发送失败
                    var temp = tempTime + '<pre id="msg-' + msgId + '" status="1" class="list-right clearfix">' +
                        '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="' + myInfo.imUserid + '">我</div>' +
                        '<div class="list-text"  data-msgtype="100002"  data-senderid="' + myInfo.imUserid + '"  data-status=""  data-sendtime="' + new Date().getTime() + '" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"><pre>' + msgBody + '</pre>' +
                        '<em class="loading" msgId="' + msgId + '" onclick="resendMsg(this)"><img src="../images/public/loading-ms.gif"></em></div></pre>';
                    result += temp;
                    msgs.push(msg);
                } else if (msgArr[i].msgType == 100001) { /* 消息回执 */
                    var unReadNum = '未读';
                    var that = this;
                    if (CHATOBJ.groupType == 2) {
                        acknowledgeFnObj.getGroupMemberCount(function(count) {
                            var unReadNum;// 应该去掉自己，所以总人数去掉一个
                            if (count === 1) {
                                unReadNum = '全部已读';
                                $(document).find('#msg-' + msgId + '').find('.acknowledge-unread').addClass('readed');
                            } else {
                                unReadNum = count - 1 + '人未读';// 应该去掉自己，所以总人数去掉一个
                            }
                            $('#msgArea').find('#msg-' + msgId + '').find('.acknowledge-unread').html(unReadNum);
                        });
                    }
                    var msgId = Math.uuid();
                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': 100001, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': CHATOBJ.groupId, // 类型stringa
                        'grouptype': CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid // 类型int
                    };
                    temp = acknowledgeFnObj.getSendAcknowledgeMsgTepm(unReadNum, msg, tempTime, msgId);
                    result += temp;
                    msgs.push(msg);
                } else if (msgArr[i].msgType == 3) {
                    var msgId = Math.uuid();
                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': 3, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': msgArr[i].groupId || CHATOBJ.groupId, // 类型string
                        'grouptype': msgArr[i].groupType || CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid, // 类型int
                        'picpath': msgArr[i].picPath, //
                        'picwidth': msgArr[i].picwidth,
                        'picheight': msgArr[i].picheight,
                        'picsize': msgArr[i].picsize
                    };
                    var temp = tempTime + '<div id="msg-' + msgId + '" status="1" class="list-right clearfix">' +
                        '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="' + myInfo.imUserid + '">我</div>' +
                        '<div class="list-text"  data-msgtype="3" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"  data-senderid="' + myInfo.imUserid + '"  data-status=""  data-sendtime="' + new Date().getTime() + '"><p><img class="pop-image"  data-picwidth="' + msgArr[i].picwidth + '"  data-picheight="' + msgArr[i].picheight + '" imgType="2" msgId="' + msgId + '" src="' + msgArr[i].picPath + '" style="max-width:150px;max-height:150px;"' +
                        ' onclick="viewImg(this)"></p>' +
                        '<em class="loading" msgId="' + msgId + '" onclick="resendMsg(this)"><img src="../images/public/loading-ms.gif"></em></div></div>';
                    result += temp;
                    msgs.push(msg);
                } else if (msgArr[i].msgType == 5) {
                    var msgId = Math.uuid();
                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': 5, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': msgArr[i].groupId || CHATOBJ.groupId, // 类型string
                        'grouptype': msgArr[i].groupType || CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid, // 类型int
                        LocaltionLongitude: msgArr[i].LocaltionLongitude,
                        LocaltionLatitude: msgArr[i].LocaltionLatitude,
                        LocaltionPicUrl: msgArr[i].LocaltionPicUrl,
                        LocaltionContent: msgArr[i].LocaltionContent
                    };
                    var temp = tempTime + '<div id="msg-' + msgId + '" status="1" class="list-right clearfix">' +
                        '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="' + myInfo.imUserid + '">我</div>' +
                        '<div class="list-text"  data-msgtype="3" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"  data-senderid="' + myInfo.imUserid + '"  data-status=""  data-sendtime="' + new Date().getTime() + '"><div class="map" x="' + msgArr[i].LocaltionLongitude + '" y="' + msgArr[i].LocaltionLatitude + '" positionName="' +
                        msgArr[i].LocaltionContent + '"><img src="' + msgArr[i].LocaltionPicUrl + '" width="150">' +
                        '<p>' + msgArr[i].LocaltionContent + '</p></div>' +
                        '<em class="loading" msgId="' + msgId + '" onclick="resendMsg(this)"><img src="../images/public/loading-ms.gif"></em></div></div>';
                    result += temp;
                    msg.LocaltionPicUrl = msg.LocaltionPicUrl.split('/').pop();
                    msgs.push(msg);
                } else if (msgArr[i].msgType == 6) { // 文件
                    // todo 发送消息
                    var msgId = Math.uuid();
                    var msg = msgArr[i],
                        fileAllName = msg['fileAllName'],
                        picPath = msg['picPath'];
                    var fileType = getFileType(fileAllName);
                    var fileBgColor = getFileBgColorClassName(fileType);
                    var typeClass = '   file-wrapper padding-0 ' + fileBgColor;
                    var fileSize = msg.size;
                    var nowTime = new Date().getTime();
                    var dataState = typeof (msgArr[i].needToDownload) === 'undefined' ? 'uploading' : msgArr[i].needToDownload ? 'notdown' : 'finish';
                    msgFileCount++;

                    var msg = {
                        'msgid': msgId, // 类型string
                        'msgbody': msgArr[i].msgBody, // 类型string
                        'msgtype': 6, // 类型 int 1:文本 type2:表情 type3:图片
                        'groupid': msgArr[i].groupId || CHATOBJ.groupId, // 类型string
                        'grouptype': msgArr[i].groupType || CHATOBJ.groupType, // 类型int
                        'senderid': myInfo.imUserid, // 类型int
                        'filePath': msgArr[i].filePath,
                        'fid': msgArr[i].fid,
                        'fname': msgArr[i].fname,
                        'fsize': msgArr[i].fsize || fileSize
                    };
                    var temp = tempTime +
                        '<div id="msg-' + msgId + '" status="1" class="list-right clearfix  file-box">' +
                        '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="' + myInfo.imUserid + '">我</div>' +
                        '<div class="list-text ' + typeClass + '"  data-msgtype="6" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '"  data-senderid="' + myInfo.imUserid + '"  data-status=""  data-sendtime="' + new Date().getTime() + '">' +
                        '<div class="content clearfix" data-clickfilemsgid = ' + msgId + '  data-senderid= ' + myInfo.imUserid + '>' +
                        /*   +       '<div class="content clearfix" onclick="alert(123)">' */
                        '<div class="file-class">' +
                        '<img src="../images/file/' + picPath + '56@2x.png" alt="">' +
                        '<div class="shadow">' +
                        '<canvas class="canvas" width="56" height="56">不支持canvas</canvas>' +
                        '</div>' +
                        '<div class="prompt-content file-pause hide">已暂停</div>' +
                        '<div class="prompt-content file-overdue hide">已过期</div>' +
                        '<div class="prompt-content file-deleted hide">已删除</div>' +
                        '</div>' +
                        '<p>' + fileAllName + '</p>' +
                        '</div>' +
                        '<div class="down">' +
                        '<span class="data-size" data-total="' + bytesToSize(fileSize) + '">' + bytesToSize(fileSize) + '</span>' +
                        '<span class="data-from">Aeromind桌面端</span>' +
                        '</div>' +
                        '<div class="icon-wrapper ' + ((msgArr[i].needToDownload || msgArr[i].FileStatus !== 2) ? '' : 'hide') + '" data-icon-wrapper-id=' + msgId + '  data-state=' + dataState + ' data-file-path="' + msgArr[i].filePath + '"  data-file-name="' + fileAllName + '"  data-sendtime=' + nowTime + '  data-type="2"  data-senderid= ' + myInfo.imUserid + ' data-need-to-download=' + msgArr[i].needToDownload + '>' +
                        '<em class="' + (msgArr[i].needToDownload ? 'iconn-icon-download' : 'iconn-icon-stop') + '"></em>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    result += temp;
                    // tempMsgId.push(msgId);
                    msgs.push(msg);

                    // var clickFunctionStr = 'clickFile('+msgIdStr+')';

                    if (!msgArr[0].fid) {
                        (function(i, msgId, picPath, fileName, fileSize, CHATOBJ) {
                            qFileTransferObj.getFileActiveStates(msgArr[i].filePath, function(data) {
                                if (data === 0) { // 0 ok  -1  被占用  -2 不存在
                                    msgFileCount--;
                                } else {
                                    if (data === -1) {
                                        $('#too-much-pic').html('当前文件正在被占用，无法发送').removeClass('hideList');
                                    } else if (data === -2) {
                                        $('#too-much-pic').html('该文件不存在').removeClass('hideList');
                                    }
                                    var picTip = setTimeout(function() {
                                        $('#too-much-pic').addClass('hideList');
                                    }, 2000);
                                    $('#input-content').html(msgObj.dom.innerHTML);
                                    return;
                                }

                                if (msgFileCount === 0) {
                                    _send();
                                }
                            });
                        })(i, msgId, picPath, fileAllName, fileSize, CHATOBJ);
                    } else {
                        $('#input-content').html('').focus();
                        _send();
                    }
                }
            }

            if (msgFileCount === 0) {
                $('#input-content').html('').focus();
                _send();
            }

            function _send() {
                $('#msgArea-' + msgs[0].groupid + ' #msg').append(result);

                // canvasUtils.sendMsgCanvas(msgId);

                var msgHeight = $('#msgArea-' + msgs[0].groupid + ' #msg').height();
                var a = document.getElementById('msgArea-' + msgs[0].groupid);
                if (a) {
                    a.scrollTop = msgHeight;
                }

                // 以最后一条消息为准更新会话列表详情
                var last = msgs[msgs.length - 1];
                if (last.msgtype == 1 || last.msgtype == 100002 || last.msgtype == 100003 || last.msgtype == 100001) {
                    if (last.grouptype == 1) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html(codeStr(last.msgbody));
                    } else if (last.grouptype == 2) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html(myInfo.myname + ': ' + codeStr(last.msgbody));
                    }
                    $('#session-' + last.groupid).find('.time').html(date_format(new Date().getTime(), 'HH:mm'));
                    $('#session-' + last.groupid).attr('msgTime', new Date().getTime());
                } else if (last.msgtype == 3) {
                    if (last.grouptype == 1) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html('[图片]');
                    } else if (last.grouptype == 2) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html(myInfo.myname + ': [图片]');
                    }
                    $('#session-' + last.groupid).find('.time').html(date_format(new Date().getTime(), 'HH:mm'));
                    $('#session-' + last.groupid).attr('msgTime', new Date().getTime());
                } else if (last.msgtype == 6) { // 文件
                    if (last.grouptype == 1) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html('[文件]');
                    } else if (last.grouptype == 2) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html(myInfo.myname + ': [文件]');
                    }
                    $('#session-' + last.groupid).find('.time').html(date_format(new Date().getTime(), 'HH:mm'));
                    $('#session-' + last.groupid).attr('msgTime', new Date().getTime());
                } else if (last.msgtype == 5) { // 位置
                    if (last.grouptype == 1) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html('[位置]');
                    } else if (last.grouptype == 2) {
                        $('#session-' + last.groupid).find('p').find('.session-text').html(myInfo.myname + ': [位置]');
                    }
                    $('#session-' + last.groupid).find('.time').html(date_format(new Date().getTime(), 'HH:mm'));
                    $('#session-' + last.groupid).attr('msgTime', new Date().getTime());
                }
                var isTop = $('#session-' + msgs[0].groupid).attr('isTop');
                if (isTop == 0) {
                    if (topNum == 0) {
                        $('#session').children().first().before($('#session-' + msgs[0].groupid));
                    } else {
                        $('#session').children().eq(topNum - 1).after($('#session-' + msgs[0].groupid));
                    }
                }
                // 显示发送中的状态
                $('#session-' + last.groupid).attr('msgId', last.msgid);
                $('#session-' + last.groupid).find('p').find('em').removeClass('iconn-34').addClass('iconn-35').removeClass('hideList');

                console.log(msgs);
                if (CHATOBJ.groupType === '2') {
                    msgs.forEach(function(item) {
                        item.groupname = CHATOBJ.groupName
                    });
                }
                mainObject.sendMessageList(msgs);
                if ($('#session-' + msgs[0].groupid).hasClass('active')) {
                    var sessionTop = $('#session-' + msgs[0].groupid)[0].offsetTop;
                    var sessionScrollTop = $('#session-' + msgs[0].groupid).parent().parent().scrollTop();
                    if (sessionTop < sessionScrollTop){
                        $('#session-' + msgs[0].groupid).parent().parent().scrollTop(sessionTop);
                    }
                }
                aiteObj.oldContStr = $('#input-content').text();// 更新old html
                for (var i = 0; i < msgs.length; i++) {
                    var msg = msgs[i];
                    var msgId = msg.msgid;
                    var msgType = msg.msgtype;
                    addMsgTimerWidthOutFile(msgType, msgId, msg);
                }
            }

            draftMap.remove(msgs[0].groupid);
            // $('#input-content').html('').focus();
            var msgHeight = $('#msgArea-' + msgs[0].groupid + ' #msg').height();
            // $('#msgArea-'+CHATOBJ.groupId).scrollTop(msgHeight);
        } else {
            $('#input-content').html('').focus();
        }
    }
}

/**
 * 添加消息发送定时器 去除文件的定时器检验机制
 * @param msgId
 */
function addMsgTimerWidthOutFile(msgType, msgId, msg) {
    if (msgType != 6) {
        addMsgTimer(msgId, msg);
    }
}

/**
 * 添加消息发送定时器
 * @param msgId
 */
function addMsgTimer(msgId, msg) {
    (function(_msgId, _msg) {
        var msgId = _msgId;
        var msg = _msg;
        setTimeout(function() {
            testSendFiled(msgId, msg);
        }
            , 1000 * 60);
    })(msgId, msg);
}


/**
 * 测试单条消息是否发送成功
 * @param msgId
 */

function testSendFiled(_msgId_, _msg_) {
    if ($('#msg-' + _msgId_).attr('status') == 1) {
        $('#msg-' + _msgId_).attr('status', '2');
        $('#msg-' + _msgId_).find('em').html('').removeClass('loading')
            .addClass('iconn-34');
        if ($('#session-' + _msg_.groupid).attr('msgId') == _msgId_) {
            $('#session-' + _msg_.groupid).find('p').find('em').removeClass('iconn-35').addClass('iconn-34').removeClass('hideList');
        }
        resendMsgMap.put(_msgId_, _msg_);
    }
}
/**
 * 重发消息
 * @param msgId
 */
function resendMsg(msg) {
    if ($(msg).hasClass('iconn-34')) {
        var msgId = $(msg).attr('msgId');
        $('#msg-' + msgId).attr('status', '1');
        $('#msg-' + msgId).find('em').html('<img src="../images/public/loading-ms.gif">')
            .removeClass('iconn-34').addClass('loading');
        var msg = resendMsgMap.get(msgId);
        if ($('#session-' + msg.groupid).attr('msgId') == msg.msgid) {
            $('#session-' + msg.groupid).find('p').find('em').removeClass('iconn-34').addClass('iconn-35').removeClass('hideList');
        }
        var msgList = [];
        msgList.push(msg);
        mainObject.sendMessageList(msgList);
        resendMsgMap.remove(msgId);

        var msgType = msg.msgtype;
        addMsgTimerWidthOutFile(msgType, msgId, msg);
    }
}

/**
 * 消息回包
 * @param msg
 */
function ackMsg(msg) {
    window.clearTimeout(timer[msg.msgid]);
    console.log('消息回包', msg);
    $('#msg-' + msg.msgid).find('.list-text').attr('data-status', msg.status);

    if (msg.status === 0) {
        // if ($('#msg-' + msg.msgid).attr('status') == 1) {
        $('#msg-' + msg.msgid).attr('status', 2);
        $('#msg-' + msg.msgid).find('em').html('').removeClass('loading')
            .addClass('iconn-34');

        // 更改会话列表的发送中和发送失败的icon
        if ($('#session-' + msg.groupid).attr('msgId') == msg.msgid) {
            $('#session-' + msg.groupid).find('p').find('em').removeClass('hideList').removeClass('iconn-35').addClass('iconn-34');
        }
        if (msg.msgType === 6) {
            $('#msg-' + msg.msgid).find('em').html('').removeClass('loading')
                .addClass('iconn-34').parent().removeClass('hideList');
        }
        // }
        if (msg.msgType == 3) {
            $('#msgArea-' + msg.groupid + ' #msg #' + msg.msgid +
                ' img[msgId="' + msg.msgid + '"]').attr('fileName', msg.SerFileName)
                .attr('fileExt', msg.fileExt).attr('imgType', 1);
        }
        resendMsgMap.put(msg.msgid, {
            groupid: msg.groupid,
            grouptype: msg.grouptype,
            msgbody: msg.msgbody,
            msgid: msg.msgid,
            msgtype: msg.msgType,
            senderid: msg.senderid
        });
    }

    if ($('#msg-' + msg.msgid).attr('status') == 1) {
        $('#msg-' + msg.msgid).attr('status', 0);
        $('#msg-' + msg.msgid).find('em').html('').removeClass('loading')
            .removeClass('iconn-34');

        // 更改会话列表的发送中和发送失败的icon
        if ($('#session-' + msg.groupid).attr('msgId') == msg.msgid) {
            $('#session-' + msg.groupid).find('p').find('em').addClass('hideList');
        }
    }
    if ($('#session-' + msg.groupid).attr('msgId') == msg.msgid) {
        $('#session-' + msg.groupid).find('p').find('em').addClass('hideList');
    }
    if (msg.msgType == 3) {
        $('#msgArea-' + msg.groupid + ' #msg #' + msg.msgid +
            ' img[msgId="' + msg.msgid + '"]').attr('fileName', msg.SerFileName)
            .attr('fileExt', msg.fileExt).attr('imgType', 1);
    }
}

/**
 * 格式化输入区消息
 * @returns {Array}
 */
function formatMsg() {
    var msgArr = [];

    msgArr.safe = true;
    // 1--判断是否为空消息
    var html_ = replaceAll($('#input-content').html(), '<br>', '').trim();
    if (html_ == '') {
        return [];
    }
    var container = document.querySelector('#input-content');
    var rContainer = document.createElement('div');
    var vContainer = document.createElement('div');
    vContainer.innerHTML = rContainer.innerHTML = container.innerHTML;

    var nodeArr = [].slice.call(vContainer.childNodes, 0);
    // console.log(nodeArr);

    var combineText = '';
    var combineHTML = '';
    var shouldCombine = false;
    var msgLength = 0;
    var extra_aite_im_ids = '';// 存放 @的人的字符串集合 后台用字符串格式便于存储
    var isAcknowledgementMsg = false; // 是否是回执消息
    nodeArr.forEach(function(item) {
        if (item.nodeType === 8) {
            return;
        } else if (item.nodeType === 3) {
            var text = item.nodeValue;

            var html_ = replaceAll(replaceAll(text, '<', '&lt;'), '>', '&gt;').replace(/((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%()&:\/~\+#]*[\w\-\@?^=%&\/~\+)#])?/g, function(s, $1, index) {
                if (/^(\d+)(\.\d+){1,2}$/.test(s)) {
                    return s;
                }
                if (s.indexOf('http://') != -1 || s.indexOf('https://') != -1) {
                    return '<a class="url-link" onclick="publicObject.openUrl(0,\'' + s + '\')">' + s + '</a>';
                } else {
                    return '<a class="url-link" onclick="publicObject.openUrl(0,\'http://' + s + '\')">' + s + '</a>';
                }
            });
            combineText += text;
            combineHTML += replaceAll(replaceAll(replaceAll(text, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
            shouldCombine = true;
            msgLength += text.length;
        } else if (item.className === 'input-file') {
            var safeModule = item.dataset.safe;

            var tempHtml = item.outerHTML;
            var msg = {
                'html': tempHtml,
                'msgType': 6,
                'filePath': decodeURI(item.dataset.path),
                'msgBody': '你收到一个文件',
                'draft': '[文件]',
                'fileName': decodeURI($(item).attr('data-file-name')),
                'fileAllName': decodeURI(item.dataset.fileallname),
                'picPath': decodeURI(item.dataset.picpath),
                'safe': safeModule,
                'size': item.dataset.size,
                fid: item.dataset.fid,
                fsize: item.dataset.fsize,
                fname: item.dataset.fname,
                FileStatus: 0,
                /* picPath: getFileThumbnailSrc(getFileType(item.dataset.fname)), */
                needToDownload: !(item.dataset.filePath || item.dataset.path)
            };

            if (safeModule === 'false') {
                msgArr.safe = false;
            } else if (msg.size > 500 * 1024 * 1024) {
                msgArr.overSize = true;
            }
            if (shouldCombine) {
                addCombinedMsg();
            }
            msgArr.push(msg);
        } else if (item.className === 'input-img') {
            var tempHtml = item.outerHTML;
            var msg = {
                'html': tempHtml,
                'msgType': 3,
                'picPath': item.getAttribute('src'),
                'msgBody': '你收到一张图片',
                'draft': '[图片]',
                'picwidth': parseInt(item.getAttribute('data-picwidth')),
                'picheight': parseInt(item.getAttribute('data-picheight')),
                'picsize': parseInt(item.getAttribute('data-picsize'))
            };
            if (shouldCombine) {
                addCombinedMsg();
            }
            msgArr.push(msg);
        } else if (item.className === 'input-msg-aite') { // @消息
            var imId = $(item).attr('im-id');
            extra_aite_im_ids += imId + ',';

            var tempHtml = item.outerHTML;
            var text = $(item).attr('data-aite-name');
            combineText += text + ' ';
            combineHTML += tempHtml;
            shouldCombine = true;
        } else if (item.className === 'input-AcknowledgementMsg') { // 回执消息
            var tempHtml = item.outerHTML;
            combineHTML += tempHtml;
            shouldCombine = true;
            isAcknowledgementMsg = true;
        } else {
            var text = item.outerHTML;
            var msgBody_ = '';
            if (text.indexOf('<img') != -1) {
                msgBody_ = '[' + facesMap[text.replace('<img class="input-face" src="../images/face/', '').replace('.png">', '')] + ']';
            } else {
                msgBody_ = text;
            }
            combineText += msgBody_;
            combineHTML += text;
            shouldCombine = true;
        }
    });

    if (shouldCombine) {
        addCombinedMsg();
    }

    function addCombinedMsg() {
        if (combineText.toString().trim() === '') {
            if (!isAcknowledgementMsg) {
                return;
            }
        }
        var msgType = 1;
        var msg = '';
        if (extra_aite_im_ids.length > 0) { // 说明是@消息
            msgType = 100002;
        }
        if (isAcknowledgementMsg) { // 说明是回执消息
            msgType = 100001;
            combineHTML = combineHTML.trim();
        }
        // console.log('combineHTML', combineHTML);
        msg = {
            'html': combineHTML,
            'msgType': msgType,
            msgBody: combineText,
            draft: combineText,
            // draft: decodeStr(combineText),
            extra_aite_im_ids: extra_aite_im_ids.substring(0, extra_aite_im_ids.length - 1)
        };
        msgArr.push(msg);
        combineText = '';
        combineHTML = '';
        shouldCombine = false;
        extra_aite_im_ids = '';// 清空
    }

    $(container).html('');

    console.log('切分后的消息内容：', msgArr);
    return {
        msgArr: msgArr,
        dom: vContainer,
        msgLength: msgLength
    };
}


/**
 * 发起新会话
 * @param data
 */
function newConversation(data, flag, fn) {
    console.log('发起会话', data);
    $('#session-no-record').addClass('hideList');
    var groupId;
    var avatar;
    var groupName = '';
    if (data.groupType == 1) {
        if (data.imid > myInfo.imUserid) {
            groupId = myInfo.imUserid + '_' + data.imid;
        } else if (data.imid < myInfo.imUserid) {
            groupId = data.imid + '_' + myInfo.imUserid;
        } else {
            groupId = data.imid + '_' + myInfo.imUserid;
        }
        avatar = '<div class="list-name" style="background:' + getNickNameColor(data.id) + ';">' +
            getNickName(data.staffName) +
            '</div>';
        groupName = data.staffName;
    } else if (data.groupType == 2) {
        groupId = data.groupId;
        avatar = '<div class="list-name" style="background:' +
            getNickNameColor(Math.abs(hashCode(groupId))) + ';"><em class="iconn-46"></em></div>';
        groupName = data.groupName;
    }

    var session = $('#session-' + groupId);
    // 不存在当前会话
    if (session.length == 0) {
        publicObject.getSessionInfo(groupId, function(info) {
            var isMute;
            if (info.sessionTop == 1) {
                isMute = info.SessionisMute === '0' ? 'hideList' : '';
                var temp = '<li id="session-' + groupId + '"' +
                    ' number="0" toptime="' + info.sessionTopTime + '" isTop="1">' +
                    '<span class="top"></span><span class="num hideList">0</span>' + avatar + '<div class="list-text">' +
                    '<h2><span class="session-name">' + codeStr(groupName) + '</span><span class="time">' + (info.MsgTime || '') + '</span></h2>' +
                    '<p><em class="iconn-35 hideList"></em><span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span>' +
                    '<span class="session-text">' + (info.MsgContent || '') + '</span></p><span class="iconn-mute ' + isMute + ' "></span></div></li>';
                if (topNum == 0) {
                    $('#session').prepend(temp);
                } else {
                    var children = $('#session').children();
                    for (var i = 0; i < children.length; i++) {
                        var topTime = parseInt($(children[i]).attr('topTime'));
                        if (info.sessionTopTime > topTime) {
                            $(children[i]).before(temp);
                            break;
                        }
                    }
                }
                topNum += 1;
            } else if (info.sessionTop == 0) {
                isMute = info.SessionisMute === '0' ? 'hideList' : '';
                var temp = '<li id="session-' + groupId + '"' +
                    ' number="0" isTop="0">' +
                    '<span class="num hideList">0</span>' + avatar + '<div class="list-text">' +
                    '<h2><span class="session-name">' + codeStr(groupName) + '</span><span class="time">' + (info.MsgTime || '') + '</span></h2>' +
                    '<p><em class="iconn-35 hideList"></em><span class="session-list-acknowledge-notice hideList">[回执消息]</span><span class="session-list-at-notice hideList">[有人@我]</span><span class="session-list-announcement-notice hideList">[群公告]</span><span class="red hideList">[草稿]</span>' +
                    '<span class="session-text">' + (info.MsgContent || '') + '</span></p><span class="iconn-mute ' + isMute + ' "></span></div></li>';
                if (topNum == 0) {
                    $('#session').prepend(temp);
                } else {
                    $('#session').children().eq(topNum - 1).after(temp);
                }
            }
            data.GroupId = groupId;
            data.GroupType = data.groupType;
            data.MsgSendName = data.staffName;
            data.GroupName = info.groupName;
            data.SessionTopmark = info.sessionTop;
            data.SessionisMute = info.SessionisMute;
            data.oaId = info.oaId;
            data.deptName = data.deptname ? data.deptname : data.deptName;
            data.dutyName = data.dutyname ? data.dutyname : data.dutyName;
            $('#session-' + groupId).data(data);
            $('#session-' + groupId).attr('isMute', info.SessionisMute);
            if (flag) {
                $('#im-chat').click();
                window.VueApp.$store.dispatch('setGlobalStatus', 'chat');
                $('#session-' + groupId).click();
            }
            fn && fn();
        });
    } else {
        if (flag) {
            $('#im-chat').click();
            window.VueApp.$store.dispatch('setGlobalStatus', 'chat');
            $('#session-' + groupId).click();
        }
        fn && fn();
    }
}

/**
 * 预览图片
 * @param img
 */
function viewImg(img) {
    // imgtype 1-历史或接受或已发送成功       2-发送未成功
    var imgType = $(img).attr('imgType');
    var imgObj;
    if (imgType == 1) {
        imgObj = {
            'groupId': CHATOBJ.groupId,
            'msgId': $(img).attr('msgId'),
            'serFileName': $(img).attr('fileName'),
            'fileExt': $(img).attr('fileExt')
        };
    } else {
        imgObj = {
            'groupId': CHATOBJ.groupId,
            'msgId': $(img).attr('msgId'),
            'sendPicPath': $(img).attr('src')
        };
    }
    mainObject.StartViewPic(imgObj);
}

// 输入框预览图片
function viewInputImg(img) {
    var imgList = [];
    var imgPathList = [];
    var imgIndex = '';
    var imgParentDom = $(img).parent();
    $(img).attr('this', 'true');
    imgList = $(imgParentDom).children('img.input-img');
    for (var i = 0; i < imgList.length; i++) {
        imgPathList.push($(imgList[i]).attr('src'));
        if ($(imgList[i]).attr('src') === $(img).attr('src') && $(imgList[i]).attr('this')) {
            imgIndex = i;
            $(imgList[i]).removeAttr('this');
        }
    }
    imgObj = {
        'sendPicPath': $(img).attr('src'),
        'imgPathList': imgPathList,
        'imgIndex': imgIndex
    };
    console.log(imgObj);
    mainObject.StartViewPic(imgObj);
}

// 文件预览
function preveiwFile(msgId) {
    var $iconWrapper = $('[data-icon-wrapper-id=' + msgId + ']');
    var senderId = $iconWrapper.attr('data-senderid');
    var filesGid = CHATOBJ.groupId;
    var filesMsgid = msgId;
    var filesFpath = '';

    var receivedFilePath = $iconWrapper.attr('data-file-path');
    // console.log('path:'+receivedFilePath);
    var state = $iconWrapper.attr('data-state');
    console.log('此文件的发送id,state:', senderId, state);

    if (senderId == myInfo.imUserid) { // 自己发的
        if (state == 'finish') {
            console.log(filesGid);
            qFileTransferObj.preveiwFile(filesGid, filesMsgid, receivedFilePath);
        }
    } else { // 不是我
        if (state == 'finish') { // filesFpath
            qFileTransferObj.preveiwFile(filesGid, filesMsgid, receivedFilePath);
        }
    }
}

var fileUtil2 = (function() {
    var fileSessition = [];

    return {
        download: function(gid, msgId, savePath) {
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            var fileName =$(clickDom).prev().prev().find('p').html()
            qFileTransferObj.downloadFile(gid, msgId, savePath, fileName);
        },
        pause: function(gid, msgId) {
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            qFileTransferObj.pause(gid, msgId);
        },
        finishCallback: function(msgId, path, type, gid) {
            console.log('下载或者上传完成路径：' + path);
            // console.error('此处接口有问题 秒传时候路径不全  历史下载路径为全的：' + path);
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            // 右侧触发导致的回调 此处clickDom有可能不存在，（这个节点在历史会话中，还未被加载）
            if (!clickDom) {
                return;
            }
            clickDom.dataset.state = 'finish';
            if (type === 2) {   // 2下载完成  1上传完成
                // clickDom.dataset.filePath = path + $(clickDom).parent().find('.icon-wrapper').attr('data-file-name');
                $(clickDom).attr('data-file-path', path);
            }

            setTimeout(function() {
                $('[data-icon-wrapper-id=' + msgId + ']')
                    .addClass('hideList')
                    .find('em')
                    .removeClass('iconn-icon-stop')
                    .removeClass('iconn-34')
                    .removeClass('iconn-icon-download')
                    .removeClass('iconn-icon-upload');


                $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
            }, 0);
            var $progressDom = $('#msg-' + msgId + '').find('.data-size');
            var totalSize = $progressDom.attr('data-total');
            $progressDom.html(totalSize);

            canvasUtils.finish({
                msgid: msgId
            });

            // 更改左侧列表标志为完成
            if ($('#session-' + gid).attr('msgId') == msgId) {
                $('#session-' + gid).find('p').find('em').addClass('hideList');
            }
        },
        downloadCallback: function(msgId, progress, total) {
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            var $progressDom = null;
            var totalSize = 0;
            var prog = 0;
            if (!$progressDom) {
                $progressDom = $('#msg-' + msgId + '').find('.data-size');
                totalSize = bytesToSize(total);
            }
            prog = bytesToSize(progress);
            prog && totalSize && $progressDom.html(prog + '/' + totalSize);
            canvasUtils.setState({
                processSize: progress,
                total: total,
                msgid: msgId
            });
        },
        errorCallback: function(msgId, gid) {
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            $('[data-icon-wrapper-id=' + msgId + ']')[0].dataset.state = 'error';
            $('[data-icon-wrapper-id=' + msgId + ']').find('em')
                .removeClass('iconn-icon-stop')
                .removeClass('iconn-icon-download')
                .removeClass('iconn-icon-upload')
                .addClass('iconn-34');

            // 更改左侧列表标志为失败
            if ($('#session-' + gid).attr('msgId') == msgId) {
                $('#session-' + gid).find('p').find('em').removeClass('iconn-35').addClass('iconn-34').removeClass('hideList');
            }
        },
        changeState: function(gid, msgId, state) {
            var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
            var msgStatus = JSON.parse($(clickDom).parents('.list-text').attr('data-msg')).status;
            // 当点击右侧文件列表时，会话框内文件dom节点有可能还没有生成，
            if (!clickDom) {
                return;
            }
            var senderId = $('.content').filter('[data-clickfilemsgid=' + msgId + ']').attr('data-senderid');
            var type = clickDom.dataset.type;

            if (senderId == myInfo.imUserid) { // 自己
                // if (type == PcSourceType) { // pc
                if (type == PcSourceType && clickDom.dataset.needToDownload !== 'true') { // pc
                    uploadFunc2();
                } else { // 移动端
                    downloadFunc2();
                }
            } else {
                downloadFunc2();
            }

            function downloadFunc2() {
                if (state == 0) {
                } else if (state == 1) { // 正在下载
                    clickDom.dataset.state = 'downloading';
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-download').addClass('iconn-icon-stop');
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
                } else if (state == 4) { // 下载暂停
                    clickDom.dataset.state = 'pause';
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-stop').addClass('iconn-icon-download');
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').removeClass('hide');
                } else if (state == 100) { // 下载出错
                    clickDom.dataset.state = 'error';
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em')
                        .removeClass('iconn-icon-upload')
                        .removeClass('iconn-icon-download')
                        .removeClass('iconn-icon-stop')
                        .addClass('iconn-34');
                } else if (state == 101) { // 预览文件已被删除
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-deleted').removeClass('hide');
                    $('[data-icon-wrapper-id=' + msgId + ']').attr('data-state', 'deleted');
                }
            }

            function uploadFunc2() {
                if (state == 1) { // 正在上传
                    clickDom.dataset.state = 'uploading';
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-upload').addClass('iconn-icon-stop');
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
                } else if (state == 4) { // 上传暂停
                    clickDom.dataset.state = 'pause';
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-stop').addClass('iconn-icon-upload');
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').removeClass('hide');
                } else if (state == 100) { // 上传错误
                    clickDom.dataset.state = 'error';
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
                    $('[data-icon-wrapper-id=' + msgId + ']').find('em')
                        .removeClass('iconn-icon-upload').addClass('iconn-34');

                    // 左侧列表标志失败
                    if ($('#session-' + groupID).attr('msgId') == msgId) {
                        $('#session-' + groupID).find('p').find('em').removeClass('iconn-35').addClass('iconn-34').removeClass('hideList');
                    }
                } else if (state == 101) { // 预览文件已被删除
                    $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-deleted').removeClass('hide');
                    $('[data-icon-wrapper-id=' + msgId + ']').attr('data-state', 'deleted');
                }
            }
        }
    };
})();

function trigFileEv(msgId) {
    var clickDom = $('[data-icon-wrapper-id=' + msgId + ']')[0];
    var msgStatus = JSON.parse($(clickDom).parents('.list-text').attr('data-msg')).status;
    if (!clickDom) {
        return;
    }
    var state = clickDom.dataset.state;
    var type = clickDom.dataset.type;
    var groupID = CHATOBJ.groupId;
    var senderId = clickDom.dataset.senderid;
    var expire = clickDom.dataset.expire;

    var filesFpath = $('[data-icon-wrapper-id=' + msgId + ']').attr('data-file-path');

    var msgs = [];// 存放暂停的 文件数组

    if (expire == 'true') {
        return;
    }


    if (senderId == myInfo.imUserid) { // 自己
        if (type == PcSourceType && state !== 'notdown' && clickDom.dataset.needToDownload !== 'true') { // pc
            uploadFunc();
        } else { // 移动端
            downloadFunc();
        }
    } else {
        downloadFunc();
    }

    function downloadFunc() {
        if (state == 'notdown') {
            clickDom.dataset.state = 'downloading';
            fileUtil2.download(groupID, msgId, '');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-download').addClass('iconn-icon-stop');
        } else if (state == 'downloading') {
            clickDom.dataset.state = 'pause';
            fileUtil2.pause(groupID, msgId);
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').removeClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-stop').addClass('iconn-icon-download');
        } else if (state == 'pause') {
            clickDom.dataset.state = 'downloading';
            fileUtil2.download(groupID, msgId, '');
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-download').addClass('iconn-icon-stop');
        } else if (state == 'error') {
            clickDom.dataset.state = 'downloading';
            fileUtil2.download(groupID, msgId, '');
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').removeClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-34').addClass('iconn-icon-stop');
            // 隐藏左侧列表标志
            if ($('#session-' + groupID).attr('msgId') == msgId) {
                $('#session-' + groupID).find('p').find('em').addClass('hideList');
            }
        }
    }

    function uploadFunc() {
        if (state == 'uploading') {
            clickDom.dataset.state = 'pause';
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').removeClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-stop').addClass('iconn-icon-upload');
            fileUtil2.pause(groupID, msgId);
        } else if (state == 'pause') {
            clickDom.dataset.state = 'uploading';
            var msg = {
                'msgid': msgId,
                'groupid': groupID,
                'filePath': filesFpath,
                'msgtype': 6,
                'senderid': myInfo.imUserid,
                'grouptype': CHATOBJ.groupType
            };
            msgs.push(msg);
            mainObject.sendMessageList(msgs);
            msgs.splice(0, msgs.length);
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em').removeClass('iconn-icon-upload').addClass('iconn-icon-stop');// 行为
        } else if (state == 'error') {
            clickDom.dataset.state = 'uploading';
            var msg = {
                'msgid': msgId,
                'groupid': groupID,
                'filePath': filesFpath,
                'msgtype': 6,
                'senderid': myInfo.imUserid,
                'grouptype': CHATOBJ.groupType
            };
            msgs.push(msg);
            mainObject.sendMessageList(msgs);
            msgs.splice(0, msgs.length);
            $('.content').filter('[data-clickfilemsgid=' + msgId + ']').find('.file-pause').addClass('hide');
            $('[data-icon-wrapper-id=' + msgId + ']').find('em')
                .removeClass('iconn-34').addClass('iconn-icon-stop');

            // 隐藏左侧列表标志
            if ($('#session-' + groupID).attr('msgId') == msgId) {
                $('#session-' + groupID).find('p').find('em').addClass('iconn-35').removeClass('iconn-34').removeClass('hideList');
            }
        }
    }
}


CanvasRenderingContext2D.prototype.sector = function(x, y, radius, color, sAngle, eAngle, deg) {
    // var width = this.canvas.width;
    var width = 100;
    // var height = this.canvas.height;
    var height = 100;
    this.clearRect(0, 0, 2 * x, 2 * y);
    this.beginPath();
    this.fillStyle = color;
    this.moveTo(x, y);
    this.arc(x, y, radius, sAngle, eAngle, true);
    this.closePath();
    return this;
};


var canvasUtils = (function() {
    var canvasLen = 56; // 暂时写死 待优化
    var canvasSession = [];
    return {
        start: function(obj) {
            var total = obj.total;
            var msgid = obj.msgid;
            var processSize = obj.processSize;
            var ctx = '';
            if (!msgid) {
                total = obj.total;
                msgid = obj.msgid;
                ctx = this.getCanvasCtx(msgid);
                canvasSession.push(msgid);
            }
            var percent = processSize / total;
            // console.log(percent);
            ctx.sector(canvasLen / 2, canvasLen / 2, canvasLen, 'rgba(0,0,0,0.2)', 0, Math.PI * 2 * percent, true).fill();
        },
        // finish: function (obj) {
        //     var msgid = '';
        //     var animateFlag = canvasSession.includes(msgid);
        //     if (!msgid) {
        //         msgid = obj.msgid;
        //         ctx = this.getCanvasCtx(msgid);
        //     }
        //     if (animateFlag) {
        //         ctx.sector(canvasLen / 2, canvasLen / 2, canvasLen, 'rgba(0,0,0,0.2)', 0, Math.PI * 2, true).fill();
        //
        //     } else {
        //         var deg = 0;
        //         var timer = setInterval(function () {
        //             deg++;
        //             if (deg == 100) {
        //                 clearInterval(timer);
        //             }
        //             ctx.sector(canvasLen / 2, canvasLen / 2, canvasLen, 'rgba(0,0,0,0.2)', Math.PI * 0.0, Math.PI * 2 / 100 * deg, true).fill();
        //         }, 10)
        //     }
        // },
        initOpenSessionCanvas: function() {
            var canvas = document.querySelectorAll('.canvas');
            var deg = 0;
            var ctxObj = {};
            // 初始化所有的遮罩层
            for (var i = 0; i < canvas.length; i++) {
                ctxObj[i] = canvas[i].getContext('2d');
                ctxObj[i].translate(canvasLen / 2, canvasLen / 2);
                ctxObj[i].sector(canvasLen / 2, canvasLen / 2, canvasLen / 2, 'rgba(0,0,0,0.2)', 0, Math.PI * 2, true).fill();
            }
        },
        sendMsgCanvas: function(msgid) {
            var ctx = this.getCanvasCtx(msgid);
            if (!ctx) {
                // ctx.translate(canvasLen / 2, canvasLen / 2);
                // ctx.sector(canvasLen / 2, canvasLen / 2, canvasLen, 'rgba(0,0,0,0.2)', 0, Math.PI * 2, true).fill();
            }
        },
        getCanvasCtx: function(msgid) {
            var arr = [];
            $('#' + msgid).find('canvas')[0] ? arr.push($('#' + msgid).find('canvas')[0].getContext('2d')) : false;
            if ($('#file-list-ul li a[msgid="' + msgid.substr(4) + '"]').length > 0) {
                arr.push($('#file-list-ul li a[msgid="' + msgid.substr(4) + '"]').parent().parent('.file-item').find('canvas')[0].getContext('2d'));
            }
            return arr;
        },
        setState: function(obj) {
            var total = obj.total;
            var msgid = 'msg-' + obj.msgid;
            console.log(msgid);
            var processSize = obj.processSize;
            var percent = processSize / total;
            var ctx = this.getCanvasCtx(msgid);
            ctx.forEach(function(item) {
                item.sector(canvasLen / 2, canvasLen / 2, canvasLen, 'rgba(0, 0, 0, 0.2)', 0, Math.PI * 2 * percent, true).fill();
            });
        },
        finish: function(obj) {
            var msgid = 'msg-' + obj.msgid;
            var ctx = this.getCanvasCtx(msgid);
            ctx.forEach(function(item) {
                item.clearRect(0, 0, canvasLen, canvasLen);
            });
        }
    };
})();


function initOfflineMsgNum(number) {
    console.log(number);
}

/**
 * 被邀请加入群
 * @param msg
 */
function beInvitedIntoGroup(msg) {
    console.log('被邀请加入群', msg);
    publicObject.getSessionInfo(msg.groupId, function(info) {
        var group = {
            'groupId': msg.groupId,
            'groupName': msg.groupName,
            'groupType': 2
        };
        console.log(group, info);

        var color = getNickNameColor(Math.abs(hashCode(msg.groupId)));
        var isCreate = msg.isCreate;
        if (isCreate) {
            var temp = '<li id="group-' + msg.groupId + '" ><a href="javascript:;">' +
                '<div class="im-name" style="background:' + color + ';">' +
                '<span class="iconn-46"></span></div>' +
                '<p>' + codeStr(msg.groupName) + '</p></a></li>';
            $('#myGroup-content').append(temp);

            // 发起群聊提示通知
            var groupHoldId = msg.fromUid;
            var groupHoldName = msg.fromName;
            var groupId = msg.groupId;
            var invitedUids = msg.invitedUids;
            var invitedNames = msg.invitedNames;
            var crateNum = msg.curSize - 1;
            var htmlTemp = '';
            var textTemp = '';
            var timeTemp = formatMsgTime(msg.optTime);
            var invitedImIdAry = invitedUids.split(',');
            var invitedNamesAry = invitedNames.split(',');
            if (groupHoldId == myInfo.imUserid) {
                newConversation(group, true, function() {
                    $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
                    $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
                });
                if (invitedImIdAry.length == 1) {
                    textTemp = '你邀请' + invitedNames + '加入了群聊';
                } else if (invitedImIdAry.length > 1 && invitedImIdAry.length <= 20) {
                    invitedNames = invitedNamesAry.join('、');
                    textTemp = '你邀请' + invitedNames + '加入了群聊';
                } else if (invitedImIdAry.length > 20) {
                    invitedNamesAry = invitedNamesAry.slice(0, 20);
                    invitedNames = invitedNamesAry.join('、');
                    textTemp = '你邀请' + invitedNames + '等' + crateNum + '人加入了群聊';
                }
            } else if (groupHoldId !== myInfo.imUserid) {
                newConversation(group, false, function() {
                    $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
                    $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
                });
                for (var i = 0; i < invitedImIdAry.length; i++) {
                    if (invitedImIdAry[i] == myInfo.imUserid) {
                        invitedNamesAry.splice(i, 1);
                        invitedNamesAry.unshift('你');
                        if (invitedImIdAry.length == 1) {
                            textTemp = groupHoldName + '邀请你加入了群聊';
                        } else if (invitedImIdAry.length > 1 && invitedImIdAry.length <= 20) {
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '加入了群聊';
                        } else if (invitedImIdAry.length > 20) {
                            invitedNamesAry = invitedNamesAry.slice(0, 20);
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '等' + crateNum + '人加入了群聊';
                        }
                    }
                }
            }
            htmlTemp = '' +
                '<div class="list-revoke clearfix ">' +
                '<span class="text-wrapper text-wrapper-width">' + textTemp + '</span>' +
                '</div>';


            /* setTimeout(function(){
             $('#msgArea-' + groupId+ ' #msg').append(htmlTemp);
             $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
             console.log(2)
             }, 300); */
            var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
            var st = $('#msgArea-' + groupId).scrollTop();
            if (msgHeight - st < 800) {
                $('#msgArea-' + groupId).scrollTop(msgHeight);
            }
            if ($('#group-' + msg.groupId).length > 0) {
                $('#group-' + msg.groupId).data().isInitName = true;
            }
        } else {
            // 添加群成员提示通知
            var groupHoldId = msg.fromUid;
            var groupHoldName = msg.fromName;
            var groupId = msg.groupId;
            var invitedUids = msg.invitedUids;
            var invitedNames = msg.invitedNames;
            var crateNum = msg.curSize - 1;
            var addNum = msg.newJoinSize;
            var htmlTemp = '';
            var textTemp = '';
            var timeTemp = formatMsgTime(msg.optTime);
            var invitedImIdAry = invitedUids.split(',');
            var invitedNamesAry = invitedNames.split(',');
            var tempTime = '';
            if (lastMsgTimeMap.get(msg.groupId) == undefined) {
                var now = new Date().getTime();
                tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                lastMsgTimeMap.put(msg.groupId, now);
            } else {
                var now = new Date().getTime();
                if (now - lastMsgTimeMap.get(msg.groupId) >= 5 * 60 * 1000) {
                    tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
                    lastMsgTimeMap.put(msg.groupId, now);
                } else {
                    tempTime = '';
                }
            }
            if ($('#session-' + msg.groupId).length > 0) {
                $('#session-' + msg.groupId).data().GroupName = msg.groupName;
                $('#session-' + msg.groupId).data().groupName = msg.groupName;
                $('#session-' + msg.groupId).find('.session-name').html(codeStr(msg.groupName));
                if (CHATOBJ != undefined && CHATOBJ.groupId == msg.groupId) {
                    $('#chat-title').html(codeStr(msg.groupName));

                    addCountToGroupName();

                    CHATOBJ.groupName = msg.groupName;
                }
            }
            if ($('#group-' + msg.groupId).length > 0) {
                $('#group-' + msg.groupId).data().GroupName = msg.groupName;
                $('#group-' + msg.groupId).data().groupName = msg.groupName;

                $('#group-' + msg.groupId).find('p').html(codeStr(msg.groupName));
            }

            newConversation(group, false, function() {
                $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
                $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
            });

            if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
                var invitedArr = msg.invitedNames.split(','),
                    uidArr = msg.invitedUids.split(',');
                console.log($('#group-' + msg.groupId).data());
                $('#group-detail-title').find('p').html(codeStr(msg.groupName) + '(' + msg.curSize + '人)');
                $('#group-detail-info #group-name').html(codeStr(msg.groupName));

                invitedArr.forEach(function(item, i) {
                    var hideListOr = groupDelMemberOpen == true ? '' : 'hideList';
                    var oaId = '';
                    mainObject.getOaIdByImId(uidArr[i], function(oaid) {
                        oaId = Number(oaid);
                        var temp = '<li id="groupMember-' + uidArr[i] + '" imId="' + uidArr[i] + '" groupId="' + group.groupId + '"><a href="javascript:;">' +
                            '<div class="im-name" style="background:' + getNickNameColor(oaId) + ';">' +
                            '<img class="deleteCross ' + hideListOr + '" src="../images/icon/CombinedShape@2x.png"  alt="">' +
                            getNickName(item) + '</div><p>' + item + '</p></a></li>';
                        $('#group-detail-members').find('ul').append(temp);
                    });
                });
            }

            var invitedTemp = '<li id="group-' + msg.groupId + '" ><a href="javascript:;">' +
                '<div class="im-name" style="background:' + color + ';">' +
                '<span class="iconn-46"></span></div>' +
                '<p>' + codeStr(msg.groupName) + '</p></a></li>';
            if ($('#group-' + msg.groupId).length == 0) {
                $('#myGroup-content').append(invitedTemp);
            }


            if (groupHoldId == myInfo.imUserid) {
                if (invitedImIdAry.length == 1) {
                    textTemp = '你邀请' + invitedNames + '加入了群聊';
                } else if (invitedImIdAry.length > 1 && invitedImIdAry.length <= 20) {
                    invitedNames = invitedNamesAry.join('、');
                    textTemp = '你邀请' + invitedNames + '加入了群聊';
                } else if (invitedImIdAry.length > 20) {
                    invitedNamesAry = invitedNamesAry.slice(0, 20);
                    invitedNames = invitedNamesAry.join('、');
                    textTemp = '你邀请' + invitedNames + '等' + addNum + '人加入了群聊';
                }
            } else if (groupHoldId !== myInfo.imUserid) {
                for (var i = 0; i < invitedImIdAry.length; i++) {
                    if (invitedImIdAry[i] == myInfo.imUserid) {
                        invitedNamesAry.splice(i, 1);
                        invitedNamesAry.unshift('你');
                        if (invitedImIdAry.length == 1) {
                            textTemp = groupHoldName + '邀请你加入了群聊';
                        } else if (invitedImIdAry.length > 1 && invitedImIdAry.length <= 20) {
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '加入了群聊';
                        } else if (invitedImIdAry.length > 20) {
                            invitedNamesAry = invitedNamesAry.slice(0, 20);
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '等' + addNum + '人加入了群聊';
                        }
                    } else if (invitedImIdAry[i] !== myInfo.imUserid) {
                        if (invitedImIdAry.length == 1) {
                            textTemp = groupHoldName + '邀请' + invitedNames + '加入了群聊';
                        } else if (invitedImIdAry.length > 1 && invitedImIdAry.length <= 20) {
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '加入了群聊';
                        } else if (invitedImIdAry.length > 20) {
                            invitedNamesAry = invitedNamesAry.slice(0, 20);
                            invitedNames = invitedNamesAry.join('、');
                            textTemp = groupHoldName + '邀请' + invitedNames + '等' + addNum + '人加入了群聊';
                        }
                    }
                }
            }
            if (topNum == 0) {
                $('#session').children().first().before($('#session-' + groupId));
            } else {
                $('#session').children().eq(topNum - 1).after($('#session-' + groupId));
            }
            htmlTemp = tempTime + '' +
                '<div class="list-revoke clearfix ">' +
                '<span class="text-wrapper text-wrapper-width">' + textTemp + '</span>' +
                '</div>';
            $('#msgArea-' + groupId + ' #msg').append(htmlTemp);
            $('#session-' + groupId).find('p').find('.session-text').html(textTemp);

            var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
            var st = $('#msgArea-' + groupId).scrollTop();
            if (msgHeight - st < 800) {
                $('#msgArea-' + groupId).scrollTop(msgHeight);
            }
        }
        $('#group-' + msg.groupId).data(group);
        $('#myGroup').find('.num').html($('#myGroup-content').children().length);
    });
}

/**
 * 解散群通知
 * @param msg
 */
function disbandGroup(msg) {
    console.log('解散群通知', msg);
    var groupId = msg.groupId;
    var htmlTemp = '';
    var textTemp = '';
    var timeTemp = formatMsgTime(msg.optTime);
    var tempTime = '';
    if (lastMsgTimeMap.get(msg.groupId) == undefined) {
        var now = new Date().getTime();
        tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
        lastMsgTimeMap.put(msg.groupId, now);
    } else {
        var now = new Date().getTime();
        if (now - lastMsgTimeMap.get(msg.groupId) >= 5 * 60 * 1000) {
            tempTime = '<div class="list-time">' + formatMsgTime(now) + '</div>';
            lastMsgTimeMap.put(msg.groupId, now);
        } else {
            tempTime = '';
        }
    }
    if (msg.fromUid === myInfo.imUserid) {
        // 删除会话
        if ($('#session-' + groupId).length != 0) {
            $('#session').children().remove('#session-' + groupId);
        }
        // 删除消息区
        if ($('#msgArea-' + groupId).length != 0) {
            if (!$('#msgArea-' + msg.groupId).hasClass('hideList') && msg.groupId == CHATOBJ.groupId) {
                $('#chatArea').addClass('hideList');
                $('#msg-no-record').removeClass('hideList');
                CHATOBJ = {};
            }
            $('#msgArea').children().remove('#msgArea-' + groupId);
        }
    } else {
        textTemp = msg.fromName + '解散了该群';
        htmlTemp = tempTime + '' +
            '<div class="list-revoke clearfix">' +
            '<span class="text-wrapper">' + textTemp + '</span>' +
            '</div>';
        $('#msgArea-' + groupId + ' #msg').append(htmlTemp);
        $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
        $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
        var group = {
            'groupId': msg.groupId,
            'groupName': msg.groupName,
            'groupType': 2
        };
        if (topNum == 0) {
            $('#session').children().first().before($('#session-' + groupId));
        } else {
            $('#session').children().eq(topNum - 1).after($('#session-' + groupId));
        }
        newConversation(group, false);
        var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
        var st = $('#msgArea-' + groupId).scrollTop();
        if (msgHeight - st < 800) {
            $('#msgArea-' + groupId).scrollTop(msgHeight);
        }
    }
    // 删除我的群组
    if ($('#group-' + groupId).length != 0) {
        $('#myGroup-content').children().remove('#group-' + groupId);
    }
    /* if(groupId = CHATOBJ.groupId){
     $('#msg-no-record').removeClass('hideList');
     $('#chatArea').addClass('hideList');
     } */
    if (groupDetailObj != undefined && groupId == groupDetailObj.groupId) {
        $('#members-no-record').siblings().addClass('hideList');
        $('#members-no-record').removeClass('hideList');
    }
    $('#myGroup').find('.num').html($('#myGroup-content').children().length);
}

/*
 *转让群主管理权消息提示
 *
 */
function transferGroup(data) {
    console.log('转让群主管理权消息通知', data);
    var groupHoldName = data.fromName;
    var groupId = data.groupId;
    var toName = data.toName;
    var toUid = data.toUid;
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
    newConversation({
        groupId: data.groupId,
        groupName: data.groupName,
        groupType: 2
    }, false, function() {
        $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
    });
    if (toUid === myInfo.imUserid) {
        textTemp = '你已成为新群主';
    } else {
        textTemp = toName + '已成为新群主';
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
    $('#session-' + groupId).find('h2').find('.time').html(timeTemp);

    if ($('#session-' + data.groupId).length > 0) {
        $('#session-' + data.groupId).data().GroupName = data.groupName;
    }
    if ($('#group-' + data.groupId).length > 0) {
        $('#group-' + data.groupId).data().groupName = data.groupName;
    }

    var total = $('#group-detail-members').find('ul li').length;
    $('#session-' + data.groupId).find('.session-name').html(codeStr(data.groupName));
    if (data.groupId == CHATOBJ.groupId) {
        $('#chat-title').html(codeStr(data.groupName));
        addCountToGroupName();
    }
    $('#group-' + data.groupId).find('p').html(codeStr(data.groupName));
    $('#group-detail-title').find('p').html(codeStr(data.groupName) + '(' + total + '人)');
    $('#group-detail-info #group-name').html(codeStr(data.groupName));

    if (groupDetailObj && groupId === groupDetailObj.groupId) {
        $('#group-' + data.groupId).click();
    };
    var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
    var st = $('#msgArea-' + groupId).scrollTop();
    if (msgHeight - st < 800) {
        $('#msgArea-' + groupId).scrollTop(msgHeight);
    }
}
/*
 转让群主后修改名称权力
 */
// function transferGroupHolder(data) {
//     //$("#group-detail-info .edit").removeAttr('data-pen-imid').attr('data-pen-imid',data.toUid);
//     if(data.toUid === myInfo.imUserid){
//         $("#group-detail-info .edit").removeClass('hide');
//     } else {
//         $("#group-detail-info .edit").addClass('hide');
//     }
// }


/*
 扫码加群
 */
function scanQRJoinGroup(data) {
    console.log('扫码加群通知', data);
    var creatName = data.createQRName;
    var groupId = data.groupId;
    var scannerName = data.scannerName;
    var scannerUid = data.scannerUid;
    var htmlTemp = '';
    var textTemp = '';
    var timeTemp = formatMsgTime(data.optTime);

    if (scannerUid === myInfo.imUserid) {
        textTemp = '你通过扫描二维码加入了群聊';
        newConversation({
            groupId: data.groupId,
            groupName: data.groupName,
            groupType: 2
        }, true, function() {
            $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
            $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
        });
    } else {
        textTemp = scannerName + '通过扫描二维码加入了群聊';
        htmlTemp = '' +
            '<div class="list-revoke clearfix">' +
            '<span class="text-wrapper">' + textTemp + '</span>' +
            '</div>';
        newConversation({
            groupId: data.groupId,
            groupName: data.groupName,
            groupType: 2
        }, false, function() {
            $('#msgArea-' + groupId + ' #msg').append(htmlTemp);
            $('#session-' + groupId).find('p').find('.session-text').html(textTemp);
            $('#session-' + groupId).find('h2').find('.time').html(timeTemp);
        });
    }
    if (topNum == 0) {
        $('#session').children().first().before($('#session-' + groupId));
    } else {
        $('#session').children().eq(topNum - 1).after($('#session-' + groupId));
    }
    /* htmlTemp=''
     + '<div class="list-revoke clearfix">'
     + '<span class="text-wrapper">' + textTemp + '</span>'
     + '</div>';
     $('#msgArea-' + groupId+ ' #msg').append(htmlTemp);
     $('#session-' + groupId).find('p').find('.session-text').html(textTemp); */
    if (groupDetailObj != undefined && groupId == groupDetailObj.groupId) {
        var scannerName = data.scannerName,
            scannerUid = data.scannerUid;
        $('#group-detail-title').find('p').html(codeStr(data.groupName) + '(' + JSON.parse(data.extra).size + '人)');
        $('#group-detail-info #group-name').html(codeStr(data.groupName));

        var hideListOr = groupDelMemberOpen == true ? '' : 'hideList';
        var oaId = '';
        mainObject.getOaIdByImId(scannerUid, function(oaid) {
            oaId = Number(oaid);
            var temp = '<li id="groupMember-' + scannerUid + '" imId="' + scannerUid + '" groupId="' + groupId + '"><a href="javascript:;">' +
                '<div class="im-name" style="background:' + getNickNameColor(oaId) + ';">' +
                '<img class="deleteCross ' + hideListOr + '" src="../images/icon/CombinedShape@2x.png"  alt="">' +
                getNickName(scannerName) + '</div><p>' + scannerName + '</p></a></li>';
            $('#group-detail-members').find('ul').append(temp);
        });
    };

    if ($('#session-' + groupId).length > 0) {
        $('#session-' + groupId).data().GroupName = data.groupName;
        $('#session-' + groupId).data().groupName = data.groupName;
        $('#session-' + groupId).find('.session-name').html(codeStr(data.groupName));
        if (CHATOBJ != undefined && CHATOBJ.groupId == groupId) {
            $('#chat-title').html(codeStr(data.groupName));
            addCountToGroupName();
        }
    }
    if ($('#group-' + groupId).length > 0) {
        $('#group-' + groupId).data().GroupName = data.groupName;
        $('#group-' + groupId).data().groupName = data.groupName;
        $('#group-' + groupId).find('p').html(codeStr(data.groupName));
    }

    // var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
    // $('#msgArea-' + groupId).scrollTop(msgHeight);

    var msgHeight = $('#msgArea-' + groupId + ' #msg').height();
    var st = $('#msgArea-' + groupId).scrollTop();
    if (msgHeight - st < 800) {
        $('#msgArea-' + groupId).scrollTop(msgHeight);
    };
    var color = getNickNameColor(Math.abs(hashCode(data.groupId)));
    var invitedTemp = '<li id="group-' + data.groupId + '" ><a href="javascript:;">' +
        '<div class="im-name" style="background:' + color + ';">' +
        '<span class="iconn-46"></span></div>' +
        '<p>' + codeStr(data.groupName) + '</p></a></li>';
    if ($('#group-' + data.groupId).length == 0) {
        $('#myGroup-content').append(invitedTemp);
        $('#group-' + data.groupId).data({
            groupId: data.groupId,
            groupName: data.groupName
        });
    }
    $('#myGroup').find('.num').html($('#myGroup-content').children().length);
}


/**
 * 退出群或踢出群
 * @param msg
 */
function quitOrKickoutGroup(msg) {
    console.log('退出或者踢出群', msg);
    // 用户被踢出群
    if (msg.quitType == 1) {
        publicObject.getGroupInfo(msg.groupId, function(groupInfo) {
            console.log(groupInfo);
            $('#session-' + msg.groupId).find('.session-name').html(codeStr(groupInfo.groupName));
            /* var data_ = $('#session-' + msg.groupId).data();
             data_.GroupName = groupInfo.groupName;
             var data = $('#session-' + msg.groupId).data(data_); */
            if ($('#session-' + msg.groupId).length > 0) {
                $('#session-' + msg.groupId).data().GroupName = groupInfo.groupName;
                $('#session-' + msg.groupId).data().groupName = groupInfo.groupName;
            }
            if ($('#group-' + msg.groupId).length > 0) {
                $('#group-' + msg.groupId).data().groupName = groupInfo.groupName;
                $('#group-' + msg.groupId).data().GroupName = groupInfo.groupName;
            }
            $('#session-' + msg.groupId).find('.session-name').html(codeStr(groupInfo.groupName));
            if (CHATOBJ != undefined && CHATOBJ.groupId == msg.groupId) {
                $('#chat-title').html(codeStr(groupInfo.groupName));
                addCountToGroupName();
                CHATOBJ.groupName = groupInfo.groupName;
            }
            var ids = msg.kickedUids.split(',');
            if (ids.indexOf('' + myInfo.imUserid) != -1) {
                if ($('#group-' + msg.groupId).length != 0) {
                    $('#myGroup-content').children().remove('#group-' + msg.groupId);
                    $('#myGroup').find('.num').html($('#myGroup-content').children().length);
                }
                if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
                    $('#members-no-record').siblings().addClass('hideList');
                    $('#members-no-record').removeClass('hideList');
                }
            } else {
                if ($('#group-' + msg.groupId).length != 0) {
                    $('#group-' + msg.groupId).find('p').html(codeStr(groupInfo.groupName));
                }
                if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
                    $('#group-detail-title').find('p').html(codeStr(groupInfo.groupName) + '(' + JSON.parse(msg.extra).size + '人)');
                    $('#group-detail-info #group-name').html(codeStr(groupInfo.groupName));
                    for (var i = 0; i < ids.length; i++) {
                        $('#group-detail-members').find('ul').children().remove('#groupMember-' + ids[i]);
                    }
                }
            }
        });
    }
    // 用户主动退出群
    if (msg.quitType == 2) {
        publicObject.getGroupInfo(msg.groupId, function(groupInfo) {
            console.log(groupInfo);
            $('#session-' + msg.groupId).find('.session-name').html(codeStr(groupInfo.groupName));
            // var data_ = $('#session-' + msg.groupId).data();
            // data_.GroupName = groupInfo.groupName;
            // var data = $('#session-' + msg.groupId).data(data_);
            console.log(msg.groupId);
            if (CHATOBJ != undefined && CHATOBJ.groupId == msg.groupId) {
                $('#chat-title').html(codeStr(groupInfo.groupName));
                addCountToGroupName();
                CHATOBJ.groupName = groupInfo.groupName;
            }
            if (msg.fromUid == myInfo.imUserid) {
                if ($('#group-' + msg.groupId).length != 0) {
                    $('#myGroup-content').children().remove('#group-' + msg.groupId);
                    $('#myGroup').find('.num').html($('#myGroup-content').children().length);
                }
                if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
                    $('#members-no-record').siblings().addClass('hideList');
                    $('#members-no-record').removeClass('hideList');
                }
                if ($('#session-' + msg.groupId).length !== 0) {
                    $('#session-' + msg.groupId).remove();
                }
                if ($('#msgArea-' + msg.groupId).length !== 0) {
                    if (!$('#msgArea-' + msg.groupId).hasClass('hideList')) {
                        $('#chatArea').addClass('hideList');
                        $('#msg-no-record').removeClass('hideList');
                        CHATOBJ = {};
                    }
                    $('#msgArea-' + msg.groupId).remove();
                }
            } else {
                if ($('#group-' + msg.groupId).length != 0) {
                    $('#group-' + msg.groupId).find('p').html(codeStr(groupInfo.groupName));
                }
                if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
                    $('#group-detail-title').find('p').html(codeStr(groupInfo.groupName) + '(' + JSON.parse(msg.extra).size + '人)');
                    $('#group-detail-info #group-name').html(codeStr(groupInfo.groupName));
                    $('#group-detail-members').find('ul').children().remove('#groupMember-' + msg.fromUid);
                }
            }
        });
    }
}

/**
 * 修改群信息
 * @param msg
 */
function editGroupInfoNotify(msg) {
    console.log('修改群信息通知', msg);
    if ($('#session-' + msg.groupId).length != 0) {
        if (JSON.parse(msg.extra).groupName != undefined) {
            $('#session-' + msg.groupId).find('.session-name').html(codeStr(JSON.parse(msg.extra).groupName));
            var data = $('#session-' + msg.groupId).data();
            data.GroupName = JSON.parse(msg.extra).groupName;
            $('#session-' + msg.groupId).data(data);
            if (CHATOBJ != undefined && CHATOBJ.groupId == msg.groupId) {
                CHATOBJ.groupName = JSON.parse(msg.extra).groupName;
            }
        }
    }
    if (CHATOBJ != undefined && msg.groupId == CHATOBJ.groupId) {
        if (JSON.parse(msg.extra).groupName != undefined) {
            $('#chat-title').html(codeStr(JSON.parse(msg.extra).groupName));
            addCountToGroupName();
        }
    }
    if ($('#group-' + msg.groupId).length != 0) {
        if (JSON.parse(msg.extra).groupName != undefined) {
            $('#group-' + msg.groupId).find('p').html(codeStr(JSON.parse(msg.extra).groupName));
            var data = $('#group-' + msg.groupId).data();
            // data.groupName = JSON.parse(msg.extra).groupName;
            $('#group-' + msg.groupId).data().groupName = JSON.parse(msg.extra).groupName;
        }
    }
    if (groupDetailObj != undefined && msg.groupId == groupDetailObj.groupId) {
        if (JSON.parse(msg.extra).groupName != undefined) {
            var total = $('#group-detail-members').find('ul li').length;
            $('#group-detail-title').find('p').html(codeStr(JSON.parse(msg.extra).groupName) + '(' + total + '人)');
            $('#group-detail-info #group-name').html(codeStr(JSON.parse(msg.extra).groupName));
        }
    }
}


/**
 * 初始化表情包
 */
function initEmoji() {
    for (var i = 0; i < faces.length; i++) {
        var temp = '<li><img src="../images/face/' + faces[i] + '.png" onclick="insertFace(this)" tips ="' + facesMap[faces[i]] + '" ></li>';
        $('#faces').append(temp);
    }
}

function openChat() {
    $('#im-chat').click();
    var children = $('#session').children();
    for (var i = 0; i < children.length; i++) {
        var num = $(children[i]).attr('number');
        if (num != 0) {
            $(children[i]).click();
            break;
        }
    }
}

function syncUnreadMassageCount(data) {
    console.log('同步未读消息', data);
    var groupId = data.GroupId;
    var sessionData = $('#session-' + groupId).data();
    console.log('同步未读消息', sessionData);
    mainObject.setMsgReaded(groupId);
    var num = $('#session-' + groupId).attr('number');
    if (num === '0' || num === '') {
        return;
    }
    num = parseInt(num);

    $('#session-' + groupId).find('.session-list-announcement-notice').addClass('hideList');
    $('#session-' + groupId).find('.session-list-at-notice').addClass('hideList');
    $('#session-' + groupId).find('.session-list-acknowledge-notice').addClass('hideList');


    $('#session-' + groupId).attr('number', 0);
    $('#session-' + groupId).find('.num').addClass('hideList');

    if ($('#session-' + groupId).attr('isMute') === '0') {
        var totalNum = parseInt($('#im-chat').attr('number'));
        console.log(totalNum, num);
        totalNum = totalNum - num;
        $('#session-' + groupId).find('.num').text('0');
        $('#im-chat').attr('number', totalNum);
        if (totalNum > 0 && totalNum <= 999) {
            $('#im-chat').find('span').html(totalNum).removeClass('hideList');
        } else if (totalNum > 999) {
            $('#im-chat').find('span').html('999+').removeClass('hideList');
        } else if (totalNum === 0) {
            $('#im-chat').find('span').html('0').addClass('hideList');
        }
        if (sessionData.GroupType == 1) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.oaId,
                'name': sessionData.MsgSendName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                'sendTime': sessionData.MsgTimellong || 0
            }
        } else if (sessionData.GroupType == 2) {
            var unReadBoxData = {
                'type': sessionData.GroupType,
                'id': sessionData.GroupId,
                'name': sessionData.GroupName,
                'sessionid': sessionData.GroupId,
                'unreadmsgcount': $('#session-' + sessionData.GroupId).attr('number') || 0,
                'sendTime': sessionData.MsgTimellong || 0
            }
        }
        console.log('未读数上报',unReadBoxData)
        mainObject.messageBoxUnreadMsgSet(unReadBoxData);
        mainObject.setMacBadge(totalNum.toString(), false);
    }
}

/**
 * 初始化特殊消息Map
 * @param data
 */
function setSessionSpecialMessageMap(data) {
    data.forEach(function(item) {
        specialMassageCountMap.put(item.GroupId, {
            AtMeCount: item.AtMeCount,
            GroupAnnouncementCount: item.GroupAnnouncementCount,
            ReportCount: item.ReportCount
        });
    });
}

function initSessionSpecialMessage() {
    specialMassageCountMap.each(function(key, data) {
        if (data.AtMeCount !== 0) {
            $('#session-' + key + ' .session-list-at-notice').removeClass('hideList');
        }
        if (data.GroupAnnouncementCount !== 0) {
            $('#session-' + key + ' .session-list-announcement-notice').removeClass('hideList');
        }
        if (data.ReportCount !== 0) {
            $('#session-' + key + ' .session-list-acknowledge-notice').removeClass('hideList');
        }
    });
}

$(document).on('click.data.icon.wrapper', '[data-icon-wrapper-id]', function(e) {
    e.stopPropagation();
    var $this = $(this);
    var msgId = $this.attr('data-icon-wrapper-id');

    trigFileEv(msgId);
});

$(document).on('click', '.file-wrapper', function(e) {
    var $this = $(this);
    var msgId = $this.find('.content').attr('data-clickfilemsgid');
    var state = $this.find('[data-icon-wrapper-id]').attr('data-state');
    if (state == 'finish') {
        preveiwFile(msgId);
    } else {
        trigFileEv(msgId);
    }
});

/**
 * 获取元素文本节点的内容
 *
*/
function getTextNodeContent(node){
    let children=node.childNodes,
        str="";
    for(let i=0,length=children.length;i<length;i++){
        if(children[i].nodeType === 3 && children[i].textContent!="\n"){
            str+=children[i].textContent;
        }else if(children[i].nodeType === 1 && children[i].childNodes.length ==0 ){
            str+='[' + facesMap[children[i].outerHTML.replace('<img class="input-face" src="../images/face/', '').replace('.png">', '')] + ']'
        }
    }
    return str;
}

/**
 * 渲染应用通知页面
 * @param list 列表
 * @param flag 是否已经渲染过
 */
function renderApplicationMessageList(list, flag) {
    var showTime = false,
        temp = '',
        newMessageFlag = false;

    if (!flag && list.length === 0) {
        $('.application-no-record').removeClass('hideList');
        $('.application-message-list-area').html('');
        $('.application-message-list-area').addClass('hideList');
        return;
    }
    $('.application-no-record').addClass('hideList');
    if (!flag) {
        $('.application-message-list-area').html('');
    }
    $('.application-message-list-area').removeClass('hideList');
    // applicationMessageNum += list.length;

    list.forEach((item, index) => {
        applicationMessageNum++;
        var content = JSON.parse(item.content);
        var detailContent = '';
        if (content.length === 1 && content[0].elementId === 8) { // 只有一个日期起止组件
            var detail = JSON.parse(content[0].detail);
            if (content[0].format === 'yyyy-MM-dd') {
                detailContent = `
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">开始时间</div>：${formatDate(detail.beginDate)}</div>
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">结束时间</div>：${formatDate(detail.endDate)}</div>
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">总时长</div>：${detail.days}天${detail.hours}时${detail.minutes}分</div>
                    `;
            } else {
                detailContent = `
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">开始时间</div>：${formatDate(detail.beginDate)} ${formatTime(detail.beginTime)}</div>
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">结束时间</div>：${formatDate(detail.endDate)} ${formatTime(detail.endTime)}</div>
                    <div class="application-message-item-detail"><div class="application-message-item-detail-title">总时长</div>：${detail.days}天${detail.hours}时${detail.minutes}分</div>
                    `;
            }

        } else if (content.length === 1 && content[0].elementId === 6) { // 只有一个日期单组件
            detailContent = `<div class="application-message-item-detail"><div class="application-message-item-detail-title">${content[0].title}</div>：${date_format(content[0].detail, content[0].format)}</div>`;
        } else if (content.length === 1 && !content[0].format) { // 只有一个非日期组件
            detailContent = `<div class="application-message-item-detail"><div class="application-message-item-detail-title">${content[0].title}</div>：${content[0].detail}</div>`;
        } else if (content.length > 1) { // 由多个组件
            content.forEach(det => {
                if (det.elementId === 8) {
                    detailContent += `<div class="application-message-item-detail"><div class="application-message-item-detail-title">开始时间</div>：`;
                } else {
                    detailContent += `<div class="application-message-item-detail"><div class="application-message-item-detail-title">${det.title}</div>：`;
                }
                if (det.elementId !== 8 && det.elementId !== 6) {
                    detailContent += `${det.detail}</div>`;
                } else if (det.elementId === 6) {
                    detailContent += `${date_format(det.detail, det.format)}</div>`;
                } else if (det.elementId === 8) {
                    if (det.format === 'yyyy-MM-dd HH:mm') {
                        detailContent += `${formatDate(JSON.parse(det.detail).beginDate)} ${formatTime(JSON.parse(det.detail).beginTime)}</div>`;
                    } else {
                        detailContent += `${formatDate(JSON.parse(det.detail).beginDate)}</div>`;
                    }
                }
            });
        }
        var applicationMessageItem =
            `<div class="application-message-item">
                <div class="application-message-item-module">审批</div>
                <div class="application-message-item-content">
                    <div class="application-message-item-title">${item.title}</div>
                    ${detailContent}
                </div>
            </div>`;
        if (applicationMessageConfig.needTimeSign || (!flag && index === 0) || applicationMessageConfig.timeArr[applicationMessageConfig.timeArr.length - 1] - item.sendTime > 300000) {
            applicationMessageConfig.timeArr.push(item.sendTime);
            showTime = true;
            applicationMessageConfig.needTimeSign = false;
        } else {
            showTime = false;
        }
        var tempTime = showTime ? '<div class="list-time">' + formatMsgTime(item.sendTime) + '</div>' : '';
        temp += tempTime + applicationMessageItem;
        if (applicationMessageNum === parseInt($('.application-message-list-history .num').html())) {
            temp += `<div class="application-message-new-message-sign">以上为新通知</div>`
            applicationMessageConfig.needTimeSign = true;
        }
    });
    if (list.length === 20 || scrollToApplication) {
        var moreSign = '<div class="application-message-list-more"><a href="javascript:;" onclick="_loadMoreApplicationMessage()">查看更多消息</a></div>';
        temp += moreSign;
        firstMsgTimeMap.put('applicationMessage', list[list.length - 1].sendTime);
    }
    $('.application-message-list-area').append(temp);

    setTimeout(function() {
        var unReadApplicationNum = parseInt($('.application-message-list-history .num').html());
        if (unReadApplicationNum === 0) {
            return;
        }
        var target = $('.application-message-item')[unReadApplicationNum - 1];
        if (!target) {
            if (!applicationMessageConfig.refreshing) {
                $('.application-message-list-history').removeClass('hideList');
            }
            return;
        }
        var top = target.offsetTop;
        var height = $(target).height() / 2;
        if (!applicationMessageConfig.refreshing && unReadApplicationNum > 0 && top + height - $('.application-message-list').height() > $('.application-message-list').scrollTop()) {
            $('.application-message-list-history').removeClass('hideList');
        }
    }, 0);

    if (scrollToApplication) {
        setTimeout(function() {
            goToNewApplication();
            scrollToApplication = false;
        }, 0);
    }


    function formatDate(str) { // 格式化日期 yyyy-MM-dd
        let year = str.substr(0, 4);
        let month = str.substr(4, 2);
        let day = str.substr(6, 2);
        return year + '-' + month + '-' + day;
    }

    function formatTime(str) { // 格式化时间 00:00
        let hour = str.substr(0, 2);
        let minute = str.substr(2, 2);
        return hour + ':' + minute;
    }

}

function setApplicationMessageMute() {
    mainObject.setNoticeCardMessageDisturb(false, noticeCardMsg.data.module.id);
}
function cancelApplicationMessageMute() {
    mainObject.setNoticeCardMessageDisturb(true, noticeCardMsg.data.module.id);
}
function deleteApplicationMessage() {
    mainObject.setNoticeCardMessageDelete(true, '');
    console.log('上报工作通知已读', noticeCardMsg.data.module.messageIds.join(','));
    mainObject.setNoticeCardReadMessage(noticeCardMsg.data.module.moduleType,noticeCardMsg.data.module.messageIds.join(','));
    var num_ = $('#session-applicationMessage').attr('number');
    var total = parseInt($('#im-chat').attr('number')) - num_;
    if (CHATOBJ.groupType === 'applicationMessage') {
        CHATOBJ = {};
        $('#chat-title').html('');
        $('#chat-deptAndDuty').addClass('hideList');
        $('.application-message-list').addClass('hideList');
        $('.application-message-list-area').html();
        $('#msg-no-record').removeClass('hideList');
        $('#chatArea').addClass('hideList');
        $('.application-message-list-new').addClass('hideList');
        $('.application-message-list-history').addClass('hideList');
    }
    $('#im-chat').attr('number', total);
    if (total > 0 && total <= 999) {
        $('#im-chat').find('.num').html(total).removeClass('hideList');
    } else if (total > 999) {
        $('#im-chat').find('.num').html('999+').removeClass('hideList');
    } else {
        $('#im-chat').find('.num').html('0').addClass('hideList');
    }
    var unReadBoxData = {
        'type': 4,
        'id': 'applicationMessage',
        'name': '',
        'sessionid': 'applicationMessage',
        'unreadmsgcount': 0,
        'sendTime': 0
    }
    console.log('未读数上报',unReadBoxData)
    mainObject.messageBoxUnreadMsgSet(unReadBoxData);
    mainObject.setMacBadge(total.toString(), false);
    $('#session-applicationMessage').remove();
}
function goToNewApplication() {
    var unReadApplicationNum = parseInt($('.application-message-list-history .num').html());
    if (applicationMessageNum >= unReadApplicationNum) {
        var target = $('.application-message-new-message-sign')[0];
        var top = target.offsetTop;
        var height = $(target).height();
        $('.application-message-list').scrollTop(top + height - $('.application-message-list').height());
        console.log(top, height);
    } else {
        var pageSize = unReadApplicationNum - applicationMessageNum;
        mainObject.getNoticeOfApplicationMessageList(noticeCardMsg.data.module.moduleName, 0, firstMsgTimeMap.get('applicationMessage') - 1, myInfo.companyId, 1, pageSize + 1);
        scrollToApplication = true;
        $('.application-message-list-more').remove();
    }
}
function refreshApplicationMessage() {
    // $('.application-message-list-new')
    // $('.application-message-list-area').html('');
    // applicationMessageNum = 0;
    // mainObject.getNoticeOfApplicationMessageList(noticeCardMsg.data.module.moduleName, 0, 0, myInfo.companyId, 1, 20);
    //
    // setTimeout(function() {
    //     mainObject.setNoticeCardReadMessage(noticeCardMsg.data.module.moduleType, noticeCardMsg.data.module.messageIds.join(','));
    //     noticeCardMsg.data.module.messageIds = [];
    // }, 1000);
    //
    // var _num_ = parseInt($(session).attr('number'));
    // if (_num_ > 0) {
    //     $('.application-message-list-history .num').html(_num_);
    //     $('.application-message-list-history').removeClass('hideList');
    //     setUnreadMsg(_num_);
    // }
    applicationMessageConfig.refreshing = true;
    CHATOBJ.groupType = '';
    openSession($('.session-applicationMessage'));
}
