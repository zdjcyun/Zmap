/*
 * @Author: gisboss
 * @Date: 2020-08-26 09:48:57
 * @LastEditors: gisboss
 * @LastEditTime: 2021-04-25 17:07:33
 * @Description: 场景上下文信息类
 */

import ZViewer from "./ZViewer.js";


/**
 * @exports SceneContext
 * @class
 * @classdesc  场景上下文信息类，当前类对象创建后，场景对象也同时被创建。
 */
class SceneContext {
    /**
     * 创建地图对象
     * @method
     * @param {String} el 地图窗口容器ID
     * @param {Object} sceneOptions 地图初始化参数
     */
    constructor(el, sceneOptions) {
        this.authority = null;
        /**
         * @property {String} DOMElement id属性
         * @type {String}
         */
        this.domId = el;

        /**
         * @property {Object} sceneOptions 场景参数属性
         */
        this.sceneOptions = sceneOptions;


        /**
         * @property {ZViewer} viewer 场景视图对象
         */
        this.viewer = new ZViewer(this.domId, this.sceneOptions);


        /**
         * 场景初始视图定位完成后的回调方法
         */
        this.initViewLoadedHandler = undefined;
    }

    /**
     * 初始化zviewer
     * @returns {Promise.<SceneContext>}
     */
    init(map3dModule) {
        return new Promise((resolve, reject) => {
            this.viewer.initViewLoadedEvent.addEventListener(
                () => {
                    if (this.initViewLoadedHandler) {
                        this.initViewLoadedHandler.call(this, map3dModule, this.viewer);
                    }
                });

            resolve(this.viewer.init());
        });
    }

    destroy() {
        if (this.viewer) {
            this.viewer.destroy();
        }

        this.domId = null;
        this.viewer = null;
        this.sceneOptions = null;
        this.initViewLoadedHandler = null;
    }

    /**
     * 获取地图场景源始参数对象
     * @return {Object} 地图源始参数对象
     */
    getSceneOptions() {
        return this.sceneOptions;
    }

    /**
     * 获取地图对象
     * @return {ZMap} map 地图对象
     */
    getViewer() {
        return this.viewer;
    }

    /**
     * 场景DOMElement对象id属性
     * @return {String} 容器元素id
     */
    getDomId() {
        return this.domId;
    }

    setAuthorityfunction(u) {
        this.authority = u;
    }

    getAuthority() {
        return this.authority;
    }

    hasAuthority(roleId) {
        return this.authority[roleId];
    }
}

export default SceneContext;