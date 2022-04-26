

import CoordTypeEnum from '../enum/CoordTypeEnum.js';
import BdGeoConverterUtil from './BdGeoConverterUtil.js';

function wrapperResultPoint(x, y) {
    return { x: x, y: y };
}

/**
 * @exports GeoCoordConverterUtil
 * @classdesc 坐标转换通用工具类。此类为Object实例，不需要new
 * @class
 * @static
 */
let GeoCoordConverterUtil = {
    pi: 3.1415926535897932384626,
    a: 6378245.0,
    ee: 0.00669342162296594323,

    /**
     * wgs84转GCJ-02坐标系
     * @param {Number} lon 经度
     * @param {Number} lat 纬度
     * @return {Object} 坐标点对象
     */
    wgs84_To_Gcj02: function (lon, lat) {
        let dLat = this.transformLat(lon - 105.0, lat - 35.0);
        let dLon = this.transformLon(lon - 105.0, lat - 35.0);
        let radLat = lat / 180.0 * this.pi;
        let magic = Math.sin(radLat);
        magic = 1 - this.ee * magic * magic;
        let sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * this.pi);
        dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * this.pi);
        let mgLat = parseFloat(lat) + dLat;
        let mgLon = parseFloat(lon) + dLon;
        return wrapperResultPoint(mgLon, mgLat);
    },
    /**
     * GCJ-02坐标系转wgs84
     * @param {Number} lon 经度
     * @param {Number} lat 纬度
     * @return {Object} 坐标点对象
     */
    gcj02_To_Gps84: function (lon, lat) {
        let gps = this.transform(lat, lon);
        let lontitude = lon * 2 - Number(gps.x);
        let latitude = lat * 2 - Number(gps.y);
        return wrapperResultPoint(lontitude, latitude);
    },

    /**
     *  (GCJ-02) 坐标转换成百度坐标系 (BD-09)
     * @param {Number} gg_lon 经度
     * @param {Number} gg_lat 纬度
     * @return {Object} 坐标点对象
     */
    gcj02_To_Bd09: function (gg_lon, gg_lat) {
        let x_pi = this.pi * 3000.0 / 180.0;
        let x = gg_lon;
        let y = gg_lat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        let bd_lon = z * Math.cos(theta) + 0.0065;
        let bd_lat = z * Math.sin(theta) + 0.006;
        return wrapperResultPoint(bd_lon, bd_lat);
    },

    /**
     * 百度坐标系 (BD-09)坐标转换成(GCJ-02)坐标
     * @param {Number} bd_lon 经度
     * @param {Number} bd_lat 纬度
     * @return {Object} 坐标点对象
     */
    bd09_To_Gcj02: function (bd_lon, bd_lat) {
        let x_pi = this.pi * 3000.0 / 180.0;
        let x = bd_lon - 0.0065, y = bd_lat - 0.006;
        let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        let gg_lon = z * Math.cos(theta);
        let gg_lat = z * Math.sin(theta);
        return wrapperResultPoint(gg_lon, gg_lat);
    },

    transformLat: function (x, y) {
        let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
            + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * this.pi) + 40.0 * Math.sin(y / 3.0 * this.pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * this.pi) + 320 * Math.sin(y * this.pi / 30.0)) * 2.0 / 3.0;
        return ret;
    },

    transformLon: function (x, y) {
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
            * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * this.pi) + 40.0 * Math.sin(x / 3.0 * this.pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * this.pi) + 300.0 * Math.sin(x / 30.0
            * this.pi)) * 2.0 / 3.0;
        return ret;
    },

    transform: function (lat, lon) {
        let dLat = this.transformLat(lon - 105.0, lat - 35.0);
        let dLon = this.transformLon(lon - 105.0, lat - 35.0);
        let radLat = lat / 180.0 * this.pi;
        let magic = Math.sin(radLat);
        magic = 1 - this.ee * magic * magic;
        let sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * this.pi);
        dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * this.pi);
        let mgLat = parseFloat(lat) + dLat;
        let mgLon = parseFloat(lon) + dLon;
        return wrapperResultPoint(mgLon, mgLat);
    },


    /**
     * 经纬度转Web墨卡托坐标
     * @param {Number} lon 经度
     * @param {Number} lat 纬度
     * @return {Object} 坐标点对象
     */
    lonLat2WebMercator: function (lon, lat) {
        let x = lon * 20037508.34 / 180;
        let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;

        return wrapperResultPoint(x, y);
    },


    /**
     * Web墨卡托转经纬度
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @return {Object} 坐标点对象
     */
    webMercator2lonLat: function (x, y) {
        x = x / 20037508.34 * 180;
        y = y / 20037508.34 * 180;
        y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);

        return wrapperResultPoint(x, y);
    },


    /**
     * 坐标转换通用类。可实现各种坐标系之间的坐标转换
     * @param {Number} from 源坐标系代号。取值为CoordTypeEnum具体值
     * @param {Number} to 目标坐标系代号。取值为CoordTypeEnum具体值
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @return {Object} 坐标点对象
     * @see CoordTypeEnum
     */
    coordsConvert: function (from, to, x, y) {
        x = x * 1;
        y = y * 1;
        if (from === to) {
            return { x: x, y: y };
        }
        let targetPoint;
        if (from == CoordTypeEnum.wgs84) {
            targetPoint = this.wgs84ToOther(to, x, y);
        } else if (from == CoordTypeEnum.webmercator) {
            targetPoint = this.webMercatorToOther(to, x, y);
        } else if (from == CoordTypeEnum.gcj02) {
            targetPoint = this.gcj02ToOther(to, x, y);
        } else if (from == CoordTypeEnum.gcj02mc) {
            targetPoint = this.gcj02mcToOther(to, x, y);
        } else if (from == CoordTypeEnum.bd09ll) {
            targetPoint = this.bd09llToOther(to, x, y);
        } else if (from == CoordTypeEnum.bd09mc) {
            targetPoint = this.bd09mcToOther(to, x, y);
        }

        return targetPoint;
    },

    wgs84ToOther: function (to, x, y) {
        let targetPoint = { x: x, y: y };
        if (to == CoordTypeEnum.wgs84) {
            return targetPoint;
        } else if (to == CoordTypeEnum.webmercator) {
            targetPoint = this.lonLat2WebMercator(x, y);

        } else if (to == CoordTypeEnum.gcj02) {
            targetPoint = this.wgs84_To_Gcj02(x, y);

        } else if (to == CoordTypeEnum.gcj02mc) {
            targetPoint = this.wgs84_To_Gcj02(x, y);
            targetPoint = this.lonLat2WebMercator(targetPoint.x, targetPoint.y);

        } else if (to == CoordTypeEnum.bd09ll) {
            targetPoint = this.wgs84_To_Gcj02(x, y);
            targetPoint = this.gcj02_To_Bd09(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.bd09mc) {
            targetPoint = this.wgs84_To_Gcj02(x, y);
            targetPoint = this.gcj02_To_Bd09(targetPoint.x, targetPoint.y);
            targetPoint = BdGeoConverterUtil.bd09_To_bd09_Mer(targetPoint.x, targetPoint.y);
        }

        return targetPoint;
    },
    webMercatorToOther: function (to, x, y) {
        let targetPoint = this.webMercator2lonLat(x, y);
        return this.wgs84ToOther(to, targetPoint.x, targetPoint.y);
    },

    gcj02ToOther: function (to, x, y) {
        let targetPoint = { x: x, y: y };
        if (to == CoordTypeEnum.gcj02) {
            return targetPoint;
        } else if (to == CoordTypeEnum.wgs84) {
            targetPoint = this.gcj02_To_Gps84(x, y);
        } else if (to == CoordTypeEnum.webmercator) {
            targetPoint = this.gcj02_To_Gps84(x, y);
            targetPoint = this.lonLat2WebMercator(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.gcj02mc) {
            targetPoint = this.lonLat2WebMercator(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.bd09ll) {
            targetPoint = this.gcj02_To_Bd09(x, y);
        } else if (to == CoordTypeEnum.bd09mc) {
            targetPoint = this.gcj02_To_Bd09(x, y);
            targetPoint = BdGeoConverterUtil.bd09_To_bd09_Mer(targetPoint.x, targetPoint.y);
        }

        return targetPoint;
    },
    gcj02mcToOther: function (to, x, y) {
        let targetPoint = this.webMercator2lonLat(x, y);
        return this.gcj02ToOther(to, targetPoint.x, targetPoint.y);
    },

    bd09llToOther: function (to, x, y) {
        let targetPoint = { x: x, y: y };
        if (to == CoordTypeEnum.bd09ll) {
            return targetPoint;
        } else if (to == CoordTypeEnum.wgs84) {
            targetPoint = this.bd09_To_Gcj02(x, y);
            targetPoint = this.gcj02_To_Gps84(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.webmercator) {
            targetPoint = this.bd09_To_Gcj02(x, y);
            targetPoint = this.gcj02_To_Gps84(targetPoint.x, targetPoint.y);
            targetPoint = this.lonLat2WebMercator(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.gcj02) {
            targetPoint = this.bd09_To_Gcj02(x, y);
        } else if (to == CoordTypeEnum.gcj02mc) {
            targetPoint = this.bd09_To_Gcj02(x, y);
            targetPoint = this.lonLat2WebMercator(targetPoint.x, targetPoint.y);
        } else if (to == CoordTypeEnum.bd09mc) {
            targetPoint = BdGeoConverterUtil.bd09_To_bd09_Mer(x, y);
        }

        return targetPoint;
    },
    bd09mcToOther: function (to, x, y) {
        let targetPoint = BdGeoConverterUtil.bd09_Mer_To_bd09(x, y);

        return this.bd09llToOther(to, targetPoint.x, targetPoint.y);
    }

};

export default GeoCoordConverterUtil;