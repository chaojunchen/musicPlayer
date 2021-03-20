; (function (root) {
    function ajax (options) {
        options = options || {};
        let url = options.url += "?" || "";
        url = url.indexOf("?") > 0 ? options.url : options.url
        const type = options.type ? options.type.toUpperCase() : "GET";
        const success = options.success || function () { };
        const isAsync = options.isAsync === undefined ? true : options.isAsync;
        const data = options.data || {};
        let dataStr = "";
        if (typeof (data) == "object") {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    dataStr += key + "=" + data[key] + "&"
                }
            }
        } else {
            dataStr = data.toString();
        }

        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    success(JSON.parse(xhr.responseText));
                }
            }
        }
        if (type === "POST") {
            xhr.open(type, url, isAsync);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(dataStr)
        } else if (type === "GET") {
            xhr.open(type, url + dataStr, isAsync);
            xhr.send();
        }
    }
    root["ajax"] = ajax;
})(window.musicPlayer || (window.musicPlayer = {}));