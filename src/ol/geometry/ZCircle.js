import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZPoint from './ZPoint.js';
import ZExtent from './ZExtent.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';
import ZSpatialReference from '../ZSpatialReference.js';

function getDegreeCenter(point) {
    point.__ = point.__.clone().transform('EPSG:' + point.spatialReference.wkid, 'EPSG:4326');
    return point.__.getCoordinates();
}

/**
 * @exports ZCircle
 * @classdesc 几何圆
 * @class
 * @extends ZGeometry
 * @param {ZPoint} point 中心点对象
 * @param {Number} radius 半径以米算
 * @param {Number} [numberOfPoints=32] 分段数
 */
class ZCircle extends ZGeometry {
    constructor(point, radius, numberOfPoints) {
        super();
        let center = getDegreeCenter(point);
        this.numberOfPoints = numberOfPoints || 32;
        let circle4326 = new ol.geom.Polygon.circular(center, radius, this.numberOfPoints);
        //Polygon
        this.__ = circle4326.clone().transform('EPSG:4326', 'EPSG:' + point.spatialReference.wkid);
        this.spatialReference = point.spatialReference;
        this.center = point;
        this.radius = radius;
    }


    /**
     * 获取圆心
     * @return {ZPoint} 圆心点坐标
     */
    getCenter() {
        return this.center;
    }

    /**
     * 获取边界范围
     * @returns {ZExtent} 矩形范围对象
     */
    getExtent() {
        let minx = this.center.x - this.radius;
        let miny = this.center.y - this.radius;
        let maxx = this.center.x + this.radius;
        let maxy = this.center.y + this.radius;
        return new ZExtent(minx, miny, maxx, maxy, this.spatialReference);
    }


    /**
     * 进行坐标变换
     * @param {CoordTypeEnum} from 原始坐标系代号
     * @param {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZCircle} 转换后的Z对象
     */
    applyTransform(from, to) {
        let nc = GeoCoordConverterUtil.coordsConvert(from, to, this.center.x, this.center.y);
        return new ZCircle(nc, this.radius, this.numberOfPoints);
    }

    /**
     * 整体偏移几何坐标值
     * @param {Number} xOffset 水平方向偏移量
     * @param {Number} yOffset 垂直方向偏移量
     * @return {ZCircle} 新的ZCircle对象
     */
    offset(xOffset, yOffset) {
        let nc = new ZPoint(this.center.x + xOffset, this.center.y + yOffset, this.spatialReference);
        return new ZCircle(nc, this.radius, this.numberOfPoints);
    }

    /**
     * 转换为JSON表达对象
     * @return {Object} JSON对象。
     * 如{rings:[],spatialReference:{},center:[],radius:0,numberOfPoints:0,geometryType:""}
     */
    toJSON() {
        return {
            rings: this.__.getCoordinates(),
            spatialReference: {
                wkid: this.center.spatialReference.wkid
            },
            center: [this.center.x, this.center.y],
            radius: this.radius,
            numberOfPoints: this.numberOfPoints,
            geometryType: ZGeometryType.POLYGON
        };
    }

}

/**
 * 圆的Z类型字符串
 * @type {string}
 */
ZCircle.prototype.geometryType = ZGeometryType.POLYGON;

/**
 * 圆的GeoJSON几何类型字符串
 * @type {string}
 */
ZCircle.prototype.type = ZGeometryType.GEOJSON_CIRCLE;

/**
 * 从openlayer原始圆对象生成ZCircle对象
 * @param {ol.geom.Circle} c 原始圆对象
 * @return {ZCircle}
 */
ZCircle.from = function (c) {
    let xym = c.getCenter();
    let r = c.getRadius();
    let center = ZPoint.from(xym);
    return new ZCircle(center, r);
};

/**
 * 从JSON表达对象转换为ZCircle对象
 * @param {Object} json JSON对象
 * @return {ZCircle} ZCircle对象
 */
ZCircle.fromJSON = function (json) {
    let center = json['center'];
    let sr = json['spatialReference'];
    return new ZCircle(new ZPoint(center[0], center[1], new ZSpatialReference(sr['wkid'])), json['radius'], json['numberOfPoints']);
};





export default ZCircle;