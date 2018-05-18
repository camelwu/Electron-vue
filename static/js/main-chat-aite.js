/*
 *  Created by shangkui
 *  Date:2017-04-10
 *  群@
 */
var commonAiteObj = {
    formatCousor: function() {
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    },
    updateRelAndSel: function(selObj, selRange) {
        sel = selObj;
        range = selRange;
    },
    getSerchListStr: function(list) {
        var tempItem = '';
        var ret = '';
        var isFirst = '';
        list.forEach(function(item, index) {
            var imId = item.imId;
            isFirst = index === 0 ? 'active' : '';
            tempItem += '<li class="msg-aite ' + isFirst + '" im-id="' + imId + '"><div>' + item['nickName'] + '</div></li>';
        });
        return ret = '<ul>' + tempItem + '</ul>';
    },
    showSerchList: function(list, position) {
        if (list.length === 0) {
            klogger.info('没有查找到任何人员');
            commonAiteObj.hideSerchList();
            return;
        }
        var SerchListStr = this.getSerchListStr(list);
        aiteObj.$memberContainer.removeClass('hideList').html(SerchListStr);
        $('.aiteMemberList').scrollTop(0);
        var top = aiteObj.$memberContainer.height();
        console.log(position);

        let ofl = document.querySelector('.aiteMemberList').offsetLeft;
        // console.log('左侧便宜量',document.querySelector('.aiteMemberList').offsetLeft)
        // console.log('去除列表后的总宽度',document.body.clientWidth -120)
        // console.log('差值',ofl-document.body.clientWidth -120)
        // let ofw = document.querySelector('.aiteMemberList').offsetWidth
        if (ofl >= document.body.clientWidth - 120) {
            aiteObj.$memberContainer.css({
                left: position.right - 120,
                top: position.top - top - 10
            });
        } else {
            aiteObj.$memberContainer.css({
                left: position.right,
                top: position.top - top - 10
            });
            // 第一次启动ofl会为0，所以此处需要在展示了之后再判断一次
            let ofl = document.querySelector('.aiteMemberList').offsetLeft;
            if (ofl >= document.body.clientWidth - 120) {
                aiteObj.$memberContainer.css({
                    left: position.right - 120,
                    top: position.top - top - 10
                });
            }
        }
    },
    // againAite 说明搜索状态中 再次输入了艾特，这种情况下也是需要隐藏，但是不用更新 aiteObj.oldContStr，其余情况才需要更新
    hideSerchList: function(againAite) {
        if (aiteObj.searching == aiteObj.state.SEARCHING) {
            console.log('--@--hideSerchList');
            aiteObj.searching = aiteObj.state.STOP;
            aiteObj.$memberContainer.addClass('hideList');
            var temp_aite = aiteObj.$inputContainer.find('#' + aiteObj.current_aiteId + '');
            if (temp_aite[0]) {
                temp_aite.removeAttr('id');
                temp_aite[0].style.float = 'none';
                var temp_aiteValue = temp_aite.text();

                temp_aite.before(temp_aiteValue);
                temp_aite.remove();
            }
            // range.collapse(true);
            // sel.removeAllRanges();
            // sel.addRange(range);
            this.formatCousor();
            // insertImg(temp_aiteValue);
            if (!againAite) {
                aiteObj.oldContStr = $('#input-content').text();// 更新old html
            }
        }
    },
    serching: function() {
        // klogger.info('searching状态:', aiteObj.searching);
        // klogger.info('composing:', aiteObj.composing);
        if ((aiteObj.searching === aiteObj.state.SEARCHING) && (!aiteObj.composing)) {
            var $temp_aite = aiteObj.$inputContainer.find('#' + aiteObj.current_aiteId + '');
            var temp_aiteValue = $temp_aite.html();
            if (typeof temp_aiteValue === 'undefined') { // 说明删除了@
                this.hideSerchList();
                return;
            }
            var searchKey = temp_aiteValue.substring(1, temp_aiteValue.length);
            aiteObj.cursorPosition = aiteObj.getCursorPosition();
            console.log('实时搜索的内容：', searchKey);
            if (searchKey.includes('@')) {
                this.hideSerchList(true);
                return;
            }
            mainObject.searchGroupMemberWhenAT(CHATOBJ.groupId, myInfo.imUserid, searchKey, 0, aiteObj.groupMemCount, function(data) {
                commonAiteObj.showSerchList(data, aiteObj.cursorPosition);
            });
            return true;
        }
    },
    serchItemClick: function(target) {
        var $this = $(target);
        $this.parent().parent().addClass('hideList');
        var nameWidhAite = '@' + $this.find('div').html();
        var imgDom = document.createElement('img');
        imgDom.ondragstart = function() {
            return false;
        };
        var dpr = window.devicePixelRatio;
        publicObject.convertNameToPicture(nameWidhAite, dpr, function(obj) {
            // console.log(obj);
            var imsrc = obj.picPath;
            imgDom.src = imsrc;
            var picHeight = obj.picHeight;
            if (dpr >= 2) {
                picHeight = picHeight / 2;
            }
            imgDom.style.height = picHeight + 'px';
        });

        var imId = $this.attr('im-id');


        //  plan a
        // var $temp_aite = aiteObj.$inputContainer.find('#' + aiteObj.current_aiteId + '');
        // $temp_aite[0].contentEditable = false;
        // $temp_aite.attr('im-id', imId);
        // $temp_aite.attr('class', 'input-msg-aite');
        // $temp_aite.html('@' + name + ' ');


        //  plan b  替换成图片  暂时挂起
        var $temp_aite = aiteObj.$inputContainer.find('#' + aiteObj.current_aiteId + '');
        $temp_aite.before(imgDom);
        $temp_aite.removeAttr('id');
        $temp_aite.html('');
        $temp_aite.remove();
        var $imgDom = $(imgDom);
        $imgDom.attr('im-id', imId);
        $imgDom.attr('class', 'input-msg-aite');
        $imgDom.attr('data-aite-name', nameWidhAite);
        // aiteObj.$inputContainer.focus();
        // range.collapse(true);
        // sel.removeAllRanges();
        // sel.addRange(range);
        this.formatCousor();


        aiteObj.searching = aiteObj.state.FINISH;

        aiteObj.oldContStr = $('#input-content').text();// 更新old html
        return false;
    }

};

function AiteObj() {
    this.state = {
        STOP: 'STOP',
        SEARCHING: 'SEARCHING',
        FINISH: 'FINISH'
    };
    this.searching = this.state.STOP;
    this.current_aiteId = '';// 当前编辑状态中的艾特的id
    this.$memberContainer = '';
    this.$inputContainer = '';
    this.cursorPosition = '';
    this.composing = false;
    this.groupMemCount = 0;
    this.oldContStr = '';
    this.flag = true;
}
AiteObj.prototype = {
    getSerchList: function() {
        // 群成员数量
        mainObject.getGroupMemberCount({'GroupId': CHATOBJ.groupId}, function(data) {
            aiteObj.groupMemCount = data.GroupMemCount;
            if (aiteObj.groupMemCount < 0) {
                klogger.error('请求群成员数量出错');
            }
            /* mainObject.getGroupMembers({
             'GroupId': CHATOBJ.groupId,
             'GroupMemberPage': 0,
             'GroupMemberPagesize': aiteObj.groupMemCount
             }); */
            mainObject.searchGroupMemberWhenAT(CHATOBJ.groupId, myInfo.imUserid, '', 0, aiteObj.groupMemCount, function(data) {
                aiteObj.getSerchListCallback(data);
            });
        });
    },
    getSerchListCallback: function(list) {
        if (!(aiteObj.searching == aiteObj.state.SEARCHING)) {
            return;
        }
        commonAiteObj.showSerchList(list, aiteObj.cursorPosition);
    },
    getCursorPosition: function() {
        var aiteSpan = aiteObj.$inputContainer.find('#' + aiteObj.current_aiteId + '')[0];
        var aiteSpanClientRect = aiteSpan.getBoundingClientRect();
        return aiteSpanClientRect;
    },
    triggerSearch: function(e) {
        klogger.info('triggerSearch:');
        /* var againSearch= false;
         if(this.searching == aiteObj.state.SEARCHING){//说明当前正在搜索状态中 再次触发了@
         againSearch= true;
         } */
        this.searching = aiteObj.state.SEARCHING;
        this.current_aiteId = Math.uuid();
        this.getSerchList();
        this.insertAite();
        this.cursorPosition = aiteObj.getCursorPosition();
        /* if(againSearch){
         commonAiteObj.serching();
         againSearch= false;
         } */

        // 取消全局搜索状态
        endSearch(true);
        e && e.preventDefault();
    },
    // beforeContentNull  先前是否有内容
    removeAite: function(beforeContentNull) {
        // 说明之前有内容
        if (!beforeContentNull) {
            var textNode = range.startContainer;
            klogger.info('文本startContainer', textNode);
            /* var sof = range.startOffset;
             klogger.info('鼠标所在文本的位置',sof);
             textNode.deleteData(sof,1);
             aiteObj.triggerSearch(); */
            var anchorNode = sel.anchorNode;
            var anchorNodeSof = sel.anchorOffset;
            anchorNode.deleteData(anchorNodeSof - 1, 1);
        }
        aiteObj.triggerSearch();
    },
    insertAite: function() {
        var temphtml = '<span id="' + aiteObj.current_aiteId + '">@</span>';
        insertImg(temphtml);
    },
    isAite: function(newStr) {
        // 搜索状态中不用对比判断
        /* if(this.searching === aiteObj.state.SEARCHING){
         this.oldContStr = newStr;
         return;
         } */
        if (CHATOBJ.groupType != 2) { // 不是群消息
            this.oldContStr = newStr;
            return;
        }
        /* if(newStr.length <= this.oldContStr.length){//说明是删除字符（暂时不考虑选中一部分同时添加字符的情况）
         this.oldContStr = newStr;
         return;
         } */
        klogger.info('new', newStr);
        klogger.info('old', aiteObj.oldContStr);
        if ((newStr.length - this.oldContStr.length) == 1) { // 只有新增一个字符才判断
            if ($('#input-content').html().length <= 1 && newStr == '@') { // 输入框为空第一次输入@时
                $('#input-content').html('');
                // aiteObj.triggerSearch();
                aiteObj.removeAite(true);
                this.oldContStr = newStr;
                return;
            }
            var newStrArr = newStr.split('');
            newStrArr.forEach(function(item, i) {
                if (aiteObj.flag) {
                    var oldStrArr = aiteObj.oldContStr.split('');
                    if (oldStrArr[i] != item) {
                        aiteObj.flag = false;
                        klogger.info('找到的变化的字符是', item, i);
                        if (item == '@') {
                            aiteObj.removeAite(false);
                        }
                    }
                }
            });
            aiteObj.flag = true;
        }
        this.oldContStr = newStr;
    }
};
var aiteObj = new AiteObj();

$(function() {
    aiteObj.$memberContainer = $('.aiteMemberList');
    aiteObj.$inputContainer = $('#input-content');
    aiteObj.oldContStr = aiteObj.$inputContainer.text();// 更新old html
    /**
     * 输入@触发
     */
    document.getElementById('input-content').addEventListener('keydown', function(e) {
        if (CHATOBJ.groupType != 2) { // 不是群消息
            return;
        }
        // klogger.info('没有弹出联系人？:', e);
        if (e.shiftKey && e.keyCode == 50) { // 是@
            // aiteObj.triggerSearch(e);
        }
    });
    /*    $('#input-content').on('keydown',function (e) {
     if (CHATOBJ.groupType != 2) {//不是群消息
     return;
     }
     if (e.keyCode === 16) return;
     klogger.info('没有弹出联系人？:',e);
     if (e.shiftKey && e.keyCode == 50) {//是@
     klogger.info('开始搜索:',e);
     aiteObj.searching = aiteObj.state.SEARCHING;
     aiteObj.current_aiteId = Math.uuid();
     aiteObj.getSerchList();
     insertAite();
     aiteObj.cursorPosition = aiteObj.getCursorPosition();
     e.preventDefault();
     }

     }); */

    /**
     * 搜索条目点击事件
     */
    aiteObj.$memberContainer.on('click', '.msg-aite', function(e) {
        var target = this;
        return commonAiteObj.serchItemClick(target);
    });
    /**
     * 输入@后输入其他继续搜索
     */
    var $contenainer = $('#input-content');
    $(document).on('input', '#input-content', function(e) {
        // debugger;
        /* if (!commonAiteObj.serching() && !aiteObj.composing) {
         commonAiteObj.hideSerchList(true);
         } */
        commonAiteObj.serching();
        aiteObj.isAite($contenainer.text());// 更新old html
    });

    /**
     * 输入@后失去焦点
     */
    /*   $(document).on('blur', '#input-content', function (e) {
     if(searching){
     klogger.info('输入@后失去焦点：',e);
     searching= false;
     $memberContainer.addClass('hideList');
     var temp_aite = $inputContainer.find('#'+current_aiteId+'');
     var temp_aiteValue = temp_aite.html();
     klogger.info(temp_aiteValue);
     temp_aite.after(temp_aiteValue);
     temp_aite.remove();
     };

     }); */

    /**
     * 输入@后触发其他区域
     */
    $(document).on('click', function() {
        commonAiteObj.hideSerchList();
    });


    aiteObj.$inputContainer[0].addEventListener('compositionstart', function(event) {
        klogger.info('compositionstart:', event.data);
        aiteObj.composing = true;
    });
    aiteObj.$inputContainer[0].addEventListener('compositionend', function(event) {
        klogger.info('compositionend:', event.data);
        aiteObj.composing = false;
    });

    aiteObj.$inputContainer[0].addEventListener('blur', function(event) {
        // klogger.info('失去焦点:');
    });
    aiteObj.$inputContainer[0].addEventListener('focus', function(event) {
        // klogger.info('获得焦点:');
    });


    /**
     * 输入enter触发
     */
    document.getElementById('input-content').addEventListener('keydown', function(e) {
        if (e.keyCode === 13) {
            // commonAiteObj.hideSerchList();
        }
    });


    $('.aiteMemberList').on('mouseover', 'li', function() {
        if (!$(this).hasClass('active')) {
            $('.aiteMemberList li.active').removeClass('active');
            $(this).addClass('active');
        }
    });

    $(document).on('keydown', function(e) {
        if ($('.aiteMemberList').hasClass('hideList')) {
            return;
        }
        var active = document.querySelector('.aiteMemberList li.active');
        if (e.keyCode === 40) {
            e.preventDefault();
            if (active.nextElementSibling) {
                $(active).removeClass('active');
                $(active.nextElementSibling).addClass('active');
            }

            active = document.querySelector('.aiteMemberList li.active');
            if (active.offsetTop > $('.aiteMemberList').scrollTop() + $('.aiteMemberList').height() - active.clientHeight) {
                $('.aiteMemberList').scrollTop(active.offsetTop - $('.aiteMemberList').height() + active.clientHeight);
            }
        }
        if (e.keyCode === 38) {
            e.preventDefault();
            if (active.previousElementSibling) {
                $(active).removeClass('active');
                $(active.previousElementSibling).addClass('active');
            }
            active = document.querySelector('.aiteMemberList li.active');
            if (active.offsetTop < $('.aiteMemberList').scrollTop()) {
                $('.aiteMemberList').scrollTop(active.offsetTop);
            }
        }
        if (e.keyCode === 13) {
           // e.preventDefault();
           // $('.aiteMemberList li.active').mousedown();
        }
    });
});


