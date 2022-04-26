/**
 * @exports TerrainProviderTypeEnum
 * @class
 * @classdesc 自定义地形类型枚举类。名字空间map3d.layers.enum.TerrainLayerTypeEnum。此类为Object实例，不需要new
 */
const TerrainProviderTypeEnum = {
    /**
     * 无地形
     * @type{String}
     * @constant
     */
    ELLIPSOID: "ellipsoid",

    /**
     * cesium内置类型
     * @type{String}
     * @constant
     */
    CESIUM: "cesium"
};

export default Object.freeze(TerrainProviderTypeEnum);
