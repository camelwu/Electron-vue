/**
 * Created by shangkuikui on 2017/6/6.
 */
(function() {
    const InputOperateRules = {
        isPlateNull() {
            return true;
        },
        isSelected() {
            console.log('选中text: ', window.getSelection().toString());
            console.log('选中html: ', mycopy());
            // return window.getSelection().toString();
            return mycopy();
        }
    };

    const Copy = {
        name: '复制',
        rules: function() {
            return InputOperateRules.isSelected();
        },
        fn: function copy() {
            document.execCommand('Copy', 'false', null);
            console.log('复制');
            let s = mycopy();
            console.log(s);
        }
    };
    const Cut = {
        name: '剪切',
        rules: function() {
            return InputOperateRules.isSelected();
        },
        fn: function() {
            document.execCommand('Cut');
            console.log('执行剪切');
        }
    };
    const Paste = {
        name: '粘贴',
        rules: function() {
            return InputOperateRules.isPlateNull();
        },
        fn: function() {
            console.log(document.execCommand);
            // document.execCommand("paste", "false", null);
            console.log('执行粘贴');
            mainObject.getClipboardInfo(function(data) {
                pasteToInput(data);
            });
        }
    };
    const InputOperate = [Copy, Cut, Paste];

    function mycopy() {
        let selectionObj = window.getSelection();
        let rangeObj = selectionObj.getRangeAt(0);
        let docFragment = rangeObj.cloneContents();
        let tempDiv = document.createElement('div');
        tempDiv.appendChild(docFragment);
        let s = tempDiv.innerHTML;
        return s;
    }

    function _documentSelectElement(element) {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNode(element);
        sel.removeAllRanges();
        sel.addRange(range);
    }


    function showRightMenu(e) {
        currentInput =AllINPUT.PRE
        let ret = InputOperate.map(operate => {
            // return operate.rules();
            return operate;
        });
        let temp = ``;
        ret.forEach(operate => {
            let clas = operate.rules() ? 'enable' : 'Unenable';
            temp += `<li data-obj="" class="${clas}" data-pass="${clas}">${operate.name}</li>`;
        });
        // console.log(document.body.clientHeight);
        // console.log(document.querySelector('#sendBtn').offsetTop);

        let domArray = document.querySelectorAll('.kright');
        [].forEach.call(domArray, dom => $(dom).addClass('hideList'));

        let y = document.body.clientHeight - 160 + 50;
        $('.inputrightmenu').removeClass('hideList').html(temp).css({
            left: e.pageX + 'px',
            top: e.pageY - 94 + 'px'
        });
        let ofl = document.querySelector('.inputrightmenu').offsetLeft;
        if (ofl >= document.body.clientWidth - 100) {
            $('.inputrightmenu').css({
                left: e.pageX - 100 + 'px',
                top: e.pageY - 94 + 'px'
            });
        }
    }

    $(document).on('mousedown', '#input-content, .channel-input-container', function(e) {
        if ($(e.target).hasClass('input-img')) {
            _documentSelectElement(e.target);
        }
        if ($(e.target).hasClass('input-file')) {
            _documentSelectElement(e.target);
        }
        if (e.which == 3) {
            setTimeout(function() {
                showRightMenu(e);
            }, 0);
            e.stopPropagation();
        }
    });
    $(document).on('click', '.inputrightmenu li', function(e) {
        let name = $(this).html();
        InputOperate.forEach(operate => {
            if (operate.name === name && $(this).attr('data-pass') === 'enable') {
                operate.fn(this);
                $('.inputrightmenu').addClass('hideList');
            }
        });
    });
    $(document).on('click', function() {
        $('.inputrightmenu').addClass('hideList');
    });

    $(document).on('mousedown', function(e) {
        if (e.which == 3) {
            $('.inputrightmenu').addClass('hideList');
        }
    });
})();
