import GeoJsonUtil from "../utils/GeoJsonUtil.js";
import ZPinBuilder from "../core/ZPinBuilder.js";
import BaseDataSource from "./BaseDataSource.js";
import ZEvent from "../events/ZEvent.js";
import GlobalConstant from "../core/GlobalConstant.js";

/**
 * 符号风格对应的属性字段名称
 */
const StylePropertyIdentifier = Object.freeze({
    TITLE: "title",
    DESCRIPTION: "description", //
    MARKER_SIZE: "marker-size",
    MARKER_SYMBOL: "marker-symbol",
    MARKER_COLOR: "marker-color",
    STROKE: "stroke", //
    STROKE_OPACITY: "stroke-opacity",
    STROKE_WIDTH: "stroke-width",
    OUTLINE_STROKE: "outline-stroke", //
    OUTLINE_OPACITY: "outline-opacity",
    OUTLINE_WIDTH: "outline-width",
    FILL: "fill",
    FILL_OPACITY: "fill-opacity",
});

/**
 * 构建实体描述信息的回调方法
 * @param {Object} properties 属性键值对象
 * @param {String} nameProperty name属性字段名称
 */
const DEFAULT_DESCRIBE = function (properties, nameProperty) {
    let html = '';
    let simpleStyleIdentifierValues = _.values(StylePropertyIdentifier);
    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            if (key === nameProperty || simpleStyleIdentifierValues.indexOf(key) !== -1) {
                continue;
            }
            let value = properties[key];
            if (Cesium.defined(value)) {
                if (_.isPlainObject(value)) {
                    html += '<tr><th>' + key + '</th><td>' + DEFAULT_DESCRIBE(value) + '</td></tr>';
                } else {
                    html += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
                }
            }
        }
    }

    if (html.length > 0) {
        html = '<table class="cesium-infoBox-defaultTable"><tbody>' + html + '</tbody></table>';
    }

    return new Cesium.ConstantProperty(html);
}

const buildDecription = function (properties, describe, targetEntity) {

    let nameProperty;

    //Check for the simplestyle specified name first.
    let name = properties.title;
    if (Cesium.defined(name)) {
        targetEntity.name = name;
        nameProperty = 'title';
    } else {
        //Else, find the name by selecting an appropriate property.
        //The name will be obtained based on this order:
        //1) The first case-insensitive property with the name 'title',
        //2) The first case-insensitive property with the name 'name',
        //3) The first property containing the word 'title'.
        //4) The first property containing the word 'name',
        let namePropertyPrecedence = Number.MAX_VALUE;
        for (let key in properties) {
            if (properties.hasOwnProperty(key) && properties[key]) {
                let lowerKey = key.toLowerCase();

                if (namePropertyPrecedence > 1 && lowerKey === 'title') {
                    namePropertyPrecedence = 1;
                    nameProperty = key;
                    break;
                } else if (namePropertyPrecedence > 2 && lowerKey === 'name') {
                    namePropertyPrecedence = 2;
                    nameProperty = key;
                } else if (namePropertyPrecedence > 3 && /title/i.test(key)) {
                    namePropertyPrecedence = 3;
                    nameProperty = key;
                } else if (namePropertyPrecedence > 4 && /name/i.test(key)) {
                    namePropertyPrecedence = 4;
                    nameProperty = key;
                }
            }
        }
        if (Cesium.defined(nameProperty)) {
            targetEntity.name = properties[nameProperty];
        }
    }

    let description = properties.description;

    return Cesium.defined(description) ? new Cesium.ConstantProperty(description) :
        Cesium.defined(describe) ? describe(properties, nameProperty) : undefined;

}

/** 
 * SYMBOL_TYPE 符号渲染类型
 * @type {Object}
 * @property {Number} SYMBOL_TYPE.DEFAULT 默认cesium类型
 * @property {Number} SYMBOL_TYPE.CUSTOM_MARKER 有水滴背景的自定义图标类型
 * @property {Number} SYMBOL_TYPE.CUSTOM_IMAGE 无背景图标的纯图片类型
 */
const SYMBOL_TYPE = Object.freeze({
    DEFAULT: 0,
    CUSTOM_MARKER: 1,
    CUSTOM_IMAGE: 2,
    CUSTOM_DEFAULT: 3,
});

// 默认参数选项
const DEFAULT_ENTITY_OPTIONS = Object.freeze({
    clampToGround: false,
    symbolBorder: undefined,
    customSymbol: SYMBOL_TYPE.DEFAULT,
    markerColor: GlobalConstant.MARKER_COLOR,
    markerSymbol: undefined,
    markerSize: GlobalConstant.MARKER_SIZE, //24,64
    materialType: Cesium.Material.ColorType,
    duration: undefined,
    stroke: Cesium.Color.YELLOW,
    strokeWidth: 2,
    flowImage: undefined,
    fill: GlobalConstant.FILL,
    scaleByDistance: undefined, //new Cesium.NearFarScalar(1.0e3, 1.0, 6.0e6, 0),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 6.0e6),
    disableDepthTestDistance: undefined,
    crsFunction: undefined,
    describe: DEFAULT_DESCRIBE,
    markerColorCallBack: undefined,
    markerSymbolCallBack: undefined,
    label: false,
    billboard: false,
    strokeDasharray: undefined,
    dashLength: undefined,
    dashPattern: undefined,
    symbols:[] // 单字段多值 样式集合
});

//绘制符号类
const DEFUALT_SYMBOLE_BUILDER = new ZPinBuilder();


/**
 * @exports DynamicDataSource
 * @class
 * @classdesc 动态GeoJSON数据源。名字空间map3d.datasources.DynamicDataSource
 * 
 * @constructor
 * @param {Object} options 参数配置对象 
 * @param {GeoJSON|String} options.url 几何GeoJSON参数对象或URL请求GeoJSON地址
 * @param {Boolean} [options.refresh=false] 是否定期刷新数据源 
 * @param {Array.<String>} [options.refreshInterval=-1] 数据源刷新间隔(秒)
 * @param {Boolean} [options.primitive=undefined] 是否采用primitive对象方式加载
 * 
 */
class DynamicDataSource extends BaseDataSource {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        options.name = Cesium.defaultValue(options.name, 'dynamic_' + Cesium.createGuid());

        if (!Cesium.defined(options.url)) {
            throw new Cesium.DeveloperError('options.url is required.');
        }

        super(options);


        /**
         * @property {String} url 数据源
         */
        this.url = options.url;

        /**
         * @property {Object} urlParameters url数据源的请求参数
         * @see {Cesium.Resource}
         */
        this.urlParameters = options.urlParameters;

        /**
         * @property {Object} entityStyleOptions 对象渲染风格参数
         */
        this.entityStyleOptions = copyEntityStyleOptions(DEFAULT_ENTITY_OPTIONS, options);

        /**
         * @property {Boolean} [showRotationEffect=false] 当数据源为点类型时，是否显示底部的旋转特效
         */
        this.showRotationEffect = Cesium.defaultValue(options.showRotationEffect, false);

        /**
         * @property {Boolean} [refresh=false] 是否定时刷新
         */
        this.refresh = Cesium.defaultValue(options.refresh, false);

        /**
         * @property {Number} [refreshInterval=-1] 刷新间隔时间参数（秒）
         */
        this.refreshInterval = Cesium.defaultValue(options.refreshInterval, -1);

        /**
         * @property {Function} [refreshCallback] 刷新回调方法，定时任务会自动调用此方法。回调方法参数格式:function(newData,this)。
         */
        this.refreshCallback = options.refreshCallback;

        /**
         * @property {Number} _refreshIntervalId 定时器id
         */
        this._refreshIntervalId = undefined;

        /**
         * 数据重新加载时触发
         * @type {ZEvent}
         */
        this.refreshEvent = ZEvent.getInstance('refresh');


        /**
         * @property {Cesium.BoundingSphere} boundingSphere 边界包围球对象
         */
        this.boundingSphere = null;


        //添加清除资源方法
        this.destroyFuns.push(destroy);

        if (this.refresh) {
            // 设置定时器
            this.setRefreshInterval(this.refreshInterval);
        }

        //是否已经准备好数据
        this._ready = false;
    }


    /**
     * 初始化数据源参数
     * @param {Object} url 数据源请求URL
     * @param {Object} [urlParameters] 数据源请求参数。常用的就是携带token
     * @returns {Promise}
     */
    initDataSource(url, urlParameters) {

        // 数据源加载请求Promise 
        let geoPromise;
        if (_.isString(url)) {
            geoPromise = Cesium.Resource.fetchJson(Object.assign({
                url: url,
            }, urlParameters));
        } else {
            geoPromise = Cesium.when(url);
        }

        return geoPromise;
    }


    /**
     * 设置定时刷新
     * @param {Number} refreshInterval 刷新间隔时间参数（秒）
     * @returns {Number} 返回定时器id
     */
    setRefreshInterval(refreshInterval) {
        this.clearRefreshInterval();

        if (!refreshInterval || refreshInterval < 0) {
            return;
        }

        this._refreshIntervalId = setInterval(() => refreshDataCallback(this), refreshInterval * 1000);

        return this._refreshIntervalId;
    }

    /**
     * 清除定时刷新
     */
    clearRefreshInterval() {
        if (this._refreshIntervalId) {
            clearInterval(this._refreshIntervalId);
            this._refreshIntervalId = null;
        }
    };


    /**
     * 加载数据
     */
    loadData(options) {
        Cesium.DataSource.setLoading(this, true);

        if (options) {
            if (options.url && options.url !== this.url) {
                this.url = options.url;
            }
            if (options.urlParameters !== this.urlParameters) {
                this.urlParameters = options.urlParameters;
            }
        }

        return this.initDataSource(this.url, this.urlParameters)
            .then((geoJson) => loadDataComplete(this, geoJson))
            .otherwise((error) => {
                Cesium.DataSource.setLoading(this, false);
                this.errorEvent.raiseEvent(this, error);
                console.log(error);
                return Cesium.when.reject(error);
            });
    }
}

/**
 * 销毁数据源对象
 */
function destroy() {
    this.clearRefreshInterval();
    this.url = null;
    this.entityStyleOptions = null;
    this.refreshCallback = null;
    this.refreshEvent.removeAll();
    this.refreshEvent = null;
    this.boundingSphere = null;

}


//复制实体绘制风格属性参数
function copyEntityStyleOptions(srcOption, descOption) {
    let result = {};
    for (let k in srcOption) {
        result[k] = (k in descOption) ? descOption[k] : srcOption[k];
    }

    return result;
}

/**
 * 数据加载完成后回调
 * @param {DynamicDataSource} _this this对象
 * @param {GeoJson} featureCollection GeoJson要素集请求Json数据 
 * @returns {DynamicDataSource} this对象
 */
function loadDataComplete(_this, featureCollection) {

    if (!featureCollection || !featureCollection.features.length) {
        return _this;
    }

    let entities = GeoJsonUtil.geoJSONToEntities(featureCollection, getEntityBuildOptions(_this));

    for (let i = 0, len = entities.length; i < len; i++) {
        _this.entities.add(entities[i]);
    }

    // 添加边界矩形
    let center = GeoJsonUtil.getCenterFromGeoJson(featureCollection);
    _this.boundingSphere = new Cesium.BoundingSphere(
        Cesium.Cartesian3.fromDegreesArrayHeights(center.center)[0], center.distance);

    Cesium.DataSource.setLoading(_this, false);

    //是否已经准备好数据
    _this._ready = true;

    return _this;

}

//构建Entity所需要的参数
function getEntityBuildOptions(_this) {
    return Object.assign({
        crs: _this.crs,
        sceneCrs: _this.sceneCrs,
        pinBuilder: DEFUALT_SYMBOLE_BUILDER,
    }, _this.entityStyleOptions);
}





/**
 * 刷新数据回调方法，定时任务会自动调用此方法
 * @private
 */
function refreshDataCallback(_this) {
    _this.initDataSource(_this.url, _this.urlParameters).then((geoJson) => {
        if (_this.refreshCallback) {
            geoJson = _this.refreshCallback(geoJson);
        }
        // 如果第一次数据还未加载完成，则不做更新处理
        if (!_this._ready) {
            return;
        }
        // 更新源数据 
        let updateResult = updateBillboardEntity(_this, geoJson);
        // 提交事件
        _this.refreshEvent.raiseEvent(updateResult, _this);
    }).otherwise((error) => {
        console.log(error);
        this.errorEvent.raiseEvent(this, error);
        return Cesium.when.reject(error);
    });
}



/**
 * 更新图层中实体的属性
 * @private
 * @param {DynamicBillboardCollection} _this this对象
 * @param {GeoJson} newGeoJson 新的数据源
 * @returns {Object}
 */
function updateBillboardEntity(_this, newGeoJson) {

    let result = {
        isUpdated: false,
        data: newGeoJson,
        updatedEntities: undefined
    };
    let entity;
    if (newGeoJson.type === GeoJsonUtil.GEOJSON_TYPE.FEATURE) {
        for (let i = 0, len = _this.entities.values.length; i < len; i++) {
            entity = _this.entities.values[i];
            if (entity.id === newGeoJson.id) {
                let r = entity.updateAppearance(newGeoJson.properties);
                if (r) {
                    result.isUpdated = true;
                    result.updatedEntities = [entity];
                }
                break;
            }
        }

    } else if (newGeoJson.type === GeoJsonUtil.GEOJSON_TYPE.FEATURE_COLLECTION) {
        let newFeature;
        for (let j = 0, lenNew = newGeoJson.features.length; j < lenNew; j++) {
            newFeature = newGeoJson.features[j];
            for (let i = 0, len = _this.entities.values.length; i < len; i++) {
                entity = _this.entities.values[i];
                if (entity.id === newFeature.id) {
                    let r = entity.updateAppearance(newFeature.properties);
                    if (r) {
                        if (!result.isUpdated) {
                            result.isUpdated = true;
                            result.updatedEntities = [];
                        }

                        result.updatedEntities.push(entity);
                    }
                    break;
                }
            }
        }
    }

    return result;
}



/**
 * 根据属性值动态生成符号
 * @private
 */
let SymbolCallbackProperty = (function () {
    function _(properties, options) {
        this.options = options;
        this.properties = properties;
        // 调用基类
        Cesium.CallbackProperty.call(this, (time) => {
            return this._init();
        }, true);
    }


    _.__proto__ = Cesium.CallbackProperty;
    _.prototype = Object.create(Cesium.CallbackProperty.prototype);
    _.prototype.constructor = _;


    _.prototype._init = function () {
        let symbol = this.options.markerSymbol;
        let color = this.options.markerColor;
        let size = this.options.markerSize;
        let border = this.options.symbolBorder;
        let customSymbol = this.options.customSymbol;

        let pinBuilder = this.options.pinBuilder;

        if (Cesium.defined(this.properties)) {

            let cssColor;
            if (this.options.markerColorCallBack) {
                cssColor = this.options.markerColorCallBack(this.properties);
            } else { // 取属性对象中的参数值
                cssColor = this.properties[StylePropertyIdentifier.MARKER_COLOR];
            }

            if (Cesium.defined(cssColor)) {
                color = Cesium.Color.fromCssColorString(cssColor);
            }

            size = Cesium.defaultValue(this.properties[StylePropertyIdentifier.MARKER_SIZE], size);
            let markerSymbol;
            if (this.options.markerSymbolCallBack) {
                const markerSymbolConfig = this.options.markerSymbolCallBack(this.properties);
                if (_.isString(markerSymbolConfig)) {
                    markerSymbol = markerSymbolConfig;
                } else {
                    color = markerSymbolConfig.markerColor;
                    size = markerSymbolConfig.markerSize;
                    border = markerSymbolConfig.symbolBorder;
                    customSymbol = markerSymbolConfig.customSymbol;
                    markerSymbol = markerSymbolConfig.markerSymbol;
                }

            } else { // 取属性对象中的参数值
                markerSymbol = this.properties[StylePropertyIdentifier.MARKER_SYMBOL];
            }

            if (Cesium.defined(markerSymbol)) {
                symbol = markerSymbol;
            }
        }

        let canvasOrPromise;
        if (pinBuilder) {
            if (Cesium.defined(symbol)) {
                if (symbol.length === 1) {
                    canvasOrPromise = pinBuilder.fromText(symbol.toUpperCase(), color, size);
                } else if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_MARKER) {
                    canvasOrPromise = pinBuilder.fromMakiIconId2(symbol, color, size, border);
                } else if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_IMAGE) {
                    canvasOrPromise = pinBuilder.fromMakiIconIdByImage(symbol, color, size, border);
                } else {
                    canvasOrPromise = pinBuilder.fromMakiIconId(symbol, color, size);
                }
            } else {
                if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_DEFAULT) {
                    canvasOrPromise = pinBuilder.fromCustomSymbolDefault(color, size, border);
                } else {
                    canvasOrPromise = pinBuilder.fromColor(color, size);
                }
            }
        }

        //return Cesium.when(canvasOrPromise);
        return canvasOrPromise;
    };

    return _;
})();

/**
 * 根据属性值只生成一次符号，后面不会变化
 * @memberof DynamicDataSource
 * @param {Object} properties GeoJson的属性对象
 * @param {Object} options 参数选项
 */
function getSymbolConstantProperty(properties, options) {

    let symbol = options.markerSymbol;
    let color = options.markerColor;
    let size = options.markerSize;
    let border = options.symbolBorder;
    let customSymbol = options.customSymbol;

    let pinBuilder = options.pinBuilder;

    if (Cesium.defined(properties)) {

        let cssColor;
        if (options.markerColorCallBack) {
            cssColor = options.markerColorCallBack(properties);
        } else { // 取属性对象中的参数值
            cssColor = properties[StylePropertyIdentifier.MARKER_COLOR];
        }

        if (Cesium.defined(cssColor)) {
            color = Cesium.Color.fromCssColorString(cssColor);
        }

        size = Cesium.defaultValue(properties[StylePropertyIdentifier.MARKER_SIZE], size);
        let markerSymbol;
        if (options.markerSymbolCallBack) {
            markerSymbol = options.markerSymbolCallBack(properties);
            const markerSymbolConfig = options.markerSymbolCallBack(properties);
            if (_.isString(markerSymbolConfig)) {
                markerSymbol = markerSymbolConfig;
            } else {
                color = markerSymbolConfig.markerColor;
                size = markerSymbolConfig.markerSize;
                border = markerSymbolConfig.symbolBorder;
                customSymbol = markerSymbolConfig.customSymbol;
                markerSymbol = markerSymbolConfig.markerSymbol;
            }
        } else { // 取属性对象中的参数值
            markerSymbol = properties[StylePropertyIdentifier.MARKER_SYMBOL];
        }

        if (Cesium.defined(markerSymbol)) {
            symbol = markerSymbol;
        }
    }

    let canvasOrPromise;
    if (pinBuilder) {
        if (Cesium.defined(symbol)) {
            if (symbol.length === 1) {
                canvasOrPromise = pinBuilder.fromText(symbol.toUpperCase(), color, size);
            } else if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_MARKER) {
                canvasOrPromise = pinBuilder.fromMakiIconId2(symbol, color, size, border);
            } else if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_IMAGE) {
                canvasOrPromise = pinBuilder.fromMakiIconIdByImage(symbol, color, size, border);
            } else {
                canvasOrPromise = pinBuilder.fromMakiIconId(symbol, color, size);
            }
        } else {
            if (customSymbol === DynamicDataSource.SYMBOL_TYPE.CUSTOM_DEFAULT) {
                canvasOrPromise = pinBuilder.fromCustomSymbolDefault(color, size, border);
            } else {
                canvasOrPromise = pinBuilder.fromColor(color, size);
            }
        }
    }

    //return Cesium.when(canvasOrPromise);
    return canvasOrPromise;
}

//缓存几何颜色材质
let cacheStyle = {};


/**
 * 根据属性值动态生成几何颜色材质 
 * @memberof DynamicDataSource
 * @param {Object} properties 属性对象
 * @param {Object} defaultProperty 默认属性值
 * @param {String} propertyName 要取的属性中的键名
 */
function getGeometryProperty(properties, defaultProperty, propertyName) {
    let propertyValue;
    if (Cesium.defined(properties)) {
        propertyValue = properties[propertyName];
    }

    let key = propertyName + propertyValue;
    let r = cacheStyle[key];
    if (r) {
        return r;
    }

    if (propertyName === StylePropertyIdentifier.STROKE) {
        if (!propertyValue) {
            r = new Cesium.ColorMaterialProperty(defaultProperty);
            cacheStyle[key] = r;
            return r;
        }

        let color = Cesium.Color.fromCssColorString(propertyValue);
        let opacity = properties[StylePropertyIdentifier.STROKE_OPACITY];
        if (Cesium.defined(opacity) && opacity !== 1.0) {
            color.alpha = opacity;
        }

        r = new Cesium.ColorMaterialProperty(color);
        cacheStyle[key] = r;

        return r;
    } else if (propertyName === StylePropertyIdentifier.OUTLINE_STROKE) {
        if (!propertyValue) {
            r = new Cesium.ColorMaterialProperty(defaultProperty);
            cacheStyle[key] = r;
            return r;
        }

        let color = Cesium.Color.fromCssColorString(propertyValue);
        let opacity = properties[StylePropertyIdentifier.OUTLINE_OPACITY];
        if (Cesium.defined(opacity) && opacity !== 1.0) {
            color.alpha = opacity;
        }

        r = new Cesium.ColorMaterialProperty(color);
        cacheStyle[key] = r;

        return r;
    } else if (propertyName === StylePropertyIdentifier.FILL) {
        if (!propertyValue) {
            r = new Cesium.ColorMaterialProperty(defaultProperty);
            cacheStyle[key] = r;
            return r;
        }

        let fillColor = Cesium.Color.fromCssColorString(propertyValue);
        let opacity = properties[StylePropertyIdentifier.FILL_OPACITY];
        if (Cesium.defined(opacity) && opacity !== 1.0) {
            fillColor.alpha = opacity;
        }

        r = new Cesium.ColorMaterialProperty(fillColor);
        cacheStyle[key] = r;

        return r;
    }

    return null;
}


DynamicDataSource.SYMBOL_TYPE = SYMBOL_TYPE;
DynamicDataSource.DEFAULT_DESCRIBE = DEFAULT_DESCRIBE;
DynamicDataSource.buildDecription = buildDecription;
DynamicDataSource.DEFAULT_ENTITY_OPTIONS = DEFAULT_ENTITY_OPTIONS;
DynamicDataSource.DEFUALT_SYMBOLE_BUILDER = DEFUALT_SYMBOLE_BUILDER;
DynamicDataSource.getSymbolCallbackProperty = SymbolCallbackProperty;
DynamicDataSource.StylePropertyIdentifier = StylePropertyIdentifier;
DynamicDataSource.getGeometryProperty = getGeometryProperty;
DynamicDataSource.getSymbolConstantProperty = getSymbolConstantProperty;


/**
 * 加载数据源
 * @param {Object|String} data 数据源请求地址或直接对象
 * @param {Object} options 数据源参数选项
 * @returns {Promise.<BaseDataSource>}
 */
DynamicDataSource.load = (data, options) => {
    options.url = data;
    return new DynamicDataSource(options).loadData();
}

export default DynamicDataSource;