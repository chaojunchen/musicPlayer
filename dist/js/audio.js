// 音乐模块。处理音乐：播放、暂停、移动、
; (function (player) {
    function AudioManage () {
        this.status = "pause"; //当前音乐的状态：播放 || 暂停
        this.audio = document.createElement("audio");
        this.timer = null;
        this.speed = 0;
    }
    AudioManage.prototype = {
        load (src) {
            this.audio.src = src;
        },
        play () {
            this.status = "play";
            this.audio.play();
            const This = this;
            clearInterval(This.timer);
            This.timer = setInterval(() => {
                This.speed = This.audio.volume * 1.2;
                if (This.speed >= 1) {
                    clearInterval(This.timer);
                } else {
                    This.audio.volume = This.speed;
                }
            }, 20);
        },
        pause () {
            const This = this;
            clearInterval(This.timer);
            This.timer = setInterval(() => {
                This.speed = This.audio.volume / 1.2;
                if (This.speed <= 0.05) {
                    This.status = 'pause';
                    This.audio.pause();
                    clearInterval(This.timer);
                } else {
                    This.audio.volume = This.speed;
                }
            }, 20);
        },
        //当进度条拖动时的处理
        playTo (target) {
            this.audio.currentTime = target;
        },
        // 音乐播放完成
        end (fn) {
            this.audio.onended = fn;//利用回调处理
        }
    }
    player.music = new AudioManage();
})(window.musicPlayer || (window.musicPlayer = {}))