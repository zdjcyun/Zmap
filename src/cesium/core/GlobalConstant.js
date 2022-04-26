/*
 * @Author: gisboss
 * @Date: 2021-03-26 08:40:31
 * @LastEditors: gisboss
 * @LastEditTime: 2021-10-11 14:57:29
 * @Description: 全局常量
 */
/**
 * @class map3d.core.GlobalConstant
 * @classdesc 全局常量
 */
export default Object.freeze({

    /**
     * 位置定位时查看位置相机高
     */
    LOCATION_VIEW_HEIGHT: 1000,
    /**
     * 普通的（相对于绘图状态）双击时间间隔
     */
    LEFT_DOUBLE_CLICK_INTERVAL: 300,
    /**
     * 绘图工具双击时间间隔
     */
    MOUSE_DBL_CLICK_INTERVAL: 1,
    /**
     * 初始加载视图位置
     */
    DEFAULT_VIEW: {
        lng: 110.603965,
        lat: 34.544088,
        height: 20000000,
    },
    /**
     * 选中要素的高亮颜色
     */
    HIGHLIGHT_COLOR: Cesium.Color.fromCssColorString('rgba(255,255,0,0.3)'),

    /**
     * 动态数据源符号颜色
     */
    MARKER_COLOR: Cesium.Color.ROYALBLUE,

    /**
     * 动态数据源符号高亮颜色
     */
    MARKER_HIGHLIGHT_COLOR: Cesium.Color.RED,

    /**
     * 动态数据源符号大小
     */
    MARKER_SIZE: 48,

    /**
     * 动态数据源多边形填充色
     */
    FILL: Cesium.Color.fromBytes(255, 255, 0, 100),

    /**
     * 标注填充色
     */
    LABEL_FILL: Cesium.Color.WHITE,
    /**
     * 动态数据源标注外线颜色
     */
    LABEL_OUTLINE_COLOR: Cesium.Color.TEAL,

    /**
     * 动态数据源标注外线宽度
     */
    LABEL_OUTLINE_WIDTH: 1,

    /**
     * 动态数据源标注字体
     */
    LABEL_FONT: ' 20px 微软雅黑',


    /**
     * 动态数据源标注y坐标偏移像素大小
     */
    LABEL_OFFSET_DETAL_Y: 10,

});