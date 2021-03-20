// 用于获取数据并渲染出来，加上会选择的图片.添加事件。选择的图片。利用其他模块导出的audio播放音乐
; (function (ajax, player) {
    function musicPlayer (wrap) {
        this.wrap = wrap; //歌曲列表的数据是js生成的，这些数据（js生成dom元素）要添加到那个dom元素里。
        this.dataList = null;//数据列表
        this.music = player.music; //音乐模块。再加载音乐时赋值。这个方法处理audio的功能。如状态、更新、停止。已经是实例化对象了。
        this.render = player.render;//渲染音乐、图片、音乐信息。吧数据传入就可以
        this.totalMusic = null;//音乐一共多少首,在getData中赋值
        this.timer = null;//选择图片的定时器
        this.indexObj = null;//下标模块。变化下标来达到切歌.再得到数据后赋值。
        this.musicList = null;//  音乐列表模块。主要添加事件、创建数据、动画等。在获取数据后加载该模块
        this.progress = player.progressModule.progress();//实例化进度条。
    }
    musicPlayer.prototype = {
        init () {
            this.getData("../data/songList.json");
            this.getDom();
        },
        getDom () {
            // 要选择的图片dom对象
            this.record = document.querySelector(".songImg img");
            //底部控制区域，得到所有的子dom对象
            this.control = document.querySelector(".control").children;
            const veriable = {
                "isLike": 0,
                "prev": 1,
                "toggle": 2,
                "next": 3,
                "openList": 4
            }
            for (const key in veriable) {
                if (veriable.hasOwnProperty(key)) {
                    this[key] = this.control[veriable[key]]
                    // this.isLike = this.control[0];
                }
            }
            // //是否喜欢这首歌的dom对象
            // this.isLike = this.control[0];
            // //切换上一首个的dom对象
            // this.prev = this.control[1];
            // //暂停与播放的都dom对象
            // this.toggle = this.control[2]
            // //切换下一首一首个的dom对象
            // this.next = this.control[3];
            // // 所有歌曲的列表的dom对象
            // this.musicList = this.control[4];
            // console.log(this.toggle);
        },
        // 获取数据
        getData (url) {
            let This = this;
            ajax({
                url: url,
                success: function (data) {
                    This.dataList = data;
                    This.totalMusic = data.length - 1;
                    //列表切歌。传入数据，wrap为dom元素，生成的dom数据会添加到这个wrap中。
                    This.pickMusic(data, This.wrap);

                    This.indexObj = new player.IndexControl(data.length); //这个构造函数用于控制音乐下标。切换下标。导出的是一个对象，里面有当前的下标，下标++ 或--
                    This.loadMusic(This.indexObj.index);//得到数据加载音乐并渲染到页面。
                    This.musicControl();//给音乐添加事件播放、暂停
                    This.progressDrag();//添加进度条拖动功能。
                },
                isAsync: true,
            });
        },
        // 加载音乐和图片,用于刷新
        loadMusic (index) {
            const This = this;
            // 重新渲染页面
            this.render(this.dataList[index])

            //通过暴露的函数传入下标加载音乐,
            this.music.load(this.dataList[index].audioSrc);
            // 总时长渲染。
            this.progress.renderTotalTime(this.dataList[index].duration)

            //是否需要播放音乐。
            if (this.music.status == "play") {
                this.music.play();
                this.progress.move(0); //切歌时进度条开始移动。0为参数，判断是从0开始播放，还是接着播放
                this.imgRotate(0);//每次切歌都会执行这个方法。那么就从七点开始旋转。
                this.toggle.className = "playing";
            }

            //更新音乐列表的当前选中音乐。这个方法每次音乐改变都会执行。那么在此处更新最好。
            this.musicList.changeSlect(index);
            //  添加音乐结束事件
            this.music.end(function () {
                This.loadMusic(This.indexObj.next());
            })
        },
        // 控制音乐（事件），上一首，下一首，暂停。。。。
        musicControl () {
            const This = this;
            //点击上一首的处理函数
            function prev () {
                // 更新状态
                This.music.status = "play";
                // 切歌
                This.indexObj.prev();
                // 刷新页面
                This.loadMusic(This.indexObj.index);
            }
            // 手指离开屏幕
            this.prev.addEventListener('touchend', player.debounce(prev, 300))

            // 点击暂停与播放按钮的处理函数
            function toggle () {
                // 在播放中，点击就暂停
                if (This.music.status == "play") {
                    This.music.pause();
                    This.progress.pause();//进度条停止
                    // 停止转动图片
                    This.stopRotate();
                    //暂停歌曲。切换dom元素图标状态
                    This.updataClass("pause");
                } else {
                    This.music.play();
                    This.progress.move();//进度条开始移动
                    // 开始播放，更新图标状态。
                    This.updataClass("play");
                    const deg = This.record.dataset.rotate || 0;//当还没有设置（第一次执行旋转函数）data-rotate时默认给0
                    This.imgRotate(deg);
                }
            }
            // 手指离开屏幕
            this.toggle.addEventListener("touchend", toggle)

            //点击下一首的处理函数
            function next () {
                This.music.status = 'play';
                This.indexObj.next();
                This.loadMusic(This.indexObj.index);
            }
            //                          debounce函数执行完毕会返回一个函数在这个位置
            this.next.addEventListener('touchend', player.debounce(next, 300))
        },
        // 旋转图片
        imgRotate (deg) {
            clearInterval(this.timer);
            const This = this
            this.timer = setInterval(() => {
                deg = +deg + 0.2;
                this.record.dataset.rotate = deg;
                this.record.style.transform = `rotateZ(${deg}deg)`
            }, 1000 / 60)
        },
        // 切换播放/暂停时的class
        updataClass (status) {
            if (status == 'play') {
                this.toggle.classList.remove("pause")
                this.toggle.classList.add("playing");
            } else {
                this.toggle.classList.remove("playing")
                this.toggle.classList.add("pause");
            }
        },
        //用于清楚定时器，img的旋转角度。
        stopRotate () {
            clearInterval(this.timer);
            // this.timer = null;
            // this.record.style.transform = "";
        },
        // 音乐列表切歌；
        pickMusic (data, wrap) {
            const This = this;
            this.musicList = new player.MusicList(data, wrap)
            // this.musicList.
            // 音乐列表的dom元素
            this.musicList.domList.forEach((item, index) => {
                item.addEventListener("touchend", function () {
                    //当点击的歌曲与当前播放的是同一首，那么啥也不做。
                    // 音乐列表生成的dom元素与请求的音乐列表数据是一致的。
                    if (This.currentIndex === index) {
                        return;
                    } else {
                        This.music.status = "play";//更新状态。
                        This.loadMusic(index);//根据索引值重新加载音乐。
                        This.musicList.slideDown();//关闭列表
                    }
                })
            })
        },
        // 拖到进度条，ele拖到的元素是啥
        progressDrag () {
            const This = this;
            // 实例化拖动dom元素。
            const circle = new player.progressModule.drag(document.getElementsByClassName("circle")[0]);
            // 拖动时的处理
            circle.move = function (percentage) {
                This.music.pause();//移动时停止播放音乐。
                This.updataClass("pause");//让图片变成暂停状态。
                This.stopRotate();//停止转动图片
                // 更新进度条。
                This.progress.move(percentage);


            }
            // 手指抬起
            circle.end = function (per) {
                // 求出拖到的时间点
                let currentTime = per * This.dataList[This.indexObj.index].duration;
                // 让音乐切到相应的事件点
                This.music.playTo(currentTime);
                // 开始播放
                This.music.play();
                // 进度条开始移动
                This.progress.update(per);
                // 更新类名
                This.updataClass("play");

                // 抬起的点时最后一秒。那么切换下一首
                // 当前时间 == 总时长。那么切换下一首
                // if (currentTime == This.dataList[This.indexObj.index].duration) {
                //     This.loadMusic(This.indexObj.next());
                // }

                // 得到图片选中角度，继续旋转
                const imgDom = document.querySelector(".songImg > img")
                const deg = imgDom.dataset.rotate || 0;
                This.imgRotate(deg);
            }
        }
    }
    const music = new musicPlayer(document.getElementsByClassName("songList")[0]);
    music.init();
})(window.musicPlayer.ajax, window.musicPlayer);