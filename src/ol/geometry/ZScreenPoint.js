/*
 * @Author: gisboss
 * @Date: 2020-08-27 09:15:48
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-28 13:38:42
 * @Description: 屏幕坐标点
 */

/**
 * @exports ZScreenPoint
 * @classdesc 屏幕坐标点
 * @class
 * @param {Number} x 屏幕X像素坐标
 * @param {Number} y 屏幕Y像素坐标
 */
class ZScreenPoint {

    constructor(x, y) {
        this.x = x * 1;
        this.y = y * 1;
        this.__ = [this.x, this.y];
        this.__.x = this.x;
        this.__.y = this.y;
    }

    /**
     * 设置屏幕X像素坐标
     * @param {Number} x  屏幕X像素坐标
     * @returns {ZScreenPoint} this对象
     */
    setX(x) {
        this.__ = [x * 1, this.y];
        this.x = x * 1;
        this.__.x = this.x;
        this.__.y = this.y;
        return this;
    }

    /**
     * 设置屏幕Y像素坐标
     * @param {Number} y 屏幕Y像素坐标
     * @returns  {ZScreenPoint} this对象
     */
    setY(y) {
        this.__ = [this.x, y * 1];
        this.y = y * 1;
        this.__.x = this.x;
        this.__.y = this.y;
        return this;
    }

    /**
     * 更新x坐标和y坐标
     * @param {Number} x 屏幕X像素坐标
     * @param {Number} y 屏幕Y像素坐标
     * @returns  {ZScreenPoint} this对象
     */
    update(x, y) {
        this.__ = [x * 1, y * 1];
        this.x = x * 1;
        this.y = y * 1;
        this.__.x = this.x;
        this.__.y = this.y;
        return this;
    }

    /**
     * 设置x坐标偏移和y坐标偏移
     * @param {Number} dx 屏幕X偏移坐标
     * @param {Number} dy 屏幕Y偏移坐标
     * @returns  {ZScreenPoint} this对象
     */
    offset(dx, dy) {
        this.__ = [this.x + dx * 1, this.y + dy * 1];
        this.x += dx;
        this.y += dy;
        this.__.x = this.x;
        this.__.y = this.y;
        return this;
    }

}



export default ZScreenPoint;