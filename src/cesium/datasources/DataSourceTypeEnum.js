/*
 * @Author: gisboss
 * @Date: 2020-08-31 16:43:41
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-10 14:58:53
 * @Description: file content
 */
/**
 * @exports DataSourceTypeEnum
 * @class
 * @classdesc 自定义数据源类型。名字空间map3d.datasources.DataSourceTypeEnum
 * @enum {Number}
 */
const DataSourceTypeEnum = {
    /** 
     * 自定义数据源
     * @type {Number}
     * @constant
     */
    DS_CUSTOM: 0,

    /** 
     * GeoJSON数据源
     * @type {Number}
     * @constant
     */
    DS_GEOJSON: 1,

    /** 
     * 动态GeoJSON数据源
     * @type {Number}
     * @constant
     */
    DS_DYNAMIC: 2,

    /** 
     * 动态GeoJSON数据源
     * @type {Number}
     * @constant
     */
    DS_DYNAMIC_PRIMITIVE: 3,

    /** 
     * kml数据源
     * @type {Number}
     * @constant
     */
    DS_KML: 4,

    /** 
     * czml数据源
     * @type {Number}
     * @constant
     */
    DS_CZML: 5,

    /** 
     * ArcGIS mapserver数据源
     * @type {Number}
     * @constant
     */
    DS_ARCGIS_MAPSERVER: 6,

    /** 
     * ArcGIS Shape数据源
     * @type {Number}
     * @constant
     */
    DS_ARCGIS_SHP: 7,

    /** 
     * 影像URL模板数据源
     * @type {Number}
     * @constant
     */
    DS_IMAGERY_URLTEMPLATE: 8,

    /** 
     * 3dtileset数据源
     * @type {Number}
     * @constant
     */
    DS_3DTILESET: 9,

    /** OGC WMS数据源
     * @type {Number}
     * @constant
     */
    DS_WMS: 10,

    /** 
     * 动态水面数据源
     * @type {Number}
     * @constant
     */
    DS_WATER: 11,

    /** 
     * 视频纹理数据源
     * @type {Number}
     * @constant
     */
    DS_VIDEO: 12,

    /** 
     * 云图数据源
     * @type {Number}
     * @constant
     */
    DS_DYNAMIC_IMAGERY: 13,

    /** 
     * 行政区划数据源
     * @type {Number}
     * @constant
     */
    DS_DISTRICT: 14,

    /** 
     * 热力图数据源
     * @type {Number}
     * @constant
     */
    DS_IMAGERY_HEATMAP: 15,

    /** 
     * Kriging数据源
     * @type {Number}
     * @constant
     */
    DS_IMAGERY_KRIGING: 16,

    /** 
     * TileClassification数据源
     * @type {Number}
     * @constant
     */
    DS_TILE_CLASSIFICATION: 17,
}

export default DataSourceTypeEnum;