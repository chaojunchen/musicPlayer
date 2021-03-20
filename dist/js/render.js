// 这个模块主要负责页面的一切渲染(主要是图片)
; (function (root) {
    // 渲染歌曲图片以及模糊的背景。
    function renderImg (src) {
        const wrap = document.getElementById("wrap");
        const songImg = document.querySelector(".songImg img");
        const blur = root.blurImg;
        blur(src, wrap); //把背景变模糊
        songImg.src = src;
    }
    // 渲染专辑和名字以及作者
    function renderInfo (data) {
        const name = document.getElementsByClassName("name")[0];
        const auther = document.getElementsByClassName("auther")[0];
        const album = document.getElementsByClassName("album")[0];
        name.innerText = data.name;
        auther.innerText = data.singer;
        album.innerText = data.album;
    }
    // 是否喜欢当前的这首歌
    function renderIsLike (isLike) {
        const like = document.getElementsByClassName("like")[0];
        isLike == true ? like.classList.add("solid") : like.classList.remove("solid");
    }
    root.render = function (data) {
        renderImg(data.image);
        renderInfo(data);
        renderIsLike(data.isLike);
    };
})(window.musicPlayer || (window.musicPlayer = {}));
