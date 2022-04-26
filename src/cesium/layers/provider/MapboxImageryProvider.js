/*
 * @Author: gisboss
 * @Date: 2021-03-09 09:25:27
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-10 15:57:47
 * @Description: file content
 */
import BaseImageryProvider from "./BaseImageryProvider.js";

/**
 * @exports MapboxImageryProvider
 * @class
 * @classdesc 矢量地图切片数据实现类。名字空间map3d.layers.provider.MapboxImageryProvider
 * @constructor
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} options.bigfont 字体风格
 * @property {String} options.tileStyle 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */

class MapboxImageryProvider extends Cesium.MapboxImageryProvider {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        initImageryProvider(options);

        super(options);

        //调用BaseImageryProvider的方法
        this.extendProperty(options);
    }
}


/**
 * 继承属性和方法
 */
BaseImageryProvider.extend(MapboxImageryProvider.prototype);

function initImageryProvider(options) {
    if (!Cesium.defined(options.mapId)) {
        throw new Cesium.DeveloperError("options.mapId is required.");
    }

    options.accessToken = Cesium.defaultValue(options.accessToken, 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA');
}

export default MapboxImageryProvider;