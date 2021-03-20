// 这个模块负责进度条的功能
; (function (root) {
    // 进度条
    function Progress () {
        this.durationTime = 0;//总时间
        this.startTime = 0;//开始时间
        this.timer = null;//计时器
        this.lastTime = 0;//用于记录已经走百分之多少。
        this.init();
    }
    Progress.prototype = {
        init () {
            this.getDom();
        },
        // 获取dom元素
        getDom () {
            this.totalTime = document.querySelector(".totalTime");
            this.currentTime = document.querySelector(".currentTime");
            this.circle = document.querySelector(".circle");
            this.totalBg = document.querySelector(".totalBg");
            this.currentBg = document.querySelector(".currentBg");
        },
        // 解析时间 60s ---》 01:00样式
        parseTime (time) {
            time = Math.round(time); //更新时间时防止出现小数
            let m = Math.floor(time / 60);
            let s = time % 60;
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s; 
            return (m + ":" + s)
        },
        // 把总是长渲染出来
        renderTotalTime (time) {
            this.durationTime = time;//更新总时间
            time = this.parseTime(time);//变成10：10形式
            this.totalTime.innerText = time;
        },
        //进度条移动 不断计算
        move (per) {
            /**
             * per:每次切歌都应该从0开始播放。
             * 这个参数就是用于判断是否该从0开始播放。
             * 如果没有那么就会从上一次的进度接着播放。有值（值尽量为0）那么就会从头开始播放。
             */
            this.lastTime = per === undefined ? this.lastTime : per;
            //清除上一次的定时器，每次播放都会开启一个定时器。当点击下一首是也会播放。
            // 那么就开启了多个定时器。点击暂停只是暂停上一首歌的定时器。那么当前的这
            // 一首歌进度条还是会走
            cancelAnimationFrame(this.timer);
            const This = this;
            this.startTime = new Date().getTime();//每次播放都会记录时间点，也会重新赋值。
            function frame () {
                // 这个方法会用定时器执行。currentTime会一直++；
                // 但是move执行时会重新赋值this.startTime;那么比例就会归零。

                let currentTime = new Date().getTime();
                //走了多少比例 =     已经播放的百分比 +  (求出当前歌曲走了多少时间    /    总的歌曲时间 )
                let percentage = This.lastTime + ((currentTime - This.startTime) / (This.durationTime * 1000));//得到百分比
                // 这个比例小于1那么歌曲就还没有走完。
                if (percentage <= 1) {
                    This.update(percentage);
                } else { //歌曲以及播放完了。
                    cancelAnimationFrame(This.timer);
                }
                // 开启定时器。
                This.timer = requestAnimationFrame(frame);
            }
            frame();
        },
        // 更新
        update (percentage) {
            const time = this.parseTime(percentage * this.durationTime);
            // 更新当前时间
            this.currentTime.innerText = time;
            // 更新进度条宽带
            this.currentBg.style.width = percentage * 100 + "%";

            // 更新小圆点
            // 第一种方法。
            // this.circle.style.left = `calc(${percentage * 100 + "%"} - 2.3vw)`

            // 第二种:得到的是px
            // 小圆点的范围就在父级之内。用比例求出占了父级的多少像素
            let distanceX = percentage * (this.currentBg.parentElement.offsetWidth);
            this.circle.style.transform = `translatex(${distanceX}px)`
        },
        // 停止
        pause () {
            cancelAnimationFrame(this.timer);
            const stop = new Date().getTime(); //记录暂停的时间点
            //记录已经播放了百分之多少 。 不+=的话多次暂停  上次播放的记录（this.startTime)会被重新赋值,就可能会为0%。
            this.lastTime += (stop - this.startTime) / (this.durationTime * 1000);
        }
    }

    function instanceProgress () {
        return new Progress();
    }
    // 拖到进度条。ele为dom对象，谁要拖到
    function Drag (ele) {
        this.obj = ele;
        this.startPointX = 0;//记录开始托的点
        this.percentage = 0;//记录百分比。
        this.startLeft = 0;//记录已经走的距离。通过小圆点的translate值得到
        this.init();
    }
    Drag.prototype = {
        // 主要时添加事件。
        init () {
            const This = this;
            this.obj.style.transform = "translatex(0)";//给一个初始值，防止后面读取时出错。

            // 手中开始触摸屏幕。
            this.obj.addEventListener("touchstart", function (ev) {
                // 手指按下记录按下的点，为了计算移动的距离
                This.startPointX = ev.changedTouches[0].clientX;

                //每次按下得到小圆点的translatex值。这个值就是已经走过来的时间
                This.startLeft = parseFloat(this.style.transform.split("(")[1])

                // 暴露函数。后续自己添加。如果有这个函数，执行。
                This.start && This.start();
            })
            // 手指移动
            this.obj.addEventListener("touchmove", function (ev) {
                ev.preventDefault();
                // 计算移动的距离 =        当前点坐标x        -   按下点的坐标x
                This.distanceX = ev.changedTouches[0].clientX - This.startPointX;

                // 把已经走了的距离再加上
                //      this指向当前点击的小圆点
                let l = This.startLeft + This.distanceX;
                // 父级的宽度
                const parentWidth = this.parentElement.offsetWidth;
                if (l <= 0) {
                    l = 0; //小圆点的移动范围只能再父级width之内。
                } else if (l > parentWidth) {
                    l = parentWidth;
                }
                // 得到百分比、值 <=1
                This.percentage = l / parentWidth;

                // 暴露函数，自行添加。形成为已走过的百分比。
                This.move && This.move(This.percentage);
            })
            // 手指抬起
            this.obj.addEventListener("touchend", function () {
                // 自行添加处理函数。
                This.end && This.end(This.percentage);
            })
        },
        // 按下,实例后自行重写
        start () {

        },
        // 开始移动,实例后自行重写
        move () {

        },
        // 手指抬起,实例后自行重写
        end () {

        },

    }
    // 实例化拖动。
    function instanceDrag (ele) {
        return new Drag(ele);
    }
    root.progressModule = {
        progress: instanceProgress,
        drag: instanceDrag
    }
    // let wrap = new instanceDrag(document.getElementsByClassName("circle")[0]);
    // console.log(wrap);
    // wrap.move = function () {
    //     console.log("S");
    // }
    // console.log(wrap);
})(window.musicPlayer || (window.musicPlayer = {}));
