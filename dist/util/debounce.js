; (function (root) {
    function debounce (func, time) {
        let firstTime = null;
        return function (e) {
            let nowTime = new Date().getTime();
            if (nowTime - firstTime > time) {
                func.apply(this, arguments);
                firstTime = nowTime;
            }
        }
    }
    root["debounce"] = debounce;
})(window.musicPlayer || (window.musicPlayer = {}));