/*
 * @Author: gisboss
 * @Date: 2020-08-31 16:43:41
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-10 15:55:18
 * @Description: file content
 */


/**
 * @exports ImageryProviderTypeEnum
 * @class
 * @classdesc 自定义底图切片地图类型。名字空间map3d.layers.enum.ImageryProviderTypeEnum。此类为Object实例，不需要new
 * @enum {String}
 */
const ImageryProviderTypeEnum = {
    /**
     * 内置本地离线图片
     * @type {String}
     * @constant
     */
    LOCAL: "local",

    /**
     * URL模板切片
     * @type {String}
     * @constant
     */
    URL: "url",

    /**
     * 百度地图切片
     * @type {String}
     * @constant
     */
    BAIDU: "baidu",

    /**
     * 高德地图切片
     * @type {String}
     * @constant
     */
    GAODE: "gaode",

    /**
     * 天地图地图切片
     * @type {String}
     * @constant
     */
    TIANDITU: "tianditu",

    /**
     * 谷歌地图切片
     * @type {String}
     * @constant
     */
    GOOGLE: "google",

    /**
     * 必应地图切片
     * @type {String}
     * @constant
     */
    BING: "bing",

    /**
     * OSM地图切片
     * @type {String}
     * @constant
     */
    OSM: "osm",

    /**
     * ArcGIS切片
     * @type {String}
     * @constant
     */
    ARCGIS: "arcgis",

    /**
     * mapbox style切片
     * @type {String}
     * @constant
     */
    MAPBOXSTYLE: "mapboxstyle",

    /**
     * mapbox 地图切片
     * @type {String}
     * @constant
     */
    MAPBOX: "mapbox"
};

export default Object.freeze(ImageryProviderTypeEnum);