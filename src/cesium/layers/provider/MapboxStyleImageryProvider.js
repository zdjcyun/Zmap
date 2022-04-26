/*
 * @Author: gisboss
 * @Date: 2021-03-09 09:25:27
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-10 15:46:26
 * @Description: file content
 */
import BaseImageryProvider from "./BaseImageryProvider.js";

/**
 * @exports MapboxStyleImageryProvider
 * @class
 * @classdesc 矢量地图切片数据实现类。名字空间map3d.layers.provider.MapboxStyleImageryProvider
 * @constructor
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} options.bigfont 字体风格
 * @property {String} options.tileStyle 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */

class MapboxStyleImageryProvider extends Cesium.MapboxStyleImageryProvider {
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
BaseImageryProvider.extend(MapboxStyleImageryProvider.prototype);

function initImageryProvider(options) {
    if (!Cesium.defined(options.styleId)) {
        throw new Cesium.DeveloperError("options.styleId is required.");
    }

    options.accessToken = Cesium.defaultValue(options.accessToken, 'pk.eyJ1IjoiZ2lzYm9zcyIsImEiOiJja20xcnd4dmQwM294MnRvMDN5N3NwdmFsIn0.AyDLDYlTYBkSPpgUCLpNxg');
}

export default MapboxStyleImageryProvider;