/**
 * Created by shangkuikui on 2017/4/14.
 */

+(function() {
    var Logger = function(level) {
        this.CURRENT_LEVEL = level;
    };
    Logger.LEVEL_DEBUG = 0;
    Logger.LEVEL_INFO = 1;
    Logger.LEVEL_WARN = 2;
    Logger.LEVEL_ERROR = 3;
    Logger.LEVEL_FATAL = 4;


    Logger.prototype = {

        info: function() {
            this.message(Logger.LEVEL_INFO, arguments);
        },
        message: function(level, args) {
            if (level > this.CURRENT_LEVEL) {
                var temp = [];
                [].forEach.call(args, function(item) {
                    temp.push(item);
                });
                console.log(temp);
            }
        }
    };
    window.klogger = new Logger(Logger.LEVEL_FATAL);
}());
