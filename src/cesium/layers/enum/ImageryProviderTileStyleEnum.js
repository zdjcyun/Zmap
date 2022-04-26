/**
 * @exports ImageryProviderTileStyleEnum
 * @class
 * @classdesc 自定义切片底图类型。名字空间map3d.layers.enum.ImageryProviderTileStyleEnum。此类为Object实例，不需要new
 * @enum {String}
 */
const ImageryProviderTileStyleEnum = {
    /**
     * WGS84坐标系影像地图
     * @type{String}
     * @constant
     */
    IMG: "img",

    /**
     * WGS84坐标系影像地图注记
     * @type{String}
     * @constant
     */
    IMGANNO: "imganno",

    /**
     * WGS84坐标系矢量地图
     * @type{String}
     * @constant
     */
    VEC: "vec",

    /**
     * WGS84坐标系矢量地图注记
     * @type{String}
     * @constant
     */
    VECANNO: "vecanno",

    /**
     * 国测局坐标系影像地图
     * @type{String}
     * @constant
     */
    IMG_GCJ: "img_gcj",

    /**
     * 国测局坐标系影像地图注记
     * @type{String}
     * @constant
     */
    IMGANNO_GCJ: "imganno_gcj",

    /**
     * 国测局坐标系矢量地图
     * @type{String}
     * @constant
     */
    VEC_GCJ: "vec_gcj",

    /**
     * 国测局坐标系矢量地图注记
     * @type{String}
     * @constant
     */
    VECANNO_GCJ: "vecanno_gcj",

    /**
     * 百度矢量午夜黑
     * @type{String}
     * @constant
     */
    VEC_BAIDU_CUSTOM: "vec_baidu_custom",

    /**
     * 高德矢量交通
     * @type{String}
     * @constant
     */
    VEC_GAODE_TRAFFIC: "vec_gaode_traffic",

    /**
     * 地形地图
     * @type{String}
     * @constant
     */
    TER: "ter",
    /**
     * 地形地图注记
     * @type{String}
     * @constant
     */
    TERANNO: "teranno",

    /**
     * 国测局坐标系地形地图
     * @type{String}
     * @constant
     */
    TER_GCJ: "ter_gcj",

    /**
     * 获取注记图层风格名称
     * @method
     * @param {String} mapstyle 矢量或影像地图的风格名称
     * @returns {string} 注记风格名称
     */
    getAnnoMapStyle: function (mapstyle) {
        var gcjIndex = mapstyle.indexOf('_gcj');
        var annomapstyle;
        if (gcjIndex > -1) {
            annomapstyle = mapstyle.substring(0, gcjIndex) + 'anno_gcj';
        } else {
            annomapstyle = mapstyle + 'anno';
        }

        return annomapstyle;
    },

    /**
     * 获取注记风格图层的后缀名称
     * @method
     * @returns {String}
     */
    getAnnoSuffix: function () {
        return 'anno';
    },

    /**
     * 获取注记风格图层的后缀中文名称
     * @method
     * @returns {String}
     */
    getAnnoSuffix_ZH: function () {
        return '注记';
    }
};

export default Object.freeze(ImageryProviderTileStyleEnum);
