import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZExtent from './ZExtent.js';
import ZSpatialReference from '../ZSpatialReference.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';

/**
 * @exports ZPoint
 * @classdesc 几何点封装类
 * @class
 * @extends ZGeometry
 * @param {Number} x X坐标
 * @param {Number} y Y坐标
 * @param {Number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZPoint extends ZGeometry {
    constructor(x, y, spatialReference) {
        super();

        this.x = x * 1;
        this.y = y * 1;
        this.__ = new ol.geom.Point([this.x, this.y]);
        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
        this.__.x = this.x;
        this.__.y = this.y;
    }



    /**
     * 设置x坐标
     * @param {Number} x 新x坐标值
     */
    setX(x) {
        this.__.translate(x * 1.0 - this.x, 0);
        this.x = x * 1.0;
        this.__.x = this.x;
    }

    /**
     * 设置y坐标
     * @param {Number} y 新y坐标值
     */
    setY(y) {
        this.__.translate(0, y * 1.0 - this.y);
        this.y = y * 1.0;
        this.__.y = this.y;
    }

    /**
     * 更新x和y坐标
     * @param {Number} x 新x坐标值
     * @param {Number} y 新y坐标值
     */
    update(x, y) {
        this.__.translate(x * 1.0 - this.x, y * 1.0 - this.y);
        this.x = x * 1.0;
        this.y = y * 1.0;
        this.__.x = this.x;
        this.__.y = this.y;
    }

    /**
     * 进行坐标变换
     * @param  {CoordTypeEnum} from 原坐标系代号
     * @param  {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZPoint} 转换后的ZPoint对象
     */
    applyTransform(from, to) {
        let resultPnt = GeoCoordConverterUtil.coordsConvert(from, to, this.x, this.y);

        return new ZPoint(resultPnt.x, resultPnt.y, this.spatialReference);
    }


    /**
     * 整体偏移几何坐标值
     * @param {Number} xOffset 水平方向偏移量
     * @param {Number} yOffset 垂直方向偏移量
     * @return {ZPoint} 新的ZPoint对象
     */
    offset(xOffset, yOffset) {
        return new ZPoint(this.x + xOffset, this.y + yOffset, this.spatialReference);
    }

    /**
     * 转换为json对象
     * @returns {Object} JSON对象{x: Number, y: Number, spatialReference: {wkid: Number}, geometryType: String}
     */
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            spatialReference: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.POINT
        };
    }

    /**
     * 获取中心点坐标
     * @returns {ZPoint} ZPoint对象
     */
    getCenter() {
        return this;
    }

    /**
     * 获取点的范围，以边长0.000000000001 值扩大。
     * @returns {ZExtent} 矩形范围
     */
    getExtent() {
        let deta = 0.000000000001;
        return new ZExtent(this.x - deta, this.y - deta, this.x + deta, this.y + deta);
    }

}
/**
 * Z类型值
 * @type {string}
 */
ZPoint.prototype.geometryType = ZGeometryType.POINT;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZPoint.prototype.type = ZGeometryType.GEOJSON_POINT;

/**
 * 从原生对象中获取Z对象
 * @param {ol.geom.Point} o 原生点对象
 * @param {Number} wkid 原坐标系代号，如果对象中有属性crs，则优先使用此属性EPSG值
 * @returns {ZPoint} 新ZPoint对象
 */
ZPoint.from = function (o, wkid) {
    let coordinates = o.getCoordinates();
    return new ZPoint(coordinates[0], coordinates[1], new ZSpatialReference(o.get('crs') || wkid || 0));
}

/**
 * 从JSON对象中生成Z对象
 * @param {Object} json json表达形式对象
 * @property {Number} x x坐标
 * @property {Number} y y坐标
 * @property {Object} spatialReference 坐标系对象
 * @property {Number} spatialReference.wkid 坐标系EPSG代号
 * @returns {ZPoint} 新ZPoint对象
 */
ZPoint.fromJSON = function (json) {
    return new ZPoint(json['x'], json['y'], new ZSpatialReference(json['spatialReference']['wkid']));
}



export default ZPoint;