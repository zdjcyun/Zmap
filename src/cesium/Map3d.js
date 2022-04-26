/**
 * @Author: gisboss
 * @Date: 2019-12-03 08:11:19
 * @LastEditors: gisboss
 * @LastEditTime: 2020-09-01 08:28:22
 * @Description: 三维地图入口类
 */

 import Core from "../core/Core.js";
 import EngineType from "../core/EngineType.js";
 import Fullscreen from "../core/Fullscreen.js";
 import HttpRequest from "../core/HttpRequest.js";
 import IFrameMessage from "../core/IFrameMessage.js";
 import EngineSearchEngineType from "../core/SearchEngine.js";
 import ArrowPolyline from './core/ArrowPolyline.js';
 import FixGltf from "./core/FixGltf.js";
 import CircleWaveMaterialProperty from "./core/CircleWaveMaterialProperty.js";
 import PolylineTrailLinkMaterialProperty from "./core/PolylineTrailLinkMaterialProperty.js";
 import EllipsoidFadeMaterialProperty from "./core/EllipsoidFadeMaterialProperty.js";
 import GlobalConstant from "./core/GlobalConstant.js";
 import DrawHandler from "./core/DrawHandler.js";
 import ZLabelVisualizer from "./core/ZLabelVisualizer.js";
 
 import Map3dModule from "./Map3dModule.js";
 import SceneContext from "./SceneContext.js";
 import ZScene from "./ZScene.js";
 import IMap3D from "./IMap3D.js";
 import ZViewer from "./ZViewer.js";
 import ZDataSourceModel from "./models/ZDataSourceModel.js";
 import BaseWidget from "./widgets/BaseWidget.js";
 import CameraStateWidget from "./widgets/CameraStateWidget.js";
 import CopyrightWidget from "./widgets/CopyrightWidget.js";
 import DataCertifWidget from "./widgets/DataCertifWidget.js";
 import LegendWidget from "./widgets/LegendWidget.js";
 import MousePositionWidget from "./widgets/MousePositionWidget.js";
 import NavigationToolWidget from "./widgets/NavigationToolWidget.js";
 import ScaleBarWidget from "./widgets/ScaleBarWidget.js";
 import DrawToolWidget from "./widgets/DrawToolWidget.js";
 import MeasureToolWidget from "./widgets/MeasureToolWidget.js";
 import TooltipWidget from "./widgets/TooltipWidget.js";
 import WidgetCollection from "./widgets/WidgetCollection.js";
 
 import BdGeoConverterUtil from "./utils/BdGeoConverterUtil.js";
 import CommonUtil from "./utils/CommonUtil.js";
 import GeoCoordConverterUtil from "./utils/GeoCoordConverterUtil.js";
 import GeoJsonUtil from "./utils/GeoJsonUtil.js";
 import UIUtil from "./utils/UIUtil.js";
 import GeometryUtil from "./utils/GeometryUtil.js";
 import Model3DUtil from "./utils/Model3DUtil.js";
 import NavigationToolUtil from "./utils/NavigationToolUtil.js";
 import DistrictUtil from "./utils/DistrictUtil.js";
 import EffectUtil from "./utils/EffectUtil.js";
 import IdentifyUtil from "./utils/IdentifyUtil.js";
 
 import S3MTilesLayer from "./layers/S3MTiles/S3MTilesLayer.js";
 import EchartsLayer from "./layers/echarts/EchartsLayer.js";
 import ImageryProviderCollection from "./layers/ImageryProviderCollection.js";
 import TerrainProviderCollection from "./layers/TerrainProviderCollection.js";
 import TerrainProviderTypeEnum from "./layers/enum/TerrainProviderTypeEnum.js";
 import ImageryProviderTypeEnum from "./layers/enum/ImageryProviderTypeEnum.js";
 import ImageryProviderTileStyleEnum from "./layers/enum/ImageryProviderTileStyleEnum.js";
 import ArcGISImageryProvider from "./layers/provider/ArcGISImageryProvider.js";
 import BaiduImageryProvider from "./layers/provider/BaiduImageryProvider.js";
 import BaseImageryProvider from "./layers/provider/BaseImageryProvider.js";
 import BingImageryProvider from "./layers/provider/BingImageryProvider.js";
 import GaodeImageryProvider from "./layers/provider/GaodeImageryProvider.js";
 import GoogleImageryProvider from "./layers/provider/GoogleImageryProvider.js";
 import LocalImageryProvider from "./layers/provider/LocalImageryProvider.js";
 import UrlImageryProvider from "./layers/provider/UrlImageryProvider.js";
 import OSMImageryProvider from "./layers/provider/OSMImageryProvider.js";
 import TiandituImageryProvider from "./layers/provider/TiandituImageryProvider.js";
 import WMSImageryProvider from "./layers/provider/WMSImageryProvider.js";
 import WMTSImageryProvider from "./layers/provider/WMTSImageryProvider.js";
 import MapboxStyleImageryProvider from "./layers/provider/MapboxStyleImageryProvider.js";
 import MapboxImageryProvider from "./layers/provider/MapboxImageryProvider.js";
 
 
 import BaiduGeoCoderService from "./geocoder/BaiduGeoCoderService.js";
 import GaodeGeoCoderService from "./geocoder/GaodeGeoCoderService.js";
 import GeoCoderTypeEnum from "./geocoder/GeoCoderTypeEnum.js";
 import OSMGeoCoderService from "./geocoder/OSMGeoCoderService.js";
 import ZEvent from "./events/ZEvent.js";
 import LayerEventType from "./events/LayerEventType.js";
 import PickEventType from "./events/PickEventType.js";
 import ScreenSpaceEventType from "./events/ScreenSpaceEventType.js";
 import ViewerEventType from "./events/ViewerEventType.js";
 
 import CoordTypeEnum from "./enum/CoordTypeEnum.js";
 import DrawModeEnum from "./enum/DrawModeEnum.js";
 import ToolModeEnum from "./enum/ToolModeEnum.js";
 import ModelOffsetTypeEnum from "./enum/ModelOffsetTypeEnum.js";
 import OperationStatusEnum from "./enum/OperationStatusEnum.js";
 
 import BaseDataSource from "./datasources/BaseDataSource.js";
 import DataSourceLoader from "./datasources/DataSourceLoader.js";
 import DataSourceManager from "./datasources/DataSourceManager.js";
 import DataSourceTypeEnum from "./datasources/DataSourceTypeEnum.js";
 import DynamicImageryDataSource from "./datasources/DynamicImageryDataSource.js";
 import DistrictDataSource from "./datasources/DistrictDataSource.js";
 import DynamicDataSource from "./datasources/DynamicDataSource.js";
 import BasePrimitive from "./datasources/BasePrimitive.js";
 import WaterSurfacePrimitive from "./datasources/WaterSurfacePrimitive.js";
 import DynamicBillboardCollection from "./datasources/DynamicBillboardCollection.js";
 import ChangeablePrimitive from "./datasources/ChangeablePrimitive.js";
 import TileClassificationPrimitive from "./datasources/TileClassificationPrimitive.js";
 import ZGroundPrimitive from "./datasources/ZGroundPrimitive.js";
 
 import VideoDataSource from "./datasources/VideoDataSource.js";
 import ZPinBuilder from "./core/ZPinBuilder.js";
 import ZBillboard from "./core/ZBillboard.js";
 import ZColorMap from "./core/ZColorMap.js";
 
 
 import BloomLightShader from "./shaders/BloomLightShader.js";
 import CircleScanShader from "./shaders/CircleScanShader.js";
 import CircleWaveShader from "./shaders/CircleWaveShader.js";
 import PolylineTrailLinkShader from "./shaders/PolylineTrailLinkShader.js";
 import RadarScanShader from "./shaders/RadarScanShader.js";
 import WaterSurfaceShader from "./shaders/WaterSurfaceShader.js";
 
 
 /**
  * @module map3d
  * @class
  * @classdesc 三维GIS入口全局对象
  */
 let map3d = {
   name: "map3d",
   /**
    * @property {String} version 当前版本号
    */
   version: "2.0.1",
   /**
    * @property {String} engineType 内核引擎
    */
   engineType: EngineType.CESIUM,
   /**
    * @property {String} language 国际化语言
    */
   language: "zh-CN",
 
   /**
    * 创建场景对象
    * @methods
    * @param {string} divId 场景窗口容器ID
    * @param {Object} options 场景初始化参数
    * @param {Function} [initViewLoadedHandler=undefined] 初始视图定位完成后的回调方法
    * @returns {Promise.<Map3dModule>}
    */
   createScene: (divId, options, initViewLoadedHandler) => {
 
     let sc = new SceneContext(divId, options);
     sc.initViewLoadedHandler = initViewLoadedHandler;
 
     let mm = new Map3dModule(sc);
 
     return sc.init(mm).then(() => mm);
   },
 
   /**
    * 设置国际化语言
    * @param {String} lang 要设置的语言类型名称
    */
   setLanguage: (lang) => {
     this.language = lang;
   },
 
   /**
    * 显示等待提示掩膜
    */
   showLoadingDiv() {
     let loading = document.createElement("div");
     loading.setAttribute("class", "zgis3d zgis-loading");
     loading.innerHTML =
       '<div class="zgis-spinner1"><div class="zgis-double-bounce1"></div><div class="zgis-double-bounce2"></div></div>';
 
     document.body.prepend(loading);
   },
 
   /**
    * 隐藏等待提示掩膜
    */
   hideLoadingDiv() {
     let els = document.querySelectorAll(".zgis3d.zgis-loading");
     if (els) {
       for (let i = 0, len = els.length; i < len; ++i) {
         els[i].style.display = "none";
       }
     }
   },
 };
 
 Object.assign(map3d, {
   core: {
     Core,
     EngineType,
     Fullscreen,
     HttpRequest,
     IFrameMessage,
     EngineSearchEngineType,
     FixGltf,
     ZPinBuilder,
     ZBillboard,
     ZColorMap,
     GlobalConstant,
     DrawHandler,
     ArrowPolyline,
   },
   datasources: {
     BaseDataSource,
     BasePrimitive,
     ChangeablePrimitive,
     DataSourceLoader,
     DataSourceManager,
     DataSourceTypeEnum,
     DistrictDataSource,
     DynamicBillboardCollection,
     DynamicDataSource,
     DynamicImageryDataSource,
     TileClassificationPrimitive,
     VideoDataSource,
     WaterSurfacePrimitive,
     ZGroundPrimitive,
   },
   enum: {
     CoordTypeEnum,
     DrawModeEnum,
     ToolModeEnum,
     ModelOffsetTypeEnum,
     OperationStatusEnum,
   },
   events: {
     ZEvent,
     LayerEventType,
     PickEventType,
     ScreenSpaceEventType,
     ViewerEventType,
   },
   geocoder: {
     BaiduGeoCoderService,
     GaodeGeoCoderService,
     GeoCoderTypeEnum,
     OSMGeoCoderService,
   },
   layers: {
     echarts: {
       EchartsLayer,
     },
     s3mtiles: {
       S3MTilesLayer,
     },
     enum: {
       ImageryProviderTileStyleEnum,
       ImageryProviderTypeEnum,
       TerrainProviderTypeEnum,
     },
     provider: {
       ArcGISImageryProvider,
       BaiduImageryProvider,
       BaseImageryProvider,
       BingImageryProvider,
       GaodeImageryProvider,
       GoogleImageryProvider,
       LocalImageryProvider,
       UrlImageryProvider,
       OSMImageryProvider,
       TiandituImageryProvider,
       WMSImageryProvider,
       WMTSImageryProvider,
       MapboxStyleImageryProvider,
       MapboxImageryProvider,
     },
     ImageryProviderCollection,
     TerrainProviderCollection,
 
   },
   models: {
     ZDataSourceModel,
   },
   shaders: {
     BloomLightShader,
     CircleScanShader,
     CircleWaveShader,
     PolylineTrailLinkShader,
     RadarScanShader,
     WaterSurfaceShader,
   },
   utils: {
     BdGeoConverterUtil,
     CommonUtil,
     DistrictUtil,
     EffectUtil,
     GeoCoordConverterUtil,
     GeoJsonUtil,
     GeometryUtil,
     Model3DUtil,
     NavigationToolUtil,
     UIUtil,
     IdentifyUtil,
   },
   widgets: {
     BaseWidget,
     CameraStateWidget,
     CopyrightWidget,
     DataCertifWidget,
     DrawToolWidget,
     LegendWidget,
     MeasureToolWidget,
     MousePositionWidget,
     NavigationToolWidget,
     ScaleBarWidget,
     TooltipWidget,
     WidgetCollection,
   },
   IMap3D,
   SceneContext,
   ZScene,
   ZViewer,
 });
 
 export {
   map3d
 };