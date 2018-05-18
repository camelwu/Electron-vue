/**
 * Created by shangkuikui on 2017/5/22.
 */
class Message {
    constructor() {
        this.typeClass = '';
        this.listText = ' list-text ';
    }

    getTemplate() {
        throw new Error('必须复写父类方法');
    }

    getTypeClass() {
        return this.typeClass;
    }

    getListText() {
        return this.listText;
    }

    testUrlAndFace(msg) {
        // 文本消息
        let $decode = $('#decode');
        $decode.text(msg.msgbody);
        let _msgBody_ = $decode.html();
        let msgBody_ = _msgBody_.replace(/((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%()&:\/~\+#;\u4e00-\u9fa5]*[\w\-\@?^=%&\/~\+)#;\u4e00-\u9fa5])?/g, function(s, $1, index) {
            // if (/^(\d+)(\.\d+){1,2}$/.test(s)) {
            //     return s;
            // }
            if (s.indexOf('http://') != -1 || s.indexOf('https://') != -1) {
                return '<a class="url-link" onclick="publicObject.openUrl(0,\'' + s + '\')">' + s + '</a>';
            } else {
                return '<a class="url-link" onclick="publicObject.openUrl(0,\'http://' + s + '\')">' + s + '</a>';
            }
        });
        msg.msgbody = msgBody_.replace(/(\[[\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z]+\]?)/g, function(s, $1, index) {
            if (faces.indexOf(getFaceEng($1.replace('[', '').replace(']', ''))) != -1) {
                return '<img class="input-face" src="../images/face/' + getFaceEng($1.replace('[', '').replace(']', '')) + '.png">';
            } else {
                return $1;
            }
        });
        return msg;
    }
}
class VoiceMsg extends Message {
    constructor() {
        super();
        this.msgtype = 2;
        this.typeClass = ' voice';
    }

    getTemplate(msg, type) {
        let width = 80,
            newSound = '';
        if (msg.playTime > 20) {
            width = 80 + (msg.playTime - 20);
        }
        if (msg.senderId == myInfo.imUserid) {
            newSound = '';
        } else if (msg.VoiceBePlayed === 0) {
            // 未播放过的语音
            newSound = '<div class="new-m"></div>';
        }

        return '<div time="' + msg.playTime + '" style="width:' + width + 'px" class="clearfix"><div class="voice-con" id="voice-con">' +
            '<em class="iconn-2"></em><div class="voice-box hide"></div></div><span>' + msg.playTime + '"</span>' +
            '</div>' + newSound;
    }
}
class PicMsg extends Message {
    constructor() {
        super();
        this.msgtype = 3;
    }

    getTemplate(msg, type) {
        let width;
        let heigth;
        let smallUrl = msg.picurl;
        let url = msg.picurl;
        if (msg.picwidth / msg.picheight >= 1) {
            if (msg.picwidth > 150) {
                width = 150;
                heigth = 150 * msg.picheight / msg.picwidth;
            } else {
                width = msg.picwidth;
                heigth = msg.picheight;
            }
        } else if (msg.picwidth / msg.picheight < 1) {
            if (msg.picheight > 150) {
                width = 150 * msg.picwidth / msg.picheight;
                heigth = 150;
            } else {
                width = msg.picwidth;
                heigth = msg.picheight;
            }
        } else {
            width = 150;
            heigth = 150;
        }

        if (type === msgManger.type.OPENSSION || type === msgManger.type.LOADMORE) {
            if (msg.status == 0) { // 发送成功
                url = msg.sourPath;
            } else {
                if (msg.SPicLocalPath == '') {
                    url = msg.picurl;
                } else {
                    url = msg.SPicLocalPath;
                }
            }
        }

        return '<p><img class="pop-image" imgType="1" msgId="' + msg.msgId + '"' +
            'fileName="' + msg.SerFileName + '"' +
            'fileExt="' + msg.fileExt + '" src="' + smallUrl + '" data-src="' + url + '"' +
            'data-picwidth="' + msg.picwidth + '" data-picheight="' + msg.picheight + '" data-picsize=' + msg.picsize + ' ' +
            'style="width:' + width + 'px;height:' + heigth + 'px;" onclick="viewImg(this)"/></p>';
    }
}
class FileMsg extends Message {
    constructor() {
        super();
        this.msgtype = 6;
        this.typeClass = '';
    }

    getTemplate(msg) {
        let fileName = msg.fname;
        let from = sourceFromObj[Math.floor((msg.from / 1000000)) + ''];
        let fileType = getFileType(fileName);
        let imgSrc = getFileThumbnailSrc(fileType);
        let sendtime = msg.sendtime;
        let state = msg.FileStatus;
        let orHide = state == 3 ? '' : 'hide';
        return '' +
            '<div class="content clearfix" oncontextmenu=openGlobalContextMenu("copyFile") data-clickfilemsgid = "' + msg.msgId + '"   data-senderid= ' + msg.senderId + ' >' +
            '<div class="file-class">' +
            '<img src="../images/file/' + imgSrc + '56@2x.png"  alt="">' +
            '<div class="shadow">' +
            '<canvas class="canvas" width="56" height="56">不支持canvas</canvas>' +
            '</div>' +
            '<div class="prompt-content file-pause hide">已暂停</div>' +
            '<div class="prompt-content file-overdue ' + orHide + '">已过期</div>' +
            '<div class="prompt-content file-deleted hide">已删除</div>' +
            '</div>' +
            '<p>' + fileName + '</p>' +
            '</div>' +
            '<div class="down">' +
            '<span class="data-size"  data-total="' + bytesToSize(msg.fsize) + '">' + bytesToSize(msg.fsize) + '</span>' +
            '<span class="data-from">' + from + '</span>' +
            '</div>';
    }

    getTypeClass() {
        let fileName = msgManger.msg.fname;
        let fileType = getFileType(fileName);
        let fileBgColor = getFileBgColorClassName(fileType);
        return this.typeClass = '   file-wrapper padding-0 ' + fileBgColor;
    }
}
class LocationMsg extends Message {
    constructor() {
        super();
        this.msgtype = 5;
    }

    getTemplate(msg) {
        return '<div class="map" x="' + msg.LocaltionLongitude + '" y="' + msg.LocaltionLatitude + '" positionName="' +
            msg.LocaltionContent + '"><img src="' + msg.LocaltionPicUrl + '" width="150">' +
            '<p>' + msg.LocaltionContent + '</p></div>';
    }
}
class TxtMsg extends Message {
    constructor() {
        super();
        this.msgtype = 1;
    }

    getTemplate(msg) {
        msg = this.testUrlAndFace(msg);
        return '<pre>' + msg.msgbody + '</pre>';
    }
}
class AiteMsg extends Message {
    constructor() {
        super();
        this.msgtype = 100002;
        this.typeClass = '';
    }

    getTemplate(msg) {
        msg = this.testUrlAndFace(msg);
        return '<pre>' + msg.msgbody + '</pre>';
    }

    getTypeClass() {
        this.typeClass = '';
        let atIdsArr = msgManger.msg.altUids.split(',');
        atIdsArr.forEach(id => {
            if (parseInt(id) === myInfo.imUserid) {
                this.typeClass = 'at-me-msg';
            }
        });
        return this.typeClass;
    }

}
class AnnounceMsg extends Message {
    constructor() {
        super();
        this.msgtype = 100003;
        this.typeClass = 'announce-msg';
    }

    getTemplate(msg) {
        msg = this.testUrlAndFace(msg);
        return '<pre>' + msg.msgbody + '</pre>';
    }
}
class AcknowledgeMsg extends Message {
    constructor() {
        super();
        this.msgtype = 100001;
        this.listText = '';
    }

    getTemplate(msg) {
        msg = this.testUrlAndFace(msg);
        // mainObject.queryMsgUnReadCount(CHATOBJ.groupId, msgId);//查询未读人数
        let msgbody = msg.msgbody,
            // grouptype = msg.grouptype,
            senderId = msg.senderId,
            msgId = msg.msgId,
            // groupId = msg.groupid,
            shouldHide = 'hideList';
        let temp = '';
        let unReadNum = ' 已读';
        let float_ = 'fl';

        if (msg.status === 0) {
            shouldHide = '';
        }


        let readedClass = 'readed';
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
            '<div class=" list-text acknowledge-content" data-msg=' + encodeCharacterEntities(JSON.stringify(msg)) + '  data-msgtype="100001"   data-senderid="' + msg.senderId + '"  data-status="' + msg.status + '"  data-sendtime="' + msg.sendtime + '"><pre>' + msgbody + '</pre>' +
            '<em class="iconn-34 ' + shouldHide + '" msgId="' + msgId + '" onclick="resendMsg(this)"></em>' +
            '</div>' +
            '</div>' +
            '<div clearfix>' +
            '<div class="acknowledge-down ' + float_ + '"><span>回执消息 :</span><span class="acknowledge-unread ' + readedClass + '" msg-id="' + msgId + '"  sender-id="' + senderId + '">' + unReadNum + '</span></div>' +
            '</div>' +
            '</pre>';
        this.putInReceiptMap();
        return temp;
    }

    putInReceiptMap() {
        let msg = msgManger.msg;
        let list = receiptMap.get(msg.groupid);
        let receiptObj = {
            'senderId': msg.senderId,
            'seqId': msg.msgSeqId,
            'msgId': msg.msgId
        };
        if (list == undefined) {
            receiptMap.put(msg.groupid, Array.of(receiptObj));
        } else {
            list.push(receiptObj);
            receiptMap.put(msg.groupid, list);
        }
    }

}
class RevokeMsg extends Message {
    constructor() {
        super();
        this.msgtype = -100;
    }

    getTemplate(msg) {
        let temp = msg.msgbody;
        if (msg.grouptype == 1) {
            if (!(temp == '你撤回了一条消息')) {
                temp = msg.msgbody = '对方撤回了一条消息';
            }
        }
        return '<div class="list-revoke clearfix">' +
            '<div class="text-wrapper">' + temp + '</div>' +
            '</div>';
    }


}

class MsgManger {
    constructor() {
        this.voiceMsg = new VoiceMsg();
        this.picMsg = new PicMsg();
        this.fileMsg = new FileMsg();
        this.locationMsg = new LocationMsg();
        this.txtMsg = new TxtMsg();
        this.aiteMsg = new AiteMsg();
        this.announceMsg = new AnnounceMsg();
        this.acknowledgeMsg = new AcknowledgeMsg();
        this.revokeMsg = new RevokeMsg();
        this.currentMsg = {};
        this.msg = {};
        this.type = {
            RECEIVEMSG: 'RECEIVEMSG',
            OPENSSION: 'OPENSSION',
            LOADMORE: 'LOADMORE'
        };
    }

    getTemplate(msg, {type}) {
        return this.getCurrentMsg(msg).getTemplate(msg, type);
    }

    getTypeClass() {
        return this.currentMsg.getTypeClass();
    }

    getListText() {
        return this.currentMsg.getListText();
    }

    getCurrentMsg(msg) {
        switch (msg.msgtype) {
            case 1:
                return this.currentMsg = this.txtMsg;
                break;
            case 2:
                return this.currentMsg = this.voiceMsg;
                break;
            case 3:
                this.currentMsg = this.picMsg;
                break;
            case 5:
                this.currentMsg = this.locationMsg;
                break;
            case 6:
                this.currentMsg = this.fileMsg;
                break;
            case 100001:
                this.currentMsg = this.acknowledgeMsg;
                break;
            case 100002:
                this.currentMsg = this.aiteMsg;
                break;
            case 100003:
                this.currentMsg = this.announceMsg;
                break;
            case -100:
                this.currentMsg = this.revokeMsg;
                break;
        }
        this.msg = msg;
        return this.currentMsg;
    }
}
const msgManger = new MsgManger();
