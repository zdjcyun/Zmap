/**
 * @module IMap3D
 * @exports IMap3D
 * @class
 * @classdesc 三维场景对外接口模块类。建议所有对外暴露的接口在这里声明。
 * @param {ZSceneContext} context 场景上下文对象
 */
import NavigationToolUtil from "./utils/NavigationToolUtil.js";
import UIUtil from "./utils/UIUtil.js";
import CommonUtil from "./utils/CommonUtil.js";
import DataSourceTypeEnum from "./datasources/DataSourceTypeEnum.js";
import CoordTypeEnum from "./enum/CoordTypeEnum.js";
import GeoCoordConverterUtil from "./utils/GeoCoordConverterUtil.js";
import DistrictUtil from "./utils/DistrictUtil.js";
import ZDataSourceModel from "./models/ZDataSourceModel.js";


let IMap3D = function (context) {

    /**
     * @property {ZSceneContext} context 场景上下文
     */
    this.context = context;
};


/**
 * 地图缩放（放大in，缩小out）
 * @param {String} code 缩放参数。可选值：[in,out]
 * @example sceneZoom('in')
 */
IMap3D.prototype.sceneZoom = function (code) {
    let zviewer = this.context.getViewer();
    if (code === 'out') {
        NavigationToolUtil.zoomOut(zviewer);
    } else {
        NavigationToolUtil.zoomIn(zviewer);
    }
};

/**
 * 二维三维场景模式切换
 */
IMap3D.prototype.switchSceneMode = function () {
    NavigationToolUtil.switchSceneMode(this.context.getViewer());
};

/**
 * 恢复初始视图位置
 * @method
 */
IMap3D.prototype.resetHome = function () {
    NavigationToolUtil.resetHome(this.context.getViewer());
};

/**
 * 使场景全屏显示
 */
IMap3D.prototype.fullscreen = function () {
    NavigationToolUtil.fullscreen(this.context.getViewer());
};

/**
 * 指北针组件回到正北方向
 */
IMap3D.prototype.reduceCompass = function () {
    NavigationToolUtil.reduceCompass(this.context.getViewer());
};

/**
 * 定位用户位置
 */
IMap3D.prototype.locationUser = function () {
    NavigationToolUtil.locationUser(this.context.getViewer());
};

/**
 * 场景位置定位
 * @param {Object} params 定位参数。包含features属性（必须），可选参数orientation,duration。
 * @property {Object} params params参数属性
 * @property {Array.<GeoJSONFeature>|GeoJSONFeature} params.features GeoJSON要素或要素集合数组
 * @property {Object} params.orientation 查看视角参数
 * @property {Number} [params.duration=3] 飞行动画时长
 * @example params参数示例
 * {
 *    features: [
 *        {
 *            type: "Feature",
 *            properties: {
 *                name: "设备名称2"
 *            },
 *            geometry: {
 *                type: "Point",
 *                crs: 1,//1、wgs84, 3、高德地图，中国谷歌地图经纬度坐标系
 *                coordinates: [112.87849778954987, 28.118542259200254, 150]
 *            }
 *        }
 *    ],
 *    orientation: {
 *        pitch: Math.PI / 180 * -20
 *    },
 *    duration: 3
 * }
 * @param {Function} complete 定位完成回调方法
 */
IMap3D.prototype.sceneLocation = function (params, complete) {

    this.context.getViewer().flyToFeatures(params, complete);
}


/**
 * 行政区域飞行定位
 * @param {Object} params 定位参数对象。
 * @property {Object} params params参数属性
 * @property {String} params.id 行政区数据源id
 * @property {Boolean} [params.refresh=false] 是否需要重新获取行政区数据源
 * @property {String} params.dcode 行政区国家编号。如湖南省430000
 * @property {Number} [params.duration=3] 飞行时间(秒)，默认为3秒
 * @example params参数示例
 * {
 *     refresh: false,
 *     duration: 3
 * }
 * @returns {Promise}
 */
IMap3D.prototype.flyRegion = function (params) {
    let viewer = this.context.getViewer();
    if (!params.id) {
        return UIUtil.error('数据源id属性无效');
    }

    // 获取是否存在此行政区划的数据源 
    let districtDs = viewer.getDataSourceManager().getDataSource(DataSourceTypeEnum.DS_DISTRICT, params.id);
    if (districtDs) {

        if (params.refresh || CommonUtil.hasChanged(districtDs.urlParams, params.urlParams)) {
            return districtDs.refresh(params).then((ds) => {
                return districtDs.flyTo(viewer.getCesiumViewer(), {
                    duration: params.duration || 3
                });
            });
        } else {
            return districtDs.flyTo(viewer.getCesiumViewer(), {
                duration: params.duration || 3
            });
        }

    } else {
        // let regionConfig = DistrictUtil.getItemByCode(params.dcode);
        // if (regionConfig) {

        // }
    }
}

/**
 * 切换底图图层
 * @param {Object} data 配置对象。id为必须属性
 */
IMap3D.prototype.changeBaseLayer = function (data) {
    let viewer = this.context.getViewer();
    if (!data.id) {
        return UIUtil.error('id配置属性无效');
    }

    return viewer.toggleImageryProvider(data);
}


/**
 * 添加一个数据源
 * @param {Object} data 数据源配置对象。数据格式参考{@link map3d.models.ZDataSourceModel}。
 * @see map3d.widgets.ZDataSourceModel
 */
IMap3D.prototype.addDataSource = function (data) {
    return this.context.getViewer().addDataSources(data);
}

/**
 * 删除一个数据源
 * @param {Object} data 数据源配置对象。type,id为必须属性.{type:'geojson',id:'xxxx'}
 */
IMap3D.prototype.removeDataSource = function (data) {
    return this.context.getViewer().removeDataSources(data);
}

/**
 * 添加地形数据源
 * @param {Object} terrainLyrData 数据源配置对象。id为必须属性
 */
IMap3D.prototype.addTerrain = function (terrainLyrData) {
    let viewer = this.context.getViewer();
    if (!terrainLyrData.id) {
        return UIUtil.error('id配置属性无效');
    }

    return viewer.toggleTerrainProvider(terrainLyrData);
}

/**
 * 删除地形数据源
 */
IMap3D.prototype.removeTerrain = function () {
    return this.context.getViewer().removeTerrain();
}

/**
 * 添加拾取实体监听事件
 * @param {Function} listener 事件处理方法
 * @returns {Function} 可移除事件的方法，直接调用如fun();
 */
IMap3D.prototype.addPickEntityListener = function (listener) {
    return this.context.getViewer().pickEntityEvent.addEventListener(listener);
}

/**
 * 添加场景空间左键单击监听事件
 * @param {Function} listener 事件处理方法
 * @returns {Function} 可移除事件的方法，直接调用如fun();
 */
IMap3D.prototype.addLeftClickListener = function (listener) {
    return this.context.getViewer().leftClickEvent.addEventListener(listener);
}

/**
 * 添加场景空间左键双击监听事件
 * @param {Function} listener 事件处理方法
 * @returns {Function} 可移除事件的方法，直接调用如fun();
 */
IMap3D.prototype.addLeftDblClickListener = function (listener) {
    return this.context.getViewer().leftDblClickEvent.addEventListener(listener);
}


/**
 * 添加场景空间鼠标移动监听事件
 * @param {Function} listener 事件处理方法
 * @returns {Function} 可移除事件的方法，直接调用如fun();
 */
IMap3D.prototype.addMouseMoveListener = function (listener) {
    return this.context.getViewer().mouseMoveEvent.addEventListener(listener);
}

/**
 * 过滤数据。目前只实现了Cesium.CustomDataSource.entities 过滤。
 * @param {Object} data 过滤条件。必须属性type,id
 * @property {String} data.type 数据源类型。与添加数据源接口{@link IMap3D.addDataSource}类型保持一致
 * @property {String} data.id 数据源id。与添加数据源接口{@link IMap3D.addDataSource}id保持一致
 * @property {Array.<Object>} [data.filter] 数据过滤条件数组,如果为空则显示当前数据源的全部记录
 * @example data过滤条件示例如下：
 * {
 *     type: 'dgeojson',
 *     id: 'zdjc_ys_device',
 *     filter:[
 *     {
 *         siteId:"PR2020072300000"
 *     },
 *     {
 *         siteId:"PR2020072300001"
 *     }
 *     ]
 * }
 * @param {Boolean} visible 匹配的实体显示还是隐藏
 */
IMap3D.prototype.filterDataSource = function (data, visible) {
    let viewer = this.context.getViewer();
    if (!data || !data.type || !data.id) {
        UIUtil.error("type和id条件不能为空");
        return;
    }

    //根据type与id键查找到场景中的数据源，找到数据源后进行显示隐藏过滤
    let dataSource = viewer.getDataSourceManager().getDataSource(data.type, data.id);
    if (dataSource) {

        let filters = data.filter;
        if (filters && _.isPlainObject(filters)) {
            filters = [Object.assign({}, filters)];
        }

        if (dataSource.filterEntity) {
            dataSource.filterEntity(filters, visible);
        }

        showDataSource(dataSource);
    }
}

function showDataSource(ds) {
    if (ds.toggle !== undefined) {
        ds.toggle(true);
    } else if (ds instanceof Cesium.CustomDataSource || ds.hasOwnProperty('show')) {
        ds.show = true;
    }
}


/**
 * 添加临时缓存实体数据到缓存图层
 * @method
 * @param {Object|Cesium.Entity} entity 实体对象
 * @param {Boolean} isFlyto 是否飞至此对象
 */
IMap3D.prototype.addCachedEntity = function (entity, isFlyto) {
    let viewer = this.context.getViewer();
    return viewer.scene.dataSourceManager.addCachedEntity(entity, isFlyto);
}



/**
 * 移除临时实例对象
 * @method
 * @param {Cesium.Entity|String} entity 实体对象或id
 */
IMap3D.prototype.removeCachedEntity = function (entity) {
    let viewer = this.context.getViewer();
    return viewer.scene.dataSourceManager.removeCachedEntity(entity);
}

/**
 * 移除所有临时实例对象
 * @method
 */
IMap3D.prototype.clearCachedDataSource = function () {
    let viewer = this.context.getViewer();
    return viewer.scene.dataSourceManager.clearCachedDataSource();
}


/**
 * 绕点旋转场景
 * @method
 * @param {Cesium.Cartesian3|Object} position 中心点位置。如果不是Cesium.Cartesian3类型，则必须为如下格式:{lng:110,lat:28}
 * @param {Object} options 参数选项 
 * @property {Object} options.position 坐标转换参数选项，包括from,to属性,默认都为wgs84坐标代号。
 * @property {Number} [options.distance=1000] 相机与目标的距离(单位：米)，默认值为 1000 米,如果为负值，则表示以当前相机位置旋转
 * @property {Number} [options.duration] 旋转时长，单位：秒。如果为负值，表示无限循环，如果不传则默认旋转一周的时长。
 * @property {Number} [options.pitch=-45] 俯仰角（-90~90），默认-90，-90为相机看向正下方，默认值为 -45 度
 * @property {Number} [options.angleSpeed=4] 每秒飞行角速度（单位：度/秒），默认值为 4 度
 * @see {@link utils.CommonUtil.lookAround}
 */
IMap3D.prototype.lookAround = function (position, options) {
    if (!Cesium.defined(position)) {
        throw new Cesium.DeveloperError('position is required.');
    }
    if (!(position instanceof Cesium.Cartesian3)) {
        let positionOpt = Object.assign({
            from: CoordTypeEnum.wgs84,
            to: CoordTypeEnum.wgs84,
        }, options.position);

        const pos = GeoCoordConverterUtil.coordsConvert(positionOpt.from, positionOpt.to, position.lng, position.lat);
        if (pos) {
            position = Cesium.Cartesian3.fromDegrees(pos.x, pos.y);
        }
    }

    let viewer = this.context.getViewer();
    CommonUtil.lookAround(
        viewer.getCesiumViewer(),
        position,
        options.distance,
        options.duration,
        options.pitch,
        options.angleSpeed
    );
}

/**
 * 加载GIS服务平台场景
 * @param {String} baseUrl url前缀 'http://10.88.89.76:9800/gis-map/ZdMapService/zdgis/'
 * @param {Number} sceneApiId 场景id
 * @param {Object} [options = undefined] 其它可选参数。其中最重要的是headers，请求头里面携带Authorization参数信息
 * @returns {Array.<Promise>} 场景图层配置对象数组
 */
IMap3D.prototype.loadZdGISScene = function (baseUrl, sceneApiId, options) {
    const viewer = this.context.getViewer();
    const opts = Object.assign({}, options);
    const sceneUrl = baseUrl + sceneApiId + '?key=' + opts.key;
    return Cesium.Resource.fetchJson({
        url: sceneUrl
    }, opts).then((res) => {
        //console.log(res, 'loadZdGISScene');
        const layers = res.layers ?? [];
        const sceneInfo = res.sceneInfo;

        const layerDSObjs = []
        layers.forEach((item) => {
            if (item.status !== 0) {
                return;
            }
            layerDSObjs.push(addZdGISLayer(viewer, baseUrl, opts.key,
                item.layerId,
                item.name,
                item.url ? item.url.replace("database:", "") : "",
                item.apiId,
                item.display === 1,
                item.dataFormat,
                item.format,
                item.options,
                item.style,
            ))
        });
        const optval = sceneInfo.options?.value;
        
        let sceneOptions
        if(_.isString(optval)){
            sceneOptions = JSON.parse(optval);
        }else{
            sceneOptions = optval;
        }

        if(sceneOptions){
            const destination = sceneOptions.initView?.destination;
            const orientation = sceneOptions.initView?.orientation;
            if (orientation) {
                if (orientation.heading !== undefined) {
                  orientation.heading = Cesium.Math.toRadians(
                    orientation.heading
                  );
                }
                if (orientation.pitch !== undefined) {
                  orientation.pitch = Cesium.Math.toRadians(
                    orientation.pitch
                  );
                }
                if (orientation.roll !== undefined) {
                  orientation.roll = Cesium.Math.toRadians(
                    orientation.roll
                  );
                }
              }
            viewer.getCesiumViewer().camera.flyTo({
                destination: new Cesium.Cartesian3.fromDegreesArrayHeights(
                    destination
                )[0],
                duration: 3,
                orientation: orientation,
                });
        } 
        

        return layerDSObjs;
    });
}

/**
 * 加载GIS服务平台图层
 * @param {String} baseUrl url前缀 'http://10.88.89.76:9800/gis-map/ZdMapService/zdgis/'
 * @param {Number} layerApiId 图层id
 * @param {Object} [options = undefined] 其它可选参数。其中最重要的是headers，请求头里面携带Authorization参数信息
 * @returns {Promise} 图层配置对象
 */
IMap3D.prototype.loadZdGISLayer = function (baseUrl, layerApiId, options) {
    const viewer = this.context.getViewer();
    const opts = Object.assign({}, options);
    const layerUrl = getLayerMetaUrl(baseUrl, layerApiId, opts.key);
    return Cesium.Resource.fetchJson({
        url: layerUrl
    }, opts).then((res) => {
        //console.log(res, 'loadZdGISLayer');
        if (!res.layer) {
            throw new Error('图层元数据获取失败')
        }
        const layerConfig = res.layer;
        if (layerConfig.status !== 0) {
            throw new Error('图层已禁用')
        }
        return addZdGISLayer(viewer, baseUrl, opts.key,
            layerConfig.layerId,
            layerConfig.name,
            layerConfig.url ? layerConfig.url.replace("database:", "") : "",
            layerConfig.apiId,
            opts.visible?? true,
            layerConfig.dataFormat,
            layerConfig.format,
            layerConfig.options,
            res.style,
        )
    });
}


function addZdGISLayer(sceneViewer, baseUrl, key,
    layerId,
    layerName,
    serviceName,
    apiId,
    isVisible,
    dataFormat,
    format,
    options,
    style
) {
    const formatMap = {
        "11": DataSourceTypeEnum.DS_IMAGERY_URLTEMPLATE,
        "21": DataSourceTypeEnum.DS_WMS,
        "31": DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE,
        "41": { //dataFormatMap   
            "301": DataSourceTypeEnum.DS_CUSTOM,
            "302": DataSourceTypeEnum.DS_CUSTOM,
            "303": DataSourceTypeEnum.DS_KML,
            "304": DataSourceTypeEnum.DS_CUSTOM,
            "321": DataSourceTypeEnum.DS_3DTILESET,
        },
        "42": DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE,
        "51": DataSourceTypeEnum.DS_IMAGERY_URLTEMPLATE,
        "61": DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE,
    }
    // const dataFormatMap = {
    //     "101": DataSourceTypeEnum.DS_WMS,
    //     "102": DataSourceTypeEnum.DS_WMS,
    //     "103": DataSourceTypeEnum.DS_WMS,
    //     "201": DataSourceTypeEnum.DS_WMS,
    //     "301": DataSourceTypeEnum.DS_CUSTOM,
    //     "302": DataSourceTypeEnum.DS_CUSTOM,
    //     "303": DataSourceTypeEnum.DS_KML,
    //     "304": DataSourceTypeEnum.DS_CUSTOM,
    //     "321": DataSourceTypeEnum.DS_3DTILESET,
    //     "401": DataSourceTypeEnum.DS_WMS,
    // };

    // ImageryProviderCollection.js
    const onlineMap = {
        '303': "gaode_vec",
        '202': "baidu_vec",
        '204': "baidu_street_label",
        '302': "gaode_label",
        '201': "baidu_img",
        '301': "gaode_img",
        '102': "tianditu_label",
        '104': "tianditu_street_label",
        '101': "tdt_img",
        '103': "tdt_vec",
        '203': "baidu_street"
    }

    let layeroption;
    // 图层选项
    let lyrOptions;
    if (options && typeof options.value === "string") {
        lyrOptions = JSON.parse(options ?.value ?? "{}");
    } else {
        lyrOptions = options ?.value ?? {};
    }
    const flyto = lyrOptions.flyto ?? false;
    //const df = dataFormatMap[dataFormat];
    let df = formatMap[format];


    if (format === 41) { // 三维模型
        df = formatMap[format][dataFormat];
        if (df === DataSourceTypeEnum.DS_CUSTOM) {
            const pos = window.Cesium.Cartesian3.fromDegrees(
                lyrOptions.position[0],
                lyrOptions.position[1],
                lyrOptions.position[2]
            );
            const orientationOpts = lyrOptions ?.orientation ?? {
                heading: 90,
                pitch: 0,
                roll: 0
            };
            const orientation = window.Cesium.Transforms.headingPitchRollQuaternion(
                pos,
                new window.Cesium.HeadingPitchRoll(
                    window.Cesium.Math.toRadians(orientationOpts.heading ?? 0),
                    window.Cesium.Math.toRadians(orientationOpts.pitch ?? 0),
                    window.Cesium.Math.toRadians(orientationOpts.roll ?? 0)
                ) // heading,pitch, roll
            );
            layeroption = ZDataSourceModel.getCustomModel(
                layerId,
                undefined, {
                    entities: [{
                        name: layerName,
                        position: pos,
                        orientation: orientation,
                        model: {
                            uri: getLayerUrl(baseUrl, apiId, key)
                        },
                        properties: {
                            name: layerName,
                            id: layerId,
                            serviceName: serviceName,
                            apiId: apiId,
                            dataFormat: dataFormat
                        }
                    }]
                },
                isVisible,
                flyto,
                layerName,
                layerName + serviceName
            ).toJSON();
        } else if (df === DataSourceTypeEnum.DS_3DTILESET) {
            layeroption = ZDataSourceModel.get3DTileSetModel(
                layerId,
                getLayerUrl(baseUrl, apiId, key), {
                    offset: {}
                },
                isVisible,
                flyto,
                layerName
            ).toJSON();
        } else if (df === DataSourceTypeEnum.DS_KML) {
            layeroption = ZDataSourceModel.getKmlModel(
                layerId,
                getLayerUrl(baseUrl, apiId, key), {
                    crs: 1,
                },
                isVisible,
                flyto,
                layerName
            ).toJSON()
        }
    } else if (df === DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE) { //wfs和geojson接口,3d点

        let strokeColor = formatCSColor(style.strokeColor,style.strokeOpacity)
        let fillColor = formatCSColor(style.fillColor,style.strokeOpacity)
        
        let symbol;
        if (style.type === 11 || style.type === 12) {
            symbol = getMarkerByStyle(style);
        } else if (style.type === 13) {
            const styles = style.propertyStyles;
            if (styles.length < 1) {
                const defaultSymbol = resdata.propertyStyles[0].style;// TODO resdata
                symbol = getMarkerByStyle(defaultSymbol);
            } else {
                const columnName = styles[1].columnName;
                const symbols = {}
                // symbols.fieldName = columnName
                styles.forEach((element, index) => {
                    if (!element.columnName && !element.columnValue) {
                        symbols['default'] = getMarkerByStyle(element.style);
                    } else {
                        symbols['' + element.columnValue] = getMarkerByStyle(element.style);
                    }
                });

                symbol = {
                    customSymbol: 2,
                    markerSymbolCallBack: function (property) {
                        // 图标
                        const value = property[columnName]
                        return symbols['' + value] ?? symbols['default'];
                    }
                }
            }

        }else if(style.type === 21) {
            symbol = {
                materialType:  (style.strokeDasharray === 0 || style.strokeDasharray === '') ? Cesium.Material.ColorType : Cesium.Material.PolylineDashType,
                strokeWidth: style.width,
                stroke: strokeColor,
                // TODO cesium虚线逻辑和cavas不一致
                dashLength: Number(style.strokeDasharray.split(" ")[0]) * 2,
                dashPattern: 255,
                // strokeColor: style.strokeColor,
                // gapColor: style.strokeOption,
                //outlineStroke: style.strokeColor,
                //outlineWidth: style.width,
                //show
                //arcType
                //shadows
                //classificationType
                //zIndex
                //depthFailMaterial
                //distanceDisplayCondition
            }
        }else if(style.type === 23) { 
            const styles = style.propertyStyles;
            if (styles.length < 1) {
                const defaultSymbol = styles[0].style;
                symbol = {
                    materialType:  (defaultSymbol.strokeDasharray === 0 || defaultSymbol.strokeDasharray === '') ? Cesium.Material.ColorType : Cesium.Material.PolylineDashType,
                    // TODO cesium虚线逻辑和cavas不一致
                    dashLength: Number(defaultSymbol.strokeDasharray.split(" ")[0]) * 2,
                    dashPattern: 255,
    
                    strokeWidth: defaultSymbol.width,
                    stroke: formatCSColor(defaultSymbol.strokeColor,defaultSymbol.strokeOpacity)
                }
            } else {
                const columnName = styles[1].columnName;
                const symbols = {}
                symbols.fieldName = columnName
                styles.forEach((element, index) => {
                    const temp = {
                        materialType:  (element.style.strokeDasharray === 0 || element.style.strokeDasharray === '') ? Cesium.Material.ColorType : Cesium.Material.PolylineDashType,
                        dashPattern: element.style.strokeDasharray,
        
                        strokeWidth: element.style.width,
                        stroke: formatCSColor(element.style.strokeColor,element.style.strokeOpacity)
                    }
                    if (!element.columnName && !element.columnValue) {
                        symbols['default'] = temp;
                    } else {
                        symbols['' + element.columnValue] = temp;
                    }
                });

                symbol = {
                    customSymbol: 2,
                    markerSymbolCallBack: function (property) {
                        console.log('设置样式');

                        // const value = property[columnName]
                        // return symbols['' + value] ?? symbols['default'];
                    },
                    symbols
                }
            }
        } else if(style.type === 31) {
            
            symbol = {
                outlineColor: strokeColor,
                stroke: strokeColor,
                strokeWidth: style.width,
            }
            
            if(fillColor){
                symbol.fill = fillColor
            }else {
                // 透明
                symbol.fill = formatCSColor('#FFFFFF','0')
            }
        } else if(style.type === 33) {
            const styles = style.propertyStyles;
            if (styles.length === 1) {
                const defaultSymbol = styles[0].style;
                symbol = {
                    fill:  formatCSColor(defaultSymbol.fillColor,defaultSymbol.fillColor),
                    outlineColor: formatCSColor(defaultSymbol.strokeColor,defaultSymbol.strokeOpacity),
                    stroke: formatCSColor(defaultSymbol.strokeColor,defaultSymbol.strokeOpacity),
                    strokeWidth: defaultSymbol.width,
                }
            } else {
                const columnName = styles[1].columnName;
                const symbols = {}
                symbols.fieldName = columnName
                styles.forEach((element, index) => {
                    const temp = {
                        fill:  formatCSColor(element.style.fillColor,element.style.strokeOpacity),
                        outlineColor: formatCSColor(element.style.strokeColor,element.style.strokeOpacity),
                        stroke: formatCSColor(element.style.strokeColor,element.style.strokeOpacity),
                        strokeWidth: element.style.width,
                    }
                    if (!element.columnName && !element.columnValue) {
                        symbols['default'] = temp;
                    } else {
                        symbols['' + element.columnValue] = temp;
                    }
                });

                symbol = {
                    customSymbol: 2,
                    markerSymbolCallBack: function (property) {
                        console.log('设置样式');

                        // const value = property[columnName]
                        // return symbols['' + value] ?? symbols['default'];
                    },
                    symbols
                }
            }
        }
        layeroption = ZDataSourceModel.getDynamicGeoJsonModel(
            layerId,
            getLayerUrl(baseUrl, apiId, key), Object.assign({
                // urlParameters: {
                //   headers: {
                //     "Content-Type": "application/json;charset=utf-8",
                //     Authorization: "eyJhbGciOiJIUzI1NiJ9.eyJiaXpfZGF0YV9maWVsZCI6IntcImF1dGhJZFwiOlwiMDM2YjU4ZGEtOGY0ZS00N2EyLThkNjMtN2FhYTVkMGJiNTUwXCJ9IiwiZXhwIjoxNjE1OTA0OTE1fQ.VNedAyr1NUY_A99Wwzg3ucOhExahZtkVqze3TbGdWZU"
                //   }
                // },
                clampToGround: false,
                customSymbol: 1,
                markerSize: 48,
                markerSymbol: undefined,
                markerColor: undefined,
                primitive: 0,
                crs: 1,
                refresh: 0,                
                refreshInterval: 5 * 60, // 秒
                // markerSymbolCallBack: function (property) {
                //     // 图标
                //     return 'iot_device';
                // },
                label: {
                    show: true,
                    heightReference: 0,
                },
            }, symbol),
            isVisible, flyto, layerName, serviceName
        ).toJSON()
    } else if (df === DataSourceTypeEnum.DS_WMS) {
        layeroption = ZDataSourceModel.getWMSModel(
            layerId,
            // "http://192.168.10.74:8180/geoserver/zdgis/wms",
            getLayerUrl(baseUrl, apiId, key), {
                layers: "zdgis:" + serviceName
                // rectangle: new Cesium.Rectangle.fromDegrees(112.579551696777, 26.815658569335, 112.583061218262, 26.82043457)
            },
            isVisible,
            flyto,
            layerName,
            serviceName
        ).toJSON();
    } else if (df === DataSourceTypeEnum.DS_IMAGERY_URLTEMPLATE) { // 互联网地图
        // 由APIID 获取互联网地图 来源及 服务名
        getOnlineMapInfo(baseUrl,apiId,key).then(res => {
            // TODO 
            sceneViewer.toggleImageryProvider({id:onlineMap[res.layer.url]});
            // return {id:layerId};
            layeroption = ZDataSourceModel.getImagerURLTemplateModel(
                res.layer.layerId,
                res.layer.url,
                true,
                false,
                res.layer.layerName,
                res.layer.name
            ).toJSON();
        })
    }

    sceneViewer.getDataSourceManager().addDataSource(layeroption);
    return layeroption;
}

async function getOnlineMapInfo(baseUrl,apiId,key) {
    const url = getLayerMetaUrl(baseUrl,apiId,key)
    return await Cesium.Resource.fetchJson({
        url: url
    }, {})
}

/**
 * 由hex16进制颜色转换为Cesium支持的颜色
 */
function formatCSColor(hex,opacity){
    if(hex){
        const colorVal = Cesium.Color.fromCssColorString(hex)
        return new Cesium.Color(colorVal.red, colorVal.green, colorVal.blue, opacity?Number(opacity):1);
    }
    return null
}

function getMarkerByStyle(style) {
    let marker;
    if (style.type === 11) {
        marker = {
            customSymbol: 3,
            markerSize: style.size,
            markerSymbol: undefined,
            rotation: style.rotation,
            markerColor: Cesium.Color.fromCssColorString(style.fillColor),
        }
    } else if (style.type === 12) {
        marker = {
            customSymbol: 2,
            markerSize: style.size,
            markerSymbol: style.picUrl,
            rotation: style.rotation,
            markerColor: undefined
        }
    }
    return marker;
}

function getLayerUrl(baseUrl, apiId, key) {
    return baseUrl + apiId + '?key=' + key + "&api=" + apiId
}

function getLayerMetaUrl(baseUrl, apiId, key) {
    return baseUrl + apiId + '/meta' + '?key=' + key
}

export default IMap3D;