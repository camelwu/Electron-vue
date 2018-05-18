/**
 * 当前登录人的信息
 */
var myInfo;

/**
 * 全局聊天对象，值为正在聊天的窗口参数
 */
var CHATOBJ = {};

/**
 * 消息盒子回调获取的对象
 */
var messageBoxOBJ = {};

/**
 * 在线发送消息和接收消息的时间容器
 * 结构： {
 * 			'groupId1':lastTime1,
 * 			'groupId2':lastTime2
 * 		}
 */
var lastMsgTimeMap = new Map();

/**
 * 聊天窗口内首条消息时间容器
 * 结构： {
 * 			'groupId1':lastTime1,
 * 			'groupId2':lastTime2
 * 		}
 */
var firstMsgTimeMap = new Map();

/**
 * 回执消息容器
 * 结构：	{
 * 			'groupId':	[{
 * 							'senderId':1111
 * 							'seqId':1111
 * 							'msgId':1
 *						}],[{.....}]
 * 		}
 */
var receiptMap = new Map();

/**
 * 特殊消息数量容器
 * 结构： {
 *          'groupId': [{
 *              'AtMeCount' : 0,
 *              'GroupAnnouncementCount': 0,
 *              'ReportCount': 0
 *          }]
 * }
 */
var specialMassageCountMap = new Map();


/**
 * 消息重发的集合
 */
var resendMsgMap = new Map();

/**
 * 窗口最大化和还原
 */
var windowSize = false;

/**
 * 输入区光标对象
 */

var sel, range;
var rangeMap = new Map();

/**
 * 默认表情
 */
/* var faces = [
             "微笑","色","亲亲","得意","流泪","害羞","闭嘴","鼓掌","大哭","尴尬",
             "生气","调皮","呲牙","惊讶","委屈","吐血","冷汗","抓狂","难过","偷笑",
             "白眼","不屑","快哭了","困","装酷","大笑","偷瞄","奋斗","咒骂","疑问",
        	 "晕","捶打","再见","抠鼻","发呆","坏笑","哈欠","鄙视","睡觉","饿",
        	 "阴险","难受","可怜","撇嘴","石化","泪眼"
        	]; */
// var faces = ["微笑","YY","惊恐","愤怒","色","尴尬","石化","大笑","流泪","可怜",
//              "大哭","晕","抠鼻","得意","疑问","抓狂","亲","恶心","鄙视","伤心",
//              "阴险","困","迷茫","睡觉","努力"];

// var faces = ['aixin', 'baiyan', 'bishi', 'bizui', 'buxie', 'chuida', 'ciya', 'daku', 'daxiao', 'deyi',
//     'dianzan', 'e', 'fadai', 'fendou', 'ganga', 'guzhang', 'haixiu', 'haqian',
//     'huaixiao', 'jingya', 'kelian', 'koubi', 'kuaikule', 'kun', 'leiyan', 'lenghan',
//     'liulei', 'nanguo', 'nanshou', 'OK', 'piezui', 'qin', 'se', 'fennu', 'shihua',
//     'shuijiao', 'tiaopi', 'toumiao', 'touxiao', 'tuxie', 'weiqu', 'weixiao', 'xiaoku',
//     'yinxian', 'yiwen', 'yun', 'zaijian', 'zhouma', 'zhuakuang', 'zhuangku'];.

var faces = ['baoxin', 'dianzan', 'xiaolianOK', 'face_01', 'face_02', 'face_03', 'face_04', 'face_05', 'face_06', 'face_07', 'face_08', 'face_09', 'face_10',
    'face_11', 'face_12', 'face_13', 'face_14', 'face_15', 'face_16', 'face_17', 'face_18', 'face_19', 'face_20',
    'face_21', 'face_22', 'face_23', 'face_24', 'face_25', 'face_26', 'face_27', 'face_28', 'face_29', 'face_30',
    'face_31', 'face_32', 'face_33', 'face_34', 'face_35', 'face_36', 'face_37', 'face_38', 'face_39', 'face_40',
    'face_41', 'face_42', 'face_43', 'face_44', 'face_45', 'face_46', 'face_47', 'face_48', 'face_49', 'face_50',
    'face_51', 'face_52', 'face_53', 'face_54', 'face_55', 'face_56', 'face_57', 'face_58', 'face_59', 'face_60',
    'face_61', 'face_62', 'face_63', 'face_64', 'face_65', 'face_66', 'face_67', 'face_68', 'face_69', 'face_70',
    'face_71', 'face_72', 'face_73', 'face_74', 'face_75', 'face_76', 'face_77', 'face_78', 'face_79', 'face_80',
    'face_81', 'face_82', 'face_83', 'face_84', 'face_85', 'face_86', 'face_87', 'face_88', 'face_89', 'face_90',
    'face_91', 'face_92', 'face_93', 'face_94', 'face_95', 'face_96', 'face_97', 'face_98', 'face_99', 'face_100',
    'face_101'];
   
// var facesMap = {
//     'aixin': '爱心',
//     'baiyan': '白眼',
//     'bishi': '鄙视',
//     'bizui': '闭嘴',
//     'buxie': '不屑',
//     'chuida': '捶打',
//     'ciya': '呲牙',
//     'daku': '大哭',
//     'daxiao': '大笑',
//     'deyi': '得意',
//     'dianzan': '点赞',
//     'e': '饿',
//     'fadai': '发呆',
//     'fendou': '奋斗',
//     'ganga': '尴尬',
//     'guzhang': '鼓掌',
//     'haixiu': '害羞',
//     'haqian': '哈欠',
//     'huaixiao': '坏笑',
//     'jingya': '惊讶',
//     'kelian': '可怜',
//     'koubi': '抠鼻',
//     'kuaikule': '快哭了',
//     'kun': '困',
//     'leiyan': '泪眼',
//     'lenghan': '冷汗',
//     'liulei': '流泪',
//     'nanguo': '难过',
//     'nanshou': '难受',
//     'OK': 'OK',
//     'piezui': '撇嘴',
//     'qin': '亲',
//     'se': '色',
//     'fennu': '愤怒',
//     'shihua': '石化',
//     'shuijiao': '睡觉',
//     'tiaopi': '调皮',
//     'toumiao': '偷瞄',
//     'touxiao': '偷笑',
//     'tuxie': '吐血',
//     'weiqu': '委屈',
//     'weixiao': '微笑',
//     'xiaoku': '笑哭',
//     'yinxian': '阴险',
//     'yiwen': '疑问',
//     'yun': '晕',
//     'zaijian': '再见',
//     'zhouma': '咒骂',
//     'zhuakuang': '抓狂',
//     'zhuangku': '装酷'
// };

var facesMap = {
    'baoxin':'抱心',
    'dianzan':'点赞',
    'xiaolianOK':'笑脸OK',
    'face_01':'微笑',
    'face_02':'色',
    'face_03':'亲亲',
    'face_04':'得意',
    'face_05':'流泪',
    'face_06':'害羞',
    'face_07':'闭嘴',
    'face_08':'鼓掌',
    'face_09':'大哭',
    'face_10':'尴尬',
    'face_11':'生气',
    'face_12':'调皮',
    'face_13':'呲牙',
    'face_14':'惊讶',
    'face_15':'委屈',
    'face_16':'吐血',
    'face_17':'冷汗',
    'face_18':'抓狂',
    'face_19':'难过',
    'face_20':'偷笑',
    'face_21':'白眼',
    'face_22':'不屑',
    'face_23':'快哭了',
    'face_24':'困',
    'face_25':'装酷',
    'face_26':'大笑',
    'face_27':'偷瞄',
    'face_28':'奋斗',
    'face_29':'咒骂',
    'face_30':'疑问',
    'face_31':'晕',
    'face_32':'捶打',
    'face_33':'再见',
    'face_34':'抠鼻',
    'face_35':'发呆',
    'face_36':'坏笑',
    'face_37':'哈欠',
    'face_38':'鄙视',
    'face_39':'睡觉',
    'face_40':'饿',
    'face_41':'阴险',
    'face_42':'难受',
    'face_43':'可怜',
    'face_44':'撇嘴',
    'face_45':'石化',
    'face_46':'泪眼',
    'face_47':'嘘',
    'face_48':'哼哼',
    'face_49':'爱慕',
    'face_50':'财迷',
    'face_51':'耶',
    'face_52':'思考',
    'face_53':'骷髅',
    'face_54':'痛哭',
    'face_55':'恭喜',
    'face_56':'捂脸',
    'face_57':'嘿哈',
    'face_58':'机智',
    'face_59':'皱眉',
    'face_60':'安慰',
    'face_61':'飞吻',
    'face_62':'奸笑',
    'face_63':'猪头',
    'face_64':'玫瑰',
    'face_65':'凋谢',
    'face_66':'爱心',
    'face_67':'心碎',
    'face_68':'蛋糕',
    'face_69':'喝水',
    'face_70':'西瓜',
    'face_71':'咖啡',
    'face_72':'啤酒',
    'face_73':'包包',
    'face_74':'高跟鞋',
    'face_75':'帽子',
    'face_76':'口红',
    'face_77':'裙子',
    'face_78':'T恤',
    'face_79':'裤子',
    'face_80':'眼镜',
    'face_81':'太阳镜',
    'face_82':'蜡烛',
    'face_83':'礼物',
    'face_84':'红包',
    'face_85':'拥抱',
    'face_86':'太阳',
    'face_87':'月亮',
    'face_88':'便便',
    'face_89':'炸弹',
    'face_90':'菜刀',
    'face_91':'握手',
    'face_92':'胜利',
    'face_93':'赞',
    'face_94':'OK',
    'face_95':'勾引',
    'face_96':'NO',
    'face_97':'打脸',
    'face_98':'抱拳',
    'face_99':'乒乓球',
    'face_100':'足球',
    'face_101':'篮球'
};



/**
 * 表情展开状态
 */
var faceOpen = false;

/**
 * 我的群组展开状态
 */
var myGroupOpen = false;

/**
 * 常用联系人展开状态
 */
var myContactsOpen = false;


/**
 * 我的频道展开状态
 */
var myChannelOpen = false;


/**
 * 文件列表展开状态
 */
var filesListOpen = false;

/**
 * 发起群聊弹出状态
 */
var groupChatOpen = false;

/**
 * 群组详情删除成员弹出状态
 */
var groupDelMemberOpen = false;

/**
 * 群组详情弹窗删除成员弹出状态
 */
var groupWindowDelMemberOpen = false;

/**
 * 群组详情添加成员弹出状态
 */
var groupAddMemberOpen = false;

/**
 * 群组详情弹窗添加成员弹出状态
 */
var groupWindowAddMemberOpen = false;

/**
 * 点击创建群还是添加群成员
 */
var createOrAdd;

/**
 * 发起群聊常用联系人展开状态
 */
var myContactsOpen2 = false;

/**
 * 刷新是否完成
 */
var refreshisfinished = true;

/**
 * 部门树选中标识
 */
var DEPT = {};

/**
 * 草稿
 */
var draftMap = new Map();

/**
 * 常用联系人发起会话参数
 */
var contactsDetailObj;

/**
 * 我的群组发起会话参数
 */
var groupDetailObj;

/**
 * 定时器容器
 */
var timer = {};

/**
 * 置顶会话总数
 */
var topNum = 0;

/**
 * 切换会话滚动条位置记录
 */
var scrollTopMap = new Map();

/**
 * 是否开启消息提示音
 */
var soundOpen;

/**
 * 新消息提示及未读消息定位容器
 * 格式：{
 * 		'groupId':{
 * 			'type':0------第一次打开  1------不是第一次打开
 * 			'msgId':'11111111'
 * 			'position':1111,
 * 			'unreadNum':12,
 * 			'oldPosition':111
 * 		},
 * 		groupid:{
 *
 * 		}.......
 * }
 */
var newMsgTipMap = new Map();

/**
 * 支持的文件格式
 * @type {{pdf: [*], ppt: [*], txt: [*], word: [*], other: [*], excel: [*]}}
 */
var fileThumbnail =
    {
        PDF: ['pdf'],
        PPT: ['ppt', 'pptx', 'ppsx'],
        TXT: ['txt', 'pps'],
        WORD: ['doc', 'docx', 'dotx'],
        OTHER: [ 'pot', 'rtf', 'wps', 'et', 'dps', 'epub', 'potx', 'dot'],
        EXCEL: ['xls', 'xlsx', 'xlt', 'xltx'],
        Video: ['mp4', 'avi', 'rm', 'asf', 'wmv', 'mov', '3gp', 'rmvb', 'avs', 'flv', 'mkv', 'mpg', 'dat', 'ogm', 'vob', 'rm', 'ts', 'tp', 'ifo', 'nsv', 'm2ts', 'swf'],
        Audio: ['wav', 'mp3', 'ra', 'rma', 'wma', 'ogg', 'ape', 'flac', 'acc', 'mpc', 'aac', 'au', 'aiff', 'ape', 'mod', 'asf', 'cda', 'mid', 'mka', 'mpa', 'ofr', 'wv', 'tta', 'ac3', 'dts'],
        VSD: ['vsd'],
        RAR: ['rar'],
        ZIP: ['zip']
    };

/**
 * 支持的文件格式src
 * @type {{pdf: [*], ppt: [*], txt: [*], word: [*], other: [*], excel: [*]}}
 */
var fileThumbnailSrc =
    {
        PDF: 'PDF',
        PPT: 'PPT',
        TXT: 'TXT',
        WORD: 'WORD',
        OTHER: 'other',
        EXCEL: 'EXCEL',
        Video: 'video',
        Audio: 'sound',
        VSD: 'vsd',
        RAR: 'rar',
        ZIP: 'zip'
    };
/**
 * 文件背景颜色
 */
var fileBgColorClassNameObj = {
    PDF: 'pdf-bac-color on ',
    TXT: 'txt-bac-color on ',
    PPT: 'ppt-bac-color on ',
    EXCEL: 'excel-bac-color on ',
    OTHER: 'other-bac-color on ',
    WORD: 'doc-bac-color on ',
    Video: 'video-bac-color on ',
    Audio: 'audio-bac-color on ',
    VSD: 'vsd-bac-color on ',
    RAR: 'rar-bac-color on ',
    ZIP: 'zip-bac-color on '
};
/**
 * 屏蔽的文件格式src
 * @type
 */
var fileLimitType = ['COM', 'BAT', 'CHM', 'HLP', 'JS', 'MSI', 'SCR', 'VBS', 'REG', 'app', 'APP'];

/**
 * 把文件转换成图片的格式
 * @type
 */
var fileImgType = ['BMP', 'JPG', 'JPEG', 'PNG', 'GIF'];
// PC来源
var PcSourceType = 2;
/**
 * 文件来源
 */
var sourceFromObj = {
    '0': 'Aeromind移动端', // android
    '1': 'Aeromind移动端', // ios
    '2': 'Aeromind桌面端'
};
/**
 * 当前激活的输入框
 */
let currentInput
const AllINPUT = {
    'SEARCH':'搜索框的input',
    'FORWARD': '转发的input',
    'PRE':'消息发送区的pre'
}
