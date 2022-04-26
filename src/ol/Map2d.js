/*
 * @Author: gisboss
 * @Date: 2020-08-17 16:02:53
 * @LastEditors: gisboss
 * @LastEditTime: 2021-11-16 12:57:05
 * @Description: 二维地图入口类
 */

import Core from '../core/Core.js';
import EngineType from '../core/EngineType.js';
import Fullscreen from '../core/Fullscreen.js';
import HttpRequest from '../core/HttpRequest.js';
import IFrameMessage from '../core/IFrameMessage.js';
import EngineSearchEngineType from '../core/SearchEngine.js';

import ZBufferQueryAction from './action/ZBufferQueryAction.js';
import ZCoordinateLocationAction from './action/ZCoordinateLocationAction.js';
import ZFullscreenAction from './action/ZFullscreenAction.js';
import ZHomeViewAction from './action/ZHomeViewAction.js';
import ZLayerControlAction from './action/ZLayerControlAction.js';
import ZMeasureAction from './action/ZMeasureAction.js';
import ZNavigationAction from './action/ZNavigationAction.js';
import ZPointQueryAction from './action/ZPointQueryAction.js';
import ZRefreshAction from './action/ZRefreshAction.js';
import ZSaveViewAction from './action/ZSaveViewAction.js';

import CoordTypeEnum from './enum/CoordTypeEnum.js';
import LayerClassNameTypeEnum from './enum/LayerClassNameTypeEnum.js';
import LayerSourceTypeEnum from './enum/LayerSourceTypeEnum.js';
import LayerTypeEnum from './enum/LayerTypeEnum.js';
import MapStyleEnum from './enum/MapStyleEnum.js';
import OperationStatusEnum from './enum/OperationStatusEnum.js';

import ZDrawEvent from './event/ZDrawEvent.js';
import ZEditEvent from './event/ZEditEvent.js';
import ZGlobalEvent from './event/ZGlobalEvent.js';
import ZLayerEvent from './event/ZLayerEvent.js';
import ZMapEvent from './event/ZMapEvent.js';


import ZCircle from './geometry/ZCircle.js';
import ZExtent from './geometry/ZExtent.js';
import ZGeometry from './geometry/ZGeometry.js';
import ZGeometryType from './geometry/ZGeometryType.js';
import ZMultiPoint from './geometry/ZMultiPoint.js';
import ZMultiPolygon from './geometry/ZMultiPolygon.js';
import ZPoint from './geometry/ZPoint.js';
import ZPolygon from './geometry/ZPolygon.js';
import ZPolyline from './geometry/ZPolyline.js';
import ZScreenPoint from './geometry/ZScreenPoint.js';


import BaiduLayerUtil from './layer/support/BaiduLayerUtil.js';
import FeatureLayerFormat from './layer/support/FeatureLayerFormat.js';
import LabelClass from './layer/support/LabelClass.js';
import LayerDrawingOptions from './layer/support/LayerDrawingOptions.js';
import TiandituLayerUtil from './layer/support/TiandituLayerUtil.js';
import ZLayerDefinition from './layer/support/ZLayerDefinition.js';
import ZArcGISDynamicLayer from './layer/ZArcGISDynamicLayer.js';
import ZArcGISTileLayer from './layer/ZArcGISTileLayer.js';
import ZImageLayer from './layer/ZImageLayer.js';
import ZEchartsLayer from './layer/ZEchartsLayer.js';
import ZFeatureLayer from './layer/ZFeatureLayer.js';
import ZGraphicsLayer from './layer/ZGraphicsLayer.js';
import ZOnlineMapLayer from './layer/ZOnlineMapLayer.js';
import ZLayer from './layer/ZLayer.js';
import ZTiledMapServiceLayer from './layer/ZTiledMapServiceLayer.js';
import ZWFSLayer from './layer/ZWFSLayer.js';
import ZWMSLayer from './layer/ZWMSLayer.js';
import ZWMTSLayer from './layer/ZWMTSLayer.js';

import ZLayerModel from './model/ZLayerModel.js';
import ZResModel from './model/ZResModel.js';

import ZClassBreaksRenderer from './renderer/ZClassBreaksRenderer.js';
import ZSimpleRenderer from './renderer/ZSimpleRenderer.js';
import ZUniqueValueRenderer from './renderer/ZUniqueValueRenderer.js';

import ZFont from './symbol/ZFont.js';
import ZPictureMarkerSymbol from './symbol/ZPictureMarkerSymbol.js';
import ZSimpleFillSymbol from './symbol/ZSimpleFillSymbol.js';
import ZSimpleLineSymbol from './symbol/ZSimpleLineSymbol.js';
import ZSimpleMarkerSymbol from './symbol/ZSimpleMarkerSymbol.js';
import ZSymbol from './symbol/ZSymbol.js';
import ZTextSymbol from './symbol/ZTextSymbol.js';


import ZDrawTool from './tool/ZDrawTool.js';
import ZEditTool from './tool/ZEditTool.js';
import ZMeasureTool from './tool/ZMeasureTool.js';
import ZNavigationTool from './tool/ZNavigationTool.js';

import BdGeoConverterUtil from './util/BdGeoConverterUtil.js';
import BdMeasureUtil from './util/BdMeasureUtil.js';
import GaussKrugerUtil from './util/GaussKrugerUtil.js';
import GeoCoordConverterUtil from './util/GeoCoordConverterUtil.js';
import GeometryUtil from './util/GeometryUtil.js';
import ZBdCityCodeUtil from './util/ZBdCityCodeUtil.js';
import ZDistrictUtil from './util/ZDistrictUtil.js';
import ZGraphicUtil from './util/ZGraphicUtil.js';

// widget
import ZWidget from './widget/ZWidget.js';
import ZCopyrightWidget from './widget/ZCopyrightWidget.js';
import ZScalebarWidget from './widget/ZScalebarWidget.js';
import ZZoomWidget from './widget/ZZoomWidget.js';
import ZMapStyleWidget from './widget/ZMapStyleWidget.js';
import ZCoordinateWidget from './widget/ZCoordinateWidget.js';
import ZLegendWidget from './widget/ZLegendWidget.js';
import Map2dModule from './Map2dModule.js';
import ZColor from './ZColor.js';
import ZGraphic from './ZGraphic.js';
import ZLayerManager from './ZLayerManager.js';
import ZMap from './ZMap.js';
import ZMapContext from './ZMapContext.js';
import ZSpatialReference from './ZSpatialReference.js';
import ZView from './ZView.js';


/**
 * @module map2d
 * @class
 * @classdesc 二维gis入口类对象
 */
let map2d = {
    name: 'map2d',
    /**
     * @property {String} version 当前版本号
     */
    version: '1.0.0',
    /**
     * @property {String} engineType 内核引擎
     */
    engineType: EngineType.OPENLAYERS,
    /**
     * @property {String} language 国际化语言
     */
    language: 'zh-CN',

    /**
     * 创建地图对象
     * @methods
     * @param {string} div 地图窗口容器ID
     * @param {Object} options 地图初始化参数
     * @returns {Promise}
     */
    createMap: (div, options) => {
        return new Promise((resolve, reject) => {
            let mc = new ZMapContext(div, options);
            mc.init(() => resolve(new Map2dModule(mc)));
        });
    },


    /**
     * 设置国际化语言
     * @param {String} lang 要设置的语言类型名称
     */
    setLanguage: (lang) => {
        this.language = lang;
        return this;
    },

    /**
     * 显示等待提示掩膜
     */
    showLoadingDiv() {
        let loading = document.createElement('div');
        loading.setAttribute('class', 'zgis2d zgis-loading');
        loading.innerHTML = '<div class="zgis-spinner1"><div class="zgis-double-bounce1"></div><div class="zgis-double-bounce2"></div></div>';

        document.body.prepend(loading);
    },

    /**
     * 隐藏等待提示掩膜
     */
    hideLoadingDiv() {
        let els = document.querySelectorAll('.zgis2d.zgis-loading');
        if (els) {
            for (let i = 0, len = els.length; i < len; ++i) {
                els[i].style.display = 'none';
            }
        }
    }
};

Object.assign(map2d, {
    core: {
        Core,
        EngineType,
        Fullscreen,
        HttpRequest,
        IFrameMessage,
        EngineSearchEngineType,
    },

    action: {
        ZBufferQueryAction,
        ZCoordinateLocationAction,
        ZFullscreenAction,
        ZHomeViewAction,
        ZLayerControlAction,
        ZMeasureAction,
        ZNavigationAction,
        ZPointQueryAction,
        ZRefreshAction,
        ZSaveViewAction,
    },

    enum: {
        CoordTypeEnum,
        LayerClassNameTypeEnum,
        LayerSourceTypeEnum,
        LayerTypeEnum,
        MapStyleEnum,
        OperationStatusEnum,
    },

    event: {
        ZDrawEvent,
        ZEditEvent,
        ZGlobalEvent,
        ZLayerEvent,
        ZMapEvent,
    },

    geometry: {
        ZCircle,
        ZExtent,
        ZGeometry,
        ZGeometryType,
        ZMultiPoint,
        ZMultiPolygon,
        ZPoint,
        ZPolygon,
        ZPolyline,
        ZScreenPoint,
    },

    layer: {
        support: {
            BaiduLayerUtil,
            FeatureLayerFormat,
            LabelClass,
            LayerDrawingOptions,
            TiandituLayerUtil,
            ZLayerDefinition,
        },
        ZArcGISDynamicLayer,
        ZArcGISTileLayer,
        ZEchartsLayer,
        ZFeatureLayer,
        ZGraphicsLayer,
        ZOnlineMapLayer,
        ZLayer,
        ZImageLayer,
        ZTiledMapServiceLayer,
        ZWFSLayer,
        ZWMSLayer,
        ZWMTSLayer,
    },

    model: {
        ZLayerModel,
        ZResModel,
    },

    renderer: {
        ZClassBreaksRenderer,
        ZSimpleRenderer,
        ZUniqueValueRenderer
    },

    symbol: {
        ZFont,
        ZPictureMarkerSymbol,
        ZSimpleFillSymbol,
        ZSimpleLineSymbol,
        ZSimpleMarkerSymbol,
        ZSymbol,
        ZTextSymbol,
    },

    tool: {
        ZDrawTool,
        ZEditTool,
        ZMeasureTool,
        ZNavigationTool,
    },

    util: {
        BdGeoConverterUtil,
        BdMeasureUtil,
        GaussKrugerUtil,
        GeoCoordConverterUtil,
        GeometryUtil,
        ZBdCityCodeUtil,
        ZDistrictUtil,
        ZGraphicUtil,
    },

    // widget
    widget: {
        ZWidget,
        ZCopyrightWidget,
        ZScalebarWidget,
        ZZoomWidget,
        ZMapStyleWidget,
        ZCoordinateWidget,
        ZLegendWidget,
    },

    // IMap,
    // Map2dModule,
    ZColor,
    ZGraphic,
    ZLayerManager,
    ZMap,
    // ZMapContext,
    ZSpatialReference,
    ZView,
});



/**
 * 导出二维地图包装对象
 */
export {
    map2d
};