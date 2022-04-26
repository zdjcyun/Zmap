import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZSpatialReference from '../ZSpatialReference.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';


/**
 * @exports ZExtent
 * @classdesc 矩形范围类
 * @class
 * @extends ZGeometry
 * @param xmin 最小x值
 * @param ymin 最小y值
 * @param xmax 最大x值
 * @param ymax 最大y值
 * @param {number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZExtent extends ZGeometry {
    constructor(xmin, ymin, xmax, ymax, spatialReference) {
        super();
        this.xmin = xmin * 1;
        this.ymin = ymin * 1;
        this.xmax = xmax * 1;
        this.ymax = ymax * 1;
        this.__ = [this.xmin, this.ymin, this.xmax, this.ymax];
        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
    }



    setXmin(v) {
        this.xmin = v * 1;
        this.__[0] = this.xmin;
    }

    setYmin(v) {
        this.ymin = v * 1;
        this.__[1] = this.ymin;
    }

    setXmax(v) {
        this.xmax = v * 1;
        this.__[2] = this.xmax;
    }

    setYmax(v) {
        this.ymax = v * 1;
        this.__[3] = this.ymax;
    }


    /**
     * 获取坐标数组[xmin,ymin,xmax,ymax]
     * @returns {Array} 坐标数组
     */
    getFlatCoordinates() {
        return this.__;
    }

    /**
     * 获取extent中心点
     * @returns {Array<Number>} xy数组
     */
    getCenter() {
        let center = ol.extent.getCenter(this.__);
        //由于ZPoint循环引用不用new ZPoint
        return center;
    }

    /**
     * 获取边界范围
     * @returns {ZExtent} 矩形范围对象
     */
    getExtent() {
        return this;
    }

    /**
     * 获取extent的高度
     * @returns {number} 高度
     */
    getHeight() {
        return ol.extent.getHeight(this.__);
    }

    /**
     * 获取extent的宽度
     * @returns {number} 宽度
     */
    getWidth() {
        return ol.extent.getWidth(this.__);
    }

    /**
     * 转换为json对象
     * @returns {Object} json表达形式:{{xmin: *, ymin: *, xmax: *, ymax: *, spatialReferecne: {wkid: *}, geometryType: string}}
     */
    toJSON() {
        return {
            xmin: this.xmin,
            ymin: this.ymin,
            xmax: this.xmax,
            ymax: this.ymax,
            spatialReferecne: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.EXTENT
        }
    }

    /**
     * 进行坐标变换
     * @param {CoordTypeEnum} from 原自定义坐标系代号
     * @param {CoordTypeEnum} to 目标自定义坐标系代号
     * @returns {ZExtent} 转换后的ZExtent对象
     */
    applyTransform(from, to) {
        let minxy = GeoCoordConverterUtil.coordsConvert(from, to, this.xmin, this.ymin);
        let maxxy = GeoCoordConverterUtil.coordsConvert(from, to, this.xmax, this.ymax);

        return new ZExtent(minxy.x, minxy.y, maxxy.x, maxxy.y, this.spatialReference);
    }

    /**
     * 整体偏移几何坐标值
     * @param {number} xOffset 水平方向偏移量
     * @param {number} yOffset 垂直方向偏移量
     * @return {ZExtent} 新的ZExtent对象
     */
    offset(xOffset, yOffset) {
        return new ZExtent(
            this.xmin + xOffset, this.ymin + yOffset,
            this.xmax + xOffset, this.ymax + yOffset,
            this.spatialReference);
    }

}

/**
 * Z类型值
 * @type {string}
 */
ZExtent.prototype.geometryType = ZGeometryType.EXTENT;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZExtent.prototype.type = ZGeometryType.GEOJSON_POLYGON;

/**
 * 从原生对象中获取z对象
 * @param {ol.geom.Extent} o 原生对象
 * @param {number} [wkid=4326] 投影参考
 * @returns {ZExtent} ZExtent新对象
 */
ZExtent.from = function (o, wkid) {
    if (!o) return null;
    let xmin = o[0];
    let ymin = o[1];
    let xmax = o[2];
    let ymax = o[3];
    let spatialReference = new ZSpatialReference(wkid || 4326);
    return new ZExtent(xmin, ymin, xmax, ymax, spatialReference);
};

/**
 * 从json对象中生成对象
 * @param {Object} json json表达对象
 * @returns {ZExtent} ZExtent新对象
 */
ZExtent.fromJSON = function (json) {
    return new ZExtent(json['xmin'], json['ymin'], json['xmax'], json['ymax'], new ZSpatialReference(json['spatialReference']['wkid']));
};


/**
 * 把extent放大或缩小多少倍
 * @param {ZExtent} extent 矩形范围对象
 * @param {Number} factor 放大或缩小因子
 * @returns {ZExtent}
 */
ZExtent.expand = function (extent, factor) {
    let size = ol.extent.getSize(extent.__);
    let newSize = [size[0] * factor, size[1] * factor];

    let center = extent.getCenter();

    let coords = [
        center[0] - newSize[0] * 0.5,
        center[1] - newSize[1] * 0.5,
        center[0] + newSize[0] * 0.5,
        center[1] + newSize[1] * 0.5,
    ];

    return new ZExtent(coords, extent.spatialReference);
}

export default ZExtent;