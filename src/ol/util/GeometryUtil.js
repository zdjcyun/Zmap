/*
 * @Author: gisboss
 * @Date: 2020-08-26 17:09:45
 * @LastEditors: gisboss
 * @LastEditTime: 2020-09-06 17:51:05
 * @Description: 几何工具类
 */


import ZGeometryType from '../geometry/ZGeometryType.js';
import ZExtent from '../geometry/ZExtent.js';
import ZPoint from '../geometry/ZPoint.js';
import ZMultiPoint from '../geometry/ZMultiPoint.js';
import ZPolyline from '../geometry/ZPolyline.js';
import ZPolygon from '../geometry/ZPolygon.js';
import ZCircle from '../geometry/ZCircle.js';
import ZMultiPolygon from '../geometry/ZMultiPolygon.js';


/**
 * @exports GeometryUtil
 * @classdesc 几何工具类。此类为Object实例，不需要new
 * @class
 * @static
 */
let GeometryUtil = {
    /**
     * 从原生对象生成Z对象
     * @param {ol.geom} _geometry 原生几何对象
     * @return {ZGeometry} ZGeometry子类对象
     */
    from: function (_geometry) {
        if (!_geometry) return;
        let type = _geometry.getType();
        if (type === ZGeometryType.GEOJSON_POINT) {
            return ZPoint.from(_geometry);
        } else if (type === ZGeometryType.GEOJSON_MULTI_POINT) {
            return ZMultiPoint.from(_geometry);
        } else if (type === ZGeometryType.GEOJSON_LINE_STRING || type === ZGeometryType.GEOJSON_MULTI_LINE_STRING) {
            return ZPolyline.from(_geometry);
        } else if (type === ZGeometryType.GEOJSON_POLYGON) {
            return ZPolygon.from(_geometry);
        } else if (type === ZGeometryType.GEOJSON_MULTI_POLYGON) {
            return ZMultiPolygon.from(_geometry);
        } else if (type === ZGeometryType.GEOJSON_CIRCLE) {
            return ZCircle.from(_geometry);
        } else if (type === 'GeometryCollection') {

        }
    },


    /**
     * 从JSON对象生成ZGeometry子类对象
     * @param {Object} geometryJSON ZGeometry子类JSON对象
     * @return {ZGeometry} ZGeometry子类对象
     */
    fromJSON: function (geometryJSON) {
        if (!geometryJSON) return undefined;
        let type = geometryJSON.geometryType;
        if (type === ZGeometryType.POINT) {
            return ZPoint.fromJSON(geometryJSON);
        } else if (type === ZGeometryType.MULTIPOINT) {
            return ZMultiPoint.fromJSON(geometryJSON);
        } else if (type === ZGeometryType.POLYLINE) {
            return ZPolyline.fromJSON(geometryJSON);
        } else if (type === ZGeometryType.POLYGON) {
            return ZPolygon.fromJSON(geometryJSON);
        } else if (type === ZGeometryType.MULTIPOLYGON) {
            return ZMultiPolygon.fromJSON(geometryJSON);
        } else if (type === ZGeometryType.EXTENT) {
            return ZExtent.fromJSON(geometryJSON);
        }
    },

    
};

export default GeometryUtil;