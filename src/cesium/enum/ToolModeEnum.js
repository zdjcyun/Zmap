/*
 * @Date: 2022-03-21 14:14:23
 * @LastEditTime: 2022-03-21 15:15:34
 */

/**
 * @exports ToolModeEnum
 * @class
 * @classdesc 工具模式类型枚举。名字空间map3d.enum.ToolModeEnum
 * @enum {String}
 */
const ToolModeEnum = {
    /**
     *  命令模式
     *  @type {String}
     *  @constant
     */
    COMMAND: 'command',

    /**
     * 组件模式
     * @type {String}
     * @constant
     */
    COMPONENT: 'component',
};

export default Object.freeze(ToolModeEnum);