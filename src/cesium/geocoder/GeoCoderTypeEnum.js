/**
 * @exports GeoCoderTypeEnum
 * @class
 * @classdesc 自定义坐标系代号类。名字空间map3d.geocoder.GeoCoderTypeEnum。此类为Object实例，不需要new
 */
let GeoCoderTypeEnum = {
    /**
     * 默认cesium内置地理编码
     * @constant
     */
    GC_DEFAULT: 'default',

    /**
     * 百度地理编码
     * @constant
     */
    GC_BAIDU: 'baidu',

    /**
     * 高德地理编码
     * @constant
     */
    GC_GAODE: 'gaode',

    /**
     * OSM地理编码
     * @constant
     */
    GC_OSM: 'osm'
};

export default GeoCoderTypeEnum;
