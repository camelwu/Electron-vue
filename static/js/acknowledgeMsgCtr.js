/**
 * Created by shangkuikui on 2017/4/20.
 */
$(function() {
    acknowledgeFnObj.msgId = '';
    acknowledgeFnObj.$msgArea = $('#msgArea');

    $(document).on('click.data.msgtype', '.acknowledge-unread', function(e) {
        if (CHATOBJ.groupType != 2) { // 不是群消息
            return;
        }
        var $this = $(this);
        acknowledgeFnObj.senderId = $this.attr('sender-id');
        if (acknowledgeFnObj.senderId != myInfo.imUserid) {
            return;
        }
        // acknowledgeFnObj.$container.removeClass('hideList');
        // var style = getComputedStyle(acknowledgeFnObj.$container[0], null);
        // var tempmsgId = $this.attr('msg-id');
        acknowledgeFnObj.msgId = $this.attr('msg-id');

        mainObject.showReadAndUnreadMemberInfo();
        mainObject.getMsgReadAndUnReadMembers(CHATOBJ.groupId, acknowledgeFnObj.msgId, false);

        // var left = e.pageX - parseInt(style.width);
        // var top = e.pageY - parseInt(style.height);
        /* acknowledgeFnObj.$container.css({
         'left': left,
         top: top

         }); */
        // refreshUnreadlist();
        // e.stopPropagation()
    });

    /**
     * 发送回执消息
     */
    $(document).on('click.data.msgtype', '#sendAcknowledgementMsg', function(e) {
        // var temp = '<span data-msgtype="100001"  contenteditable="false" class="input-AcknowledgementMsg">[回执消息]</span>';

        var imgDom = document.createElement('img');
        imgDom.ondragstart = function() {
            return false;
        };
        var dpr = window.devicePixelRatio;
        publicObject.convertNameToPicture('[回执消息]', dpr, function(obj) {
            // console.log(obj);
            var imsrc = obj.picPath;
            imgDom.src = imsrc;
            var picHeight = obj.picHeight;
            if (dpr >= 2) {
                picHeight = picHeight / 2;
            }
            imgDom.style.height = picHeight + 'px';
        });
        var $imgDom = $(imgDom);
        $imgDom.attr('class', 'input-AcknowledgementMsg');
        $imgDom.attr('data-msgtype', '100001');

        var $acknowledgeNode = $('#input-content').find('.input-AcknowledgementMsg');
        if ($acknowledgeNode[0]) {
            $acknowledgeNode.remove();
        } else {
            $('#input-content').prepend(imgDom);
            var obj = $('#input-content')[0];
            window.getSelection().setPosition(obj, obj.childNodes.length);
        }
        $('#input-content').focus();

        var selObj = document.getSelection();
        var selRange = selObj.getRangeAt(0);
        commonAiteObj.updateRelAndSel(selObj, selRange);

        aiteObj.oldContStr = $('#input-content').text();// 更新old html
    });
});

var acknowledgeFnObj = {
    '$container': '',
    '$readededTab': '',
    '$readedCon': '',
    '$unReadedTab': '',
    '$unReadedCon': '',
    'msgId': '',
    'senderId': '',
    '$msgArea': '',
    'msgIdsArr': [],
    /**
     * 接收到消息的模板
     * @param msgBody
     * @param grouptype
     * @param senderId
     * @param msgId
     * @param groupId
     * @returns {string}
     */
    getReceiveAcknowledgeMsgTepm: function(msgBody, grouptype, senderId, msgId, groupId, shouldHide) {
        // mainObject.queryMsgUnReadCount(CHATOBJ.groupId, msgId);//查询未读人数
        var temp = '';
        var unReadNum = ' 已读';
        var float_ = 'fl';

        var readedClass = 'readed';
        /*  if (grouptype == 2 && senderId == myInfo.imUserid) {//群聊
         unReadNum = ' 999人未读';
         mainObject.queryMsgUnReadCount(groupId,msgId);//查询未读人数
         } */
        if (senderId == myInfo.imUserid) { // 只有是自己发的时候 才需要查询是未读还是已读，否则只要看到的都是已读。
            // unReadNum = ' 999人未读||未读';
            unReadNum = '  ';
            // mainObject.queryMsgUnReadCount(groupId, msgId);//查询未读人数
            acknowledgeFnObj.msgIdsArr.push(msgId);
            readedClass = '';
            // acknowledgeMsgIdsArr.push(msgId);
        }


        if (senderId == myInfo.imUserid) {
            float_ = 'fr';
        }
        temp += '<div class="acknowledge clearfix">' +
            '<div class=" list-text acknowledge-content" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '" ><p>' + msgBody + '</p>' +
            '<em class="iconn-34 ' + shouldHide + '" msgId="' + msgId + '" onclick="resendMsg(this)"></em>' +
            '</div>' +
            '</div>' +
            '<div clearfix>' +
            '<div class="acknowledge-down ' + float_ + '"><span>回执消息 :</span><span class="acknowledge-unread ' + readedClass + '" msg-id="' + msgId + '"  sender-id="' + senderId + '">' + unReadNum + '</span></div>' +
            '</div>' +
            '</pre>';
        return temp;
    },
    /**
     * 查询群成员数量
     * @param cb
     */
    getGroupMemberCount: function(cb) {
        // console.log(CHATOBJ);
        // 群成员数量
        mainObject.getGroupMemberCount({'GroupId': CHATOBJ.groupId}, function(data) {
            var count = data.GroupMemCount;
            if (count < 0) {
                klogger.error('请求群成员数量出错');
            }
            if (typeof cb === 'function') {
                cb(count);
            }
        });
    },
    /**
     * 发送回执消息模板
     * @param unReadNum
     * @param msg
     * @param tempTime
     * @param msgId
     * @returns {string}
     */
    getSendAcknowledgeMsgTepm: function(unReadNum, msg, tempTime, msgId) {
        // status 0---发送成功         1---发送中        2---发送失败

        var msgBody = msg.msgbody.replace(/(\[[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]+\]?)/g, function(s, $1, index) {
            if (faces.indexOf(getFaceEng($1.replace('[', '').replace(']', ''))) != -1) {
                return '<img class="input-face" src="../images/face/' + getFaceEng($1.replace('[', '').replace(']', '')) + '.png">';
            } else {
                return $1;
            }
        });
        var temp = tempTime + '<pre id="msg-' + msgId + '" status="1" class="list-right clearfix">' +
            '<div class="list-name" style="background:' + getNickNameColor(myInfo.myid) + ';" imId="'+ msg.senderid +'" oaId="' + myInfo.myid + '">我</div>' +
            '<div class="acknowledge clearfix">' +
            '<div class=" list-text acknowledge-content"  data-msgtype="100001" data-msg="' + encodeCharacterEntities(JSON.stringify(msg)) + '" data-sendtime="' + new Date().getTime() + '"  data-senderid="' + myInfo.imUserid + '" ><pre>' + msgBody + '</pre>' +
            '<em class="loading" msgId="' + msgId + '" onclick="resendMsg(this)"><img src="../images/public/loading-ms.gif"></em>' +
            '</div>' +
            '</div>' +
            '<div class="clearfix">' +
            '<div class="acknowledge-down fr"><span>回执消息 :</span><span class="acknowledge-unread" msg-id="' + msgId + '" sender-id="' + myInfo.imUserid + '">' + unReadNum + '</span></div>' +
            '</div>' +
            '</pre>';

        return temp;
    },

    /**
     * 已读回执回调
     * @param obj
     * @constructor
     */
    GetMsgPeerReadedCallback: function(obj) {
        var msgId = obj.msgId;
        var $unreadCon = this.$msgArea.find('#msg-' + msgId + '').find('.acknowledge-unread');
        var oldnumstr = $unreadCon.html();
        if (!oldnumstr) { // 表示当前会话没有打开过，所以不用实时更新，在下一次打开会话时候会刷新列表
            return;
        }
        if (oldnumstr == '未读') {
            $unreadCon.html('已读');
            $unreadCon.addClass('readed');
        } else {
            var oldnum = parseInt(oldnumstr.replace(/人未读/, ''));
            if (oldnum == 1) {
                if (CHATOBJ.groupType == 2) {
                    $unreadCon.html('全部已读');
                } else {
                    $unreadCon.html('已读');
                }
                $unreadCon.addClass('readed');
            } else {
                $unreadCon.html('' + (oldnum - 1) + '人未读');
            }
        }
    },
    /**
     * CHATOBJ.groupId
     * 查询多条回执消息的未读数量
     * @constructor
     */
    queryMsgUnReadCount: function(groupid) {
        var that = this;
        mainObject.queryMsgUnReadCount(groupid, that.msgIdsArr);
        that.msgIdsArr = [];
    },
    /**
     * 查询多条回执消息的未读数量的回调
     * @constructor
     */
    GetUnReadCountResultCallback: function(arr) {
        var that = this;
        arr.forEach(function(obj) {
            var msgId = obj.msgId;
            var unreadNum = parseInt(obj.unReadNum);
            // var $unreadCon = that.$msgArea.find('#msg-' + msgId + '').find('.acknowledge-unread');
            var $unreadCon = $(document).find('#msg-' + msgId + '').find('.acknowledge-unread');
            var retStr = '';
            var readedClass = '';
            // var groupType = CHATOBJ.groupType;
            var groupType = '';
            if (!groupType) {
                groupType = $('#session-' + obj.groupId).data().GroupType;
            }
            if (unreadNum === 0) {
                retStr = '已读';
                if (groupType == 2) { // 群组
                    retStr = '全部已读';
                }
                readedClass = 'readed';
            } else if (unreadNum > 0) {
                if (groupType == 2) { // 群组
                    retStr = unreadNum + '人未读';
                } else {
                    retStr = '未读';
                }
            }
            $unreadCon.html(retStr);
            $unreadCon.addClass(readedClass);
        });
    }
};
