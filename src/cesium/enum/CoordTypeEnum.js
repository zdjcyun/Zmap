/*
 * @Author: gisboss
 * @Date: 2020-08-27 08:24:04
 * @LastEditors: gisboss
 * @LastEditTime: 2021-01-15 11:41:43
 * @Description: 自定义坐标系代号类
 */

/**
 * @exports CoordTypeEnum
 * @class
 * @classdesc 自定义坐标系代号类。名字空间map2d.enum.CoordTypeEnum。此类为Object实例，不需要new
 * @enum {Number}
 */
const CoordTypeEnum = {
    /**
     *  WGS84坐标系，代号4326，crs枚举值为1
     *  @type {Number}
     *  @constant
     */
    wgs84: 1,

    /**
     * WGS84投影坐标系，代号3857，crs枚举值为2
     * @type {Number}
     * @constant
     */
    webmercator: 2,

    /**
     *  GCJ02坐标系，代号4326，crs枚举值为3
     * @type {Number}
     *  @constant
     */
    gcj02: 3,

    /**
     * GCJ02投影坐标系，代号3857，crs枚举值为4
     * @type {Number}
     * @constant
     */
    gcj02mc: 4,

    /**
     * bd09ll坐标系，代号4326，crs枚举值为5
     * @type {Number}
     * @constant
     */
    bd09ll: 5,

    /**
     * bd09ll投影坐标系，代号3857，crs枚举值为6
     * @type {Number}
     * @constant
     */
    bd09mc: 6,
    /**
     * 中国2000坐标系，代号4490，crs枚举值为7
     * @type {Number}
     * @constant
     */
    cgcs2000: 7,


    /**
     * 获取名称
     * @param {Number}} crs CoordTypeEnum坐标系代号
     */
    getNameByCrs(crs) {
        if (crs === this.wgs84) {
            return 'WGS84经纬度';
        } else if (crs === this.webmercator) {
            return 'WGS84墨卡托投影';
        } else if (crs === this.gcj02) {
            return 'GCJ02经纬度';
        } else if (crs === this.gcj02mc) {
            return 'GCJ02墨卡托投影';
        } else if (crs === this.bd09ll) {
            return '百度经纬度';
        } else if (crs === this.bd09mc) {
            return '百度墨卡托投影';
        } else if (crs === this.cgcs2000) {
            return 'CGCS2000';
        }
    }
};

export default Object.freeze(CoordTypeEnum);