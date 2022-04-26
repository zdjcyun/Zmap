/*
 * @Author: gisboss
 * @Date: 2020-08-27 09:15:47
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-27 10:25:36
 * @Description: 几何抽象类
 */


import ZGeometryType from './ZGeometryType.js';

/**
 * @exports ZGeometry
 * @class
 * @classdesc 几何抽象类，抽象类不要使用new ZGeometry()这种用法
 * @abstract
 * @param {Object} options 几何参数
 * @property {Object} options options属性。
 * @property {string} options.type GeoJSON的几何类型
 * @property {number|ZSpatialReference} options.spatialReference 空间参考坐标系代号
 */
class ZGeometry {
    constructor(options) {
        options = options || {};
        /**
         * @property {string} type GeoJSON的几何类型
         */
        this.type = options.type;

        /**
         * @property {number|ZSpatialReference} spatialReference 空间参考坐标系代号
         */
        this.spatialReference = options.spatialReference;
        switch (this.type) {
            case ZGeometryType.GEOJSON_POINT:
                this.geometryType = ZGeometryType.POINT;
                break;
            case ZGeometryType.GEOJSON_MULTI_POINT:
                this.geometryType = ZGeometryType.MULTIPOINT;
                break;
            case ZGeometryType.GEOJSON_LINE_STRING:
            case ZGeometryType.GEOJSON_MULTI_LINE_STRING:
                this.geometryType = ZGeometryType.POLYLINE;
                break;
            case ZGeometryType.GEOJSON_CIRCLE:
            case ZGeometryType.GEOJSON_POLYGON:
                this.geometryType = ZGeometryType.POLYGON;
                break;
            case ZGeometryType.GEOJSON_MULTI_POLYGON:
                this.geometryType = ZGeometryType.MULTIPOLYGON;
                break;
            case ZGeometryType.GEOJSON_GEOMETRY_COLLECTION:
                this.geometryType = ZGeometryType.GEOMETRYCOLLECTION;
                break;
            default:
                /**
                 * @property {string} geometryType GeoJSON几何类型
                 */
                this.geometryType = ZGeometryType.GEOMETRY;
                break;
        }
    }
}

export default ZGeometry;