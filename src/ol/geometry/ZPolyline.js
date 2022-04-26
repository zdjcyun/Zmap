import ZGeometry from './ZGeometry.js';
import ZGeometryType from './ZGeometryType.js';
import ZExtent from './ZExtent.js';
import ZPoint from './ZPoint.js';
import ZSpatialReference from '../ZSpatialReference.js';
import GeoCoordConverterUtil from '../util/GeoCoordConverterUtil.js';

/**
 * @exports ZPolyline
 * @classdesc 折线段对象，为兼容上的考虑，统一的将线实现为MultiLineString
 * @class
 * @extends ZGeometry
 * @param {Array} coordinates 坐标串数组，格式如[[[x1, y1], [x2, y2],...,[x1,y1]]]
 * @param {Number|ZSpatialReference} spatialReference 空间坐标系代号EPSG
 */
class ZPolyline extends ZGeometry {
    constructor(coordinates, spatialReference) {
        super();

        this.spatialReference = _.isNumber(spatialReference) ? new ZSpatialReference(spatialReference) : spatialReference;
        this.__ = new ol.geom.MultiLineString(coordinates || []);
    }




    /**
     * 添加Polyline的组成部分path
     * @param {Array} path 单条路径坐标串 [[x1, y1],[x2, y2],[x3, y3]]
     */
    addPath(path) {
        this.__.appendLineString(new ol.geom.LineString(path));
    }

    /**
     * 删除Polyline的组成部分path
     * @param {Number} inx 序号
     */
    removePath(inx) {
        let coordinates = this.__.getCoordinates();
        coordinates.splice(inx, 1);
        this.__.setCoordinates(coordinates);
    }

    /**
     * 获取指定的点
     * @param {Number} pathIndex 线串序号
     * @param {Number} pointIndex 点序号
     * @returns {ZPoint} ZPoint点对象
     */
    getPoint(pathIndex, pointIndex) {
        pathIndex = Math.max(pathIndex, 0);
        pointIndex = Math.max(pointIndex, 0);
        let coordinates = this.__.getCoordinates();
        if (coordinates.length > 0) {
            let pnt = coordinates[pathIndex][pointIndex];

            return new ZPoint(pnt[0], pnt[1], this.spatialReference);
        }
    }

    /**
     * 获取第一个点
     * @returns {ZPoint} ZPoint点对象
     */
    getFirstPoint() {
        let pnt = this.__.getFirstCoordinate();

        return new ZPoint(pnt[0], pnt[1], this.spatialReference);
    }

    /**
     * 获取最后一个点
     * @returns {ZPoint} ZPoint点对象
     */
    getLastPoint() {
        let pnt = this.__.getLastCoordinate();

        return new ZPoint(pnt[0], pnt[1], this.spatialReference);
    }

    /**
     * 获取中心点
     * @returns {ZPoint} ZPoint点对象
     */
    getCenter() {
        //let center = this.__.getCoordinateAt(0.5);
        //let center = this.__.getCoordinateAtM(this.__.getLength()*0.5);
        let center = this.__.getFlatMidpoints();
        return new ZPoint(center[0], center[1], this.spatialReference);
    }


    /**
     * 获取边界范围
     * @returns {ZExtent} ZExtent边界范围对象
     */
    getExtent() {
        let extent = this.__.getExtent();
        return new ZExtent(extent[0], extent[1], extent[2], extent[3], this.spatialReference);
    }

    /**
     * 获取Polyline的组成部分Paths
     * @returns {Array<Array<Array<Number>>>} 全部路径坐标数组
     */
    getPaths() {
        return this.__.getCoordinates();
    }

    /**
     * 获取组成部分Path
     * @param {Number} index 指定线串的索引
     * @returns {Array<Array<Number>>} 单条路径坐标数组
     */
    getPath(index) {
        return this.__.getLineString(index * 1).getCoordinates();
    }

    /**
     * 设置Polyline的组成部分paths
     * @param {Array} paths  路径坐标三维数组
     */
    setPaths(paths) {
        if (paths) {
            this.__.setCoordinates(paths);
        }
    }

    /**
     * 进行坐标变换
     * @param  {CoordTypeEnum} from 原坐标系代号
     * @param  {CoordTypeEnum} to 目标坐标系代号
     * @returns {ZPolyline} 转换后的Z对象
     */
    applyTransform(from, to) {
        let cds = this.getPaths();
        let rPts = [];
        for (let i in cds) {
            rPts[i] = [];
            for (let j in cds[i]) {
                let resultPnt = GeoCoordConverterUtil.coordsConvert(from, to, cds[i][j][0], cds[i][j][1]);
                rPts[i].push([resultPnt.x, resultPnt.y]);
            }
        }

        return new ZPolyline(rPts, this.spatialReference);
    }

    /**
     * 整体偏移几何坐标值
     * @param {Number} xOffset 水平方向偏移量
     * @param {Number} yOffset 垂直方向偏移量
     * @return {ZPolyline} 新的ZPolyline对象
     */
    offset(xOffset, yOffset) {
        let cds = this.getPaths();
        let rPts = [];
        for (let i in cds) {
            rPts[i] = [];
            for (let j in cds[i]) {
                rPts[i].push([cds[i][j][0] + xOffset, cds[i][j][1] + yOffset]);
            }
        }

        return new ZPolyline(rPts, this.spatialReference);
    }

    /**
     * 转换为json对象
     * @returns {Object} JSON表达对象。{paths: [[[]]], spatialReference: {wkid: Number}, geometryType: String}
     */
    toJSON() {
        return {
            paths: this.getPaths(),
            spatialReference: {
                wkid: this.spatialReference.wkid
            },
            geometryType: ZGeometryType.POLYLINE
        }
    }

}

/**
 * Z类型值
 * @type {string}
 */
ZPolyline.prototype.geometryType = ZGeometryType.POLYLINE;

/**
 * GeoJSON几何类型
 * @type {string}
 */
ZPolyline.prototype.type = ZGeometryType.GEOJSON_MULTI_LINE_STRING;


/**
 * 从原生对象中获取z对象
 * @param {ol.geom.MultiLineString|ol.geom.LineString} o ol.geom.MultiLineString或ol.geom.LineString原生对象
 * @param {Number} wkid 原坐标系代号，如果对象中有属性crs，则优先使用此属性EPSG值
 * @returns {ZPolyline} 新ZPolyline对象
 */
ZPolyline.from = function (o, wkid) {
    if (o instanceof ol.geom.LineString) {
        return new ZPolyline([o.getCoordinates()], new ZSpatialReference(o.get('crs') || wkid || 0));
    } else if (o instanceof ol.geom.MultiLineString) {
        return new ZPolyline(o.getCoordinates(), new ZSpatialReference(o.get('crs') || wkid || 0));
    }
};
/**
 * 从JSON对象中生成Z对象。
 * @param {Object} json json表达形式对象
 * @property {Array} paths 多边形坐标数组
 * @property {Object} spatialReference 坐标系对象
 * @property {Number} spatialReference.wkid 坐标系EPSG代号
 * @returns {ZPolyline} ZPolyline新对象
 */
ZPolyline.fromJSON = function (json) {
    return new ZPolyline(json['paths'], new ZSpatialReference(json['spatialReference']['wkid']));
};



export default ZPolyline;