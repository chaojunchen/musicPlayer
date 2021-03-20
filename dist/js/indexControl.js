// 控制音乐播放顺序（下标的控制）
; (function (root) {
    function Index (len) {
        this.len = len; //歌曲总数
        this.index = 0; // 当前的歌曲
    }
    Index.prototype = {
        prev () { //上一首
            return this.get(-1);
        },
        next () {
            return this.get(1);
        },
        // 得到下标，判断是否超出范围
        get (val) {
            this.index = (this.index + val + this.len) % this.len;
            // %代表区间的意思。n%4 结果就是0，1，2，3
            // 不加上this.len = 0 1 2 3 只能用于切换下一首
            // 加上this.len = -0 -1 -2 -3  加上this.len
            //               ( 4  3  2  1 ) % 4 = 0 1 2 3
            //  (this.index + val  + this.len) % 4 -->0123但是为了防止负数出现+this.len就不可能有负数
            //  0 + -1 + 4  %  4 = 3
            //  3 + -1 + 4  %  4 = 2
            //  2 + -1 + 4  %  4 = 1
            //  1 + -1 + 4  %  4 = 0
            //  0 + -1 + 4  %  4 = 3
            return this.index;
        }
    }
    root.IndexControl = Index;
    // window.musicPlayer || (window.musicPlayer = {})
})(window.musicPlayer || (window.musicPlayer = {}))