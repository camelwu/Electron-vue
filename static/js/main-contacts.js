/*
 *  Created by Li Xiangkai
 *  Date:2017-01-13
 *  Instructions:
 *  	PC主窗口联系人功能区结构，包括常用联系人，组织架构，群组，联系人及员工列表和详情等
 */

/**
 * 初始化我的频道
 */
let mychannel = '';
function initMyChannel(channel) {
    console.log('------------------------------------我的频道-----------------');
    console.log('我的频道', channel);
    console.log('------------------------------------我的频道-----------------');
    mychannel = channel;
    $('#myChannel-content').html('');



    for (var i = 0; i < channel.length; i++) {
        var color = getNickNameColor(Math.abs(hashCode(channel[i].ChannelId)));
        var channelSign = ''
        var channelSignShow = ''
        // if (channel[i].offical === 0 && channel[i].type === 2 && channel[i].channelLabel === 1) {
        //     channelSign = '../images/public/双十一标签@2x.png';
        //     channelSignShow = ''
        // } else if (channel[i].offical === 0 && channel[i].type === 1) {
        //     channelSign = '../images/public/部门标签@2x.png'
        // } else if (channel[i].offical === 0 && channel[i].type === 0) {
        //     channelSign = '../images/public/全员标签@2x.png'
        // } else {
        // }else{
        //     channelSign = '';
        //     channelSignShow = 'hideList';
        // }
        var temp = '<li id="myChannel-' + channel[i].ChannelId + '"><a href="javascript:;">' +
            '<div class="im-name" style="background:' + color + ';">' +
            '<img class="channelAddress-icon" src="../images/icon/Group4Copy7@2x.png"></div>' +
            '<div style="display:flex" ><p>' + codeStr(channel[i].ChannelName) + '</p></div></a></li>';
        $('#myChannel-content').append(temp);
        $('#myChannel-' + channel[i].ChannelId).data(channel[i]);
    }
    // 绑定点击事件
    $('#myChannel-content').off('click.showChannelDetail');
    $('#myChannel-content').on('click.showChannelDetail', 'li', function() {
        console.log('click.showChannelDetail');
        showChannelDetail(this);
    });

    $('#myChannel-content').off('contextmenu.quitChannel');
    $('#myChannel-content').on('contextmenu.quitChannel', 'li', function(e) {
        console.log('contextmenu.quitChannel');
        $('#global-context-menu').addClass('hideList');

        var channel = $(e.currentTarget).data();
        // console.log(channel);
        var oaId = window.VueApp.$store.getters.oaId;
        var guests = window.VueApp.$store.getters.guests;

        if (channel.type === 1 && guests[channel.ChannelId]) {
            var currentGuests = guests[channel.ChannelId];
            for (var i = 0; i < currentGuests.length; i++) {
                if (oaId === currentGuests[i].id) {
                    openGlobalContextMenu('quiteChannel', channel);
                }
            }
        }
    });

    $('#myChannel').find('.num').html(channel.length);
}

/**
 * 初始化我的常用联系人
 */
function initMyContacts(contacts) {
    console.log('常用联系人', contacts);
    $('#myContacts-content').html('');
    $('#contacts-detail').addClass('hideList');

	// 绑定点击事件
    $('#myContacts-content').off('click.showContactDetail');
    $('#myContacts-content').on('click.showContactDetail', 'li', function() {
        showContactDetail(this);
    });

    for (var i = 0; i < contacts.length; i++) {
        var color = getNickNameColor(contacts[i].oaId);
        var name = getNickName(contacts[i].Name);
        var temp = '<li id="contacts-' + contacts[i].oaId + '"><a>' +
			'<div class="im-name" style="background:' + color + ';">' + name + '</div>' +
			'<p>' + contacts[i].Name + '</p></a></li>';
        $('#myContacts-content').append(temp);
        $('#contacts-' + contacts[i].oaId).data(contacts[i]);
    }
    $('#myContacts').find('.num').html(contacts.length);
}

/**
 * 初始化我的群组
 * @param group
 */
function initMyGroup(group) {
    console.log('群列表', group);

    $('#myGroup-content').html('');

	// 绑定点击事件
    $('#myGroup-content').off('click.showGroupDetail');
    $('#myGroup-content').on('click.showGroupDetail', 'li', function() {
        showGroupDetail(this);
    });

    for (var i = 0; i < group.length; i++) {
        var color = getNickNameColor(Math.abs(hashCode(group[i].groupId)));
        var temp = '<li id="group-' + group[i].groupId + '"><a href="javascript:;">' +
			'<div class="im-name" style="background:' + color + ';">' +
			'<span class="iconn-46"></span></div>' +
			'<p>' + codeStr(group[i].groupName) + '</p></a></li>';
        $('#myGroup-content').append(temp);
        $('#group-' + group[i].groupId).data(group[i]);
    }
    $('#myGroup').find('.num').html(group.length);
}

/**
 * 初始化部门树
 */
function initDeptTree(data) {
    $('#members-content').html('');

	// 绑定员工列表点击事件
    $('#members-content').off('click', '.im-name-td');
    $('#members-content').on('click', '.im-name-td', function() {
        showMemberInfo(this.parentNode);
    });

    $('#members-list').addClass('hideList');
    $('#members-no-record').removeClass('hideList');

    console.log('部门树', data);
    data[0].state = {
        'expanded': true
    };
    $('#deptTree').tree({
        data: data
    });

    $('#deptTree').addClass('deptTree');

	// 部门树节点点击事件
    $('#deptTree').on('nodeSelected', function(event, data) {
        $('#myGroup-content').children().removeClass('active');
        $('#myContacts-content').children().removeClass('active');
        $('#deptTree').find('ul').children().removeClass('active');
        $('#contacts-detail').addClass('hideList');

        $('.search-list .right-con').addClass('hideList');

        $('#members-list').removeClass('hideList');
        $('#members-list').siblings().addClass('hideList');

        $('#deptTree').find('li[data-nodeid = ' + data.nodeId + ']').attr('style', 'background:#f3f4f5;');

        DEPT = {
            'companyid': 1,
            'orgMemberPage': 0,
            'orgMemberPagesize': 20,
            'continue_': true
        };

        if (data.id != DEPT.depid) {
            // mainObject.getDeptMemberCount({'companyid': 1, 'depid': data.id}, function(count) {
            //     console.log('count', count);
            //     $('#members-list-title .channel-detail-num').html('(' + count + '人)');
            //     $('.channel-detail-title').html(data.deptName);
            // });
            $('#members-list-title .channel-detail-num').html('(' + data.deptNum + '人)');
            $('.channel-detail-title').html(data.deptName);
            $('#members-content').html('');
            DEPT = {
                'companyid': 1,
                'depid': data.id,
                'orgMemberPage': 0,
                'orgMemberPagesize': 20,
                'continue_': true
            };
            mainObject.getDeptmembers(DEPT, function(members) {
                console.log('部门员工', members);
                if (members.length < DEPT.orgMemberPagesize) {
                    DEPT.continue_ = false;
                }
                if (members.length == 0) {
                    $('#members-no-record').find('p').removeClass('hideList');
                    $('#members-no-record').removeClass('hideList');
                    $('#members-no-record').siblings().addClass('hideList');
                } else {
                    $('#members-list').siblings().addClass('hideList');
                    for (var i = 0; i < members.length; i++) {
                        var status = '';
                        if (!members[i].bActivated) {
                            status = '<span class="staff-status">未激活</span>';
                        }
                        var temp = '<tr staffId="' + members[i].id + '" data-staff-name="'+members[i].staffName+'"><td class="im-name-td"><div class="im-name" style="background:' + getNickNameColor(members[i].id) + ';">' +
							getNickName(members[i].staffName) + '</div>' +
							'<p><span class="staff-name">' + members[i].staffName + '</span>' + status +
							'</p></td><td><div>' + members[i].dutyName + '</div></td><td><a href="mailto:' + members[i].email + '">' + members[i].email + '</a> </td></tr>';
                        $('#members-content').append(temp);
                    }
                    $('#members-list').removeClass('hideList');
                }
            });
            DEPT.depid = data.id;
        }
    });

	// 滚动条到底部加载更多
    $('#members-scroll').mousewheel(function(e, delta) {
        console.log(delta);
        var scrollTop = $(this).scrollTop();
        var clientHeight = $(this).height();
        var scrollHeight = $(this)[0].scrollHeight;
        console.log(scrollTop, clientHeight);
        console.log(scrollHeight);
        if (scrollTop + clientHeight >= scrollHeight) {
            if (delta < 0) {
                if (DEPT.continue_ == true) {
                    $('#loadMoreMembers').removeClass('hideList');
                    DEPT.orgMemberPage = DEPT.orgMemberPage + 1;
                    mainObject.getDeptmembers(DEPT, function(members) {
                        console.log('部门员工', members);
                        if (members.length < DEPT.orgMemberPagesize) {
                            DEPT.continue_ = false;
                        }
                        for (var i = 0; i < members.length; i++) {
                            var status = '';
                            if (!members[i].bActivated) {
                                status = '<span class="staff-status">未激活</span>';
                            }
                            var temp = '<tr staffId="' + members[i].id + '" data-staff-name="'+members[i].staffName+'"><td class="im-name-td"><div class="im-name" style="background:' + getNickNameColor(members[i].id) + ';">' +
								getNickName(members[i].staffName) + '</div>' +
								'<p><span class="staff-name">' + members[i].staffName + '</span>' + status +
                                '</p></td><td><div>' + members[i].dutyName + '</div></td><td><a href="mailto:' + members[i].email + '">' + members[i].email + '</a> </td></tr>';
                            $('#members-content').append(temp);
                        }
                        $('#members-list').removeClass('hideList');
						/* if(members.length == 0){
							$('#members-no-record').find('p').removeAttr('style');
							$('#members-no-record').removeAttr('style');
							$('#members-list').attr('style','display:none;');
						}else{
							$('#members-no-record').attr('style','display:none;');
							for(var i = 0; i < members.length; i ++ ){
								var status = '';
								if(!members[i].bActivated){
									status = '<span class="staff-status">未激活</span>';
								}
								var temp = '<tr staffId="'+members[i].id+'"><td><div class="im-name" style="background:'+getNickNameColor(members[i].id)+';">'
									+ getNickName(members[i].staffName)+'</div>'
									+ '<p><span class="staff-name">'+members[i].staffName+'</span>' + status
									+ '</p></td><td><div>'+members[i].dutyName+'</div></td><td>'+members[i].mobile+'</td></tr>';
								$('#members-content').append(temp);
							}
							$('#members-list').removeAttr('style');
						} */
                    });
                }
            }
        } else {
            $('#loadMoreMembers').addClass('hideList');
        }
    });
}

/**
 * 发起群聊-部门树初始
 */
function initDeptTree2(data) {
    $('#members-content').html('');

    // 绑定员工列表点击事件
    /* $('#members-content').on('click','tr',function(){
        showMemberInfo(this);
    }); */

    console.log('部门树', data);
    data[0].state = {
        'expanded': true
    };
    $('#deptTree2').tree({
        data: data
    });
    // 部门树节点点击事件
    $('#deptTree2').on('nodeSelected', function(event, data) {
        $('#myGroup-content2').children().removeClass('active');
        $('#myContacts-content2').children().removeClass('active');
        $('#deptTree2').find('ul').children().removeClass('active');
        $('#contacts-detail2').addClass('hideList');
        $('#contact-personList').addClass('hideList');
        $('#search-personList').addClass('hideList');
        $('.group-chat-personList').find('.groupTree-personList').empty();
        $('#deptTree2').find('li[data-nodeid = ' + data.nodeId + ']').attr('style', 'background:#f3f4f5;');

        $('#all-personList').find('div').attr('checked', false);
        $('#all-personList').find('div')[0].checked = false;
        $('#all-personList').find('div').removeClass('pitch-on-div');

        $('#all-personList').find('div').removeClass('pitch-selected-div');
        $('#all-personList').find('div').removeAttr('data-disabled');
        $('#all-personList').removeAttr('data-disabled');
        // $('#all-personList').removeClass('hideList')
        $('#searchNoData').addClass('hideList');
        $('#contactNoData').addClass('hideList');
        $('#treeNoData').addClass('hideList');

        $('#group-chat-member .group-chat-search').find('input').val('');
        $('#group-chat-member .group-chat-search').find('.iconn-21').css('left', '296px');


        DEPT = {
            'companyid': 1,
            'orgMemberPage': 0,
            'orgMemberPagesize': 20,
            'continue_': true
        };
        console.log(data);
        if (data.id != DEPT.depid) {
            // mainObject.getDeptMemberCount({'companyid': 1, 'depid': data.id}, function(count) {
            //     console.log('count', count);
            //     $('#members-list-title .channel-detail-num').html('(' + count + '人)');
            //     $('.channel-detail-title').html(data.deptName);
            // });
            $('#members-list-title .channel-detail-num').html('(' + data.deptNum + '人)');
            $('.channel-detail-title').html(data.deptName);
            $('#members-content').html('');
            DEPT = {
                'companyid': 1,
                'depid': data.id,
                'orgMemberPage': 0,
                'orgMemberPagesize': 20,
                'continue_': true
            };
            console.log(DEPT.orgMemberPage);
            mainObject.getDeptmembers(DEPT, function(members) {
                $('#searchNoData').addClass('hideList');
                $('#contactNoData').addClass('hideList');
                $('#treeNoData').addClass('hideList');
                $('#all-personList').removeClass('hideList');
                if (members.length == 0) {
                    $('#treeNoData').removeClass('hideList');
                    $('#all-personList').addClass('hideList');
                    /* $('#group-chat-member .group-chat-search').find('input').val('')
                    $('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px') */
                }
                console.log('部门员工', members);
                if (members.length < DEPT.orgMemberPagesize) {
                    DEPT.continue_ = false;
                }
                if (members.length > 0) {
                    $('.group-chat-personList').find('.all-personList').removeClass('hideList');
                    $('.group-chat-personList').find('.groupTree-personList').removeClass('hideList');
                    $('.group-chat-personList').find('.search-personList').addClass('hideList');
                    for (var i = 0; i < members.length; i++) {
                        var orDisabled = members[i].bActivated ? '' : 'data-disabled="disabled"';
                        var orColor = members[i].bActivated ? '' : 'style="color:rgba(0,0,0,0.2)"';
                        var Name = members[i].bActivated ? 'name="' + members[i].staffName + '"' : '';
                        var ImId = members[i].bActivated ? 'imid="' + members[i].imid + '"' : '';
                        var backImg = members[i].bActivated ? 'pitch-active-div' : 'pitch-unactive-div';
                        var deptname = members[i].deptName;
                        var dutyname = members[i].dutyName;
                        if (members[i].imid == myInfo.imUserid) {
                            orDisabled = 'data-disabled="disabled"';
                            backImg = 'pitch-selected-div pitch-active-div';
                            ImId = '';
                        }
                        // 反勾选
                        var addPersonBtn = $('#myContacts2').attr('selectedLength');
                        if (addPersonBtn) {
                            var addPersonBtnData = $('#myContacts2').attr('selectedAryImid').split(',');
                            for (var j = 0; j < addPersonBtnData.length; j++) {
                                if (addPersonBtnData[j] == members[i].imid) {
                                    orDisabled = 'data-disabled="disabled"';
                                    backImg = 'pitch-selected-div pitch-active-div';
                                    ImId = '';
                                }
                            }
                            var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                            var selectedLength = $('#groupTree-personList').find('div.pitch-selected-div').length;
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

                        var temp = '<li ' + orDisabled + Name + ' ' + ImId + ' deptname="' + deptname + '" dutyname="' + dutyname + '" >' +
                            '<span ' + orColor + '>' + members[i].staffName + '</span>' +
                            '<p ' + orColor + '>' + members[i].dutyName + '</p>' +
                            '<div class="' + backImg + '"' + ' ' + '' + orDisabled + '></div>' +
                            '<em></em>' +
                            '</li>';
                        $('.group-chat-personList').find('.groupTree-personList').append(temp);

                        var nameAry = $('#selectList-name').children();
                        if (nameAry.length > 0) {
                        	for (var j = 0; j < nameAry.length; j++) {
                        		if ($(nameAry[j]).attr('imid') == members[i].imid) {
                            $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').attr('checked', true);
                            $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div')[0].checked = true;
                            $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').addClass('pitch-on-div');
                        }
                        }
                            var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                            var pitchLength = $('#groupTree-personList').find('div.pitch-on-div').length;
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
                    }
                }
            });
            DEPT.depid = data.id;
        } else {
            console.log(DEPT.orgMemberPage);
            mainObject.getDeptmembers(DEPT, function(members) {
                $('#searchNoData').addClass('hideList');
                $('#contactNoData').addClass('hideList');
                $('#treeNoData').addClass('hideList');
                $('#all-personList').removeClass('hideList');
                if (members.length == 0) {
                    $('#treeNoData').removeClass('hideList');
                    $('#all-personList').addClass('hideList');
                    /* $('#group-chat-member .group-chat-search').find('input').val('')
                     $('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px') */
                }
                console.log('部门员工', members);
                if (members.length < DEPT.orgMemberPagesize) {
                    DEPT.continue_ = false;
                }
                if (members.length > 0) {
                    $('.group-chat-personList').find('.all-personList').removeClass('hideList');
                    $('.group-chat-personList').find('.groupTree-personList').removeClass('hideList');
                    $('.group-chat-personList').find('.search-personList').addClass('hideList');
                    for (var i = 0; i < members.length; i++) {
                        var orDisabled = members[i].bActivated ? '' : 'data-disabled="disabled"';
                        var orColor = members[i].bActivated ? '' : 'style="color:rgba(0,0,0,0.2)"';
                        var Name = members[i].bActivated ? 'name="' + members[i].staffName + '"' : '';
                        var ImId = members[i].bActivated ? 'imid="' + members[i].imid + '"' : '';
                        var backImg = members[i].bActivated ? 'pitch-active-div' : 'pitch-unactive-div';
                        var deptname = members[i].deptName;
                        var dutyname = members[i].dutyName;
                        if (members[i].imid == myInfo.imUserid) {
                            orDisabled = 'data-disabled="disabled"';
                            backImg = 'pitch-selected-div pitch-active-div';
                            ImId = '';
                        }

                        var addPersonBtn = $('#myContacts2').attr('selectedLength');
                        if (addPersonBtn) {
                            var addPersonBtnData = $('#myContacts2').attr('selectedAryImid').split(',');
                            for (var j = 0; j < addPersonBtnData.length; j++) {
                                if (addPersonBtnData[j] == members[i].imid) {
                                    orDisabled = 'data-disabled="disabled"';
                                    backImg = 'pitch-selected-div pitch-active-div';
                                    ImId = '';
                                }
                            }
                            var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                            var selectedLength = $('#groupTree-personList').find('div.pitch-selected-div').length;
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

                        var temp = '<li ' + orDisabled + Name + ' ' + ImId + ' deptname="' + deptname + '" dutyname="' + dutyname + '" >' +
                            '<span ' + orColor + '>' + members[i].staffName + '</span>' +
                            '<p ' + orColor + '>' + members[i].dutyName + '</p>' +
                            '<div class="' + backImg + '"' + ' ' + '' + orDisabled + '></div>' +
                            '<em></em>' +
                            '</li>';
                        $('.group-chat-personList').find('.groupTree-personList').append(temp);

                        var nameAry = $('#selectList-name').children();
                        if (nameAry.length > 0) {
                            for (var j = 0; j < nameAry.length; j++) {
                                if ($(nameAry[j]).attr('imid') == members[i].imid) {
                                    $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').attr('checked', true);
                                    $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div')[0].checked = true;
                                    $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').addClass('pitch-on-div');
                                }
                            }

                            var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                            var pitchLength = $('#groupTree-personList').find('div.pitch-on-div').length;
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
                    }
                }
            });
        }
    });


    // 滚动条到底部加载更多
    $('.group-chat-personList').mousewheel(function(e, delta) {
        /* console.log(delta) */
        var scrollTop = $(this).scrollTop();
        var clientHeight = $(this).height();
        var scrollHeight = $(this)[0].scrollHeight;
        /* console.log(scrollTop,clientHeight)
        console.log(scrollHeight) */
        if (!$('#groupTree-personList').hasClass('hideList')) {
            if (scrollTop + clientHeight >= scrollHeight) {
                if (delta < 0) {
                    if (DEPT.continue_ == true) {
                        $('#loadMoreMembers').removeClass('hideList');
                        DEPT.orgMemberPage = DEPT.orgMemberPage + 1;
                        console.log(DEPT.orgMemberPage);
                        mainObject.getDeptmembers(DEPT, function(members) {
                            $('#searchNoData').addClass('hideList');
                            $('#contactNoData').addClass('hideList');
                            $('#treeNoData').addClass('hideList');
                            $('#all-personList').removeClass('hideList');
                            // console.log($('#groupTree-personList').children())
                            if (members.length == 0 && $('#groupTree-personList').children().length == 0) {
                                $('#treeNoData').removeClass('hideList');
                                $('#all-personList').addClass('hideList');
                                /* $('#group-chat-member .group-chat-search').find('input').val('')
                                 $('#group-chat-member .group-chat-search').find('.iconn-21').css('left','296px') */
                            }
                            console.log('部门员工', members);
                            if (members.length < DEPT.orgMemberPagesize) {
                                DEPT.continue_ = false;
                            }
                            if (members.length > 0) {
                                $('.group-chat-personList').find('.all-personList').removeClass('hideList');
                                $('.group-chat-personList').find('.groupTree-personList').removeClass('hideList');
                                $('.group-chat-personList').find('.search-personList').addClass('hideList');
                                for (var i = 0; i < members.length; i++) {
                                    var orDisabled = members[i].bActivated ? '' : 'data-disabled="disabled"';
                                    var orColor = members[i].bActivated ? '' : 'style="color:rgba(0,0,0,0.2)"';
                                    var Name = members[i].bActivated ? 'name="' + members[i].staffName + '"' : '';
                                    var ImId = members[i].bActivated ? 'imid="' + members[i].imid + '"' : '';
                                    var backImg = members[i].bActivated ? 'pitch-active-div' : 'pitch-unactive-div';
                                    var deptname = members[i].deptName;
                                    var dutyname = members[i].dutyName;
                                    if (members[i].imid == myInfo.imUserid) {
                                        orDisabled = 'data-disabled="disabled"';
                                        backImg = 'pitch-selected-div pitch-active-div';
                                        ImId = '';
                                    }
                                    var addPersonBtn = $('#myContacts2').attr('selectedLength');
                                    if (addPersonBtn) {
                                        var addPersonBtnData = $('#myContacts2').attr('selectedAryImid').split(',');
                                        for (var j = 0; j < addPersonBtnData.length; j++) {
                                            if (addPersonBtnData[j] == members[i].imid) {
                                                orDisabled = 'data-disabled="disabled"';
                                                backImg = 'pitch-selected-div pitch-active-div';
                                                ImId = '';
                                            }
                                        }
                                        var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                                        var selectedLength = $('#groupTree-personList').find('div.pitch-selected-div').length;
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

                                    var temp = '<li ' + orDisabled + Name + ' ' + ImId + ' deptname="' + deptname + '" dutyname="' + dutyname + '" >' +
                                        '<span ' + orColor + '>' + members[i].staffName + '</span>' +
                                        '<p ' + orColor + '>' + members[i].dutyName + '</p>' +
                                        '<div class="' + backImg + '"' + ' ' + '' + orDisabled + '></div>' +
                                        '<em></em>' +
                                        '</li>';
                                    $('.group-chat-personList').find('.groupTree-personList').append(temp);

                                    var nameAry = $('#selectList-name').children();
                                    if (nameAry.length > 0) {
                                        for (var j = 0; j < nameAry.length; j++) {
                                            if ($(nameAry[j]).attr('imid') == members[i].imid) {
                                                $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').attr('checked', true);
                                                $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div')[0].checked = true;
                                                $('#groupTree-personList li[imid="' + members[i].imid + '"]').find('div').addClass('pitch-on-div');
                                            }
                                        }
                                        var activeLength = $('#groupTree-personList').find('div.pitch-active-div').length;
                                        var pitchLength = $('#groupTree-personList').find('div.pitch-on-div').length;
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
                                }
                            }
                        });
                    }
                }
            } else {
                $('#loadMoreMembers').addClass('hideList');
            }
        }
    });

    /* var nameList=$('#selectList-name').children()
    if(nameList.length>0){
        var groupTreeList=$("#groupTree-personList li[imid]");
        for(var i=0;i<nameList.length;i++){
            console.log(groupTreeList.length)
            for(var j=0;j<groupTreeList.length;j++){
                if($(groupTreeList[j]).attr('imid')==$(nameList[i]).attr('imid')){
                    $(groupTreeList[j]).find('div').attr("checked", true);
                    $(groupTreeList[j]).find('div')[0].checked = true;
                    $(groupTreeList[j]).find('div').addClass('pitch-on-div')
                }
            }
        }
    } */
}

/**
 * 发起群聊-常用联系人初始
 */
function initMyContacts2(contacts) {
    console.log('常用联系人', contacts);

    $('#contact-personList').html('');

    // 绑定点击事件
    /* $('#myContacts-content2').on('click','li',function(){
        showContactDetail2(this);
    }); */


    for (var i = 0; i < contacts.length; i++) {
        var orDisabled = contacts[i].bActivated ? '' : 'data-disabled="disabled"';
        var orColor = contacts[i].bActivated ? '' : 'style="color:rgba(0,0,0,0.2)"';
        var Name = contacts[i].bActivated ? 'name="' + contacts[i].Name + '"' : '';
        var ImId = contacts[i].bActivated ? 'imid="' + contacts[i].imId + '"' : '';
        var backImg = contacts[i].bActivated ? 'pitch-active-div' : 'pitch-unactive-div';
        var deptname = contacts[i].deptName;
        var dutyname = contacts[i].dutyName;
        var temp = '<li ' + orDisabled + Name + ' ' + ImId + ' deptname="' + deptname + '" dutyname="' + dutyname + '"  id="contacts-' + contacts[i].oaId + '">' +
            '<span ' + orColor + '>' + contacts[i].Name + '</span>' +
            '<p ' + orColor + '>' + contacts[i].dutyName + '</p>' +
            '<div class="' + backImg + '"' + ' ' + '' + orDisabled + '></div>' +
            '<em></em>' +
            '</li>';
        $('.group-chat-personList').find('.contact-personList').append(temp);
        $('#contacts-' + contacts[i].oaId).data(contacts[i]);
    }
    $('#myContacts2').find('.num').html(contacts.length);
}

/**
 * 显示我的频道详情
 * @param contact
 */
function showChannelDetail(channel) {
    console.log('频道详情', channel);

    // channel list 切换时清除选中区域
    var selObj = window.getSelection();
    selObj.removeAllRanges();

    $(channel).siblings().removeClass('active');
    $(channel).addClass('active');
    $('.search-list .right-con').addClass('hideList');
    $('#myContacts-content').children().removeClass('active');
    $('#myGroup-content').children().removeClass('active');
    $('#channel-detail').siblings().addClass('hideList');
    $('#channel-detail').removeClass('hideList');
    $('#channel-detail-members').find('ul').html('');
    $('.contacts-title').removeClass('hideList');
    $('.ChannelCondition').addClass('hideList');
    $('.ChannelConditionMember').addClass('hideList');
    $('#channel-detail-members').find('ul').removeClass('hideList');
    var channelInfo = $(channel).data();
    $('.new-channel-conversation').data(channelInfo);
    $('#channel-detail-title').find('div').attr('style', 'background:' + getNickNameColor(Math.abs(hashCode(channelInfo.ChannelId))) + ';');
    $('#channel-detail-info').find('#channel-name').html(codeStr(channelInfo.ChannelDesc));
    $('#channel-detail-info').find('#channel-true-name').html(codeStr(channelInfo.ChannelName));
    // mainObject.getDeptMemberCount({'companyid':1,'depid':channelInfo.deptId},function(count){
    //     console.log('部门频道成员数量',count);
    $('#channel-detail-title').find('p').html(codeStr(channelInfo.ChannelName));
    $('#channel-detail-title').find('span img').addClass('hideList');
    if (channelInfo.offical === 0 && channelInfo.type === 0) {
        $('#channel-detail-title').find('.channel-label-all').removeClass('hideList');
    }
    if (channelInfo.offical === 0 && channelInfo.type === 1) {
        $('#channel-detail-title').find('.channel-label-dept').removeClass('hideList');
    }
    if (channelInfo.offical === 0 && channelInfo.channelLabel === 1) {
        $('#channel-detail-title').find('.channel-label-special').removeClass('hideList');
    }
    // });
    $('#channel-bulletin').html(channelInfo.notice);
    // 计算不同窗口大小下的分页大小
    var containerWidth = $('#channel-detail-members').width() - 12;
    var containerHeigth = $('#channel-detail-members').height() - 40;
    var x = parseInt(containerWidth / 50);
    var y = parseInt(containerHeigth / 88) + 1;
    var pageSize = x * y;
    var channelDept = {
        'depid': channelInfo.deptId
    };
    mainObject.getChannelMembers(channelInfo.ChannelId, 0);
    // mainObject.getDeptmembers(channelDept,function (members) {
    //     initChannelMembers(members)
    // })
}

/**
 * 显示常用联系人详情
 * @param contact
 */
function showContactDetail(contact) {
    $('#myGroup-content').children().removeClass('active');
    $('#myChannel-content').children().removeClass('active');
    $(contact).siblings().removeClass('active');
    $(contact).addClass('active');
    $('.search-list .right-con').addClass('hideList');
	// var a = $(contact).find('p').outerWidth(false);
    $('#contacts-detail').siblings().addClass('hideList');
    $('#contacts-detail').removeClass('hideList');
    $('.contacts-title').removeClass('hideList');
    $('#partTime').addClass('hideList');
    $('#partTime').find('p').remove();
    var id = $(contact).data().oaId;
    publicObject.getMemberInfoFromOaId(id, function(userInfo) {
        console.log('常用联系人详情', userInfo);
        contactsDetailObj = userInfo;
        contactsDetailObj.groupType = 1;
        $('#contacts-detail .im-name').html(getNickName(userInfo.staffName))
			.attr('style', 'background:' + getNickNameColor(userInfo.id) + ';');
        $('#contacts-detail-name').html(userInfo.staffName + `<em class="iconn-5 star-contact-active" data-oaid=${userInfo.id}></em>`);
        if (userInfo.bActivated) {
            $('#contacts-detail-status').addClass('hideList');
            $('#contact-btn').removeClass('disabled');
        } else {
            $('#contacts-detail-status').removeClass('hideList');
            $('#contact-btn').addClass('disabled');
        }
        $('#contacts-detail-phone').html('<em class="iconn-20"></em>' + userInfo.mobile);
        $('#contacts-detail-mail').html('<em class="iconn-42"></em>' + '<a href="mailto:' + userInfo.email + '">' + userInfo.email + '</a>');
        $('#contacts-detail-dept').html('<em class="iconn-4"></em>' + userInfo.deptName);
        $('#contacts-detail-duty').html('<em class="iconn-43"></em>' + userInfo.dutyName);
    });
    publicObject.getMemberParttimeInfoByOaid(id, function(data) {
        console.log('兼职信息', data);
        $('#partTime').find('p').remove();
        if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
                var temp = '<p style="margin-top:5px;"><em class="iconn-4"></em>' + data[i].deptInfo + '</p>' +
					'<p><em class="iconn-43"></em>' + data[i].dutyName + '</p style="margin-bottom:5px;">';
                $('#partTime').append(temp);
            }
            $('#partTime').removeClass('hideList');
        }

        let copyData = [[{
            text: '复制',
            func: () => {
                document.execCommand('Copy', 'false', null);
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }]];
        $('#partTime p').smartMenu(copyData, {
            name: '复制'
        });

        $('#partTime').on('mousedown', 'p', function(e) {
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
}

function showContactDetail2(contact) {
    $('.search-list .right-con').removeClass('hideList');
    $('#myGroup-content2').children().removeClass('active');
    $(contact).siblings().removeClass('active');
    $(contact).addClass('active');
    $('#partTime2').addClass('hideList');
    $('#partTime2').find('p').remove();
    // var a = $(contact).find('p').outerWidth(false);
    $('#contacts-detail2').siblings().addClass('hideList');
    $('#contacts-detail2').removeClass('hideList');
    $('.search-list .right-con span.contacts-title').removeClass('hideList');
    var id = $(contact).data().id;
    publicObject.getMemberInfoFromOaId(id, function(userInfo) {
        console.log('常用联系人详情', userInfo);
        contactsDetailObj = userInfo;
        contactsDetailObj.groupType = 1;
        $('#contacts-detail2 .im-name').html(getNickName(userInfo.staffName))
            .attr('style', 'background:' + getNickNameColor(userInfo.id) + ';');
        $('#contacts-detail-name2').html(userInfo.staffName + `<img src="../images/icon/icon常用联系人@2x.png" class="star-contact-inactive2"  data-oaid=${userInfo.id}>` + `<img src="../images/icon/icon常用联系人@2xcopy.png" class=" star-contact-active2" data-oaid=${userInfo.id}>`);
        if (userInfo.bActivated) {
            $('#contacts-detail-status2').addClass('hideList');
            $('#contact-btn2').removeClass('disabled');
        } else {
            $('#contacts-detail-status2').removeClass('hideList');
            $('#contact-btn2').addClass('disabled');
        }
        if (userInfo.isStarContact) {
            $('#contacts-detail-name2').find('.star-contact-active2').removeClass('hideList');
            $('.star-contact-inactive2').addClass('hideList');
        } else {
            $('#contacts-detail-name2').find('.star-contact-active2').addClass('hideList');
            $('.star-contact-inactive2').removeClass('hideList');
        }
        $('#contacts-detail-phone2').html('<em class="iconn-20"></em>' + userInfo.mobile);
        $('#contacts-detail-mail2').html('<em class="iconn-42"></em>' + '<a href="mailto:' + userInfo.email + '">' + userInfo.email + '</a>');
        $('#contacts-detail-dept2').html('<em class="iconn-4"></em>' + userInfo.deptName);
        $('#contacts-detail-duty2').html('<em class="iconn-43"></em>' + userInfo.dutyName);
    });
    publicObject.getMemberParttimeInfoByOaid(id, function(data) {
        console.log('兼职信息', data);
        if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
                var temp = '<p style="margin-top:5px;"><em class="iconn-4"></em>' + data[i].deptInfo + '</p>' +
                    '<p><em class="iconn-43"></em>' + data[i].dutyName + '</p style="margin-bottom:5px;">';
                $('#partTime2').append(temp);
            }
            $('#partTime2').removeClass('hideList');
        }


        let copyData = [[{
            text: '复制',
            func: () => {
                document.execCommand('Copy', 'false', null);
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }]];
        $('#partTime p').smartMenu(copyData, {
            name: '复制'
        });

        $('#partTime').on('mousedown', 'p', function(e) {
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
}

/**
 * 从常用联系人详情页发起会话
 */
function contactNewConversation(node) {
    if (!$(node).hasClass('disabled')) {
        newConversation(contactsDetailObj, true);
    }
}

/**
 * 从我的群组发起会话
 */

function groupNewConversation() {
    newConversation(groupDetailObj, true);
}


function channelNewConversation() {
    var channelInfo = $('.new-channel-conversation').data();
    window.VueApp.$store.dispatch('setGlobalStatus', 'channel');
    window.VueApp.$store.dispatch('setCurrentChannelSession', channelInfo.ChannelId);
}

/**
 * 显示员工详情
 * @param member
 */
function showMemberInfo(member) {
    var id = parseInt($(member).attr('staffId'));
    // var staffName = parseInt($(member).attr('data-staff-name'));
    mainObject.showMemberInfo(1, id, '');
}

/**
 * 显示群详情弹窗
 */
function showGroupInfo() {
    if (CHATOBJ.groupType == 1) {
        mainObject.showMemberInfo(2, CHATOBJ.imId, CHATOBJ.groupName);
    }
    if (CHATOBJ.groupType == 2) {
        var groupInfo = {
            'groupId': CHATOBJ.groupId,
            'groupName': $('#group-' + CHATOBJ.groupId).data() ? $('#group-' + CHATOBJ.groupId).data().groupName : '',
            'isInitName': $('#group-' + CHATOBJ.groupId).data() ? $('#group-' + CHATOBJ.groupId).data().isInitName : false
        };
        console.log(groupInfo);
        console.log(CHATOBJ);
        mainObject.showGroupInfoDialog(groupInfo);
    }
}

/**
 * 显示群组详情
 * @param group
 */
function showGroupDetail(group) {
    $(group).siblings().removeClass('active');
    $(group).addClass('active');
    $('.search-list .right-con').addClass('hideList');
    $('#myContacts-content').children().removeClass('active');
    $('#myChannel-content').children().removeClass('active');
    $('#group-detail').siblings().addClass('hideList');
    $('#group-detail').removeClass('hideList');
    $('.contacts-title').removeClass('hideList');
    $('#group-detail-members').find('ul').html('');
    $('#group-detail-info-btn').click();
    var groupInfo = $(group).data();
    console.log('群详情', groupInfo, group);
    groupDetailObj = groupInfo;
    groupDetailObj.groupType = 2;
    $('#group-detail-title').find('div').attr('style', 'background:' + getNickNameColor(Math.abs(hashCode(groupInfo.groupId))) + ';');
    $('#group-detail-info').find('#group-name').html(codeStr(groupInfo.groupName));
	// 群成员数量
    mainObject.getGroupMemberCount({'GroupId': groupInfo.groupId}, function(data) {
        console.log('群成员数量', data);
        $('#group-detail-title').find('p').html(codeStr(groupInfo.groupName) +
				'(' + data.GroupMemCount + '人)');
    });
	// 群公告
    mainObject.getGroupBulletin({'GroupId': groupInfo.groupId }, function(data) {
        $('#group-bulletin').html(data[0].content);
    });
	// 群成员
	// 计算不同窗口大小下的分页大小
    var containerWidth = $('#group-detail-members').width() - 12;
    var containerHeigth = $('#group-detail-members').height() - 40;
    var x = parseInt(containerWidth / 50);
    var y = parseInt(containerHeigth / 88) + 1;
    var pageSize = x * y;
    mainObject.getGroupMembers({
        'GroupId': groupInfo.groupId,
        'GroupMemberPage': 0,
        'GroupMemberPagesize': 100
    });
}

function initGroupMembers(members) {
    console.log('群成员', members);

	// 绑定点击事件-删除群

    $('#group-detail-members').find('ul').html('');

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

        /* $('#group-detail-members').on('mouseenter','div.deletePersonBtn',function () {
            $('.deletePersonBtn').find('img').attr('src','../images/icon/移除成员－hover／click@2x.png')
            $('.deletePersonBtn').find('p').css({'color':"#3E89F7"})
        })
		if(groupDelMemberOpen==false){
            $('#group-detail-members').on('mouseleave','div.deletePersonBtn',function () {
                $('.deletePersonBtn').find('img').attr('src','../images/icon/移除成员@2x.png')
                $('.deletePersonBtn').find('p').css({'color':"#4590E4"})
            })
		} */
    } else {
        var addTemp = '<div class="add-del-personBtn addPersonBtn"><a href="javascript:;">' +
            '<div class="im-name add-personBtn">' +
            '<img src="../images/icon/添加群成员@2x.png"  alt="">' +
            '</div><p>添加</p></a></div>';
        $('#group-detail-members').find('ul').prepend(addTemp);
    }

    for (var i = 0; i < members.length; i++) {
        if (members[i].isGourpHolder) {
            if (members[i].oaId === myInfo.myid) {
                $('.edit').removeClass('hide');
            } else {
                $('.edit').addClass('hide');
            }
        }
    	var hideCross = members[i].isGourpHolder ? '' : '<img class="deleteCross hideList" src="../images/icon/CombinedShape@2x.png"  alt="">';
        var temp = '<li data-staff-name = "'+members[i].nickName+'" id="groupMember-' + members[i].imId + '" imId="' + members[i].imId + '" groupId="' + members[i].groupId + '"><a href="javascript:;">' +
			'<div class="im-name" style="background:' + getNickNameColor(members[i].oaId) + ';">' +
            hideCross +
			getNickName(members[i].nickName) + '</div><p>' + members[i].nickName + '</p></a></li>';
        $('#group-detail-members').find('ul').append(temp);
    }
}

$(function() {
    let copyData = [[{
        text: '复制',
        func: () => {
            document.execCommand('Copy', 'false', null);
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }]];
    $('#contacts-detail-infos p').smartMenu(copyData, {
        name: '复制'
    });

    $('#contacts-detail-infos').on('mousedown', 'p', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i]);
                    }
                    return;
                } else if (this.childNodes[i].tagName === 'A') {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i].childNodes[0]);
                    }
                    return;
                }
            }
        }
    });

    $('#contacts-detail-name').smartMenu(copyData, {
        name: '复制'
    });

    $('#contacts-detail-name').on('mousedown', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i]);
                    }
                    return;
                } else if (this.childNodes[i].tagName === 'A') {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i].childNodes[0]);
                    }
                    return;
                }
            }
        }
    });


    $('#contacts-detail-infos2 p').smartMenu(copyData, {
        name: '复制'
    });

    $('#contacts-detail-infos2').on('mousedown', 'p', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i]);
                    }
                    return;
                } else if (this.childNodes[i].tagName === 'A') {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i].childNodes[0]);
                    }
                    return;
                }
            }
        }
    });

    $('#contacts-detail-name2').smartMenu(copyData, {
        name: '复制'
    });

    $('#contacts-detail-name2').on('mousedown', function(e) {
        if (e.which == 3) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].nodeType === 3) {
                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i]);
                    }
                    return;
                } else if (this.childNodes[i].tagName === 'A') {

                    let str = window.getSelection().toString();
                    if (!str) {
                        documentSelectElement(this.childNodes[i].childNodes[0]);
                    }
                    return;
                }
            }
        }
    });
    $('#channel-name').smartMenu(copyData, {
        name: '复制'
    });

    $('#channel-name').on('mousedown', function(e) {
        if (e.which == 3) {
            if (e.which == 3) {
                let str = window.getSelection().toString();
                if (!str) {
                    documentSelectElement(this);
                }
            }
        }
    });

    $('#channel-bulletin').smartMenu(copyData, {
        name: '复制'
    });

    $('#channel-bulletin').on('mousedown', function(e) {
        if (e.which == 3) {
            let str = window.getSelection().toString();
            if (!str) {
                documentSelectElement(this);
            }
        }
    });

    /**
     * 常用联系人点击事件
     * 1常用联系人列表删除人员，2取消选中状态，3详情页面恢复默认
     */


    $(document).on('click', '.star-contact-active', function() {
        let oaId = parseInt($(this).attr('data-oaid'));
        console.log(oaId);
        mainObject.delStarContact(oaId);
        setTimeout(function() {
            $('#members-no-record').removeClass('hideList');
        }, 300);
    });

    $('#contacts-detail-name2').on('click', '.star-contact-active2', function() {
        let oaId = parseInt($(this).attr('data-oaid'));
        console.log(oaId);
        $('.star-contact-inactive2').removeClass('hideList');
        $('.star-contact-active2').addClass('hideList');

        mainObject.delStarContact(oaId);
    });

    $('#contacts-detail-name2').on('click', '.star-contact-inactive2', function() {
        let oaId = parseInt($(this).attr('data-oaid'));
        console.log(oaId);
        $('.star-contact-inactive2').addClass('hideList');
        $('.star-contact-active2').removeClass('hideList');

        mainObject.addStarContact(oaId);
    });
});


/* $('.detail-membersList').on('click','div.deletePersonBtn',function(e){
    e.stopPropagation()
    if(groupDelMemberOpen==false){
        $('#group-detail-members ul li').find('img').removeClass("hideList")
        $('.deletePersonBtn').find('img').attr('src','../images/icon/移除成员－hover／click@2x.png')
        $('.deletePersonBtn').find('p').css({'color':"#3E89F7"})
        groupDelMemberOpen=true
    }else{
        $('#group-detail-members ul li').find('img').addClass("hideList")
        $('.deletePersonBtn').find('img').attr('src','../images/icon/移除成员@2x.png')
        $('.deletePersonBtn').find('p').css({'color':"#4590E4"})
        groupDelMemberOpen=false
    }
}); */


/**
 * 频道成员详情
 * @param member
 */
function initChannelMembers(members, channelId) {
    console.log('频道成员', members, channelId);
    const ret = [];
    console.log('--我的频道部分：频道成员--:');
    for (let k of Object.keys(members)) {
        let tempKeyObj = {
            'isLeter': k
        };
        members[k].length && ret.push(tempKeyObj);
        members[k].forEach(item => ret.push(item));
    }
    $('#channel-detail-members').find('ul').html('');
    let adminId = '';
    let mychannel = window.VueApp.$store.state.channels.channelSessionList;
    mychannel.forEach(channel => {
        if (channel.ChannelId == channelId) {
            adminId = channel.adminId;
        }
    });
    console.log('频道成员--beauty', ret);
    let temp = ``;
    ret.forEach((item, idx) => {
        if (item.isLeter) {
            temp += `<li  class="item item-letter">`;
            if (idx === 0) {
                temp += `<p class="leter first-letter">${item.isLeter.toUpperCase()}<a class="screenConditionsBtn" onclick="showChannelCondition()"><span class="screenConditionsIcon"></span><span class="screenConditions">查看筛选条件</span></a></p>`;
            } else {
                temp += `<p class="leter">${item.isLeter.toUpperCase()}</p>`;
            }
        } else {
            temp += `<li  class="item item-people" imid="${item.imid}" data-staff-name="${item.staffName}">`;
            temp += `<div class="people">
                        <p class="left">
                            <span class="avator" style="background:${getNickNameColor(item.id)}">${getNickName(item.staffName)}</span>
                            <span class="name">${item.staffName}</span>
                      `;
            if (adminId == item.id) {
                temp += `<span class="manager">频道管理员</span>`;
            }
            if (item.listType === 1) {
                temp += `<span class="manager">特邀</span>`;
            }
            temp += `</p>
                        <span class="right">${item.dutyName}</span>
                     </div>`;
        }
        temp += `</li>`;
    });
    $('#channel-detail-members').find('ul').html(temp);
    // $('#channel-detail-members').find('ul').html('')
    // for(var i = 0;i < members.length; i ++){
    //     /*var hideCross=members[i].isGourpHolder?'':'<img class="deleteCross hideList" src="../images/icon/CombinedShape@2x.png"  alt="">';*/
    //     var temp = '<li id="channelMember-'+members[i].imid+'" imId="'+members[i].imid+'" deptId="'+members[i].deptId+'"><a href="javascript:;">'
    //         + '<div class="im-name" style="background:'+getNickNameColor(members[i].id)+';">'
    //         /*+ hideCross*/
    //         + getNickName(members[i].staffName)+'</div><p>'+members[i].staffName+'</p></a></li>';
    //     $('#channel-detail-members').find('ul').append(temp);
    // }
}

/**
 * 筛选条件
 * @param member
 */

function initChannelCondition(channelInfo,guestArr) {
    console.log('筛选条件',channelInfo,guestArr);
    var conditionHide = ''
    if ($('#condition-'+channelInfo.ChannelId).length > 0 && !$('#condition-'+channelInfo.ChannelId).hasClass('hideList')) {
        conditionHide = ''
    }else{
        conditionHide = 'hideList'
    }
    $('#channel-detail-members').find('div.conditionBox').html('');
    let temp = '<div class="ChannelCondition '+conditionHide+'" id="condition-'+channelInfo.ChannelId+'">'+
                '<div class="ChannelConditionTitle">'+
                '<div>'+
                '筛选条件</div><a onclick="hideChannelCondition()">'+
                '返回上一级'+
                '</a>'+
                '</div>'+
                '<div class="ChannelConditionContent">';
    if (channelInfo.type !== 2) {
        temp += '<div class="channelOrganizationNode">'+
                '<span class="channelLeft">'+
                '组织节点'+
                '</span>'+
                '<span class="channelOrganizationNodeName" >'+
                channelInfo.deptName +
                '</span></div>'
    }
    if (channelInfo.type !== 0) {
        temp += '<div class="channelConditionMember" style="'+ (channelInfo.type === 2 ? 'border-top:none':'') +'">'+
                '<span class="channelLeft">'+
                '特邀名单'+
                '</span>'+
                '<span class="channelConditionMemberCount"><span>'+
                (guestArr.length > 0 ? guestArr.length : '')+
                '</span><a class="channelConditionMemberIcon" onclick="showChannelConditionMember()" src="">'+
                '</a>'+
                '</span>'
    }

        temp +='</div></div>';
    $('#channel-detail-members').find('div.conditionBox').html(temp);
}

function initChannelConditionList(channelInfo,guestArr) {
    console.log('筛选成员',channelInfo,guestArr);
    var conditionMemberHide = ''
    if ($('#conditionMember-'+channelInfo.ChannelId).length > 0 && !$('#conditionMember-'+channelInfo.ChannelId).hasClass('hideList')) {
        conditionMemberHide = ''
    }else{
        conditionMemberHide = 'hideList'
    }
    $('#channel-detail-members').find('div.conditionMemberBox').html('');
    let temp = '<div class="ChannelConditionMember '+conditionMemberHide+'" id="conditionMember-'+channelInfo.ChannelId+'">'+
                '<div class="ChannelConditionTitle">'+
                '<div>'+
                '特邀名单'+
                '  (  '+guestArr.length+'  )'+
                '</div><a onclick="hideChannelConditionMember()">'+
                '返回上一级'+
                '</a>'+
                '</div>';


    if (guestArr.length === 0) {
        temp += '<div class="conditionMember-no-record ">'+
                '<img src="../images/public/no-record.jpg">'+
                '<p>'+'暂无特邀成员'+'</p>'+
                '</div>'
    } else if (guestArr.length > 0){
        var channelInfo = $('.new-channel-conversation').data();
        console.log(channelInfo)
        temp += '<div class="ChannelConditionMemberContent">'
        for (var i = 0; i < guestArr.length; i++) {
            if (guestArr[i].firstLetterGuest) {
                temp += '<li class="conditionitem  condition-item" imid="'+
                        guestArr[i].imid+'" data-staff-name="'+
                        guestArr[i].staffName+'"><p class="condition-leter ">'+
                        guestArr[i].firstLetterGuest.toUpperCase()+
                        '</p><div class="condition-people"><p class="left"><span class="avator" style="background:'+
                        getNickNameColor(guestArr[i].id)+'">'+
                        getNickName(guestArr[i].staffName)+'</span><span class="name">'+
                        guestArr[i].staffName+'</span><span class="manager">'+
                        (guestArr[i].id === channelInfo.adminId ? '频道管理员':'')+'</span></p><span class="right">'+
                        guestArr[i].dutyName+'</span></div></li>'
            } else {
                temp += '<li class="conditionitem  condition-item" imid="'+
                        guestArr[i].imid+'" data-staff-name="'+
                        guestArr[i].staffName+'"><div class="condition-people"><p class="left"><span class="avator" style="background:'+
                        getNickNameColor(guestArr[i].id)+'">'+
                        getNickName(guestArr[i].staffName)+'</span><span class="name">'+
                        guestArr[i].staffName+'</span><span class="manager">'+
                        (guestArr[i].id === channelInfo.adminId ? '频道管理员':'')+'</span></p><span class="right">'+
                        guestArr[i].dutyName+'</span></div></li>'
            }
        }
        temp += '</div></div>';
    }
    $('#channel-detail-members').find('div.conditionMemberBox').html(temp);
}

//查看筛选条件
function showChannelCondition() {
    $('#channel-detail-info').addClass('hideList');
    $('#channel-detail-members').find('ul').addClass('hideList');
    $('.ChannelCondition').removeClass('hideList');
}

function hideChannelCondition() {
    $('#channel-detail-members').find('ul').removeClass('hideList');
    $('.ChannelCondition').addClass('hideList');
}

function showChannelConditionMember() {
    $('.ChannelCondition').addClass('hideList');
    $('.ChannelConditionMember').removeClass('hideList');
}

function hideChannelConditionMember() {
    $('.ChannelCondition').removeClass('hideList');
    $('.ChannelConditionMember').addClass('hideList');
}

/**
 * 筛选条件名单
 * @param member
 */

// 绑定员工列表点击事件
$('#channel-detail-members').on('click', '.item-people', function() {
    // showMemberInfo2(this);
});
/**
 * 显示员工详情
 * @param member
 */
function showMemberInfo2(member) {
    var id = parseInt($(member).attr('imid'));
    mainObject.showMemberInfo(1, id, '');
}

function showMyInfo() {
    event.stopPropagation();
    mainObject.showMemberInfo(2, myInfo.imUserid, '');
}
