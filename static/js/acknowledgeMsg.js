/**
 * Created by shangkuikui on 2017/4/17.
 */
$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.qReadAndUnReadMemberInfoObject = channel.objects.qReadAndUnReadMemberInfoObject;
        window.mainObject = channel.objects.qMainObject;
        $(window).blur(function() {
            // 关闭弹窗
            qReadAndUnReadMemberInfoObject.CloseWnd();
        });
        // qReadAndUnReadMemberInfoObject.getMsgReadAndUnReadMembers(CHATOBJ.groupId, acknowledgeFnObj.msgId);
        qReadAndUnReadMemberInfoObject.getReadAndUnreadMembersInfo();
        // 查询回执消息已读未读人员
        mainObject.sig_channelOrUnReadResult.connect(function(data) {
            console.log(data);
            acknowledgeFnObj2.getMemberlistCallback(data.readUids, data.unRreadUids);
        });
        qReadAndUnReadMemberInfoObject.sigGetReadAndUnReadMembers.connect(function(readedObj, unreadObj) {
            console.log('查询回执消息已读人员列表', readedObj);
            console.log('查询回执消息未读人员列表', unreadObj);
            acknowledgeFnObj2.getMemberlistCallback(readedObj.users, unreadObj.users);
        });
        qReadAndUnReadMemberInfoObject.OnHtmlReady();
    });
    acknowledgeFnObj2.$container = $('.huizhiMemberListContainer');// 外层容器
    acknowledgeFnObj2.$readededTab = acknowledgeFnObj2.$container.find('#readededTab');// 已读容器tab
    acknowledgeFnObj2.$readedCon = acknowledgeFnObj2.$container.find('#readedMemberlist');// 已读容器
    acknowledgeFnObj2.$unReadedTab = acknowledgeFnObj2.$container.find('#unReadedTab');// 未读容器tab
    acknowledgeFnObj2.$unReadedCon = acknowledgeFnObj2.$container.find('#unReadedMemberlist');// 未读容器

    /**
     *  tab栏切换
     */
    acknowledgeFnObj2.$container.on('click', function(e) {
        var currentTab = e.target;
        var $currentTab = $(currentTab);
        var id = $currentTab.attr('id');
        if (id === 'unReadedTab') {
            acknowledgeFnObj2.$unReadedTab.addClass('active');
            acknowledgeFnObj2.$readededTab.removeClass('active');
            acknowledgeFnObj2.$unReadedCon.removeClass('hideList');
            acknowledgeFnObj2.$readedCon.addClass('hideList');
        } else if (id === 'readededTab') {
            acknowledgeFnObj2.$readededTab.addClass('active');
            acknowledgeFnObj2.$unReadedTab.removeClass('active');
            acknowledgeFnObj2.$readedCon.removeClass('hideList');
            acknowledgeFnObj2.$unReadedCon.addClass('hideList');
        }
        e.stopPropagation();
    });
});

var acknowledgeFnObj2 = {
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
     * 查询已读未读人员列表回调
     * @param readed
     * @param unread
     */
    getMemberlistCallback: function(readed, unread) {
        var readedTemp = this.getTempFromData(readed, '暂无已读');
        var unreadTemp = this.getTempFromData(unread, '全部已读');
        acknowledgeFnObj2.$readedCon.html(readedTemp);
        acknowledgeFnObj2.$unReadedCon.html(unreadTemp);
        var tempunread = '未读(' + unread.length + ')';
        var tempread = '已读(' + readed.length + ')';
        acknowledgeFnObj2.$readededTab.html(tempread);
        acknowledgeFnObj2.$unReadedTab.html(tempunread);
    },

    /**
     * 查看已读未读人员列表的模板
     * @param members
     * @returns {string}
     */
    getTempFromData: function(members, tips) {
        var temp = '';
        if (members.length === 0) {
            return readedTemp = '<p class="no-readed">' + tips + '</p>';
        }
        members.forEach(function(item) {
            temp += '<li imId="' + item.imId + '"  oaId="' + item.oaId + '" >' +
                '<a href="javascript:;">' +
                '<div class="im-name" style="background:' + getNickNameColor(item.oaId) + ';">' + getNickName(item.nickName) + '</div>' +
                '<p>' + (item.nickName.length > 3 ? (item.nickName.substring(0, 3) + '.') : item.nickName) + '</p>' +
                '</a>' +
                '</li>';
        });
        return readedTemp = '<ul class="clearfix">' + temp + '</ul>';
    }
};

