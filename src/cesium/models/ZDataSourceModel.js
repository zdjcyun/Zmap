import DataSourceTypeEnum from "../datasources/DataSourceTypeEnum.js";

/**
 * @exports ZDataSourceModel
 * @class
 * @classdesc 图层数据模型类。名字空间map3d.models.ZDataSourceModel。 
 */
class ZDataSourceModel {
    constructor(source) {
        this.id = source.id;
        this.type = source.type;
        this.label = source.label;
        this.description = source.description;
        this.visible = source.visible === undefined ? true : source.visible;
        this.flyto = source.flyto;
        this.url = source.url;
        this.options = source.options;
    }

    /**
     * 深度复制
     */
    clone() {
        return new ZDataSourceModel(this.toJSON());
    }

    /**
     * 转换为普通Json对象。options对象为深度复制
     * @returns {Object} 返回深度复制后的Object对象。
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            description: this.description,
            url: this.url,
            flyto: this.flyto,
            visible: this.visible,
            options: this.options //? JSON.parse(JSON.stringify(this.options)) : undefined,
        };
    }


    /**
     * 给options属性添加新属性配置
     * @param {Object} configObj 要追加的新配置属性
     * @returns {ZDataSourceModel} 返回this对象
     */
    appendOptionsContent(configObj) {
        if (!this.options) {
            this.options = {};
        }
        Object.assign(this.options, configObj);

        return this;
    }

};

/**
 * 创建一个3DTileSet数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String} url 三维模型地址
 * @param {Object} [options] 模型偏移旋转变化参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.get3DTileSetModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_3DTILESET,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(options);
};


/**
 * 创建一个DynamicGeoJson数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getDynamicGeoJsonModel = (id, url, options, visible, flyto, label, description) => {

    let type = (options && options.primitive) ? DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE : DataSourceTypeEnum.DS_DYNAMIC;

    return new ZDataSourceModel({
        type: type,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        //type:'static',
        //crs: 3,
        //refreshInterval: 0.3 * 60, // 秒
        clampToGround: true,
        customSymbol: 1,
        markerSymbol: 'iot_device',
        label: {
            show: true,
            outlineColor: Cesium.Color.TEAL,
        },
        // refreshCallback: (geoJSON)=> {},
    }, options));
};


/**
 * 创建一个GeoJson数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getGeoJsonModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_GEOJSON,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        markerSymbol: 'iot_device',
        markerColor: Cesium.Color.GREEN,
        markerSize: 48,
    }, options));
};


/**
 * 创建一个行政区划数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getDistrictModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_DISTRICT,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        // crs: 3,
        // urlParams: {
        //     typeName: 'hs_science_city:china_district',
        //     cql_filter: "dcode='430100'",
        // },
    }, options));
};


/**
 * 创建一个ImagerURLTemplate数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String} url 数据源地址
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getImagerURLTemplateModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_IMAGERY_URLTEMPLATE,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};


/**
 * 创建一个Custom数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getCustomModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_CUSTOM,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};


/**
 * 创建一个Kml数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getKmlModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_KML,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};


/**
 * 创建一个Czml数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
 ZDataSourceModel.getCzmlModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_CZML,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};

/**
 * 创建一个WMS数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String} url 数据源地址
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getWMSModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_WMS,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        //layers: 'hs_science_city:building',
        parameters: {
            format: 'image/png',
            transparent: true,
        },
        //rectangle: new Cesium.Rectangle.fromDegrees(112.579551696777, 26.815658569335, 112.583061218262, 26.82043457)
    }, options));
};


/**
 * 创建一个water数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getWaterModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_WATER,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        // perPositionHeight: false,
        // extrudedHeight: 1.5
    }, options));
};


/**
 * 创建一个切片单体化数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getTileClassificationModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_TILE_CLASSIFICATION,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};



/**
 * 创建一个Video数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getVideoModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_VIDEO,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({
        // perPositionHeight: false,
        extrudedHeight: 0.001
    }, options));
};


/**
 * 创建一个动态切换图片的数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Object} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getDynamicImageryModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_DYNAMIC_IMAGERY,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};



/**
 * 创建一个热力图图片的数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Array} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getHeatmapImageryModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_IMAGERY_HEATMAP,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};


/**
 * 创建一个Kriging插值图片的数据源模型对象
 * @param {String} id 唯一标识名称
 * @param {String|Array} url 数据源地址或对象
 * @param {Object} [options] 参数选项
 * @param {Boolean} [visible=true] 模型是否可见
 * @param {Boolean} [flyto=false] 模型加载完成后是否飞到此模型
 * @param {String} [label=undefined] 用于ui显示的简单描述
 * @param {String} [description=undefined] 用于ui显示的详细描述
 */
ZDataSourceModel.getKrigingImageryModel = (id, url, options, visible, flyto, label, description) => {
    return new ZDataSourceModel({
        type: DataSourceTypeEnum.DS_IMAGERY_KRIGING,
        id: id,
        url: url,
        visible: visible,
        flyto: flyto,
        label: label,
        description: description,
    }).appendOptionsContent(Object.assign({}, options));
};




export default ZDataSourceModel;