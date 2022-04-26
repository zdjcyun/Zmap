/*
 * @Author: gisboss
 * @Date: 2020-08-31 16:43:41
 * @LastEditors: gisboss
 * @LastEditTime: 2020-12-02 19:11:16
 * @Description: file content
 */
import BaseImageryProvider from "./BaseImageryProvider.js";

/**
 * @exports ArcGISImageryProvider
 * @class
 * @extends map3d.layers.provider.BaseImageryProvider
 * @classdesc ArcGIS地图切片数据类。名字空间map3d.layers.provider.ArcGISImageryProvider。
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} options.url 切片请求地址
 * @property {String} options.tileStyle 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */
class ArcGISImageryProvider extends Cesium.ArcGisMapServerImageryProvider {
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
BaseImageryProvider.extend(ArcGISImageryProvider.prototype);


function initImageryProvider(options) {
    if (!Cesium.defined(options.url)) {
        throw new Cesium.DeveloperError("options.url is required.");
    }

}

export default ArcGISImageryProvider;