import CoordTypeEnum from "../../enum/CoordTypeEnum.js";
import ImageryProviderTileStyleEnum from "../enum/ImageryProviderTileStyleEnum.js";
import ImageryProviderCollection from "../ImageryProviderCollection.js";

/**
 * @exports BaseImageryProvider
 * @class
 * @abstract
 * @classdesc 地图切片数据基类。名字空间map3d.layers.provider.BaseImageryProvider。
 * @param {Object} [options] 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} [options.id] 唯一id属性
 * @property {String} [options.token = undefined] 加载数据的令牌
 * @property {String} [options.tileStyle = ImageryProviderTileStyleEnum.IMG] 切片图层的风格类型
 * 
 * @see {@link Cesium.ImageryProvider}
 */
class BaseImageryProvider {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this.extendProperty(options);
    }

    initDefaultParams(options) {

        /**
         * The default alpha blending value of this provider, with 0.0 representing fully transparent and
         * 1.0 representing fully opaque.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultAlpha = options.defaultAlpha;

        /**
         * The default alpha blending value on the night side of the globe of this provider, with 0.0 representing fully transparent and
         * 1.0 representing fully opaque.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultNightAlpha = undefined;

        /**
         * The default alpha blending value on the day side of the globe of this provider, with 0.0 representing fully transparent and
         * 1.0 representing fully opaque.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultDayAlpha = undefined;

        /**
         * The default brightness of this provider.  1.0 uses the unmodified imagery color.  Less than 1.0
         * makes the imagery darker while greater than 1.0 makes it brighter.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultBrightness = undefined;

        /**
         * The default contrast of this provider.  1.0 uses the unmodified imagery color.  Less than 1.0 reduces
         * the contrast while greater than 1.0 increases it.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultContrast = undefined;

        /**
         * The default hue of this provider in radians. 0.0 uses the unmodified imagery color.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultHue = undefined;

        /**
         * The default saturation of this provider. 1.0 uses the unmodified imagery color. Less than 1.0 reduces the
         * saturation while greater than 1.0 increases it.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultSaturation = undefined;

        /**
         * The default gamma correction to apply to this provider.  1.0 uses the unmodified imagery color.
         *
         * @type {Number|undefined}
         * @default undefined
         */
        this.defaultGamma = undefined;

        /**
         * The default texture minification filter to apply to this provider.
         *
         * @type {TextureMinificationFilter}
         * @default undefined
         */
        this.defaultMinificationFilter = undefined;

        /**
         * The default texture magnification filter to apply to this provider.
         *
         * @type {TextureMagnificationFilter}
         * @default undefined
         */
        this.defaultMagnificationFilter = undefined;
    }

    extendProperty(options) {
        this.initDefaultParams(options);

        this.type = BaseImageryProvider.TYPE;
        /**
         * @property {String} id 图层对象唯一id标识
         */
        this.id = options.id || Cesium.createGuid();

        /**
         * @property {String} token 图片加载token
         */
        if (!('token' in this)) {
            this.token = options.token;
        }

        /**
         *  @property {String} tileStyle 切片样式风格
         */
        this.tileStyle = options.tileStyle || ImageryProviderTileStyleEnum.IMG;

         /**
         *  @property {String} crs 坐标系代号
         */
        this.crs = options.crs || CoordTypeEnum.wgs84;
    }


    /**
     * 添加到场景视图中
     * @method
     * @param {Cesium.Viewer} viewer 场景视图对象
     * @returns {BaseImageryProvider}
     */
    addToViewer(viewer, index) {
        this.layerIndex = Cesium.defined(index) ? Math.min(Math.max(index, 0), viewer.imageryLayers.length) : viewer.imageryLayers.length;

        let layer = viewer.imageryLayers.addImageryProvider(this, index);
        layer.id = this.id;
        //layer.brightness = 1.1;

        // 有点闪屏问题
        // layer.minificationFilter=Cesium.TextureMinificationFilter.NEAREST;
        // layer.magnificationFilter=Cesium.TextureMinificationFilter.NEAREST;

        if (index == 0) {
            layer._isBaseLayer = true;
        }

        return this;
    }

    /**
     * 从视图中移除
     * @method
     * @param {Cesium.Viewer} viewer 场景视图对象
     * @param destroy 是否销毁图层对象
     * @returns {Boolean} 成功标识
     */
    removeFromViewer(viewer, destroy) {
        let layer = this.getImageryLayer(viewer);

        this.layerIndex = -1;

        return layer ? viewer.imageryLayers.remove(layer, destroy) : false;
    }

    /**
     * 飞向图层到可视范围
     * @param {Cesium.Viewer} viewer 场景视图对象
     * @param {Object} [options=undefined] 飞行选项
     * @returns {undefined|Promise<Boolean>}
     */
    flyTo(viewer, options) {
        let layer = this.getImageryLayer(viewer);


        return layer ? viewer.flyTo(layer, options) : Cesium.when.defer().resolve(true);
    }

    /**
     * 获取当前已经添加到viewer中的layer对象
     * @param {Cesium.Viewer} viewer 场景视图对象
     * @returns {Cesium.ImageryLayer}
     */
    getImageryLayer(viewer) {
        return ImageryProviderCollection.getImageryProviderFromViewer(viewer, {
            id: this.id
        });
    }

    /**
     * 图层显示隐藏切换
     * @param {Boolean} visible 是否显示
     * @param {Cesium.Viewer} viewer 场景视图对象
     */
    toggle(visible, viewer) {
        let layer = ImageryProviderCollection.getImageryProviderFromViewer(viewer, {
            id: this.id
        });

        if (layer) {
            layer.show = visible;
        }
    }
}
BaseImageryProvider.TYPE = 'ImageryProvider';

BaseImageryProvider.extend = (targetPrototype) => {
    targetPrototype.initDefaultParams = BaseImageryProvider.prototype.initDefaultParams;
    targetPrototype.extendProperty = BaseImageryProvider.prototype.extendProperty;
    targetPrototype.addToViewer = BaseImageryProvider.prototype.addToViewer;
    targetPrototype.removeFromViewer = BaseImageryProvider.prototype.removeFromViewer;
    targetPrototype.flyTo = BaseImageryProvider.prototype.flyTo;
    targetPrototype.toggle = BaseImageryProvider.prototype.toggle;
    targetPrototype.getImageryLayer = BaseImageryProvider.prototype.getImageryLayer;
}



export default BaseImageryProvider;