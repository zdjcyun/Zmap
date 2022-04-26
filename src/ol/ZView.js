import Core from '../core/Core.js';
import IFrameMessage from '../core/IFrameMessage.js';
import LayerClassNameTypeEnum from './enum/LayerClassNameTypeEnum.js';
import LayerSourceTypeEnum from './enum/LayerSourceTypeEnum.js';
import LayerTypeEnum from './enum/LayerTypeEnum.js';
import OperationStatusEnum from './enum/OperationStatusEnum.js';
import ZGlobalEvent from './event/ZGlobalEvent.js';
import ZLayerEvent from './event/ZLayerEvent.js';
import ZEchartsLayer from './layer/ZEchartsLayer.js';
import ZGraphicsLayer from './layer/ZGraphicsLayer.js';
import GeoCoordConverterUtil from './util/GeoCoordConverterUtil.js';
import ZGraphicUtil from './util/ZGraphicUtil.js';
// import ZToolbarWidget from './widget/ZToolbarWidget.js';
// import ZSearchBoxWidget from './widget/ZSearchBoxWidget.js';
import ZCitySelectorWidget from './widget/ZCitySelectorWidget.js';
import ZCoordinateWidget from './widget/ZCoordinateWidget.js';
import ZCopyrightWidget from './widget/ZCopyrightWidget.js';
import ZLegendWidget from './widget/ZLegendWidget.js';
import ZMapStyleWidget from './widget/ZMapStyleWidget.js';
import ZScalebarWidget from './widget/ZScalebarWidget.js';
import ZWidget from './widget/ZWidget.js';
import ZZoomWidget from './widget/ZZoomWidget.js';
import ZGraphic from './ZGraphic.js';
import ZLayerManager from './ZLayerManager.js';


/**
 * 默认地图部件UI
 * @private
 */
let DEFAULT_WIDGETS = {
    //copyrightWidget
    copyright: (_view, copyrightWidgetOption) => {
        return _view.widgets.copyrightWidget = new ZCopyrightWidget(
            Object.assign({
                zmap: _view.map
            }, copyrightWidgetOption)
        );
    },

    //coordinateWidget
    coordinate: (_view, coordinateWidgetOption) => {
        return _view.widgets.coordinateWidget = new ZCoordinateWidget(
            Object.assign({
                zmap: _view.map
            }, coordinateWidgetOption)
        );
    },

    //scalebarWidget
    scalebar: (_view, scalebarWidgetOption) => {
        return _view.widgets.scalebarWidget = new ZScalebarWidget(
            Object.assign({
                zmap: _view.map
            }, scalebarWidgetOption)
        );
    },


    //zoomWidget
    zoom: (_view, zoomWidgetOption) => {
        return _view.widgets.zoomWidget = new ZZoomWidget(
            Object.assign({
                zmap: _view.map
            }, zoomWidgetOption)
        );
    },

    //legendWidget
    legend: (_view, legendWidgetOption) => {
        return _view.widgets.legendWidget = new ZLegendWidget(
            Object.assign({
                zmap: _view.map,
                layers: _view.layerManager.getLegendLayers(true)
            }, legendWidgetOption)
        );
    },


    //mapStyleWidget
    mapStyle: (_view, mapStyleWidgetOption) => {
        let bmlyrObj = _view.basemapLayer;
        if (!bmlyrObj) {
            return;
        }
        let lyrWrapper = _.get(bmlyrObj, _.head(_.keys(bmlyrObj)));
        let defaultOpt = {
            zmap: _view.map
        };
        if (lyrWrapper.type === LayerClassNameTypeEnum.ZONLINEMAPLAYER) {
            defaultOpt.mapType = lyrWrapper.mapType;
        } else if (lyrWrapper.type === LayerClassNameTypeEnum.ZARCGISTILELAYER ||
            lyrWrapper.type === LayerClassNameTypeEnum.ZWMTSLAYER) {
            defaultOpt.mapType = lyrWrapper.url;
        }

        return _view.widgets.mapStyleWidget = new ZMapStyleWidget(
            Object.assign(defaultOpt, mapStyleWidgetOption)
        );

    },

    // 城市区域过滤组件
    citySelector: (_view, citySelectorWidgetOption) => {
        return _view.widgets.citySelectorWidget = new ZCitySelectorWidget(
            Object.assign({
                zmap: _view.map
            }, citySelectorWidgetOption)
        );
    },

};


/**
 * @exports ZView
 * @class
 * @classdesc 地图的视图对象封装类。用于管理图层和页面部件元素。
 * 由ZMap对象同步创建，用户可通过ZMap.view属性访问或者调用ZMap.getView()
 */
class ZView extends ol.Observable {

    constructor(map, options) {
        super();

        this.options = options;
        this.map = map;

        /**
         * 底图图层对象。从配置文件中解析的底图都存储在此对象中。
         */
        this.basemapLayer = null;
        /**
         * 动态图层对象。从配置文件中解析的动态图层都存储在此对象中。
         */
        this.dynamicLayer = null;
        /**
         * 要素图层对象。从配置文件中解析的要素图层都存储在此对象中。
         */
        this.featureLayer = null;
        /**
         * 缓存图层对象。此对象存储视图中已经添加的临时图层。目前只添加了定位图层
         */
        this.graphicsLayer = null;

        /**
         * echarts图层对象。从配置文件中解析的echarts图层都存储在此对象中。
         * 此图层必须添加到最后，否则，鼠标交互事件无法触发。
         */
        this.echartsLayer = null;

        /**
         * @property {String} KEY_LOCATION_LAYER 临时定位图层键名，可能通过此键获取到定位图层对象。
         * @type {String}
         */
        this.KEY_LOCATION_LAYER = 'locationLayer';

        /**
         * @property {ZLayerManager} layerManager 图层管理对象。
         * @type {ZLayerManager}
         */
        this.layerManager = new ZLayerManager(map, this.options.layers);

        /**
         * @property {Object} widgets 保存所有小部件元素
         */
        this.widgets = {};

    };


    /**
     * 添加页面部件元素。
     * 目前支持：比例尺scalebar，缩放控件zoom，坐标实时显示coordinate，版权copyright，
     * 省市区域过滤citySelector，地图风格切换mapStyle，图例legend
     * @method
     * @param {Object|Array.<Object>} widgets 部件对象参数或参数列表
     */
    addDefaultWidget(widgets) {
        let wdgs = [];
        if (_.isPlainObject(widgets)) {
            wdgs.push(widgets);
        } else if (_.isArray(widgets)) {
            wdgs = widgets;
        }

        _.forEach(wdgs, (wdg) => {
            let hander = DEFAULT_WIDGETS[wdg.name];
            if (hander) {
                hander(this, wdg.options).addToMap();
            }
        });


        return;

        //@todo 下面组件还没有完成优化

        //searchBoxWidget
        if (this.options.searchBoxWidget === undefined ? true : this.options.searchBoxWidget) {
            this.searchBoxWidget = new ZSearchBoxWidget(
                Object.assign({
                    zmap: this.map
                }, this.options.searchBoxWidgetOption)
            );
            this.searchBoxWidget.addToMap();
        }

    }

    /**
     * 添加自定义控件
     * @param {String} propertyName 部件属性名称，用于view.widgets对象中存储的键
     * @param {ZWidget} widgetInstance 部件实例
     * @returns {ZWidget} 部件实例本身
     */
    addWidget(propertyName, widgetInstance) {
        if (propertyName in this.widgets) {
            throw new Error(`The property name(${propertyName}) has exists in widgets!`);
        }

        this.widgets[propertyName] = widgetInstance;

        return widgetInstance.addToMap();
    }

    /**
     * 移除控件
     * @param {String} propertyName 部件属性名称，用于view.widgets对象中存储的键
     */
    removeWidget(propertyName) {
        let widget = this.widgets[propertyName];
        if (widget) {
            return widget.removeFromMap();
        }
    }

    /**
     * 获取自定义控件
     * @param {String} widgetName 部件属性名称，用于view.widgets对象中存储的键
     * @returns {ZWidget} 部件实例本身
     */
    getWidget(widgetName) {
        return this.widgets[widgetName];
    }

    /**
     * 清除图形
     * @param {String} [graphicLayerKey] 图层的id名。不传值则所有临时图层都清除
     */
    clearGraphicLayer(graphicLayerKey) {

        if (!graphicLayerKey) {
            this.map.clearAllGraphicLayer();
            this.map.tempLayer.clear();
            this.map.graphics().clear();
        }

        let graphicLyr = this.graphicsLayer[graphicLayerKey];
        if (!graphicLyr) {
            if (graphicLayerKey === 'tempLayer') {
                this.map.tempLayer.clear();
            }
            return;
        }
        graphicLyr.clear();
    }


    /**
     * 使地图定位到要素集合范围
     * @param {Array.<Object>} features 要素集合,每一项为Feature GeoJson对象
     * @param {ZSymbol} graphicSymbol 用于显示的符号对象
     * @param {Number} [crsFrom] 源始数据坐标系代码
     * @param {Number} [crsTo] 目标坐标系代码，一般为地图的crs
     */
    locationFeatureCollection(features, graphicSymbol, crsFrom, crsTo) {

        let gs = [];
        //定位
        _.forEach(features, function (f) {
            let g = ZGraphicUtil.geoJSONToZGraphic(f);
            if (crsFrom && crsTo && crsFrom !== crsTo) {
                g.setGeometry(g.geometry.applyTransform(crsFrom, crsTo));
            }

            g.setSymbol(graphicSymbol);

            gs.push(g);
        });

        this.mapLocationBatch(gs, true, true);
    }

    /**
     * 几何图形对象批量添加并进行地图缩放定位
     * @param {Array.<ZGraphic>} graphics 需要定位的图形对象
     * @param {boolean} [isclear=true] 是否清除图层
     * @param {boolean} [centermap=false] 是否居中缩放显示地图
     */
    mapLocationBatch(graphics, isclear, centermap) {
        this.addGraphic(this.KEY_LOCATION_LAYER, graphics, isclear, centermap);
    }

    /**
     * 添加图形
     * @param {string|ZGraphicsLayer} graphicLayerKey 图形图层的键名
     * @param {Array.<ZGraphic>|Array.<Object>} graphics 需要添加的图形对象列表
     * @example
     * {
     *     geometry: geo, // 几何对象
     *     symbol: symbol, // 符号对象
     *     attributes: props // 属性对象
     * }
     * @param {boolean} [isclear=true] 添加之前是否清除图层
     * @param {boolean} [centermap=false] 是否居中显示地图
     */
    addGraphic(graphicLayerKey, graphics, isclear, centermap) {
        let graphicLyr = (graphicLayerKey instanceof ZGraphicsLayer) ? graphicLayerKey : this.graphicsLayer[graphicLayerKey];
        if (!graphicLyr) {
            if (graphicLayerKey === 'tempLayer') {
                graphicLyr = this.map.tempLayer;
            } else {
                return;
            }
        }
        if (isclear === undefined ? true : isclear) {
            graphicLyr.clear();
        }
        _.forEach(graphics, function (item) {
            let g;
            if (item instanceof ZGraphic) {
                g = item;
            } else {
                g = new ZGraphic(item.geometry, item.symbol, Object.assign({}, item.attributes));
            }

            graphicLyr.add(g);
        });

        if (centermap && graphics.length) {
            let ext = graphicLyr.getExtent();
            if (ext) {
                this.map.setExtent(ext, true, 500);
            }
        }
    }


    /**
     * 坐标转换接口
     * @param {number} from 源数据坐标系
     * @param {number} to 目标数据坐标系
     * @param {Object} point 要转换的坐标点.eg:{x:11,y:22}
     * @param {Object} [result] 转换的结果.eg:{x:11,y:22}
     * @return {Object} result 转换的结果
     * @see GeoCoordConverterUtil
     */
    coordinateTransform(from, to, point, result) {
        result = result || {};
        to = to || this.map.crs;
        let xy = GeoCoordConverterUtil.coordsConvert(from, to, point.x, point.y);

        result.x = xy.x;
        result.y = xy.y;

        return result;
    }


}

/**
 * 开始加载图层配置
 * @param {ZView} mapview 当前地图视图对象
 * @returns {Promise}
 */
ZView.startLoadLayers = function (mapview) {
    return mapview.layerManager.init().then((lyrConfig) => {
        _addLayers.call(mapview, mapview.map, lyrConfig);

        mapview.dispatchEvent(ZGlobalEvent.ON_MAP_INITIALED);
    });
}


/**
 * 添加图层列表
 * @param {ZMap} map 地图对象
 * @param {Object} ps 图层配置参数对象
 * @private
 */
function _addLayers(map, ps) {
    this.basemapLayer = _addBasemapLayer(map, ps);

    let dfLayers = _addDynamicAndFeatureLayer(map, ps);

    this.dynamicLayer = dfLayers.dynamicLayer;
    this.featureLayer = dfLayers.featureLayer;

    // 静态图片图层
    this.imageLayer = _addImageLayer(map, ps);

    this.graphicsLayer = _addGraphicLayer(map);

    this.echartsLayer = _addEchartsLayer(map, ps);

}


/**
 * 添加底图图层
 * @param {ZMap} map 地图对象
 * @param {Object} layersInfo 图层配置参数对象
 * @return {Object} 图层对象
 * @private
 */
function _addBasemapLayer(map, layersInfo) {
    let basemapConfig = {};

    _.forEach(layersInfo, function (item) {
        let basemap = item;

        if (basemap.status < 0 || basemap.type !== LayerTypeEnum.LAYER_TYPE_TILE) {
            return;
        }

        basemap.options = basemap.options || {};
        basemap.options.id = basemap.id;

        let basemapLyr = LayerSourceTypeEnum.getInstance(LayerTypeEnum.LAYER_TYPE_TILE, basemap.sourcetype, basemap);

        if (basemapLyr) {
            map.addLayer(basemapLyr);
        }

        basemapConfig[basemap.id] = basemapLyr;
    });

    return basemapConfig;
}

/**
 * 添加动态要素图层
 * @param {ZMap} map 地图对象
 * @param {Object} layersInfo 图层配置参数对象
 * @return {Object} 图层对象
 * @private
 */
function _addDynamicAndFeatureLayer(map, layersInfo) {
    let dynamicLayer = {};
    let featureLayer = {};
    _.forEach(layersInfo, function (item) {
        if (item.status < 0) {
            return;
        }
        if (item.type === LayerTypeEnum.LAYER_TYPE_DYNAMIC) {
            Object.assign(dynamicLayer, _addDynamicLayer(map, item));
        } else if (item.type === LayerTypeEnum.LAYER_TYPE_FEATURE) {
            Object.assign(featureLayer, _addFeatureLayer(map, item));
        }
    });

    return {
        dynamicLayer: dynamicLayer,
        featureLayer: featureLayer
    };
}


/**
 * 添加动态图层
 * @param {ZMap} map 地图对象
 * @param {Object} item 图层配置参数对象
 * @return {Object} 图层对象
 * @private
 */
function _addDynamicLayer(map, item) {
    let dynamicLayer = {};

    if (item.status < 0 || item.type !== LayerTypeEnum.LAYER_TYPE_DYNAMIC) {
        return dynamicLayer;
    }

    item.options = item.options || {};
    item.options.id = item.id;
    item.options.mapwkid = map.wkid();
    item.options.zmap = map;
    item.options.showInfoWin = item.options.showInfoWin === undefined ? true : item.options.showInfoWin;


    let lyr = LayerSourceTypeEnum.getInstance(LayerTypeEnum.LAYER_TYPE_DYNAMIC, item.sourcetype.toLowerCase(), item);

    map.addLayer(lyr);

    if (item.options.isSelectable) {
        lyr.addEventListener(ZLayerEvent.SINGLECLICK, function (e) {
            if (map.operationStatus === OperationStatusEnum.MAP_QUERY_POINT &&
                e.graphic.length) {
                let lyrOpts = e.target.options;
                let showInfoWin = lyrOpts.showInfoWin;
                if (showInfoWin) {
                    showInfoWindow(e.graphic, map);
                }
                if (lyrOpts.postMessage) {
                    let g = filterGraphic(e.graphic, lyrOpts.postMsgFilter);
                    IFrameMessage.postMessage({
                        os: OperationStatusEnum.MAP_QUERY_POINT,
                        data: g
                    });
                }

                map.addGraphics(e.graphic);
            }
        });
    }

    let key = item.id || item.type + '_' + item.sourcetype + '_' + Core.guid();
    dynamicLayer[key] = lyr;

    return dynamicLayer;
}

function filterGraphic(graphic, postMsgFilter) {
    let r = [];

    if (!postMsgFilter) {
        return graphic;
    }
    let tmp;
    let flds = postMsgFilter.fields;
    _.forEach(graphic, function (g) {
        tmp = {};
        if (flds) {
            _.forEach(flds, function (f) {
                tmp[f] = g.attributes[f];
            });
        } else {
            tmp = g.attributes;
        }

        if (postMsgFilter.geometry) {
            tmp.geometry = g.geometry.toJSON();
        }

        r.push(tmp);

    });

    return r;


}

/**
 * 添加要素图层
 * @param {ZMap} map 地图对象
 * @param {Object} item 图层配置参数对象
 * @return {Object} 图层对象
 * @private
 */
function _addFeatureLayer(map, item) {
    let featureLayer = {};

    if (item.status < 0 || item.type !== LayerTypeEnum.LAYER_TYPE_FEATURE) {
        return featureLayer;
    }

    item.options = item.options || {};
    item.options.id = item.id;
    item.options.showInfoWin = item.options.showInfoWin === undefined ? true : item.options.showInfoWin;
    item.options.mapwkid = map.wkid();

    let lyr = LayerSourceTypeEnum.getInstance(LayerTypeEnum.LAYER_TYPE_FEATURE, item.sourcetype.toLowerCase(), item);

    map.addLayer(lyr);

    if (item.options.isSelectable) {
        map.addLayerSelectHandler(lyr, function (se) {
            let lyrOpts = se.layer.options;
            let showInfoWin = lyrOpts.showInfoWin;
            if (showInfoWin) {
                showInfoWindow(se.graphic, map);
            }
        });
    }

    let key = item.id || lyr.id;
    featureLayer[key] = lyr;

    return featureLayer;
}

/***
 * 添加图片图层
 * @param {ZMap} map 地图对象
 * @param {Object} layersInfo 图层配置参数对象
 * @returns {Object} 图片图层对象
 * @private
 */
function _addImageLayer(map, layersInfo) {
    let imageLayer = {};

    _.forEach(layersInfo, function (item) {
        if (item.status < 0) {
            return;
        }

        if (item.type != LayerTypeEnum.LAYER_TYPE_IMAGE) return;

        item.options = item.options || {};
        item.options.id = item.id;
        item.options.mapwkid = map.wkid();

        let lyr = LayerSourceTypeEnum.getInstance(LayerTypeEnum.LAYER_TYPE_IMAGE, item.sourcetype.toLowerCase(), item);

        map.addLayer(lyr, item.order);


        let key = item.id || lyr.id;
        imageLayer[key] = lyr;
    });


    return imageLayer;

}

/**
 * 显示信息窗口
 * @param {ZGraphic} graphics 图形对象
 * @param {ZMap} map 地图对象
 * @param {String} [fields] 要显示的字段信息
 * @private
 */
function showInfoWindow(graphics, map, fields) {
    let iw = map.infoWindow;
    let g = _.isArray(graphics) ? graphics[0] : graphics;
    let result = iw.setGraphic(g, fields);
    if (result) {
        iw.show();
    }
}


/**
 * 添加graphic图层
 * @param {ZMap} map 地图对象
 * @return {Object} 图层对象
 * @private
 */
function _addGraphicLayer(map) {
    let grpLyr = {};

    let key_location_layer = 'locationLayer';
    let locationLyr = new ZGraphicsLayer(key_location_layer);
    let locationLayerOptions = map.options.locationLayerOptions;
    if (locationLayerOptions && locationLayerOptions.isSelected) {
        map.addLayerSelectHandler(locationLyr, function (se) {
            showInfoWindow(se.graphic, map, locationLayerOptions.fields);
        });
    }

    grpLyr[key_location_layer] = locationLyr;

    //定位图层
    map.addLayer(locationLyr);

    return grpLyr;
}


/**
 * 添加echarts图层
 * @param {ZMap} map 地图对象
 * @param {Object} layersInfo 图层配置参数对象
 * @returns {Object}
 * @private
 */
function _addEchartsLayer(map, layersInfo) {
    let echartsLayer = {};
    _.forEach(layersInfo, function (item) {
        if (item.status < 0 || item.type !== LayerTypeEnum.LAYER_TYPE_ECHARTS) {
            return;
        }
        let lyr;
        item.options = item.options || {};
        item.options.id = item.id;

        let opt = {
            zmap: map,
            strategy: item.options.strategy,
            eOptions: item.options.option,
            eventHandler:
                //     {
                //     'dblclick': {
                //         "query": {
                //             "seriesId": "cityTotalProject"
                //         },
                //         "handler": function (e) {
                //             //addClusterPoints(map, e.data);
                //             let title = e.name + e.seriesName + '(' + e.value[2] + ')';
                //             let url = 'http://localhost:8080/webgis/gis/api/geo/config/project';
                //             let p = { mapid:1,  dcode:e.data.dcode };
                //             $.getJSON(url, p).then(function (d) {
                //                 if (d.code < 0) {
                //                     alert(d.msg);
                //                     return;
                //                 }
                //                 let features = d.data;
                //                 let htmlContent = ['<table>'];
                //                 _.forEach(features, function (item) {
                //                     htmlContent.push('<tr><td><a class="project" data-attr="'+
                //                         JSON.stringify(item).replace(new RegExp('"','g'),"\'")+'">'
                //                         + item.name + '(' + item.project_state + ')</a></td></tr>');
                //                 });
                //                 htmlContent.push('</table>');
                //                 this.setPopupWindowContent(title, htmlContent.join(''));
                //                 this.setPopupPosition([e.value[0], e.value[1]]);
                //                 this.togglePopup(true);
                //                 $('.ze-layer-popup-infowindow-content').click(function (evt) {
                //                     let attr =$(evt.target).data('attr');
                //                     if(!attr){
                //                         return;
                //                     }
                //                     let prjData =JSON.parse(attr.replace(new RegExp("'",'g'),'"'));
                //                     this.zmap.setExtent([prjData.minx,prjData.miny,prjData.maxx,prjData.maxy],true, 300);
                //                 }.bind(this));
                //             }.bind(this));
                //         }
                //     }
                // }

                item.options.eventHandler
        };

        lyr = new ZEchartsLayer(opt);
        lyr.addToMap();

        let key = item.id || lyr.id;
        echartsLayer[key] = lyr;
    });

    return echartsLayer;
}

export default ZView;