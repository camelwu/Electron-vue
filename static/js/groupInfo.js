/*
 *  Created by Li Xiangkai
 *  Date:2017-02-10
 *  群详情弹窗
 */

$(function() {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.groupInfoObject = channel.objects.qGroupInfoObj;
        window.publicObject = channel.objects.qWebPublicObj;
        window.mainObject = channel.objects.qMainObject;

        mainObject.GetMyInfo(function(data) {
        	console.log(data);
            myInfo = data;
        });

        groupInfoObject.sigGroupIdNotify.connect(function(groupInfo) {
            console.log(groupInfo);

            $('#group-avatar').attr('style', 'background:' + getNickNameColor(Math.abs(hashCode(groupInfo.groupId))) + ';');

            groupInfoObject.getGroupBulletin({'GroupId': groupInfo.groupId }, function(data) {
                $('#group-bulletin').html(codeStr(data[0].content));
            });

            groupInfoObject.getGroupMemberCount({'GroupId': groupInfo.groupId}, function(data) {
                groupMembersNum = data.GroupMemCount;
                $('#group-count').html('(' + groupMembersNum + '人)');
            });

            var name = codeStr(groupInfo.groupName);
            $('#group-name,#group-name-small').html(name);
            $('.group-name-input').val(name);

			// 群成员
            groupInfoObject.getGroupMembers({
                'GroupId': groupInfo.groupId,
                'GroupMemberPage': 0,
                'GroupMemberPagesize': 100
            });

            // 修改
            $('#group-detail-info .edit').on('click', function() {
                $(this).parent().find('#group-name-small').addClass('hide');
                $(this).parent().find('.group-name-input').removeClass('hide');
                $('.group-name-input').val($('#group-name').text());
                // $(this).parent().find(".group-name-input").val(txtVal);
                $(this).parent().find('.group-name-input').focus().select();
                if (groupInfo.isInitName) {
                    $(this).parent().find('.group-name-input').val('');
                }
            });
            var beforeinp = '';
            $('.group-name-input').on('focus', function() {
                beforeinp = $(this).val();
            });
            $('.group-name-input').on('blur', function() {
                if (!($(this).val().trim() === '' || $(this).val() == beforeinp)) {
                    $(this).parent().find('#group-name-small').removeClass('hide').html(this.value);
                    $(this).addClass('hide');
                    $('#group-name').html(this.value);
                    groupInfo.isInitName = false;
                    mainObject.changeGroupName({
                        'groupId': groupInfo.groupId,
                        'groupName': this.value,
                        'capacity': 100
                    });
                } else {
                    $(this).parent().find('#group-name-small').removeClass('hide');
                    $(this).addClass('hide');
                }
            });
        });

        var timer_ = null;
        $('#group-name').on('mouseover', function() {
            var html = $(this).html();
            var offsetWidth = this.offsetWidth;
            if (offsetWidth >= 180) {
                timer_ = setTimeout(function() {
                    publicObject.setTip(html);
                }, 800);
            }
        }).on('mouseout', function() {
            window.clearTimeout(timer_);
            publicObject.hideTip();
        });

		// 群详情中的群成员
        groupInfoObject.siggetGroupMembers.connect(function(data) {
		    console.log(data);
            initGroupMembers(data);
        });

        $(window).blur(function() {
			// 关闭弹窗
            groupInfoObject.wndClose();
        });

        mainObject.siggetGroupMembers.connect(function(data) {
            console.log('人员列表', data);
            initGroupMembers(data);
        });

        groupInfoObject.onHtmlReady();

        mainObject.sigQuitGroupNoticeMsgNotify.connect(function(data) {
            console.log('(' + groupMembersNum + '人)');
            groupMembersNum = JSON.parse(data.extra).size;
            $('#group-count').html('(' + groupMembersNum + '人)');
            publicObject.getGroupInfo(data.groupId, function(data) {
                $('#group-name,#group-name-small').html(data.groupName);
            });
        });
        mainObject.sigChangeMgerNoticeMsgNotify.connect(function(data) {
            console.log(data);
            $('#group-name,#group-name-small').html(data.groupName);
            mainObject.getGroupMembers({
                'GroupId': data.groupId,
                'GroupMemberPage': 0,
                'GroupMemberPagesize': 100
            });
            if (myInfo.imUserid == members[0].imId) {
                var deleteTemp = '<div class="add-del-personBtn deletePersonBtn">< a href=" ">' +
                    '<div class="im-name del-personBtn">' +
                    '< img src="../images/icon/移除成员@2x.png"  alt="">' +
                    '</div><p>删除</p ></a></div>';
                $('#group-detail-members').find('ul').prepend(deleteTemp);
                $('#group-detail-members').on('click', 'li img', function() {
                    var gId = $(this).parent().parent().parent().attr('groupId');
                    var imIds = $(this).parent().parent().parent().attr('imId');
                    var data = {
                        groupId: gId,
                        memberIds: imIds
                    };
                    $(this).parent().parent().parent().remove();
                    mainObject.removeGroupMembers(data);
                });

                $('#group-detail-members').on('click', 'li img', function(e) {
                    e.stopPropagation();
                });
            }
        });
    });

    $('#group-detail-info-btn').on('click', function() {
        $(this).addClass('active');
        $('#group-detail-members-btn').removeClass('active');
        $('#group-detail-members').attr('style', 'display:none;');
        $('#group-detail-info').removeAttr('style');
    });

    $('#group-detail-members-btn').on('click', function() {
        $(this).addClass('active');
        $('#group-detail-info-btn').removeClass('active');
        $('#group-detail-info').attr('style', 'display:none;');
        $('#group-detail-members').removeAttr('style');
    });

    let copyData = [[{
	    text: '复制',
        func: () => {
            document.execCommand('Copy', 'false', null);
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }]];
    $('#group-detail-info p').smartMenu(copyData, {
        name: '复制'
    });

    $('#group-detail-info').on('mousedown', 'p', function(e) {
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
var groupMembersNum;
function initGroupMembers(members) {
    console.log('群成员', members);

    $('#group-detail-members ul').html('');

    if (myInfo.imUserid == members[0].imId) {
        var deleteTemp = '<div class="add-del-personBtn deletePersonBtn"><a href="javascript:;">' +
            '<div class="im-name del-personBtn">' +
            '<img src="../images/icon/移除成员@2x.png"  alt="">' +
            '</div><p>删除</p></a></div>';
        $('#group-detail-members').find('ul').prepend(deleteTemp);

        var addTemp = '<div class="add-del-personBtn addPersonBtn"><a href="javascript:;">' +
            '<div class="im-name add-personBtn">' +
            '<img src="../images/icon/添加群成员@2x.png"  alt="">' +
            '</div><p>添加</p></a></div>';
        $('#group-detail-members').find('ul').prepend(addTemp);
        $('#group-detail-members').on('click', 'li img', function(e) {
            var gId = $(this).parent().parent().parent().attr('groupId');
            var imIds = $(this).parent().parent().parent().attr('imId');
            var data = {
                groupId: gId,
                memberIds: imIds
            };
            $(this).parent().parent().parent().remove();
            mainObject.removeGroupMembers(data);
            var memberAry = $('#group-detail-members ul li').find('p');
            console.log(memberAry);
            var memberNameAry = [];
            for (var i = 0; i < memberAry.length; i++) {
                memberNameAry.push($(memberAry[i]).html());
            }
            // memberNameAry=memberNameAry.join('、')
            // $('#group-count').html('(' +  memberAry.length+ '人)');
            // var name = codeStr(memberNameAry);
            // console.log(name)
            // $('#group-name,#group-name-small').html(name);
        });

        $('#group-detail-members').on('click', 'li img', function(e) {
            e.stopPropagation();
        });
    } else {
        var addTemp = '<div class="add-del-personBtn addPersonBtn"><a href="javascript:;">' +
            '<div class="im-name add-personBtn">' +
            '<img src="../images/icon/添加群成员@2x.png"  alt="">' +
            '</div><p>添加</p></a></div>';
        $('#group-detail-members').find('ul').prepend(addTemp);
    }

    $('#group-detail-members').on('click', 'li', function(e) {
        e.stopPropagation();
        var oaId = $(this).attr('oaId');
        var staffName = $(this).attr('data-staff-name');
        setNickNameColorToLocal($(this).find('.im-name')[0].style.background)
        groupInfoObject.showMemberInfo(1, oaId, staffName);
    });

    // 删除群成员显示
    var oldSrc;
    $('.detail-membersWindow').on('click', 'div.deletePersonBtn', function(e) {
        e.stopPropagation();
        if (groupWindowDelMemberOpen == false) {
            $('#group-detail-members ul li').find('img').removeClass('hideList');
            $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员－hover／click@2x.png');
            $('.deletePersonBtn').find('p').css({'color': '#3E89F7'});
            oldSrc = $('.deletePersonBtn').find('img').attr('src');
            groupWindowDelMemberOpen = true;
        } else {
            $('#group-detail-members ul li').find('img').addClass('hideList');
            $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员@2x.png');
            $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
            oldSrc = $('.deletePersonBtn').find('img').attr('src');
            groupWindowDelMemberOpen = false;
        }
    });

    // 删除群成员按钮hover
    $('.detail-membersWindow').on('mouseover', 'div.deletePersonBtn', function(e) {
        oldSrc = $('.deletePersonBtn').find('img').attr('src');
        $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员－hover@2x.png');
        $('.deletePersonBtn').find('p').css({'color': '#3E89F7'});
    }).on('mouseout', function(e) {
        $('.deletePersonBtn').find('img').attr('src', oldSrc);
        $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
    });

    function showToast(config) {
        clearTimeout($('.global-toast').timer);
        var config = config || {};
        var message = config.ReturnMsg || '请求失败';
        var duration = config.duration || 2000;
        if ($('.global-toast').length === 0) {
            var ele = document.createElement('div');
            ele.className = 'global-toast hide';
            ele.innerHTML = '<span><img class="toast-icon" src="../images/icon/warning@2x.png" alt=""></span><span class="toast-body"></span>';
            document.querySelector('.opg').appendChild(ele);
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

    // 添加成员显示
    $('.detail-membersWindow').on('click', 'div.addPersonBtn', function(e) {
        if (groupMembersNum >= 100) {
            showToast({ReturnMsg: '该群已满，不能再加入新成员'});
            return;
        }

        e.stopPropagation();
        var selectedLength = $(this).siblings('li[imid]').length - 1;
        if (selectedLength <= 99) {
            if (groupWindowAddMemberOpen == false) {
                $('.selectList-count').find('strong').removeClass('redColor');
                var selectedAry = $(this).siblings('li[imid]');
                var selectedAryImid = [];
                for (var i = 0; i < selectedAry.length; i++) {
                    selectedAryImid.push($(selectedAry[i]).attr('imid'));
                }
                var groupid = $(this).siblings('li[imid]').attr('groupid');
                var groupChatdata = {
                    // selectedLength:selectedLength, //已选个数 num
                    // selectedAryImid:selectedAryImid, //已选人的imid数组
                    groupId: groupid, // groupid
                    addClick: false // 是否添加
                };

                $('#myContacts2').attr('selectedLength', selectedLength);
                $('#myContacts2').attr('selectedAryImid', selectedAryImid);
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
                var gid = $(this).siblings('li[imid]').attr('groupid');
                mainObject.showAddDialog(groupChatdata);
                groupInfoObject.wndClose();
                // groupWindowAddMemberOpen=true
            }/* else{
                $('.addPersonBtn').find('img').attr('src','../images/icon/添加群成员@2x.png')
                $('.addPersonBtn').find('p').css({'color':"#4590E4"})
                $('#group-chat-member').addClass('hideList')
                groupWindowAddMemberOpen=false
                $('.group-chat-addressList').animate({
                    scrollTop: '0px'
                }, 1000);
            } */
        }
    });

    // 添加群成员按钮hover
    var oldSrc2;
    $('.detail-membersWindow').on('mouseover', 'div.addPersonBtn', function(e) {
        oldSrc2 = $('.addPersonBtn').find('img').attr('src');
        $('.addPersonBtn').find('img').attr('src', '../images/icon/添加群成员－hover@2x.png');
        $('.addPersonBtn').find('p').css({'color': '#3E89F7'});
    }).on('mouseout', function(e) {
        $('.addPersonBtn').find('img').attr('src', oldSrc2);
        $('.addPersonBtn').find('p').css({'color': '#4590E4'});
    });

    $('.windows-pop').on('click', function(e) {
        $('#group-detail-members ul li').find('img').addClass('hideList');
        $('.deletePersonBtn').find('img').attr('src', '../images/icon/移除成员@2x.png');
        $('.deletePersonBtn').find('p').css({'color': '#4590E4'});
        oldSrc = $('.deletePersonBtn').find('img').attr('src');
        groupWindowDelMemberOpen = false;
    });

    for (var i = 0; i < members.length; i++) {
        if (members[i].isGourpHolder) {
            if (members[i].oaId === myInfo.myid) {
                $('.edit').removeClass('hide');
            } else {
                $('.edit').addClass('hide');
            }
        }
        var hideCross = members[i].isGourpHolder ? '' : '<img class="deleteCross hideList" src="../images/icon/CombinedShape@2x.png"  alt="">';
        var temp = '<li data-staff-name = "'+members[i].nickName+'" imId="' + members[i].imId + '"  oaId="' + members[i].oaId + '" groupId="' + members[i].groupId + '"><a href="javascript:;">' +
			'<div class="im-name" data-staff-name = "'+members[i].nickName+'" style="background:' + getNickNameColor(members[i].oaId) + ';">' +
            hideCross +
			getNickName(members[i].nickName) + '</div><p>' + members[i].nickName + '</p></a></li>';
        $('#group-detail-members').find('ul').append(temp);
    }
}

