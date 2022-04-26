/*
 * @Author: gisboss
 * @Date: 2020-08-21 17:19:12
 * @LastEditors: gisboss
 * @LastEditTime: 2021-12-28 11:38:39
 * @Description: file content
 */


export default {
    /**
     * 判断是否为undefined
     * @param {*} obj 待测试对象
     * @return {boolean}
     */
    isUndefined: function (obj) {
        return obj === undefined;
    },
    /**
     * html字符编码
     * @param {string} str 待编码字符串
     * @return {string}
     * @see encodeURIComponent
     */
    escape: function (str) {
        return encodeURIComponent(str);
    },

    /**
     * html字符解码
     * @param {string} str 待解码字符串
     * @return {string}
     * @see decodeURIComponent
     */
    unescape: function (str) {
        return decodeURIComponent(str);
    },
    /**
     * WebGL功能支持检测
     */
    webglCheck: function () {
        console.error({
            title: '警告',
            message: "系统检测到您使用的浏览器不支持WebGL功能"
        });
    },
    /**
     * 是否为pc客户端
     * @return {boolean}
     */
    isPCBroswer: function () {
        return !isMobile.any;
    },

    /**
     * 获取url参数
     * @param {string} name 参数名
     * @param {Object} [uri=window.location.search] uri地址对象
     * @return {string|undefined}
     */
    getUrlQueryParameter: function (name, uri) {
        uri = uri || window.location.search;
        return decodeURIComponent((new RegExp('[?|&]' + name + '=([^&;]+?)(&|#|;|$)')
            .exec(uri) || [, ""])[1].replace(/\+/g, '%20')) || undefined;
    },

    /**
     * 设置url参数
     * @param {Object} keyValueMap 需要替换的参数键值
     * @param {Object} uri=window.location.search uri地址对象
     * @return {string} 替换后的参数串
     */
    setUrlQueryParameter: function (keyValueMap, uri) {
        var url = uri || window.location.search;
        var str;
        for (var key in keyValueMap) {
            var value = keyValueMap[key];
            // 如果有修改它
            if (this.getUrlQueryParameter(key, url)) {
                var regExp = new RegExp('(.*)([#&?]' + key + '=)(.*?)($|&.*)');
                var array = url.match(regExp);
                array[3] = value;
                array.shift();
                str = array.join('');
            } else { // 如果没有,加在末尾
                var kv = key + '=' + value;
                str = url.length ? url + '&' + kv : kv;
            }
        }
        return str;
    },

    /**
     * 生成GUID
     * @return {string}
     * @see {@link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript}
     */
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 获取键盘事件的键盘数字值
     * @param {Event} e 事件对象
     * @return {number}
     */
    getKeyCode: function (evt) {
        var kc;
        if (evt.keyCode) {
            kc = evt.keyCode;
        } else if (evt.key) {
            kc = evt.key;
        }
        return kc;
    },

    /**
     * 求数组维度
     * @param {Array} _arr 
     * @returns {Number}
     */
    arrayDimension: function (_arr) {
        let a = 0;
        if (!_.isArray(_arr)) {
            return a;
        }
        let ad = function (arr) {
            for (let i = 0; i < arr.length; i++) {
                if (_.isArray(arr[i])) {
                    a++;
                    arr = arr[i];
                    ad(arr);
                }
            }
            return a;
        }

        return ad(_arr);
    }
}