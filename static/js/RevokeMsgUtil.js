/**
 * Created by shangkuikui on 2017/3/28.
 */

(function($, window) {
    let groupType;
    function RevokeMsgUtil() {

    }
    RevokeMsgUtil.prototype = {
        revoke: function(obj) {
            if (!$('.krightmenu').hasClass('hideList')) {
                $('.krightmenu').addClass('hideList');
            }

            var senderId = obj.fromUid;
            var nickName = obj.nickName;
            var GroupId = obj.GroupId;
            var MsgId = obj.msgId;
            var optTime = obj.optTime;
            var extra = obj.extra;
            // console.log(nickName);
            groupType = $(`#session-${GroupId}`).data().GroupType;
            var msgDom = $('#msg-' + MsgId);

            var tempObjStr = this.getTemplate(senderId, nickName);
            $('#msgArea-' + GroupId + ' #msg').find('#msg-' + MsgId).after(tempObjStr.htm);
            $('#msgArea-' + GroupId + ' #msg').find('#msg-' + MsgId).remove();
            console.log('移除节点：' + msgDom);
            // $('#msgArea-' + GroupId+ ' #msg').append(tempObjStr.htm);
            $('#session-' + GroupId).find('p').find('.session-text').html(tempObjStr.sessiontext);
            $('#input-content').focus();
            window.getSelection().setPosition($('#input-content')[0], $('#input-content')[0].childNodes.length);
        },
        getTemplate: function(senderId, nickName) {
            var htm = '';
            var temp = '';
            if (senderId == myInfo.imUserid) {
                temp = '你撤回了一条消息';
            } else {
                if (groupType == 1) {
                    temp = '对方撤回了一条消息';
                } else {
                    temp = nickName + '撤回了一条消息';
                }
            }
            htm += '' +
               '<div class="list-revoke clearfix">' +
               '<span class="text-wrapper">' + temp + '</span>' +
               '</div>';
            return {
                sessiontext: temp,
                htm: htm
            };
        }
    };
    window.RevokeMsgUtil = new RevokeMsgUtil();
})($, window);
