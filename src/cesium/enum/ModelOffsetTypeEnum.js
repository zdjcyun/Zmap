/*
 * @Author: gisboss
 * @Date: 2020-08-31 16:43:41
 * @LastEditors: gisboss
 * @LastEditTime: 2021-01-15 11:41:51
 * @Description: file content
 */
/**
 * @exports ModelOffsetTypeEnum
 * @class
 * @classdesc 模型偏移变化模式枚举类。名字空间map3d.enum.ModelOffsetTypeEnum。此类为Object实例，不需要new
 */
const ModelOffsetTypeEnum = {
    /**
     * 偏移量的取值使用相对偏移量模式
     * @type {Number}
     * @constant
     */
    OFFSET: 0,

    /**
     * 偏移量的取值使用目标点模式
     * @type {Number}
     * @constant
     */
    TARGET: 1
};

export default ModelOffsetTypeEnum;