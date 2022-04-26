import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZPoint from './ZPoint.js';
import ZExtent from './ZExtent.js';
import ZSpatialReference from '../ZSpatialReference.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';


/**
 * @exports ZMultiPoint
 * @classdesc 多点对象
 * @class
 * @extends ZGeometry
 * @param {Array} coordinates 坐标数组。格式为[[[x1, y1],[x2, y2], [x3, y3]]]
 * @param {number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZMultiPoint extends ZGeometry {
    constructor(coordinates, spatialReference) {
        super();
        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
        this.__ = new ol.geom.MultiPoint(coordinates);
    }


    /**
     * 追加点
     * @param {ZPoint|ol.geom.Point} point 点对象引用
     */
    addPoint(point) {
        let _p = point.__ ? point.__ : point;
        this.__.appendPoint(_p);
    }

    /**
     * 移除点
     * @param {number} index 点的索引位置
     */
    removePoint(index) {
        let coordinates = this.__.getCoordinates();
        coordinates.splice(index, 1);
        this.__.setCoordinates(coordinates);
    }


    /**
     * 获取所有点坐标数组
     * @returns {Array<Array<Number>>} 二维坐标数组
     */
    getPoints() {
        return this.__.getCoordinates();
    }

    /**
     * 获取指定点坐标数组
     * @param {number} index 点的索引位置
     * @returns {Array<Number>} 单个坐标点数组
     */
    getPoint(index) {
        return this.__.getPoint(index).getCoordinates();
    }

    /**
     * 转换为json对象
     * @returns {Object} JSON对象。如{points: [[]], spatialReference: {wkid}, geometryType: ""}
     */
    toJSON() {
        return {
            points: this.getPoints(),
            spatialReference: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.MULTIPOINT
        };
    }

    /**
     * 获取中心点坐标（取第一个点）
     * @returns {ZPoint} ZPoint对象
     */
    getCenter() {
        let pnt = this.getPoint(0);

        return new ZPoint(pnt[0], pnt[1], this.spatialReference);
    }

    /**
     * 获取点的范围
     * @returns {ZExtent} 矩形范围对象
     */
    getExtent() {
        let extent = this.__.getExtent();
        return new ZExtent(extent[0], extent[1], extent[2], extent[3], this.spatialReference);
    }

    /**
     * 进行坐标变换
     * @param {CoordTypeEnum} from 原坐标系代号
     * @param {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZMultiPoint} 转换后的Z对象
     */
    applyTransform(from, to) {
        let cds = this.getPoints();
        let rPts = [];
        for (let i in cds) {
            let resultPnt = GeoCoordConverterUtil.coordsConvert(from, to, cds[i][0], cds[i][1]);
            rPts.push([resultPnt.x, resultPnt.y]);
        }

        return new ZMultiPoint(rPts, this.spatialReference);
    }

    /**
     * 整体偏移几何坐标值
     * @param {number} xOffset 水平方向偏移量
     * @param {number} yOffset 垂直方向偏移量
     * @return {ZPoint} 新的ZPoint对象
     */
    offset(xOffset, yOffset) {
        let cds = this.getPoints();
        let rPts = [];
        for (let i in cds) {
            rPts.push([cds[i][0] + xOffset, cds[i][1] + yOffset]);
        }

        return new ZMultiPoint(rPts, this.spatialReference);
    }


}


/**
 * Z类型值
 * @type {string}
 */
ZMultiPoint.prototype.geometryType = ZGeometryType.MULTIPOINT;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZMultiPoint.prototype.type = ZGeometryType.GEOJSON_MULTI_POINT;

/**
 * 从原生对象中获取Z对象
 * @param {ol.geom.MultiPoint} o 原生多点对象
 * @param {number} wkid 原坐标系代号，如果对象中有属性crs，则优先使用此属性EPSG值
 * @returns {ZMultiPoint} 新ZMultiPoint对象
 */
ZMultiPoint.from = function (o, wkid) {
    let coordinates = o.getCoordinates();
    return new ZMultiPoint(coordinates, new ZSpatialReference(o.get('crs') || wkid || 0));
};

/**
 * 从JSON对象中生成Z对象。
 * @param {Object} json json表达形式对象
 * @property {Array} points 坐标数组
 * @property {Object} spatialReference 坐标系对象
 * @property {number} spatialReference.wkid 坐标系EPSG代号
 * @returns {ZMultiPoint} 新ZMultiPoint对象
 */
ZMultiPoint.fromJSON = function (json) {
    return new ZMultiPoint(json.points, new ZSpatialReference(json['spatialReference']['wkid']));
};

export default ZMultiPoint;