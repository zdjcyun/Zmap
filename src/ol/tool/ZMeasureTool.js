

import i18n from './i18n/ZMeasureTool.zh.js';
import CoordTypeEnum from '../enum/CoordTypeEnum.js';
import BdMeasureUtil from '../util/BdMeasureUtil.js';

/**
 * @property {Number} EARTH_RADIUS WGS84,CGCS2000坐标系地球半径
 * @constant
 */
const EARTH_RADIUS = 6378137;

/**
 * @property {Number} EARTH_MEAN_RADIUS  默认取WGS84椭球平均半径 (1/3 * (2a + b))
 * @constant
 * @see https://en.wikipedia.org/wiki/Earth_radius#Mean_radius
 */
const EARTH_MEAN_RADIUS = 6371008.8;

/**
 * @property {Number} BEIJING54_EARTH_RADIUS 北京1954坐标系地球半径
 * @constant
 */
const BEIJING54_EARTH_RADIUS = 6378245.0;
/**
 * @property {Number} XIAN80_EARTH_RADIUS 西安1980坐标系地球半径
 * @constant
 */
const XIAN80_EARTH_RADIUS = 6378140;

function getRad(deg) {
    return (Math.PI * deg / 180);
}


/**
 * @exports ZMeasureTool
 * @classdesc 测量工具类。此类为Object实例，不需要new
 * @class
 */
let ZMeasureTool = {
    /**
     * @property {String} UNIT_M 米单位
     * @type {String}
     * @constant
     */
    UNIT_M: i18n.METER,
    /**
     * @property {String} UNIT_KM 千米单位
     * @type {String}
     * @constant
     */
    UNIT_KM: i18n.KILOMETER,
    /**
     * @property {String} UNIT_SQUARE_M 平方米单位
     * @type {String}
     * @constant
     */
    UNIT_SQUARE_M: i18n.SQUARE_METER,
    /**
     * @property {String} UNIT_SQUARE_KM 平方千米单位
     * @type {String}
     * @constant
     */
    UNIT_SQUARE_KM: i18n.SQUARE_KILOMETER,
    /**
     * @property {String} UNIT_DEGREES 度单位（DEGREES）
     * @type {String}
     * @constant
     */
    UNIT_DEGREES: 'DEGREES',


    /**
     * @property {Number} MODEL_ELLIPSOID_SPHERE=4326 WGS84椭球体
     * @type {Number}
     * @constant
     */
    MODEL_ELLIPSOID_SPHERE: 4326,

    /**
     * @property {Number} MODEL_BEIJING54_ELLIPSOID_SPHERE=4326 北京54椭球体
     * @type {Number}
     * @constant
     */
    MODEL_BEIJING54_ELLIPSOID_SPHERE: 4214,

    /**
     * @property {Number} MODEL_ELLIPSOID_SPHERE=4326 西安80椭球体
     * @type {Number}
     * @constant
     */
    MODEL_XIAN80_ELLIPSOID_SPHERE: 4610,

    /**
     * @property {Number} MODEL_CGCJ2000_ELLIPSOID_SPHERE=4490 CGCJ2000椭球体,与WGS84一样
     * @type {Number}
     * @constant
     */
    MODEL_CGCJ2000_ELLIPSOID_SPHERE: 4490,

    /**
     * @property {Number} MODEL_NORMAL_SPHERE WGS84标准球体
     * @type {Number}
     * @constant
     */
    MODEL_NORMAL_SPHERE: 4326001,

    /**
     * @property {Number} MODEL_PROJECT=3857 WGS84椭球墨卡托投影
     * @type {Number}
     * @constant
     */
    MODEL_PROJECT: 3857,

    /**
     * @property {Number} MODEL_BAIDU09 百度经纬度坐标系
     * @type {Number}
     * @constant
     */
    MODEL_BAIDU09: CoordTypeEnum.bd09ll,

    /**
     * 计算两点的长度
     * @param {ZPoint|Object} fromPoint 起点。如果为Object类型，必须有属性x,y
     * @param {ZPoint|Object} toPoint 终点。如果为Object类型，必须有属性x,y
     * @param {Number} wkid 坐标点的坐标系类型。
     * 可选值MODEL_BAIDU09，MODEL_ELLIPSOID_SPHERE，MODEL_NORMAL_SPHERE，MODEL_PROJECT
     * @returns {Number} 长度
     * @static
     */
    measureLength: function (fromPoint, toPoint, wkid) {
        let ret;
        switch (wkid) {
            case this.MODEL_BAIDU09:
                ret = BdMeasureUtil.measeureLengthBD09Sphere(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
                break;
            case this.MODEL_BEIJING54_ELLIPSOID_SPHERE:
                ret = this.measureLengthEllipsoidSphere(
                    fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, BEIJING54_EARTH_RADIUS);
                break;
            case this.MODEL_XIAN80_ELLIPSOID_SPHERE:
                ret = this.measureLengthEllipsoidSphere(
                    fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, XIAN80_EARTH_RADIUS);
                break;
            case this.MODEL_ELLIPSOID_SPHERE:
            case this.MODEL_CGCJ2000_ELLIPSOID_SPHERE:
                ret = this.measureLengthEllipsoidSphere(
                    fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, EARTH_RADIUS);
                break;
            case this.MODEL_NORMAL_SPHERE:
                ret = this.measeureLengthStandardSphere(
                    fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
                break;
            case this.MODEL_PROJECT:
                ret = this.measeureLengthProjection(
                    fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
                break;
            default:
                ret = 0;
                break;
        }
        return ret;
    },


    /**
     * 通过经纬度计算两点间距离: 采用WGS-84椭球模型
     * @param {Number} fromLon   出发点经度
     * @param {Number} fromLat   出发点纬度
     * @param {Number} toLon     目标点经度
     * @param {Number} toLat     目标点纬度
     * @param {Number} [radius=6378137]    地球长半径
     * @return {Number} 两点间距离
     * @private
     */
    measureLengthEllipsoidSphere: function (fromLon, fromLat, toLon, toLat, radius) {
        // let r = radius || EARTH_RADIUS;
        // let radLon1 = getRad(fromLon);//经度
        // let radLat1 = getRad(fromLat);//纬度
        // let radLon2 = getRad(toLon);
        // let radLat2 = getRad(toLat);
        // let A = Math.cos(radLat1) * Math.cos(radLat2);
        // let B = Math.cos(radLon1) * Math.cos(radLon2);
        // let C = Math.sin(radLon1) * Math.sin(radLon2);
        // let D = Math.sin(radLat1) * Math.sin(radLat2);
        // let s = Math.acos(A * (B + C) + D);
        // s = s * r;
        // s = Math.round(s * 10000) / 10000;
        // return s;

        //下面是openlayer的算法。求的是大圆弧长。与上面的算法差不多
        let r = radius || EARTH_MEAN_RADIUS;
        let radLat1 = getRad(fromLat);
        let radLat2 = getRad(toLat);
        let deltaLatBy2 = (radLat2 - radLat1) / 2;
        let deltaLonBy2 = getRad(toLon - fromLon) / 2;
        let a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
            Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
            Math.cos(radLat1) * Math.cos(radLat2);
        return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
    /**
     * 通过经纬度计算两点间距离: 采用WGS84 标准球体算法
     * @param {Number} fromLat   出发点纬度
     * @param {Number} fromLon   出发点经度
     * @param {Number} toLat     目标点纬度
     * @param {Number} toLon     目标点经度
     * @return {Number} 两点间距离
     * @private
     */
    measeureLengthStandardSphere: function (fromLat, fromLon, toLat, toLon) {
        let radLat1 = getRad(fromLon);
        let radLat2 = getRad(toLon);
        let a = radLat1 - radLat2;
        let b = getRad(fromLat) - getRad(fromLat);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    },
    /**
     * 通过坐标计算两点间距离: 采用投影坐标
     * @param {Number} fromLat   出发点纬度
     * @param {Number} fromLon   出发点经度
     * @param {Number} toLat     目标点纬度
     * @param {Number} toLon     目标点经度
     * @return {Number}
     * @private
     */
    measeureLengthProjection: function (fromLat, fromLon, toLat, toLon) {
        return Math.sqrt(Math.pow(toLat - fromLat, 2) + Math.pow(toLon - fromLon, 2));
    },
    /**
     * 计算坐标数组的投影面积
     * @param {Array.<Object>} points  面的点集合。其格式为:[{lng:经度,lat:纬度}]
     * @param {Number} mode 坐标值的坐标系类型。可选值MODEL_BAIDU09，MODEL_ELLIPSOID_SPHERE，MODEL_NORMAL_SPHERE，MODEL_PROJECT
     * @return {Number} 面积
     */
    measureArea: function (points, mode) {
        let r;
        if (mode === this.MODEL_ELLIPSOID_SPHERE
            || mode === this.MODEL_NORMAL_SPHERE) {
            r = this.measureAreaEllipsoidSphere(points);
            r = Math.abs(r);
        } else if (mode === this.MODEL_BAIDU09) {
            //百度地图
            r = BdMeasureUtil.measeureAreaBD09Sphere(points);
        } else {
            //投影
            r = this.measureAreaProjection(points);
        }

        return r;
    },

    /**
     * 测量投影面积
     * @param {Array} points 坐标点数组
     * @return {Number}
     * @private
     */
    measureAreaProjection: function (points) {
        let area = 0;
        let i, j;
        let x, y;
        let diff;
        let len = points.length;
        j = len - 1;
        let offset = 103088.845;
        for (i = 0; i < len; i++) {
            y = points[i].x * points[j].y;
            x = points[j].x * points[i].y;
            diff = (y - x);
            area += diff;
            j = i;
        }
        return Math.abs(area / 2);
    },

    /**
     * 经纬度面积测量
     * @param {Array.<Object>} coordinates 坐标点数组。其格式为:[{x:经度,y:纬度}]
     * @param {Number} radius=6378137 地图半径值
     * @returns {Number}
     * @private
     */
    measureAreaEllipsoidSphere: function (coordinates, radius) {
        let er = radius || EARTH_RADIUS;
        let area = 0;
        let len = coordinates.length;
        let x1 = coordinates[len - 1].x;
        let y1 = coordinates[len - 1].y;
        for (let i = 0; i < len; i++) {
            let x2 = coordinates[i].x;
            let y2 = coordinates[i].y;
            area += getRad(x2 - x1) *
                (2 + Math.sin(getRad(y1)) +
                    Math.sin(getRad(y2)));
            x1 = x2;
            y1 = y2;
        }
        return area * er * er / 2.0;
    },

    /**
     * 面积单位格式化
     * @param {Number} area 面积值
     * @returns {String} 格式化的值
     */
    areaUnitFormat: function (area) {
        let result;
        let critical = 1000000;
        if (area >= critical) {
            result = Number(area / critical).toFixed(3) + this.UNIT_SQUARE_KM;
        } else {
            result = area.toFixed(2) + this.UNIT_SQUARE_M;
        }
        return result;
    },

    /**
     * 长度单位格式化
     * @param {Number} length 长度值
     * @returns {String} 格式化的值
     */
    lengthUnitFormat: function (length) {
        let result;
        let critical = 1000;
        if (length >= critical) {
            result = Number(length / 1000).toFixed(3) + this.UNIT_KM;
        } else {
            result = length.toFixed(2) + this.UNIT_M;
        }
        return result;
    }
};

export default ZMeasureTool;