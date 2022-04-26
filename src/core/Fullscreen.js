/*
 * @Author: gisboss
 * @Date: 2020-08-26 11:38:15
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-26 11:40:11
 * @Description: 全屏控制类
 */
export default {
    /**
     * 进入全屏，F11实现全屏效果
     * 进入全屏的元素，将脱离其父元素，所以可能导致之前某些css的失效
     * 解决方案：使用 :full-screen伪类 为元素添加全屏时的样式（使用时为了兼容注意添加-webkit、-moz或-ms前缀）
     * @param {HTMLDOM} element 要全屏的元素，可以是document.body也可以是某一个div
     */
    launchFullscreen: function (element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        }
    },

    /**
     * 退出全屏模式。兼容模式。
     */
    exitFullscreen: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },

    /**
     * 获取当前全屏的节点
     * 假设id为div1的Element当前为全屏状态则
     * document.querySelector("#div1")===document.fullscreenElement
     * @returns {HTMLDOM}
     */
    getFullscreenElement: function () {
        return (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.webkitFullscreenElement || null
        );
    },

    /**
     * 判断当前是否全屏
     * @returns {boolean}
     */
    isFullScreen: function () {
        return !!(
            document.fullscreen ||
            document.mozFullScreen ||
            document.webkitIsFullScreen || document.webkitFullscreen ||
            document.msFullscreen || document.msFullscreenElement
        );
    },
    /**
     * 判断当前文档是否能切换到全屏
     * @returns {boolean}
     */
    isFullscreenEnabled: function () {
        var a = (
            document.fullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.webkitFullScreenEnabled ||
            document.msFullscreenEnabled
        );
        var body = document.body;
        return !!(
            body.webkitRequestFullScreen ||
            (body.msRequestFullscreen && document.msFullscreenEnabled) ||
            (body.requestFullscreen && a)
        );
    },
};