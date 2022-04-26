/*
 * @Author: gisboss
 * @Date: 2020-08-27 09:15:47
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-27 10:33:37
 * @Description: 自定义几何类型
 */


/**
 * @exports ZGeometryType
 * @classdesc 自定义的几何类型，包含GeoJSON类型。静态类，不需要new
 * @class
 * @enum {String}
 */
let ZGeometryType = {
    /**
     * 空几何类型
     *  @type {String}
     *  @constant
     */
    NULL: 'Null',
    /**
     * 抽象的几何类型
     *  @type {String}
     *  @constant
     */
    GEOMETRY: 'Geometry',
    /**
     * 点几何类型
     *  @type {String}
     *  @constant
     */
    POINT: 'Point',
    /**
     * 折线几何类型
     *  @type {String}
     *  @constant
     */
    POLYLINE: 'Polyline',
    /**
     * 多边形几何类型
     *  @type {String}
     *  @constant
     */
    POLYGON: 'Polygon',
    /**
     * 多点几何类型
     *  @type {String}
     *  @constant
     */
    MULTIPOINT: 'MultiPoint',
    /**
     * 多段线几何类型
     *  @type {String}
     *  @constant
     */
    MULTIPOLYLINE: 'MultiPolyline',
    /**
     * 多多边形几何类型
     *  @type {String}
     *  @constant
     */
    MULTIPOLYGON: 'MultiPolygon',
    /**
     * 矩形几何类型
     *  @type {String}
     *  @constant
     */
    EXTENT: 'Extent',

    /**
     * GeoJSON的点类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_POINT: 'Point',
    /**
     * GeoJSON的线串类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_LINE_STRING: 'LineString',
    /**
     * GeoJSON的线环类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_LINEAR_RING: 'LinearRing',
    /**
     * GeoJSON的多边形类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_POLYGON: 'Polygon',
    /**
     * GeoJSON的多点类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_MULTI_POINT: 'MultiPoint',
    /**
     * GeoJSON的多线串类型
     *  @type {String}
     *  @constant
     *  @type {String}
     *  @constant
     */
    GEOJSON_MULTI_LINE_STRING: 'MultiLineString',
    /**
     * GeoJSON的多多边形类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_MULTI_POLYGON: 'MultiPolygon',
    /**
     * GeoJSON的几何集合类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_GEOMETRY_COLLECTION: 'GeometryCollection',
    /**
     * GeoJSON的圆类型
     *  @type {String}
     *  @constant
     */
    GEOJSON_CIRCLE: 'Circle'
};

export default Object.freeze(ZGeometryType);