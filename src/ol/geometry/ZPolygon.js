import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZExtent from './ZExtent.js';
import ZPoint from './ZPoint.js';
import ZSpatialReference from '../ZSpatialReference.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';

/**
 * @exports ZPolygon
 * @classdesc 多边形封装类
 * @class
 * @extends ZGeometry
 * @param {Array} coordinates 坐标串数组，格式如[[[x1, y1], [x2, y2],...,[x1,y1]]]
 * @param {Number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZPolygon extends ZGeometry {
    constructor(coordinates, spatialReference) {
        super();

        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
        this.__ = new ol.geom.Polygon(coordinates || []);
    }


    /**
     * 添加一个环
     * @param {Array<Array<Number>>} ring 环坐标数组
     */
    addRing(ring) {
        this.__.appendLinearRing(new ol.geom.LinearRing(ring));
    }

    /**
     * 删除指定索引的线串
     * @param {Number} inx 指定索引
     */
    removeRing(inx) {
        let coordinates = this.__.getCoordinates();
        coordinates.splice(inx, 1);
        this.__.setCoordinates(coordinates);
    }

    /**
     * 获取边界范围
     * @returns {ZExtent} 矩形范围对象
     */
    getExtent() {
        let extent = this.__.getExtent();
        return new ZExtent(extent[0], extent[1], extent[2], extent[3], this.spatialReference);
    }

    /**
     * 获取所有线串的坐标数组
     * @returns {Array<Array<Array<Number>>>} 所有环的坐标数组
     */
    getRings() {
        return this.__.getCoordinates();
    }

    /**
     * 获取指定索引的线串坐标数组
     * @param index
     * @returns {Array<Array<Number>>} 单个环的坐标数组
     */
    getRing(index) {
        return this.__.getLinearRing(index).getCoordinates();
    }

    /**
     * 获取多边环个数
     * @returns {Number} 多边环个数
     */
    getRingCount() {
        return this.__.getLinearRingCount();
    }

    /**
     * 获取多边形的中心点
     * @returns {ZPoint} 中心点对象
     */
    getCenter() {
        // let extent = this.__.getExtent();
        // let center = ol.extent.getCenter(extent);
        let center = this.__.getInteriorPoint().getCoordinates();

        return new ZPoint(center[0], center[1], this.spatialReference);
    }

    /**
     * 获取多边形的中心点,getCenter的同义词
     * @returns {ZPoint} 中心点对象
     */
    getCentroid() {
        return this.getCenter();
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
     * @returns {Boolean} 自相交返回true，否则返回false
     */
    isSelfIntersecting() {
        function ccw(a, b, c) {
            return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
        }

        function intersects(a, b) {
            return (ccw(a[0], a[1], b[0]) * ccw(a[0], a[1], b[1]) <= 0) &&
                (ccw(b[0], b[1], a[0]) * ccw(b[0], b[1], a[1]) <= 0);
        }

        let components = this.getRings();
        for (let inx = 0; inx < components.length; inx++) {
            for (let inx2 = 0; inx2 < components[inx].length; inx2++) {
                let ring = components[inx][inx2];
                let len = ring.length;
                let lines = [];
                for (let i = 0; i < len - 1; i++) {
                    lines.push([ring[i], ring[i + 1]]);
                }
                for (let m = 0; m < lines.length - 1; m++) {
                    for (let n = m + 1; n < lines.length; n++) {
                        if (lines[m][1] !== lines[n][0] && lines[m][0] !== lines[n][1]) {
                            if (intersects(lines[m], lines[n])) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * 是否是内部顶点
     * @param {Object|Array} point 顶点坐标数组或对象
     * @property {Number} point.x 如果是Object类型，则必须有x坐标值
     * @property {Number} point.y 如果是Object类型，则必须有y坐标值
     * @returns {Boolean} 如果坐标值完全相同则返回true，否则返回false
     */
    isInteriorVertex(point) {
        if (!point) return false;
        let zPnt = point;
        if (!_.isArray(point)) {
            zPnt = [point.x, point.y];
        }

        let coords = this.getRings();
        for (let i = 0, len = coords.length; i < len; i++) {
            for (let j = 0, len2 = coords[i].length; j < len2; j++) {
                if (coords[i][j][0] === zPnt[0] && coords[i][j][1] === zPnt[1]) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检查点是否在多边形内部
     * @param {Array|Object} point 待检查的点对象
     * @property {Number} point.x 如果为Object类型，则必须有x属性值
     * @property {Number} point.y 如果为Object类型，则必须有y属性值
     * @returns {Boolean} 在内部则返回true,否则为false
     */
    contains(point) {
        if (!point) return false;
        let zPnt;
        if (_.isArray(point)) {
            zPnt = new ZPoint(point[0], point[1]);
        } else if (!point.__) {
            zPnt = new ZPoint(point.x, point.y);
        }
        let pExt = zPnt.getExtent();

        return this.__.intersectsExtent(pExt.__);

    }

    /**
     * 转换为json对象
     * @returns {Object} JSON表达对象{rings, spatialReference: {wkid: *}, geometryType: String}
     */
    toJSON() {
        return {
            rings: this.getRings(),
            spatialReference: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.POLYGON
        }
    }

    /**
     * 进行坐标变换
     * @param  {CoordTypeEnum} from 原坐标系代号
     * @param  {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZPolygon} 转换后的ZPolygon对象
     */
    applyTransform(from, to) {
        let cds = this.getRings();
        let rPts = [];
        for (let i in cds) {
            rPts[i] = [];
            for (let j in cds[i]) {
                let resultPnt = GeoCoordConverterUtil.coordsConvert(from, to, cds[i][j][0], cds[i][j][1]);
                rPts[i].push([resultPnt.x, resultPnt.y]);
            }
        }

        return new ZPolygon(rPts, this.spatialReference);
    }

    /**
     * 整体偏移几何坐标值
     * @param {Number} xOffset 水平方向偏移量
     * @param {Number} yOffset 垂直方向偏移量
     * @return {ZPolygon} 新的ZPolygon对象
     */
    offset(xOffset, yOffset) {
        let cds = this.getRings();
        let rPts = [];
        for (let i in cds) {
            rPts[i] = [];
            for (let j in cds[i]) {
                rPts[i].push([cds[i][j][0] + xOffset, cds[i][j][1] + yOffset]);
            }
        }

        return new ZPolygon(rPts, this.spatialReference);
    }


}


/**
 * Z类型值
 * @type {string}
 */
ZPolygon.prototype.geometryType = ZGeometryType.POLYGON;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZPolygon.prototype.type = ZGeometryType.GEOJSON_POLYGON;


/**
 * 从原生对象中获取Z对象
 * @param {ol.geom.Polygon} o 原生多边形对象
 * @param {Number} wkid 原坐标系代号，如果对象中有属性crs，则优先使用此属性EPSG值
 * @returns {ZPolygon} 新ZPolygon对象
 */
ZPolygon.from = function (poly, wkid) {
    let cds = poly.getCoordinates();
    return new ZPolygon(cds, new ZSpatialReference(poly.get('crs') || wkid || 0));
};

/**
 * 从JSON对象中生成Z对象。
 * @param {Object} json json表达形式对象
 * @property {Array} rings 多边形坐标数组
 * @property {Object} spatialReference 坐标系对象
 * @property {Number} spatialReference.wkid 坐标系EPSG代号
 * @returns {ZPolygon} 新ZPolygon对象
 */
ZPolygon.fromJSON = function (json) {
    return new ZPolygon(json['rings'], new ZSpatialReference(json['spatialReference']['wkid']));
};



export default ZPolygon;