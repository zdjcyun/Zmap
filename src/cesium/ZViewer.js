/**
 * 场景视图类
 *
 * @date 2020-03-8
 * @author gisboss
 */

import CoordTypeEnum from "./enum/CoordTypeEnum.js";
import Core from "../core/Core.js";
import ImageryProviderCollection from "./layers/ImageryProviderCollection.js";
import GeoCoderTypeEnum from "./geocoder/GeoCoderTypeEnum.js";
import ImageryProviderTileStyleEnum from "./layers/enum/ImageryProviderTileStyleEnum.js";
import BaiduGeoCoderService from "./geocoder/BaiduGeoCoderService.js";
import GaodeGeoCoderService from "./geocoder/GaodeGeoCoderService.js";
import OSMGeoCoderService from "./geocoder/OSMGeoCoderService.js";
import TerrainProviderCollection from "./layers/TerrainProviderCollection.js";
import IFrameMessage from "../core/IFrameMessage.js";
import OperationStatusEnum from "./enum/OperationStatusEnum.js";
import ZEvent from "./events/ZEvent.js";
import ViewerEventType from "./events/ViewerEventType.js";
import ScreenSpaceEventType from "./events/ScreenSpaceEventType.js";
import PickEventType from "./events/PickEventType.js";
import LayerEventType from "./events/LayerEventType.js";
import DataSourceManager from "./datasources/DataSourceManager.js";
import GeoCoordConverterUtil from "./utils/GeoCoordConverterUtil.js";
import ZScene from "./ZScene.js";
import UIUtil from "./utils/UIUtil.js";
import WidgetCollection from "./widgets/WidgetCollection.js";
import CommonUtil from "./utils/CommonUtil.js";
import DrawModeEnum from "./enum/DrawModeEnum.js";
import DrawHandler from "./core/DrawHandler.js";
import GlobalConstant from "./core/GlobalConstant.js";

/**
 * 默认初始视图位置
 * @private
 */
const DEFAULT_VIEW = GlobalConstant.DEFAULT_VIEW;

const currentPickedPositionEntityId = Cesium.createGuid();

// 默认参数选项
let DEFAULT_CESIUM_OPTIONS = {
  contextOptions: {
    webgl: {
      alpha: false,
      depth: true,
      stencil: false,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false, //通过canvas.toDataURL()实现截图需要将该项设置为true
      failIfMajorPerformanceCaveat: false,
    },
    allowTextureFilterAnisotropic: true,
  },
  /*时间动画部件*/
  animation: true,
  timeline: true,
  /*底图图层选择部件,必须为false才能自定义底图图层*/
  baseLayerPicker: false,
  sceneModePicker: false,
  fullscreenButton: false,
  //shadows: true,
  mapMode2D: Cesium.MapMode2D.ROTATE,
  infoBox: true,
  homeButton: false,
  navigationHelpButton: false,
  navigation: false,
};

// 高亮选中颜色
const HIGHLIGHT_COLOR = GlobalConstant.HIGHLIGHT_COLOR;
const TILE_FEATURE_COLOR = Cesium.Color.fromAlpha(HIGHLIGHT_COLOR, 1);

// cesium 原生viewer对象
let __viewer = null;

// 保存临时选中的要素
let selectedFeature = {
  feature: undefined,
  originalColor: new Cesium.Color(),
};

let defaultLeftClickHandler = null;
let defaultLeftDblClickHandler = null;

let _timeoutId = null;

/**
 * @class
 * @classdesc 场景视图类
 */
class ZViewer {
  /**
   * 构造方法
   * @param {String} domId HTMLElement元素id
   * @param {Object} [options] 参数选项 
   * @property {Boolean} [options.enablePickEntity=true] 启用可拾取场景对象
   * @property {Boolean} [options.enableMovePickEntity=false] 启用鼠标移动时，可拾取场景对象。为了提升性能建议关闭
   * @property {String} [options.crs=CoordTypeEnum.wgs84] 默认坐标系类型为WGS84。
   * @property {String} [options.geocoder=GeoCoderTypeEnum.GC_DEFAULT] 地理编码参数名称。
   * @property {Object} [options.imageryProvider={id: 'google_img',showanno: true}] 影像底图配置参数。请参考{@link ImageryProviderCollection.DEFAULT_ITEMS}
   *
   * @example imageryProvider配置示例如下：
   * {
   *     id: 'google_img',//谷歌影像底图
   *     showanno: true // 是否显示注记图层
   * }
   *
   * @property {Object} [options.terrainProvider = TerrainProviderCollection.DEFAULT_TERRAIN_CONFIG] 默认地形配置参数。
   *
   * @example terrainProvider配置示例如下：
   * {
   *     id: 'defaultTerrain',// 默认无地形
   *     visible: true // 是否显示地形
   * }
   *
   * @property {Boolean} [options.animation=false] 是否显示动画部件。
   * @property {Boolean} [options.timeline=false] 是否显示时间轴部件。
   * @property {Boolean} [options.depthTestAgainstTerrain=false] 是否启用尝试测试。
   * @property {Number} [options.maximumZoomDistance=9600000] 最大缩放的距离，超过此距离不再缩放场景相机。
   *
   * @property {Object} [options.initView] 初始视图位置参数。
   *
   * @example initView 配置示例如下：
   * {
   *     destination: [112.87458961, 28.11690245,50],
   *     orientation: {
   *         pitch: -20,
   *     }
   * }
   * @property {Boolean} [options.isIFrame=false] 是否启用iFrame模式。
   * @property {Boolean} [options.enablePostMessage=false] 是否启用向父窗口发送拾取到的对象数据。当处于iFrame模式时有效
   * @property {Boolean} [options.disableDefaultLeftClickHandler=false] 取消默认左键单击处理
   * @property {Boolean} [options.disableDefaultLeftDblClick=false] 取消默认左键双击处理
   * @property {Object} [options.widgets] 界面UI部件参数配置对象。
   * @see {@link GeoCoderTypeEnum} 自定义地理编码名称
   */
  constructor(domId, options) {
    /**
     * @property {Object} options 源始传入的配置对象
     */
    this.options = Object.assign({
        domId: domId,
        isIFrame: false,
        enablePostMessage: true,
        crs: CoordTypeEnum.wgs84,
        enablePickEntity: true,
        enableMovePickEntity: false,
        geocoder: GeoCoderTypeEnum.GC_DEFAULT,
        imageryProvider: {
          id: "google_img",
          showanno: true,
        },
        theme: "zgis-theme-dark",
        highlightColor: HIGHLIGHT_COLOR,
      },
      options
    );

    /**
     * @property {HTMLElement} targetElement 根HTML对象
     */
    this.targetElement = this.getTargetElement();
    this.targetElement.classList.add("zgis3d-root");

    /**
     * 场景初始化完成事件。监听方法接收参数:function(zviewer){}
     * @type {ZEvent}
     */
    this.initialedEvent = ZEvent.getInstance(
      ViewerEventType.ON_VIEWER_INITIALED
    );

    /**
     * 场景初始视图定位完成事件。监听方法接收参数:function(zviewer){}
     * @type {ZEvent}
     */
    this.initViewLoadedEvent = ZEvent.getInstance(
      ViewerEventType.ON_VIEWER_INITVIEW_LOADED
    );

    /**
     * 场景地理坐标系发生改变事件。监听方法接收参数:function(newCrs,oldCrs,zviewer){}
     * @type {ZEvent}
     */
    this.crsChangedEvent = ZEvent.getInstance(
      ViewerEventType.ON_VIEWER_CRS_CHANGED
    );

    /**
     * 场景左键单击事件。监听方法接收参数:function({position:xx,data:xx}){}
     * @type {ZEvent}
     */
    this.leftClickEvent = ZEvent.getInstance(
      ScreenSpaceEventType.ON_LEFT_CLICK
    );

    /**
     * 场景左键双击事件。监听方法接收参数:function({position:xx,data:xx}){}
     * @type {ZEvent}
     */
    this.leftDblClickEvent = ZEvent.getInstance(
      ScreenSpaceEventType.ON_LEFT_DOUBLE_CLICK
    );

    /**
     * 场景鼠标移动事件。监听方法接收参数:function({position:xx,data:xx}){}
     * @type {ZEvent}
     */
    this.mouseMoveEvent = ZEvent.getInstance(
      ScreenSpaceEventType.ON_MOUSE_MOVE
    );

    /**
     * 场景拾取事件。监听方法接收参数:function(pickedEntity){}
     * @type {ZEvent}
     */
    this.pickEntityEvent = ZEvent.getInstance(PickEventType.ON_PICK_ENTITY);

    /**
     * 底图切换事件。监听方法接收参数:function(oldConfig,newConfig,zviewer){}
     * @type {ZEvent}
     */
    this.baseLayerToggleEvent = ZEvent.getInstance(
      LayerEventType.ON_BASELAYER_TOGGLE
    );

    /**
     * 地形切换事件。监听方法接收参数:function(oldConfig,newConfig,zviewer){}
     * @type {ZEvent}
     */
    this.terrainLayerToggleEvent = ZEvent.getInstance(
      LayerEventType.ON_TERRAINLAYER_TOGGLE
    );

    /**
     * 地理编码服务对象
     * @see BaiduGeoCoderService
     * @see GaodeGeoCoderService
     * @see OSMGeoCoderService
     */
    this.geocoder = null;

    /**
     * @property {ZScene} scene 场景对象。
     * @type {ZScene}
     */
    this.scene = new ZScene(this.options);

    /**
     * 系统默认已经实现的小部件
     */
    this.widgetCollection = undefined;

    /**
     * @property {Number} currentTool 当前场景正在使用的工具按钮，主要是绘图、测量工具。
     * @see {DrawModeEnum}
     */
    this.currentTool = DrawModeEnum.NULL;
  }

  /**
   * 初始化场景视图。一般不显示调用此方法，由ZSceneContext调用。
   */
  init() {
    //初始化底图配置
    initCRS(this, this.options);

    //初始化地理编码配置
    initGeoCoder(this, this.options);

    //初始化Cesium配置
    initCesiumViewer(this, this.options);

    //添加底图配置
    initImageryProvider(this, this.options);

    //添加地形配置
    initTerrainProvider(this, this.options);

    // 鼠标事件处理
    initScreenSpaceEventHandler(this, this.options);

    //初始化场景
    initScene(this, this.options);

    // 初始化UI
    initUI(this, this.options);

    //初始视图定位
    initView(this, this.options, () => {
      // 提交初始视图定位完成事件
      this.initViewLoadedEvent.raiseEvent(this);
    });

    // 提交初始化完成事件
    this.initialedEvent.raiseEvent(this);

    return this;
  }

  /**
   * 获取场景容器顶层元素对象
   * @returns {HTMLElement} div元素结点对象
   */
  getTargetElement() {
    if (this.targetElement) {
      return this.targetElement;
    }

    return document.getElementById(this.options.domId);
  }

  /**
   * 获取内部Cesium.Viewer实例对象
   * @returns {Cesium.Viewer} Cesium.Viewer实例
   */
  getCesiumViewer() {
    return __viewer;
  }

  /**
   * 切换底图图片图层配置
   * @param {Object} newConfig 新的配置参数。具体配置请参考{@see ImageryProviderCollection.DEFAULT_ITEMS}
   */
  toggleImageryProvider(newConfig) {
    let oldCfg = this.scene.imageryProviderConfigCache;
    imageryProviderRemoveHandler(this, oldCfg);

    let newcfg = imageryProviderAddHandler(this, newConfig);

    this.baseLayerToggleEvent.raiseEvent(newcfg, oldCfg, this);
  }

  /**
   * 切换地形配置
   * @param {Object} newConfig 新的配置参数。具体配置请参考{@see TerrainProviderCollection.DEFAULT_ITEMS}
   */
  toggleTerrainProvider(newConfig) {
    // 由于地形全场景只能是一个，不需要移除操作。添加地形即为替换
    terrainProviderAddHandler(this, newConfig);

    this.terrainLayerToggleEvent.raiseEvent(
      this.scene.terrainProviderConfigCache,
      newConfig,
      this
    );
  }

  /**
   * 移除地形
   */
  removeTerrain() {
    terrainProviderRemoveHandler(this);
  }

  /**
   * 从场景中拾取对象
   * @param {Cesium.Cartesian2} windowPosition 屏幕像素坐标
   * @returns {Cesium.Entity|undefined}
   */
  pickEntity(windowPosition) {
    let viewer = __viewer;
    if (selectedFeature.feature) {
      try {
        selectedFeature.feature.color = selectedFeature.originalColor;
      } catch (e) {}
      selectedFeature.feature = undefined;
    }

    let picked = viewer.scene.pick(windowPosition);
    if (!picked) {
      return picked;
    }
    if (picked instanceof Cesium.Cesium3DTileFeature) {
      selectedFeature.feature = picked;
      Cesium.Color.clone(picked.color, selectedFeature.originalColor);
      picked.color = TILE_FEATURE_COLOR;

      let propertyNames = picked.getPropertyNames();
      let selectedEntity = new Cesium.Entity({
        id: currentPickedPositionEntityId,
        feature: picked,
      });

      let intersection = viewer.scene.pickPosition(windowPosition);
      if (intersection) {
        selectedEntity.position = intersection;
      }

      let entityDesc = ['<table class="cesium-infoBox-defaultTable"><tbody>'];
      try {
        _.forEach(propertyNames, function (item) {
          let v = picked.getProperty(item);
          if (item.toLowerCase() === "name") {
            selectedEntity.name = v;
          }
          entityDesc.push(`<tr><th>${item}</th><td>${v}</td></tr>`);
        });
      } catch (error) {}
      entityDesc.push("</tbody></table>");
      selectedEntity.description = entityDesc.join("");

      viewer.selectedEntity = selectedEntity;

      return selectedEntity;
    } else {
      let id = Cesium.defaultValue(picked.id, picked.primitive.id);
      if (id instanceof Cesium.Entity) {
        return id;
      } else if (_.isString(id)) {
        return picked.primitive;
      }
    }

    return picked;
  }

  /**
   * 关闭或启用左键单击拾取实体功能
   * @param {Boolean} enabled 左键拾取功能是否启用
   * @param {Boolean} [disableDefaultLeftClickHandler=true] 取消默认的左键单击功能
   * @returns {Zviewer} Zviewer对象
   */
  enablePickEntiyEvent(enabled, disableDefaultLeftClickHandler = true) {
    this.options.enablePickEntity = enabled;
    this.options.disableDefaultLeftClickHandler = disableDefaultLeftClickHandler;
    return this;
  }

  /**
   * 获取左键单击拾取实体功能的配置选项
   * @returns {Object}
   */
  getPickEntityOption() {
    return {
      enablePickEntity: this.options.enablePickEntity,
      disableDefaultLeftClickHandler: this.options.disableDefaultLeftClickHandler
    }
  }

  /**
   * 向IFrame父窗口发送数据
   * @param {Cesium.Entity} selectedEntity 要发送的数据对象。
   */
  postIFrameMessage(selectedEntity) {
    let result = [];
    if (selectedEntity) {
      let msgData = {};
      let props = selectedEntity.properties;
      if (!props) {
        msgData.name = selectedEntity.name;
      } else {
        let propKeys = props.propertyNames;
        if (propKeys && propKeys.length) {
          propKeys.forEach((v, index) => {
            msgData[v] = props[v].getValue();
          });
        }
      }

      result.push(msgData);
    }
    IFrameMessage.postMessage({
      os: OperationStatusEnum.SCENE_QUERY_POINT,
      data: result,
    });
  }

  /**
   * 获取场景数据源封装对象，直接返回scene.dataSourceManager
   * @returns {DataSourceManager} 场景数据源集合对象
   */
  getDataSourceManager() {
    return this.scene.dataSourceManager;
  }

  /**
   * 加载数据源
   * @param {Array|Object} dataSourceOptions 数据源配置参数
   * @returns {Promise}
   */
  addDataSources(dataSourceOptions) {
    if (!dataSourceOptions || (_.isArray(dataSourceOptions) && !dataSourceOptions.length)) {
      return Cesium.when();
    }
    return this.scene.addDataSources(dataSourceOptions);
  }

  /**
   * 移除数据源
   * @param {Array|Object} dataSourceOptions 数据源配置参数
   * @returns {Promise}
   */
  removeDataSources(dataSourceOptions) {
    return this.scene.removeDataSources(dataSourceOptions);
  }

  /**
   * 更新场景的泛光效果
   * @param {Object} [options = { show: true, glowOnly: false,  contrast: 128,  brightness: -0.1, delta: 1.0,  sigma: 3.78,  stepSize: 5.0}] 泛光参数选项
   */
  updateSceneBloom(option) {
    const options = option || {
      show: true,
      glowOnly: false,
      contrast: 128,
      brightness: -0.1,
      delta: 1.0,
      sigma: 3.78,
      stepSize: 5.0,
    };

    let bloom = __viewer.scene.postProcessStages.bloom;
    bloom.enabled = Boolean(options.show);
    bloom.uniforms.glowOnly = Boolean(options.glowOnly);
    bloom.uniforms.contrast = Number(options.contrast);
    bloom.uniforms.brightness = Number(options.brightness);
    bloom.uniforms.delta = Number(options.delta);
    bloom.uniforms.sigma = Number(options.sigma);
    bloom.uniforms.stepSize = Number(options.stepSize);
  }


  /**
   * 更新场景的阴影效果
   * @param {Object} options 
   */
   updateSceneShadows(enabled) {
    __viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
    __viewer.scene.globe.enableLighting = enabled;
    __viewer.shadows = enabled;
    __viewer.terrainShadows = enabled;
    __viewer.scene.globe.shadows = enabled ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.DISABLED;
    __viewer.scene.shadowMap.enabled = Cesium.defaultValue(enabled, false);
  }

  /**
   * 光源
   * @param {Cesium.Cartesian3} lightDirection
   */
  updateSceneLight(lightDirection) {
    __viewer.scene.light =
      new Cesium.DirectionalLight({
        direction: lightDirection
      });
  }



  /**
   * 更新天空盒背景
   * @param {Cesium.SkyBox} skyBox
   */
  updateSkyBox(skyBox) {
    __viewer.scene.skyBox = skyBox || new Cesium.SkyBox({
      sources: {
        positiveX: Cesium.buildModuleUrl('Assets/Textures/SkyBox/posx.png'),
        negativeX: Cesium.buildModuleUrl('Assets/Textures/SkyBox/negx.png'),
        positiveY: Cesium.buildModuleUrl('Assets/Textures/SkyBox/posy.png'),
        negativeY: Cesium.buildModuleUrl('Assets/Textures/SkyBox/negy.png'),
        positiveZ: Cesium.buildModuleUrl('Assets/Textures/SkyBox/posz.png'),
        negativeZ: Cesium.buildModuleUrl('Assets/Textures/SkyBox/negz.png')
      }
    })
  }

  /**
   * 环境光遮蔽
   * @param {Object} aoOptions 参数对象。eg:{enabled:true,uniforms:{}}
   * @see {viewer.scene.postProcessStages.ambientOcclusion}
   */
  updateAmbientOcclusion(aoOptions) {
    aoOptions = aoOptions || {
      enabled: true,
      uniforms: {
        ambientOcclusionOnly: false,
        intensity: 3,
        bias: 0.1,
        lengthCap: 0.03,
        stepSize: 1,
        blurStepSize: 0.86
      }
    };
    let ambientOcclusion = __viewer.scene.postProcessStages.ambientOcclusion;
    ambientOcclusion.enabled = aoOptions.enabled;
    Object.assign(ambientOcclusion.uniforms, aoOptions.uniforms);
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.scene.destroy();
    __viewer.destroy();
    this.targetElement.innerHTML = null;
    this.scene = null;
    this.widgetCollection = null;
    __viewer = null;

    if (_timeoutId !== undefined) {
      clearTimeout(_timeoutId);
    }

    Cesium.destroyObject(this);
  }

  /**
   * 定位到指定的features集合或单个要素定位
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
  flyToFeatures(params, complete) {
    let geoJSONFeature = Cesium.clone(params.features, true);

    if (geoJSONFeature.type === "Feature") {
      geoJSONFeature = [geoJSONFeature];
    } else if (!Array.isArray(geoJSONFeature)) {
      UIUtil.error("params参数格式不正确，请使用数组或单个对象");
      return;
    }

    let collection = turf.featureCollection(geoJSONFeature);
    let bbox = turf.bbox(collection);

    let from = turf.point(_.take(bbox, 2));
    let to = turf.point(_.slice(bbox, 2));
    let distance = turf.distance(from, to);

    let destination;
    let height = GlobalConstant.LOCATION_VIEW_HEIGHT;
    //let boundingSphere;
    // 只是定位一个点
    if (distance * 1000 < 0.1) {
      let geom = collection.features[0].geometry;
      let pos = geom.coordinates;
      if (pos.length < 3) {
        pos.push(height);
      } else {
        height = pos[2];
      }

      if (!geom.crs) {
        geom.crs = CoordTypeEnum.wgs84;
      }

      if (geom.crs !== this.options.crs) {
        let r = GeoCoordConverterUtil.coordsConvert(
          geom.crs,
          this.options.crs,
          pos[0],
          pos[1]
        );
        pos[0] = r.x;
        pos[1] = r.y;
      }

      destination = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], pos[2]);
      // boundingSphere = new Cesium.BoundingSphere(destination, 0.0);
    } else {
      destination = Cesium.Rectangle.fromDegrees(bbox[0], bbox[1], bbox[2], bbox[3]);
      // boundingSphere = Cesium.BoundingSphere.fromRectangle2D(destination);
    }

    params.range = height;
    params.complete = complete;
    CommonUtil.camerFlyTo(__viewer.camera, destination, params);

    // __viewer.camera.flyToBoundingSphere(boundingSphere, {
    //   duration: params.duration || 3,
    //   complete: () => {
    //     __viewer.camera.moveBackward((params.orientation && params.orientation.range) || height*2);
    //     if (complete) {
    //       complete();
    //     }
    //   },
    //   endTransform: Cesium.Transforms.eastNorthUpToFixedFrame(destination),
    //   offset: params.orientation ? new Cesium.HeadingPitchRange(params.orientation.heading, params.orientation.pitch, params.orientation.range) : undefined
    // });


    return destination;
  }

  /**
   * 获取场景的当前视图参数
   * {
   *    destination: [longitude,latitude,height],
   *    orientation: {
   *      heading: 0,
   *      pitch: 0,
   *      roll: 0
   *    }
   * }
   * @returns {Object}
   */
  getCurrentCameraView() {
    const camera = __viewer.scene.camera;
    const cartographic = __viewer.camera.positionCartographic;
    const height = cartographic.height;
    const orientation = {
      heading: Cesium.Math.toDegrees(camera.heading),
      pitch: Cesium.Math.toDegrees(camera.pitch),
      roll: Cesium.Math.toDegrees(camera.roll)
    };

    return {
      destination: [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        height
      ],
      orientation: orientation
    };
  }



} //class

function initCesiumViewer(viewer, options) {
  let cesiumOptions = Cesium.combine(options, DEFAULT_CESIUM_OPTIONS);
  //先关闭默认的，后面切换底图图层时，这个默认的图层会一直存在并不断请求图片
  cesiumOptions.imageryProvider = false;

  __viewer = new Cesium.Viewer(options.domId, cesiumOptions);
  __viewer._cesiumWidget._supportsImageRenderingPixelated = Cesium.FeatureDetection.supportsImageRenderingPixelated();
  __viewer._cesiumWidget._forceResize = true;
  __viewer.geocoder.container.style.display = "none";
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    let vtxf_dpr = window.devicePixelRatio;
    // 适度降低分辨率
    while (vtxf_dpr >= 2.0) {
      vtxf_dpr = Math.max(vtxf_dpr / 2.0, 1.0);
    }
    __viewer.resolutionScale = vtxf_dpr;
  }

  // __viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
  // __viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // __viewer.extend(Cesium.viewerPerformanceWatchdogMixin);


  if (!Core.isPCBroswer()) {
    document.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );
  }

  toggleAnimationWidget(options.animation);
  toggleTimelineWidget(options.timeline);

  let scene = __viewer.scene;
  if (Cesium.defined(scene.sun)) {
    scene.sun.show = false;
  }
  if (Cesium.defined(scene.moon)) {
    scene.moon.show = false;
  }
  scene.camera.percentageChanged = 0.01;
  // 打开深度检测，那么在地形以下的对象不可见
  if (options.depthTestAgainstTerrain === undefined) {
    options.depthTestAgainstTerrain = false;
  }
  scene.globe.depthTestAgainstTerrain =
    options.depthTestAgainstTerrain;

  //开启全球光照，光照方向依据太阳方向
  scene.globe.enableLighting = true;
  // 没有影像图层时地球的底色
  scene.globe.baseColor = Cesium.Color.SKYBLUE;

  //限制最小最大缩放距离
  scene.screenSpaceCameraController.maximumZoomDistance = options.maximumZoomDistance || DEFAULT_VIEW.height;

  document.querySelector(".cesium-geocoder-input").setAttribute("placeholder", "输入地址或地标...");

  // 隐藏地球
  toggleGlobe(scene, options.globeHidden);

  //挂载拾取事件
  __viewer.pickEntityEvent = viewer.pickEntityEvent;

  // 视频纹理同步时钟
  __viewer.clock.shouldAnimate = true;
}

/**
 * 初始视图定位
 * @private
 * @param viewer
 * @param options
 * @param {Function} complete 定位完成回调
 */
function initView(viewer, options, complete) {
  let initView = options.initView || {};
  if (_.isEmpty(initView)) {
    viewer.options.initView = Object.assign(initView, {
      destination: [DEFAULT_VIEW.lng, DEFAULT_VIEW.lat, DEFAULT_VIEW.height],
    });
  }
  let initPosition = initView.destination;

  if (initPosition.length < 3) {
    initPosition.push(1000);
  }

  __viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(
      initPosition[0],
      initPosition[1],
      DEFAULT_VIEW.height
    ),
    duration: 2,
    complete: () => {
      if (!initView.orientation && initPosition[2] == DEFAULT_VIEW.height) {
        if (complete) {
          complete();
        }
        return;
      }

      if (initView.orientation) {
        if (initView.orientation.heading !== undefined) {
          initView.orientation.heading = Cesium.Math.toRadians(
            initView.orientation.heading
          );
        }
        if (initView.orientation.pitch !== undefined) {
          initView.orientation.pitch = Cesium.Math.toRadians(
            initView.orientation.pitch
          );
        }
        if (initView.orientation.roll !== undefined) {
          initView.orientation.roll = Cesium.Math.toRadians(
            initView.orientation.roll
          );
        }
      }

      __viewer.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegreesArrayHeights(
          initPosition
        )[0],
        duration: 3,
        orientation: initView.orientation,
        complete: complete,
      });
    },
  });
}

/**
 * 初始化scene对象
 * @private
 * @param viewer
 * @param options
 */
function initScene(viewer, options) {
  viewer.scene.init(viewer);

  if (options.addDataSources && options.ds) {
    //异步加载数据源
    viewer.scene.addDataSources(options.ds);
  }
}

/**
 * 根据底图配置保存相应坐标系代号
 * @private
 * @param viewer
 * @param options
 */
function initCRS(viewer, options) {
  let imgPrvCnf = ImageryProviderCollection.getImageryProviderConfig(
    options.imageryProvider
  );
  if (imgPrvCnf) {
    // 保存当前底图坐标系类型
    updateCrs(viewer, imgPrvCnf.crs);
  }
}

/**
 * 初始化底图配置
 * @private
 * @param viewer
 * @param options
 */
function initImageryProvider(viewer, options) {
  imageryProviderAddHandler(viewer, options.baseLayer);
}

function imageryProviderAddHandler(viewer, data) {
  let cfg = ImageryProviderCollection.getImageryProviderConfig(data);
  if (!cfg) {
    return;
  }
  let config = Cesium.clone(cfg, true);
  viewer.scene.imageryProviderConfigCache = config;
  let imgProvider = ImageryProviderCollection.getImageryProvider(
    __viewer,
    config
  );
  if (imgProvider) {
    imgProvider.addToViewer(__viewer, 0);
    viewer.scene.imageryProviderConfigCache.show = true;
  }

  //需要注记图层
  if (config.showanno) {
    let annoConfig = Cesium.clone(config, true);
    annoConfig.id =
      annoConfig.id + ImageryProviderTileStyleEnum.getAnnoSuffix();
    annoConfig.mapstyle = ImageryProviderTileStyleEnum.getAnnoMapStyle(
      config.mapstyle
    );

    let imgannoProvider = ImageryProviderCollection.getImageryProvider(
      __viewer,
      annoConfig
    );
    if (imgannoProvider) {
      imgannoProvider.addToViewer(__viewer, 1);
      viewer.scene.imageryProviderConfigCache.annoshow = true;
    }
  }

  // 保存当前底图坐标系类型
  updateCrs(viewer, config.crs);

  return cfg;
}

/**
 * 更新底图坐标系代号
 * @private
 * @param {ZViewer} zviewer
 * @param {Number} crs
 */
function updateCrs(zviewer, crs) {
  let changed = 0;
  const oldCrs = zviewer.options.crs;
  if (oldCrs !== crs) {
    changed = 1;
  }

  zviewer.options.crs = crs;
  if (zviewer.geocoder) {
    zviewer.geocoder.crs = crs;
  }

  if (__viewer) {
    __viewer.scene.crs = crs;
  }

  if (changed) {
    zviewer.crsChangedEvent.raiseEvent(crs, oldCrs, zviewer);
  }
}

function imageryProviderRemoveHandler(viewer, data) {
  if (!data) {
    return;
  }
  let config = ImageryProviderCollection.getImageryProviderConfig(data);
  if (!config) {
    return;
  }

  let imgProvider = ImageryProviderCollection.getImageryProvider(
    __viewer,
    config
  );
  if (imgProvider) {
    imgProvider.removeFromViewer(__viewer);
  }

  //需要注记图层
  if (config.showanno) {
    let annoConfig = Cesium.clone(config, true);
    annoConfig.id =
      annoConfig.id + ImageryProviderTileStyleEnum.getAnnoSuffix();
    annoConfig.mapstyle = ImageryProviderTileStyleEnum.getAnnoMapStyle(
      config.mapstyle
    );

    let imgannoProvider = ImageryProviderCollection.getImageryProvider(
      __viewer,
      annoConfig
    );
    if (imgannoProvider) {
      imgannoProvider.removeFromViewer(__viewer);
    }
  }
}

/**
 * 初始化地形配置
 * @private
 * @param viewer
 * @param options
 */
function initTerrainProvider(viewer, options) {
  let tp = options.terrainLayer;
  if (tp && tp.visible !== false) {
    terrainProviderAddHandler(viewer, tp);
  } else {
    // 默认无地形
    terrainProviderAddHandler(viewer, undefined);
  }
}

function terrainProviderAddHandler(viewer, data) {
  let config = TerrainProviderCollection.getTerrainProviderConfig(data);

  if (!config) {
    return;
  }

  let terrainConfig = Cesium.clone(config, true);
  viewer.scene.terrainProviderConfigCache = terrainConfig;

  let terrProvider = TerrainProviderCollection.getTerrainProvider(
    __viewer,
    terrainConfig
  );
  if (terrProvider) {
    TerrainProviderCollection.addToViewer(__viewer, terrProvider);
    terrainConfig.show = true;
  }
}

function terrainProviderRemoveHandler(viewer) {
  //用默认地形添加
  terrainProviderAddHandler(
    viewer,
    TerrainProviderCollection.DEFAULT_TERRAIN_CONFIG
  );
}

function initGeoCoder(viewer, options) {
  let gc = options.geocoder || GeoCoderTypeEnum.GC_DEFAULT;
  if (gc === GeoCoderTypeEnum.GC_DEFAULT || gc === false) {
    // 使用cesium默认参数
    return;
  }

  let opt = {
    crs: options.crs,
  };

  if (gc === GeoCoderTypeEnum.GC_BAIDU) {
    viewer.geocoder = new BaiduGeoCoderService(opt);
  } else if (gc === GeoCoderTypeEnum.GC_GAODE) {
    viewer.geocoder = new GaodeGeoCoderService(opt);
  } else if (gc === GeoCoderTypeEnum.GC_OSM) {
    viewer.geocoder = new OSMGeoCoderService(opt);
  }
}

/**
 * ui元素创建
 * @private
 * @param viewer
 * @param options
 */
function initUI(viewer, options) {
  viewer.widgetCollection = new WidgetCollection(viewer);

  // 工具处理器
  initToolHandler(viewer, options);

  //创建底部工具栏
  initBottomToolbarRoot(viewer, options);

  //创建右边工具栏
  initRightToolbarRoot(viewer, options);

  //创建UI部件
  initWidgets(viewer, options);
}

/**
 * 初始化绘图处理类
 * @private
 */
function initToolHandler(viewer, options) {
  viewer._drawHandler = new DrawHandler(viewer, options.drawOptions);
}

/**
 * 创建底部工具栏
 * @private
 */
function initBottomToolbarRoot(viewer, options) {
  let btbConfig = options.bottomToolbar;
  if (btbConfig !== undefined && !btbConfig) {
    return;
  }

  let className = options.theme;
  let classNames = "zgis-widget-btoolbar-root";
  if (className) {
    classNames += " " + className;
  }
  let lbtbRoot = document.createElement("div");
  lbtbRoot.setAttribute("class", classNames);

  viewer.targetElement.appendChild(lbtbRoot);

  viewer.widgetCollection.bottomToolbar = lbtbRoot;
}

/**
 * 创建右边工具栏
 * @private
 */
function initRightToolbarRoot(viewer, options) {
  let rtbConfig = options.rightToolbar;
  if (rtbConfig !== undefined && !rtbConfig) {
    return;
  }

  let rbtbRoot = document.createElement("div");
  rbtbRoot.setAttribute("class", "zgis-widget-rtoolbar-root");

  viewer.targetElement.appendChild(rbtbRoot);

  viewer.widgetCollection.rightToolbar = rbtbRoot;
}

/**
 * 创建UI部件
 * @private
 */
function initWidgets(viewer, options) {
  var widgetsOption = options.widgets || {};

  let bToolbar = viewer.widgetCollection.bottomToolbar;
  if (bToolbar) {
    if (
      widgetsOption.copyrightWidget === undefined ?
      true :
      widgetsOption.copyrightWidget
    ) {
      viewer.widgetCollection.addWidget(
        "copyrightWidget",
        viewer.widgetCollection.copyrightWidget(widgetsOption.copyrightWidget),
        bToolbar
      );
    }

    if (
      widgetsOption.dataCertifWidget === undefined ?
      true :
      widgetsOption.dataCertifWidget
    ) {
      viewer.widgetCollection.addWidget(
        "dataCertifWidget",
        viewer.widgetCollection.dataCertifWidget(
          widgetsOption.dataCertifWidget
        ),
        bToolbar
      );
    }

    if (
      widgetsOption.scaleBarWidget === undefined ?
      true :
      widgetsOption.scaleBarWidget
    ) {
      viewer.widgetCollection.addWidget(
        "scaleBarWidget",
        viewer.widgetCollection.scaleBarWidget(widgetsOption.scaleBarWidget),
        bToolbar
      );
    }

    if (
      widgetsOption.mousePositionWidget === undefined ?
      true :
      widgetsOption.mousePositionWidget
    ) {
      //添加相机位置信息组件
      viewer.widgetCollection.addWidget(
        "mousePositionWidget",
        viewer.widgetCollection.mousePositionWidget(
          widgetsOption.mousePositionWidget
        ),
        bToolbar
      );
    }

    if (
      widgetsOption.cameraStateWidget === undefined ?
      true :
      widgetsOption.cameraStateWidget
    ) {
      //添加相机位置信息组件
      viewer.widgetCollection.addWidget(
        "cameraStateWidget",
        viewer.widgetCollection.cameraStateWidget(
          widgetsOption.cameraStateWidget
        ),
        bToolbar
      );
    }
  } //bottomToolbar

  let rToolbar = viewer.widgetCollection.rightToolbar;
  if (rToolbar) {
    if (
      widgetsOption.navigationToolWidget === undefined ?
      true :
      widgetsOption.navigationToolWidget
    ) {
      viewer.widgetCollection.addWidget(
        "navigationToolWidget",
        viewer.widgetCollection.navigationToolWidget(
          widgetsOption.navigationToolWidget
        ),
        rToolbar
      );
    }

    // 绘图部件，默认不显示
    if (widgetsOption.drawToolWidget) {
      viewer.widgetCollection.addWidget(
        "drawToolWidget",
        viewer.widgetCollection.drawToolWidget(widgetsOption.drawToolWidget),
        rToolbar
      );
    }

    // 量测部件，默认不显示
    if (widgetsOption.measureToolWidget) {
      viewer.widgetCollection.addWidget(
        "measureToolWidget",
        viewer.widgetCollection.measureToolWidget(
          widgetsOption.measureToolWidget
        ),
        rToolbar
      );
    }

    // 拾取部件，默认不显示
    if (widgetsOption.identifyToolWidget) {
      viewer.widgetCollection.addWidget(
        "identifyToolWidget",
        viewer.widgetCollection.identifyToolWidget(
          widgetsOption.identifyToolWidget
        ),
        rToolbar
      );
    }

    // 布点部件，默认不显示
    if (widgetsOption.distributeToolWidget) {
      viewer.widgetCollection.addWidget(
        "distributeToolWidget",
        viewer.widgetCollection.distributeToolWidget(
          widgetsOption.distributeToolWidget
        ),
        rToolbar
      );
    }

  } //rightToolbar

  // 图例部件，默认不显示
  if (widgetsOption.legendWidget) {
    viewer.widgetCollection.addWidget(
      "legendWidget",
      viewer.widgetCollection.legendWidget(widgetsOption.legendWidget)
    );
  }
}

/**
 * 隐藏动画部件
 * @param {Boolean} flag 是否可见
 * @private
 */
function toggleAnimationWidget(flag) {
  let value = flag ? "visible" : "hidden";
  document.querySelector(
    ".cesium-viewer-animationContainer"
  ).style.visibility = value;
}

/**
 * 隐藏时间线部件
 * @param {Boolean} flag 是否可见
 * @private
 */
function toggleTimelineWidget(flag) {
  let value = flag ? "visible" : "hidden";
  document.querySelector(
    ".cesium-viewer-timelineContainer"
  ).style.visibility = value;
}

/**
 * 隐藏地球
 * @param {Cesium.scene} scene
 * @param {Boolean} flag 是否可见
 * @private
 */
function toggleGlobe(scene, globeHidden) {
  if (!globeHidden) {
    return;
  }
  if (scene.skyBox) {
    scene.skyBox.show = false;
  }

  scene.backgroundColor = Cesium.Color.BACK;
  if (scene.sun) {
    scene.sun.show = false;
  }
  if (scene.moon) {
    scene.moon.show = false;
  }
  if (scene.globe) {
    scene.globe.show = false;
  }
  scene.skyAtmosphere.show = false;
}



/**
 * 重新绑定鼠标事件
 * @private
 * @param {ZViewer} viewer
 * @param {Object} options
 */
function initScreenSpaceEventHandler(viewer, options) {
  defaultLeftClickHandler = __viewer.screenSpaceEventHandler.getInputAction(
    Cesium.ScreenSpaceEventType.LEFT_CLICK
  );
  __viewer.screenSpaceEventHandler.setInputAction((movement) => {
    if (_timeoutId !== undefined) {
      clearTimeout(_timeoutId);
    }

    if (viewer.currentTool !== DrawModeEnum.NULL) {
      return;
    }

    _timeoutId = window.setTimeout(
      () => onLeftClick.call(viewer, movement),
      GlobalConstant.LEFT_DOUBLE_CLICK_INTERVAL
    );
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  defaultLeftDblClickHandler = __viewer.screenSpaceEventHandler.getInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  __viewer.screenSpaceEventHandler.setInputAction((movement) => {
    if (_timeoutId !== undefined) {
      clearTimeout(_timeoutId);
    }

    if (viewer.currentTool !== DrawModeEnum.NULL) {
      return;
    }

    onLeftDblClick.call(viewer, movement);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


  __viewer.screenSpaceEventHandler.setInputAction((movement) => {

    if (viewer.currentTool !== DrawModeEnum.NULL) {
      return;
    }

    onMouseMove.call(viewer, movement);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function onLeftClick(movement) {
  let windowPoint = movement.position;
  __viewer.trackedEntity = undefined;
  if (!this.options.enablePickEntity) {
    if (
      !this.options.disableDefaultLeftClickHandler &&
      defaultLeftClickHandler
    ) {
      defaultLeftClickHandler(movement);
    }
    this.leftClickEvent.raiseEvent({
      position: windowPoint,
      data: undefined,
    });
    return;
  }

  let pickedEntity = this.pickEntity(windowPoint);

  if (this.options.enablePostMessage) {
    this.postIFrameMessage(pickedEntity);
  }

  this.pickEntityEvent.raiseEvent(pickedEntity, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 最后调用默认的事件处理函数
  if (!this.options.disableDefaultLeftClickHandler && defaultLeftClickHandler) {
    defaultLeftClickHandler(movement);
  }

  this.leftClickEvent.raiseEvent({
    position: windowPoint,
    data: pickedEntity,
  });
}

function onLeftDblClick(movement) {
  let windowPoint = movement.position;
  __viewer.trackedEntity = undefined;

  if (!this.options.enablePickEntity) {
    if (
      !this.options.disableDefaultLeftDblClickHandler &&
      defaultLeftDblClickHandler
    ) {
      defaultLeftDblClickHandler(movement);
    }
    this.leftDblClickEvent.raiseEvent({
      position: windowPoint,
      data: undefined,
    });
    return;
  }

  let pickedEntity = this.pickEntity(windowPoint);

  if (this.options.enablePostMessage) {
    this.postIFrameMessage(pickedEntity);
  }

  this.pickEntityEvent.raiseEvent(pickedEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  // 最后调用默认的事件处理函数
  if (
    !this.options.disableDefaultLeftDblClickHandler &&
    defaultLeftDblClickHandler
  ) {
    defaultLeftDblClickHandler(movement);
  }
  // 给外部发送双击事件
  this.leftDblClickEvent.raiseEvent({
    position: windowPoint,
    data: pickedEntity,
  });
}

function onMouseMove(movement) {
  let windowPoint = movement.endPosition;

  if (!this.options.enableMovePickEntity) {
    this.mouseMoveEvent.raiseEvent({
      position: windowPoint,
      data: undefined,
    });
    return;
  }


  __viewer.trackedEntity = undefined;
  let pickedEntity = this.pickEntity(windowPoint);
  // 取消焦点显示
  __viewer.selectedEntity = undefined;

  if (this.options.enablePostMessage) {
    this.postIFrameMessage(pickedEntity);
  }

  this.pickEntityEvent.raiseEvent(pickedEntity, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  this.mouseMoveEvent.raiseEvent({
    position: windowPoint,
    data: pickedEntity,
  });
}

/**
 * 打印屏幕位置对应的地理坐标
 * @param {Cesium.Viewer} viewer Viewer原生对象
 * @param {Cesium.Cartesian2} position 屏幕坐标
 */
ZViewer.debugCameraPosition = (viewer, position) => {
  let mousePos = CommonUtil.pickPosition(viewer.scene, position);
  let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
    mousePos
  );

  console.log({
    longitude: (cartographic.longitude / Math.PI) * 180,
    latitude: (cartographic.latitude / Math.PI) * 180,
    height: cartographic.height,
  });
};



export default ZViewer;