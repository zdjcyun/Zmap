/*
 * @Author: gisboss
 * @Date: 2020-08-27 08:24:04
 * @LastEditors: gisboss
 * @LastEditTime: 2022-01-07 16:39:45
 */

/**
 * @exports DrawModeEnum
 * @class
 * @classdesc 绘图类型枚举。名字空间map3d.enum.DrawModeEnum
 * @enum {Number}
 */
const DrawModeEnum = {
    /**
     *  空
     *  @type {Number}
     *  @constant
     */
    NULL: 0,
    /**
     *  点
     *  @type {Number}
     *  @constant
     */
    POINT: 1,

    /**
     * 线
     * @type {Number}
     * @constant
     */
    POLYLINE: 2,

    /**
     * 面
     * @type {Number}
     *  @constant
     */
    POLYGON: 3,

    /**
     * 矩形
     * @type {Number}
     * @constant
     */
    RECTANGLE: 4,

    /**
     * 圆
     * @type {Number}
     * @constant
     */
    CIRCLE: 5,

    /**
     * 图标
     * @type {Number}
     * @constant
     */
    MARKER: 6,
};

export default Object.freeze(DrawModeEnum);