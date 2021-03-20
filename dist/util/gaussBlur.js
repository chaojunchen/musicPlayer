; (function (root) {
    function gaussBlur (imgData) {
        var pixes = imgData.data;
        var width = imgData.width;
        var height = imgData.height;
        var gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k, len;

        var radius = 10;
        var sigma = 5;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -radius; x <= radius; x++, i++) {
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0, len = gaussMatrix.length; i < len; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = x + j;
                    if (k >= 0 && k < width) {//确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = y + j;
                    if (k >= 0 && k < height) {//确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
            }
        }
        //end
        return imgData;
    }

    /*src：图片路径  
    *ele：哪个dom对象需要高斯模糊
    */
    function blurImg (src, ele) {
        var canvas = document.createElement('canvas');
        ele = ele || document.body;

        //这两个值越小，图片就会越模糊
        canvas.width = 150;
        canvas.height = 150;
        var context = canvas.getContext('2d');
        //3、把img对象放到了这里
        var img = new Image();
        img.src = src;
        img.onload = function () {
            // 把img画到（铺满）canvas中。
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            // 得到canvas中的每一个像素点的信息。
            var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
            // 把得到的图片信息交给blurimg函数执行。
            // 这个函数会把传入的像素信息取平均值在返回一个像素信息。
            var gaussData = gaussBlur(imgData);
            // 把处理好的像素信息再次画到canvas中。
            context.putImageData(gaussData, 0, 0);
            var imgSrc = canvas.toDataURL();//生成url地址。
            // 把处理的图片添加到dom对象上。
            ele.style.backgroundImage = 'url(' + imgSrc + ')';
        }
    }
    root.blurImg = blurImg;
})(window.musicPlayer || (window.musicPlayer = {}));
