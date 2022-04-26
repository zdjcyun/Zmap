/*
 * @Author: gisboss
 * @Date: 2020-08-28 18:14:48
 * @LastEditors: gisboss
 * @LastEditTime: 2021-12-28 16:24:57
 * @Description: file content
 */
import Core from "../core/Core.js";
import DataSourceManager from "./datasources/DataSourceManager.js";
import ZEvent from "./events/ZEvent.js";


let currentSwitchPosition = undefined;

/**
 * @exports ZScene
 * @class
 * @classdesc 场景类构造函数。
 */
class ZScene {
    /**
     * @param {Object} options 初始化参数.
     */
    constructor(options) {

        /**
         * @property {String} id 场景唯一id
         */
        this.id = 'zgis_zscene_' + Core.guid();


        /**
         * @property {Object} options 参数选项
         */
        this.options = options;


        /**
         * @property {Object} imageryProviderConfigCache 保存底图图片图层配置对象
         */
        this.imageryProviderConfigCache = undefined;

        /**
         * @property {Object} terrainProviderConfigCache 保存地形图层配置对象
         */
        this.terrainProviderConfigCache = undefined;


        /**
         * @property {DataSourceManager} dataSourceManager 所有数据源对象
         * @type {DataSourceManager}
         */
        this.dataSourceManager = null;


        this.zViewer = null;

        /**
         * 场景二三维切换事件。监听方法接收参数:function({from:3d,to:2d,currentPosition:xx}){}
         * @type {ZEvent}
         */
        this.SceneModeSwitchEvent = new ZEvent('SceneModeSwitchEvent');
    }

    /**
     * 初始化场景
     * @param {ZViewer} zViewer ZViewer对象实例
     */
    init(zViewer) {
        this.zViewer = zViewer;
        this.dataSourceManager = new DataSourceManager(zViewer, {
            crs: this.options.crs
        });

        this.SceneModeSwitchEvent.addEventListener((data) => currentSwitchPosition = data.currentPosition);

        // 添加二三维切换完成事件处理
        this.zViewer.getCesiumViewer().scene.morphComplete.addEventListener((sf, pm, cm, mf) => {
            if (!currentSwitchPosition) {
                return;
            }
            setTimeout(() => {
                // this.resetHomeHandler.bind(this);
                this.zViewer.getCesiumViewer().scene.camera.flyTo({
                    destination: currentSwitchPosition
                });
            }, 500);
        });
    }

    /**
     * 添加数据源
     * @param {Array|Object} dataSourceOptions 数据源选项配置
     * @returns {Array.<Promise>|Promise} Promise对象或Promise对象数组
     */
    addDataSources(dataSourceOptions) {
        if (Array.isArray(dataSourceOptions)) {
            let promises = [];
            dataSourceOptions.forEach((item) => {
                promises.push(this.dataSourceManager.addDataSource(item));
            });
            return Cesium.when.all(promises);
        } else {
            return this.dataSourceManager.addDataSource(dataSourceOptions);
        }
    }

    /**
     * 移除数据源
     * @param {Array|Object} dataSourceOptions 数据源选项配置
     * @returns {Array.<Promise>|Promise} Promise对象或Promise对象数组
     */
    removeDataSources(dataSourceOptions) {
        if (Array.isArray(dataSourceOptions)) {
            let promises = [];
            dataSourceOptions.forEach((item) => {
                promises.push(this.dataSourceManager.removeDataSource(item));
            });
            return Cesium.when.all(promises);
        } else {
            return this.dataSourceManager.removeDataSource(dataSourceOptions);
        }
    }


    /**
     * 清理资源
     */
    destroy() {
        this.dataSourceManager.destroy();
    }
}


export default ZScene;