/**
 * 获取头像颜色
 *
 * @param staffId
 * @returns
 */
function getNickNameColor(staffId) {
    var colorArr = [ '#B2DBF3', '#81BDEE', '#A6E6C2', '#68C6AA', '#F8B185',
        '#F693BF', '#B5B4E3', '#C280D3'];
    return colorArr[staffId % 8];
}

/**
 * 获取头像名称
 *
 * @param staffName
 * @returns
 */
function getNickName(staffName) {
    var staffName = staffName || '';
    var words = staffName.split('');
    if (words.length >= 2) {
        return words[words.length - 2] + words[words.length - 1];
    } else {
        return words || '无名';
    }
}

function checkNameLength(staffName) {
    if (!isNaN(Number(staffName))) {
        return staffName;
    }
    if (staffName.length > 4) {
        staffName = staffName.substring(0, 4) + '...';
    }
    return staffName;
}

Date.prototype.pattern = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1, // 月份
        'd+': this.getDate(), // 日
        'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
        'H+': this.getHours(), // 小时
        'm+': this.getMinutes(), // 分
        's+': this.getSeconds(), // 秒
        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
        'S': this.getMilliseconds()
        // 毫秒
    };
    var week = {
        '0': '星期日',
        '1': '星期一',
        '2': '星期二',
        '3': '星期三',
        '4': '星期四',
        '5': '星期五',
        '6': '星期六'
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '')
            .substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt
            .replace(
                RegExp.$1,
                ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f'
                        : '/u5468')
                    : '') +
                week[this.getDay() + '']);
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};
/**
 * 时间格式化
 * @param timeStamp
 * @param formatStr
 * @returns
 */
function date_format(timeStamp, formatStr) {
    var newDate = new Date();
    newDate.setTime(timeStamp);
    return newDate.pattern(formatStr);
}

/**
 * js Map工具类
 */
function Map() {
	/** 存放键的数组(遍历用到) */
    this.keys = new Array();
	/** 存放数据 */
    this.data = new Object();

	/**
	 * 放入一个键值对
	 *
	 * @param {String}
	 *            key
	 * @param {Object}
	 *            value
	 */
    this.put = function(key, value) {
        if (this.data[key] == null) {
            this.keys.push(key);
        }
        this.data[key] = value;
    };

	/**
	 * 获取某键对应的值
	 *
	 * @param {String}
	 *            key
	 * @return {Object} value
	 */
    this.get = function(key) {
        return this.data[key];
    };

	/**
	 * 删除一个键值对
	 *
	 * @param {String}
	 *            key
	 */
    this.remove = function(key) {
        var index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
        this.data[key] = null;
    };

	/**
	 * 遍历Map,执行处理函数
	 *
	 * @param {Function}
	 *            回调函数 function(key,value,index){..}
	 */
    this.each = function(fn) {
        if (typeof fn !== 'function') {
            return;
        }
        var len = this.keys.length;
        for (var i = 0; i < len; i++) {
            var k = this.keys[i];
            fn(k, this.data[k], i);
        }
    };

	/**
	 * 获取键值数组(类似<a href="http://lib.csdn.net/base/javase" class='replace_word'
	 * title="Java SE知识库" target='_blank' style='color:#df3434;
	 * font-weight:bold;'>Java</a>的entrySet())
	 *
	 * @return 键值对象{key,value}的数组
	 */
    this.entrys = function() {
        var len = this.keys.length;
        var entrys = new Array(len);
        for (var i = 0; i < len; i++) {
            entrys[i] = {
                key: this.keys[i],
                value: this.data[i]
            };
        }
        return entrys;
    };

	/**
	 * 判断Map是否为空
	 */
    this.isEmpty = function() {
        return this.keys.length == 0;
    };

	/**
	 * 获取键值对数量
	 */
    this.size = function() {
        return this.keys.length;
    };

	/**
	 * 重写toString
	 */
    this.toString = function() {
        var s = '{';
        for (var i = 0; i < this.keys.length; i++, s += ',') {
            var k = this.keys[i];
            s += k + '=' + this.data[k];
        }
        s += '}';
        return s;
    };
}

/**
 * replaceAllStr
 * @param str
 * @param r_str
 * @param t_str
 * @returns
 */
function replaceAll(str, r_str, t_str) {
    var re = new RegExp(r_str, 'g');
    return str.replace(re, t_str);
}

/**
 * java hashCode
 * @param str
 * @returns {Number}
 */
function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


function formatMsgTime(lastTime, flag) {
	// 获得今天零点的时间戳
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var todayTime = today.getTime();
	// 昨天零点时间戳
    var yesterdayTime = todayTime - 1000 * 60 * 60 * 24;
	// 一周之内零点时间戳
    var oneWeekTime = todayTime - 1000 * 60 * 60 * 24 * 6;
	// 今年的年份
    var nowYear = today.getFullYear();
    var lastTimes = new Date(lastTime);
    var lastYear = lastTimes.getFullYear();
	// 今天
    if (lastTime > todayTime) {
        var time = date_format(lastTime, 'HH:mm');
	    return time;
    }
	// 昨天
    if (lastTime < todayTime && lastTime >= yesterdayTime) {
        var time = '昨天 ' + date_format(lastTime, 'HH:mm');
        return time;
    }
	// 一周内
    if (lastTime < yesterdayTime && lastTime >= oneWeekTime) {
        var time = date_format(lastTime, 'E HH:mm');
        return time;
    }
	// 一周之外 且今年内
    if (lastTime < oneWeekTime && nowYear == lastYear) {
        var time = date_format(lastTime, 'MM/dd HH:mm');
        if (flag) {
            time = date_format(lastTime, 'MM-dd HH:mm');
        }
        return time;
    }
	// 早年
    if (lastTime < oneWeekTime && nowYear > lastYear) {
        var time = date_format(lastTime, 'yyyy/MM/dd HH:mm');
        if (flag) {
            time = date_format(lastTime, 'yyyy-MM-dd');
        }
        return time;
    }
}

function myformatMsgTime(lastTime, flag) {
    // 获得今天零点的时间戳
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var todayTime = today.getTime();
    // 昨天零点时间戳
    var yesterdayTime = todayTime - 1000 * 60 * 60 * 24;
    // 一周之内零点时间戳
    var oneWeekTime = todayTime - 1000 * 60 * 60 * 24 * 6;
    // 今年的年份
    var nowYear = today.getFullYear();
    var lastTimes = new Date(lastTime);
    var lastYear = lastTimes.getFullYear();
    // 今天
    if (lastTime > todayTime) {
        var time = date_format(lastTime, 'HH:mm');
        return time;
    }
    // 昨天
    if (lastTime < todayTime && lastTime >= yesterdayTime) {
        var time = '昨天';
        return time;
    }
    // 一周内
    if (lastTime < yesterdayTime && lastTime >= oneWeekTime) {
        var time = date_format(lastTime, 'E');
        return time;
    }
    // 一周之外 且今年内
    if (lastTime < oneWeekTime && nowYear == lastYear) {
        var time = date_format(lastTime, 'MM/dd');
        return time;
    }
    // 早年
    if (lastTime < oneWeekTime && nowYear > lastYear) {
        var time = date_format(lastTime, 'yyyy/MM/dd');
        return time;
    }
}


function decodeStr(str) {
    $('#decode').html(str);
    var result = $('#decode').text();
    return result;
}

function codeStr(str) {
    $('#decode').text(str);
    var result = $('#decode').html();
    return result;
}

function encodeCharacterEntities(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function decodeCharacterEntities(str) {
    return str.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

// 标题长度限制20字符
function chatTitleLength(str, num) {
    if (str.length <= 20) {
        var result = str.substring(0, 20) + '(' + num + '人)';
    } else {
        var result = str.substring(0, 20) + '...(' + num + '人)';
    }
    return result;
}

/**
 * 文件字节转换为单位大小
 * @param bytes 文件大小
 * @returns 对应的MB保留两位小数
 */
function bytesToSize(bytes) {
    if (bytes === '0' || bytes === 0) return '0B';

    var k = 1024;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat(bytes / Math.pow(k, i)).toFixed(2) + sizes[i];
    // toPrecision(3) 后面保留一位小数，如1.0GB                                                                                                                  //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

/**
 * 返回文件列表里的状态
 * @param status 文件状态
 * @param senderImId 发送人id
 * @returns
 */
function fileStatus(status, senderImId, from, isExist, msgStatus) {
    var obj1 = {
        '未下载': '0',
        '下载中': '1',
        '已下载': '2',
        '已过期': '3',
        '暂停下载': '4',
        '下载失败': '100',
        '文件被删除': '101'
    };
    var obj2 = {
        '未发送': '0',
        '发送中': '1',
        '已发送': '2',
        '已过期': '3',
        '暂停发送': '4',
        '发送失败': '100'
    };
    var fromType = parseInt(from / 1000000);  // 0 ios  1 Android  2 桌面端
    if (senderImId == myInfo.imUserid) {
        if (fromType == 2) {
            if (msgStatus == 0) {
                for (var attr2 in obj2) {
                    if (obj2[attr2] == status) {
                        return attr2;
                    }
                }
            } else {
                for (var attr1 in obj1) {
                    if (obj1[attr1] == status) {
                        return attr1;
                    }
                }
            }
        } else {
            for (var attr1 in obj1) {
                if (obj1[attr1] == status) {
                    return attr1;
                }
            }
        }
    } else {
        for (var attr1 in obj1) {
            if (obj1[attr1] == status) {
                return attr1;
            }
        }
    }
}

/**
 * 取得文件的后缀
 * @param str 文件名
 * @returns 对应文件图片路径
 */
function fileTypeImg(str) {
    var str = str || '';
    var d = /\.([^\.]+$)/.exec(str);
    if (d[1] == 'doc' || d[1] == 'docx') {
        return '../images/file/WORD56.png';
    } else if (d[1] == 'xls' || d[1] == 'xlsx') {
        return '../images/file/EXCEL56.png';
    } else if (d[1] == 'ppt' || d[1] == 'pptx') {
        return '../images/file/PPT56.png';
    } else if (d[1] == 'pdf') {
        return '../images/file/PDF56.png';
    } else if (d[1] == 'txt') {
        return '../images/file/TXT56.png';
    } else {
        return '../images/file/other56.png';
    }
}


/**
 * canvas进度动画
 * @param str
 * @returns
 */
function canvasShadow() {
    // canvas扇形loading动画
	/* x起始横坐标
	 * y起始纵坐标
	 * radius 半径
	 * color 颜色
	 * sAngle 起始角度
	 * eAngle 终止角度
	 * deg 百分比值1--100
	 * */
    /* CanvasRenderingContext2D.prototype.sector = function (x, y, radius,color, sAngle, eAngle, deg) {
        var width = this.canvas.width;
        var height = this.canvas.height;
        this.clearRect(-width/2, -height/2, width, height);
        this.beginPath();
        this.fillStyle = color;
        this.moveTo(0, 0);
        this.arc(0, 0, radius, sAngle, eAngle, deg);
        this.closePath();
        return this;
    };
    var canvas = document.getElementsByClassName('canvas');
    var canvasLen = canvas[0].width;
    var deg = 0;
    var ctxObj = { };
//初始化所有的遮罩层
    for(var i = 0; i < canvas.length; i++){
        ctxObj[i] = canvas[i].getContext('2d');
        ctxObj[i].translate(canvasLen/2, canvasLen/2);
        ctxObj[i].sector(canvasLen/2, canvasLen/2, 50,'rgba(0,0,0,0.2)', 0, Math.PI * 2, true).fill();
    }


   /* var timer = setInterval(function () {
        deg++;
        if (deg == 100) {
            clearInterval(timer);
            $('.shadow').remove();
        }
        ctxObj[0].sector(canvasLen / 2, canvasLen / 2, 50, 'rgba(0,0,0,0.2)', 0, Math.PI * 2 / 50 * deg, true).fill();
    }, 200)
    var percent = 0;
    var timer2 = setInterval(function () {
        percent++;
        if (percent == 100) {
            clearInterval(timer2);
        }
        ctxObj[1].sector(canvasLen / 2, canvasLen / 2, 50, 'rgba(0,0,0,0.2)', 0, Math.PI * 2 / 100 * percent, true).fill();
    }, 300) */
}


/**
 * 取得文件扩展名
 * @param str
 * @returns
 */
function getFileType(str) {
    var str = str || '';
    var d = /\.([^\.]+$)/.exec(str);
    return d ? d[1] : '';
}
/**
 * 取得文件名带扩展名
 * @param str
 * @returns
 */

function getFileNameWidthType(str) {
    var str = str || '';
    var reg = /[^\/]*[\/]+/g;
    str = str.replace(reg, '');
    return str;
}
/**
 * 取得文件名不带扩展名
 * @param str
 * @returns
 */

function getFileNameWidthOutType(str) {
    var str = str || '';
    return str.replace(/(.*\/)*([^.]+).*/ig, '$2');
}
/**
 * 去除空格
 * @param str
 * @returns
 */
function trimSpace(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * 校验七天有效期
 * @param sendtime发送文件时间
 * @param 文件的当前状态
 * @returns 新的状态
 */
function validityDate(sendTime, status) {
    return status;
}
function documentSelectElement(element) {
    var sel = window.getSelection();
    if (sel.toString()) {
        return;
    }
    var range = document.createRange();
    range.selectNode(element);
    sel.removeAllRanges();
    sel.addRange(range);
}

function HTMLEncode(input) {
    var converter = document.createElement('DIV');
    converter.innerText = input;
    var output = converter.innerHTML;
    converter = null;
    return output;
}
function HTMLDecode(text) {
    var temp = document.createElement('div');
    temp.innerHTML = text;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

function _deepClone(obj) {
    var result = typeof obj.splice === 'function' ? [] : {},
        key;
    if (obj && typeof obj === 'object') {
        for (key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                result[key] = _deepClone(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }
    return obj;
}

function _debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
        var last = Date.parse(new Date()) - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = Date.parse(new Date());
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

function _throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.parse(new Date());
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.parse(new Date());
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

function getGroupId(imid, imUserid ) {
    if (imid > imUserid) {
        return imUserid + '_' + imid;
    } else if (imid < imUserid) {
        return imid + '_' + imUserid;
    } else {
        return imid + '_' + imUserid;
    }
}
function setNickNameColorToLocal(val) {
    setToLocal('NICKNAMECOLOR', val);
}
function getNickNameColorToLocal() {
    return getFromLocal('NICKNAMECOLOR');
}
function setToLocal(key, val) {
    localStorage[key] = val
}

function getFromLocal(key) {
    return localStorage[key]
}

function loadScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = script.onreadystatechange = function(){
        if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
            callback && callback();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    head.insertBefore( script, head.firstChild );
}
