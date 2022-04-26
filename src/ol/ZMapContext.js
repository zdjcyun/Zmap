/*
 * @Author: gisboss
 * @Date: 2020-08-26 09:48:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-09 15:06:36
 * @Description: 地图上下文信息类
 */

import ZGlobalEvent from './event/ZGlobalEvent.js';
import {default as ZMap} from "./ZMap.js";
import {default as ZView} from "./ZView.js";


/**
 * @module ZMapContext
 * @class
 * @classdesc  地图上下文信息类，当前类对象创建后，地图对象也同时被创建。
 * 此类继承于ol.Observable，具体事件对象的所有特征。
 */
class ZMapContext {
    /**
     * 创建地图对象
     * @constructor
     * @param {String} el 地图窗口容器ID
     * @param {Object} mapOpts 地图初始化参数
     */
    constructor(el, mapOpts) {
        this.authority = null;
        this.domId = el;
        this.mapOptions = mapOpts;
    }

    /**
     * 地图初始化
     * @param {*} callback 初始化完成后回调
     * @returns 
     */
    init(callback) {
        this.map = new ZMap(this.domId, this.mapOptions);
        let mapview = new ZView(this.map, this.map.options);
        this.map.view = mapview;

        mapview.once(ZGlobalEvent.ON_MAP_INITIALED, callback);

        ZView.startLoadLayers(mapview);

        return this;
    }

    /**
     * 获取地图源始参数对象
     * @return {Object} mapOptions 地图源始参数对象
     */
    getMapOptions() {
        return this.mapOptions;
    }

    /**
     * 获取地图对象
     * @return {ZMap} map 地图对象
     */
    getMap() {
        return this.map;
    }

    /**
     *  @return {String} domId 容器元素id
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

export default ZMapContext;