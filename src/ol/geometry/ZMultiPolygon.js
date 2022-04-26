import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZPoint from './ZPoint.js';
import ZExtent from './ZExtent.js';
import ZPolygon from './ZPolygon.js';
import ZSpatialReference from '../ZSpatialReference.js';

/**
 * @exports ZMultiPolygon
 * @class
 * @extends ZGeometry
 * @classdesc 多多边形
 * @param coordinates 格式如[[[[x1, y1], [x2, y2],...,[x1,y1]]]],四维数组
 * @param {Number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZMultiPolygon extends ZGeometry {
    constructor(coordinates, spatialReference) {
        super();

        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
        this.__ = new ol.geom.MultiPolygon(coordinates || []);
    }



    /**
     * 添加多边形
     * @param {ZPolygon|ol.geom.Polygon} polygon 单个多边形对象
     */
    addRing(polygon) {
        let _p = polygon.__ ? polygon.__ : polygon;
        this.__.appendPolygon(_p);
    }

    /**
     * 移除多边形
     * @param {Number} inx 所在索引位置
     */
    removeRing(inx) {
        let coordinates = this.__.getCoordinates();
        coordinates.splice(inx, 1);
        this.__.setCoordinates(coordinates);
    }

    /**
     * 多边形范围矩形
     * @returns {ZExtent} 范围矩形对象
     */
    getExtent() {
        let extent = this.__.getExtent();
        return new ZExtent(extent[0], extent[1], extent[2], extent[3], this.spatialReference);
    }

    /**
     * 获取四维数组坐标值
     * @returns {Array<Array<Array<Array<Number>>>>} 四维坐标数组
     */
    getRings() {
        return this.__.getCoordinates();
    }

    /**
     * 获取指定索引的数组坐标值
     * @return {Array<Array<Array<Number>>>} 三维坐标数组
     */
    getRing(index) {
        return this.__.getCoordinates()[index * 1];
    }

    /**
     * 获取指定索引的多边形
     * @param {Number} index 索引位置
     * @returns {ZPolygon} 单个多边形对象
     */
    getPolygon(index) {
        return ZPolygon.from(this.__.getPolygon(index));
    }

    /**
     * 所有多边形的数组
     * @returns {Array<ZPolygon>} 多边形数组
     */
    getPolygons() {
        let plygons = this.__.getPolygons();
        let r = [];
        for (let i in plygons) {
            r.push(this.getPolygon(i * 1));
        }
        return r;
    }

    /**
     * 获取多边形的中心点
     * @returns {ZPoint} 中心点对象
     */
    getCenter() {
        let center = this.__.getInteriorPoints().getCoordinates();
        let sumx = 0;
        let sumy = 0;
        let len = center.length;
        for (let i = 0; i < len; i++) {
            sumx += center[i][0];
            sumy += center[i][1];
        }
        return new ZPoint(sumx / len, sumy / len, this.spatialReference);
    }

    /**
     * 获取多边形的面积
     * @returns {Number} 面积值
     */
    getArea() {
        return this.__.getArea();
    }

    /**
     * 多边形是否自相交
     * @returns {Boolean} 相交返回true，否则为false
     */
    isSelfIntersecting() {
        let polygons = this.__.getPolygons();
        let f = false;
        for (let i in polygons) {
            f = this.getPolygon(i).isSelfIntersecting();
            if (f) {
                break;
            }
        }
        return f;
    }

    /**
     * 是否包含点。判断的算法是点坐标值完全相同
     * @param {Array} point 单个点坐标数组
     * @returns {Boolean} 包含点返回true,否则返回false
     */
    contains(point) {
        let polygons = this.__.getPolygons();
        let f = false;
        for (let i in polygons) {
            f = this.getPolygon(i).contains(point);
            if (f) {
                break;
            }
        }
        return f;
    }

    /**
     * 转换为json对象
     * @returns {Object} JSON对象表达形式。如{rings: [[[[x,y],[x,y],...]]], spatialReference: {wkid: *}, geometryType: String}
     */
    toJSON() {
        return {
            rings: this.getRings(),
            spatialReference: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.MULTIPOLYGON
        }
    }

    /**
     * 进行坐标变换
     * @param  {CoordTypeEnum} from 原坐标系代号
     * @param  {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZMultiPolygon} 转换后的Z对象
     */
    applyTransform(from, to) {
        let polygons = this.getPolygons();
        let rPts = [];
        for (let i in polygons) {
            rPts.push(polygons[i].applyTransform(from, to).getRings());
        }

        return new ZMultiPolygon(rPts, this.spatialReference);
    }

    /**
     * 整体偏移几何坐标值
     * @param {Number} xOffset 水平方向偏移量
     * @param {Number} yOffset 垂直方向偏移量
     * @return {ZMultiPolygon} 新的ZMultiPolygon对象
     */
    offset(xOffset, yOffset) {
        let polygons = this.getPolygons();
        let rPts = [];
        for (let i in polygons) {
            rPts.push(polygons[i].offset(xOffset, yOffset).getRings());
        }

        return new ZMultiPolygon(rPts, this.spatialReference);
    }


}
/**
 * Z类型值
 * @type {string}
 */
ZMultiPolygon.prototype.geometryType = ZGeometryType.MULTIPOLYGON;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZMultiPolygon.prototype.type = ZGeometryType.GEOJSON_MULTI_POLYGON;

/**
 * 从原生对象中生成z对象
 * @param {ol.geom.MultiPolygon} o 原生多多边形对象
 * @param {Number} wkid 原坐标系代号，如果对象中有属性crs，则优先使用此属性EPSG值
 * @returns {ZMultiPolygon} 新ZMultiPolygon对象
 */
ZMultiPolygon.from = function (poly, wkid) {
    let cds = poly.getCoordinates();
    if (poly.getType() === 'Polygon') {
        cds = [cds];
    }
    return new ZMultiPolygon(cds, new ZSpatialReference(poly.get('crs') || wkid || 0));
};

/**
 * 从JSON对象中生成Z对象。
 * @param {Object} json json表达形式对象
 * @property {Array} rings 多边形坐标数组
 * @property {Object} spatialReference 坐标系对象
 * @property {Number} spatialReference.wkid 坐标系EPSG代号
 * @returns {ZMultiPolygon} 新ZMultiPolygon对象
 */
ZMultiPolygon.fromJSON = function (json) {
    return new ZMultiPolygon(json['rings'], new ZSpatialReference(json['spatialReference']['wkid']));
};



export default ZMultiPolygon;