// 控制音乐列表的模块

; (function (root) {
    function MusicList (data, wrap) {
        this.data = data;
        this.wrap = wrap;//生产的dom元素会添加到这个dom里
        this.domList = [];//把生成的dom元素保存。
        this.status = "hide";//当前的歌曲列表状态
        this.init();
    }
    MusicList.prototype = {
        init () {
            this.getDom();
            this.createDom(this.data);//创建数据
            this.slideDown();//歌曲列表默认不显示。
            this.addEvent();
        },
        //得到页面上需要添加事件的dom元素
        getDom () {
            //关闭按钮
            this.closeBtn = document.getElementsByClassName("close")[0];
            // 点击显示按钮
            this.openList = document.getElementsByClassName("playList")[0];
            this.dialogList = document.getElementsByClassName("dialogList")[0];
        },
        // 生成dom元素
        createDom (data) {
            const This = this;
            data.forEach((item, index) => {
                let li = document.createElement("li");
                li.innerText = item.name;
                This.domList.push(li);
                li.addEventListener("touchend", function (e) {
                    This.changeSlect(index);//添加事件。当点击当前的歌曲时添加active
                })
                This.changeSlect(0);//默认第一首歌选中
                This.wrap.appendChild(li);
            })
        },
        // 点击列表时让列表出来。
        slideUp () {
            this.status = "show";
            this.dialogList.style.transition = "0.3s"
            this.dialogList.style.transform = `translatex(0px)`;
        },
        //不显示
        slideDown () {
            this.status = "hide";
            const distanceY = this.dialogList.offsetHeight;
            this.dialogList.style.transition = "0.3s"
            this.dialogList.style.transform = `translatey(${distanceY}px)`;
        },
        // 添加active类名
        changeSlect (index) {
            this.domList.forEach((item, index) => {
                item.classList.remove("active");
            })
            this.domList[index].classList.add("active");
        },
        // 添加事件
        addEvent () {
            const This = this;
            this.closeBtn.addEventListener("touchend", function () {
                This.slideDown();
            });
            this.openList.addEventListener("touchend", function () {
                This.slideUp();
            })
        }
    }
    root.MusicList = MusicList;
})(window.musicPlayer || (window.musicPlayer = {}));