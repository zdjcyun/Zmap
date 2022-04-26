/*
 * @Author: gisboss
 * @Date: 2021-01-22 18:51:41
 * @LastEditors: gisboss
 * @LastEditTime: 2022-01-08 15:39:15
 * @Description: file content
 */

import ZEvent from "../events/ZEvent.js";
import DrawModeEnum from "../enum/DrawModeEnum.js";
import CommonUtil from "../utils/CommonUtil.js";
import GlobalConstant from "./GlobalConstant.js";
import ZPinBuilder from "./ZPinBuilder.js";

let _timeoutId = null;

/**
 * 默认点和标注风格
 * @private
 */
let DEFAULT_STYLE = {
  ellipse: {
    show: true,
    heightReference: Cesium.HeightReference.NONE,
    //height: 0,
    //extrudedHeight: 0,
    material: Cesium.Color.YELLOW.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 6,
    classificationType: Cesium.ClassificationType.BOTH,
  },
  polygon: {
    heightReference: Cesium.HeightReference.NONE,
    perPositionHeight: true,
    //height: 0,
    //extrudedHeight: 0,
    material: Cesium.Color.YELLOW.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 6,
    classificationType: Cesium.ClassificationType.BOTH,
  },
  rectangle: {
    heightReference: Cesium.HeightReference.NONE,
    //height: 0,
    //extrudedHeight: 0,
    //rotation: Cesium.Math.PI_OVER_FOUR,
    material: Cesium.Color.YELLOW.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 6,
    classificationType: Cesium.ClassificationType.BOTH,
  },
  polyline: {
    show: true,
    positions: undefined,
    width: 3,
    clampToGround: false,
    material: new Cesium.PolylineGlowMaterialProperty({
      color: Cesium.Color.YELLOW,
    }),
    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
      color: Cesium.Color.RED,
    }),
    classificationType: Cesium.ClassificationType.BOTH,
  },
  point: {
    pixelSize: 6,
    color: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 1,
    heightReference: Cesium.HeightReference.NONE,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 1.0e7),
  },
  billboard: {
    image: '',
    width: GlobalConstant.MARKER_SIZE,
    height: GlobalConstant.MARKER_SIZE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    // disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e6, 0),
  },
  label: {
    font: GlobalConstant.LABEL_FONT,
    pixelOffset: Cesium.Cartesian2.fromElements(0, -GlobalConstant.MARKER_SIZE),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e6, 0),
    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e7, 0),
    fillColor: GlobalConstant.LABEL_FILL,
    outlineColor: GlobalConstant.LABEL_OUTLINE_COLOR,
    outlineWidth: GlobalConstant.LABEL_OUTLINE_WIDTH,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    heightReference: Cesium.HeightReference.NONE,
    // disableDepthTestDistance: Number.POSITIVE_INFINITY,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 1.0e7),
  },
};


const entityHander = {
  [DrawModeEnum.POINT]: addPointEntity,
  [DrawModeEnum.POLYLINE]: addPolylineEntity,
  [DrawModeEnum.POLYGON]: addPolygonEntity,
  [DrawModeEnum.RECTANGLE]: addRectangleEntity,
  [DrawModeEnum.CIRCLE]: addCircleEntity,
  [DrawModeEnum.MARKER]: addMarkerEntity,
}

let activeShapePoints = [];
let activeShape;
let floatPoint;

/**
 * @class map3d.core.DrawHandler
 * @classdesc 绘图工具部件
 *
 * @constructor
 * @param {ZViewer} viewer viewer对象
 * @param {Object} [options] 绘制风格，包含空间、贴地、贴对象
 */
class DrawHandler {
  constructor(viewer, options) {
    options = Cesium.defaultValue(options, {});

    this.viewer = viewer;
    /**
     * @property {DrawModeEnum} [drawMode=DrawModeEnum.NULL] 绘图模式，包含点、线、面、标注、圆、矩形
     */
    this.drawMode = DrawModeEnum.NULL;

    /**
     * @property {Cesium.HeightReference} [heightReference=Cesium.HeightReference.NONE] 实体的高程参考类型
     */
    this.heightReference = Cesium.defaultValue(options.heightReference, Cesium.HeightReference.NONE);

    this._graphicsDataSource = undefined;

    /**
     * @property {Boolean} [isClear=false] 每次添加新实体对象前是否清除原来的对象
     */
    this.isClear = Cesium.defaultValue(options.isClear, false);

    /**
     * @property {ZEvent} activeEvent 绘制工具的激活事件
     */
    this.activeEvent = ZEvent.getInstance("activeEvent");

    /**
     * @property {ZEvent} deactiveEvent 绘制工具取消事件
     */
    this.deactiveEvent = ZEvent.getInstance("deactiveEvent");

    /**
     * @property {ZEvent} drawCompleteEvent 绘制完成事件,监听绘制完成的事件，获取当前绘制结果
     */
    this.drawCompleteEvent = ZEvent.getInstance("drawCompleteEvent");

    // 添加鼠标文本提示组件
    const wKey = "tooltipWidget";
    let tw = this.viewer.widgetCollection.getWidget(wKey);
    if (tw) {
      this._tooltip = tw;
    } else {
      this._tooltip = this.viewer.widgetCollection.tooltipWidget({
        zviewer: this.viewer,
      });
      this.viewer.widgetCollection.addWidget(wKey, this._tooltip);
    }


    this._eventHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.getCesiumViewer().scene.canvas
    );

    this._eventHandler.setInputAction((movement) => {
      if (_timeoutId !== undefined) {
        clearTimeout(_timeoutId);
      }
      _timeoutId = window.setTimeout(
        () => onLeftClick.call(this, movement),
        GlobalConstant.MOUSE_DBL_CLICK_INTERVAL
      );
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this._eventHandler.setInputAction(
      onLeftDblClick.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    this._eventHandler.setInputAction(
      onMouseMove.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    this._eventHandler.setInputAction(
      onMouseRightClick.bind(this),
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
  }


  /**
   * 激活工具
   * @param {DrawModeEnum} drawMode 绘制模式
   */
  activate(drawMode, tooltip) {
    if (drawMode == undefined) {
      throw new Cesium.DeveloperError("drawMode is required.");
    }
    this.drawMode = drawMode;
    this.viewer.currentTool = drawMode;

    if (tooltip) {
      this._tooltip._message = tooltip;
    }

    this.activeEvent.raiseEvent(drawMode, tooltip);
  }

  /**
   * 清除所有图元
   */
  clear() {
    this.viewer.getDataSourceManager().clearCachedDataSource();
  }

  /**
   * 添加绘制的图形对象
   * @param {Object} entity 
   * @returns {Cesium.Entity}
   */
  addCachedEntity(entity) {
    if (this.isClear) {
      this.clear();
    }
    return this.viewer.getDataSourceManager().addCachedEntity(entity);
  }

  /**
   * 使工具无效
   */
  deactivate() {
    let oldMode = this.drawMode;

    this.drawMode = DrawModeEnum.NULL;
    this.viewer.currentTool = DrawModeEnum.NULL;
    this._tooltip._message = undefined;
    this._tooltip.hide();
    this.deactiveEvent.raiseEvent(oldMode);
  }

  destroy() {
    if (_timeoutId !== undefined) {
      clearTimeout(_timeoutId);
    }
    this.viewer = null;
    this._tooltip.destroy();
    this._eventHandler.destroy();
    Cesium.destroyObject(this);
  }
}

function isActive() {
  return this.drawMode !== DrawModeEnum.NULL;
}

function onLeftClick(movement) {
  if (!isActive.call(this)) {
    this._tooltip.hide();
    return;
  }

  let scene = this.viewer.getCesiumViewer().scene;

  if (scene.mode === Cesium.SceneMode.MORPHING) {
    return;
  }

  let result = CommonUtil.pickPosition(scene, movement.position);
  if (!result) {
    return;
  }

  let finished = false;
  if (this.drawMode === DrawModeEnum.POINT || this.drawMode === DrawModeEnum.MARKER ||
    (floatPoint && this.drawMode === DrawModeEnum.RECTANGLE) ||
    (floatPoint && this.drawMode === DrawModeEnum.CIRCLE)) {
    finished = true;
    floatPoint = false;
  }

  entityHander[this.drawMode].call(this, result, finished);
}

function onLeftDblClick(movement) {
  if (_timeoutId !== undefined) {
    clearTimeout(_timeoutId);
  }

  if (!isActive.call(this)) {
    this._tooltip.hide();
    return;
  }

  let scene = this.viewer.getCesiumViewer().scene;

  if (scene.mode === Cesium.SceneMode.MORPHING) {
    return;
  }

  // 只有画线和面的时，双击结束 
  if (this.drawMode !== DrawModeEnum.POLYLINE && this.drawMode !== DrawModeEnum.POLYGON) {
    return;
  }

  let result = CommonUtil.pickPosition(scene, movement.position);
  if (!result) {
    return;
  }

  entityHander[this.drawMode].call(this, result, true);
}

function onMouseMove(movement) {
  if (!isActive.call(this)) {
    this._tooltip.hide();
    return;
  }
  let windowPoint = movement.endPosition;

  this._tooltip.showAtScreen(windowPoint, this._tooltip._message);

  // 只有画线和面的时，双击结束 
  if (this.drawMode !== DrawModeEnum.POLYLINE &&
    this.drawMode !== DrawModeEnum.POLYGON &&
    this.drawMode !== DrawModeEnum.RECTANGLE &&
    this.drawMode !== DrawModeEnum.CIRCLE) {
    return;
  }

  let scene = this.viewer.getCesiumViewer().scene;

  if (scene.mode === Cesium.SceneMode.MORPHING) {
    return;
  }

  let result = CommonUtil.pickPosition(scene, windowPoint);
  if (!result) {
    return;
  }

  if (floatPoint) {
    let c = activeShapePoints.length;
    if ((c > 1 && this.drawMode === DrawModeEnum.POLYLINE) ||
      (c > 2 && this.drawMode === DrawModeEnum.POLYGON) ||
      (c > 1 && this.drawMode === DrawModeEnum.RECTANGLE) ||
      (c > 1 && this.drawMode === DrawModeEnum.CIRCLE)) {
      activeShapePoints.pop();
    }
    activeShapePoints.push(result);
  }

}


function onMouseRightClick(movement) {
  if (_timeoutId !== undefined) {
    clearTimeout(_timeoutId);
  }
  if (this.drawMode !== DrawModeEnum.POLYLINE && this.drawMode !== DrawModeEnum.POLYGON) {
    return;
  }

  if (floatPoint) {
    let count = activeShapePoints.length;
    if ((count <= 2 && this.drawMode === DrawModeEnum.POLYLINE) || (count <= 3 && this.drawMode === DrawModeEnum.POLYGON)) {
      activeShapePoints = [];
      floatPoint = false;
    } else {
      activeShapePoints.pop();
    }
  }
}


//添加点
function addPointEntity(position, finished) {
  let entity = this.addCachedEntity({
    position: position,
    point: Cesium.clone(DEFAULT_STYLE.point, true),
  });

  if (finished) {
    entity.point.heightReference = this.heightReference;
    this.drawCompleteEvent.raiseEvent(entity, this);
    finishDraw(this.drawMode);
  }
  return entity;

  // // Create a circle.
  // var circle = new Cesium.CircleGeometry({
  //   center: position,
  //   radius: 10.0,
  // });
  // let pointPrimitive = new ChangeablePrimitive({
  //   id: '123456',
  //   geometry: circle
  // });
  // this.viewer.getCesiumViewer().scene.primitives.add(pointPrimitive);

  // if (finished) {
  //   pointPrimitive.heightReference = this.heightReference;
  //   this.drawCompleteEvent.raiseEvent(pointPrimitive);
  // }
  // return pointPrimitive;
}

/**
 * 线插入点
 * @private
 * @param {Cesium.Cartesian3} position 
 * @param {Boolean} finished 是否结束绘制
 * @returns {Cesium.Entity}
 */
function addPolylineEntity(position, finished) {
  if (activeShapePoints.length === 0) {
    floatPoint = true;
    activeShapePoints.push(position);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return activeShapePoints;
    }, false);

    let lineOpts = Cesium.clone(DEFAULT_STYLE.polyline);
    lineOpts.positions = dynamicPositions;
    activeShape = this.addCachedEntity({
      polyline: lineOpts,
    });
    return activeShape;
  }

  activeShapePoints.pop();
  activeShapePoints.push(position);
  activeShapePoints.push(position); //要加两次

  if (finished) {
    activeShapePoints.pop();
    activeShape.polyline.positions = activeShapePoints;
    if (this.heightReference === Cesium.HeightReference.CLAMP_TO_GROUND) {
      activeShape.polyline.clampToGround = true;
    }
    this.drawCompleteEvent.raiseEvent(activeShape, this);
    finishDraw(this.drawMode);
  }

  return activeShape;
}

function addPolygonEntity(position, finished) {
  if (activeShapePoints.length === 0) {
    floatPoint = true;
    activeShapePoints.push(new Cesium.Cartesian3(position.x + 0.001, position.y, position.z));
    activeShapePoints.push(position);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return new Cesium.PolygonHierarchy(activeShapePoints);
    }, false);

    let polygonOpts = Cesium.clone(DEFAULT_STYLE.polygon);
    polygonOpts.hierarchy = dynamicPositions;
    activeShape = this.addCachedEntity({
      polygon: polygonOpts,
    });
    return activeShape;
  }

  activeShapePoints.pop();
  activeShapePoints.push(position);
  activeShapePoints.push(position); //要加两次

  if (finished) {
    //删除第一个点
    activeShapePoints.shift();
    activeShapePoints.pop();
    activeShape.polygon.heightReference = this.heightReference;
    if (this.heightReference === Cesium.HeightReference.CLAMP_TO_GROUND) {
      activeShape.polygon.perPositionHeight = false;
      activeShape.polygon.height = 0.0;
      activeShape.polygon.hierarchy = {
        positions: activeShapePoints
      };
    } else {
      activeShape.polygon.hierarchy = new Cesium.PolygonHierarchy(activeShapePoints);
      activeShape.polygon.perPositionHeight = true;
    }

    this.drawCompleteEvent.raiseEvent(activeShape, this);
    finishDraw(this.drawMode);
  }

  return activeShape;
}

function addCircleEntity(position, finished) {
  if (activeShapePoints.length === 0) {
    floatPoint = true;
    activeShapePoints.push(position);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return activeShapePoints.length < 2 ? 0.0 : Cesium.Cartesian3.distance(activeShapePoints[0], activeShapePoints[1]);
    }, false);

    let polygonOpts = Cesium.clone(DEFAULT_STYLE.ellipse);
    polygonOpts.semiMajorAxis = dynamicPositions;
    polygonOpts.semiMinorAxis = dynamicPositions;
    let firstPoint = this.viewer.getCesiumViewer().scene.globe.ellipsoid.cartesianToCartographic(position);
    polygonOpts.height = firstPoint.height;
    activeShape = this.addCachedEntity({
      ellipse: polygonOpts,
      position: position,
    });
    return activeShape;
  }
  activeShapePoints.pop();
  activeShapePoints.push(position);

  if (finished) {
    activeShape.ellipse.heightReference = this.heightReference;
    if (this.heightReference === Cesium.HeightReference.CLAMP_TO_GROUND) {
      activeShape.ellipse.height = 0.0;
    } else {

    }
    let radius = Cesium.Cartesian3.distance(activeShapePoints[0], activeShapePoints[1]);
    activeShape.ellipse.semiMajorAxis = radius;
    activeShape.ellipse.semiMinorAxis = radius;

    this.drawCompleteEvent.raiseEvent(activeShape, this);
    finishDraw(this.drawMode);
  }

  return activeShape;
}


function addRectangleEntity(position, finished) {
  if (activeShapePoints.length === 0) {
    floatPoint = true;
    activeShapePoints.push(position);
    let dynamicPositions = new Cesium.CallbackProperty(function () {
      return Cesium.Rectangle.fromCartesianArray(activeShapePoints);
    }, false);

    let polygonOpts = Cesium.clone(DEFAULT_STYLE.rectangle);
    polygonOpts.coordinates = dynamicPositions;
    let firstPoint = this.viewer.getCesiumViewer().scene.globe.ellipsoid.cartesianToCartographic(position);
    polygonOpts.height = firstPoint.height;
    activeShape = this.addCachedEntity({
      rectangle: polygonOpts,
    });
    return activeShape;
  }
  activeShapePoints.pop();
  activeShapePoints.push(position);

  if (finished) {
    activeShape.rectangle.heightReference = this.heightReference;
    if (this.heightReference === Cesium.HeightReference.CLAMP_TO_GROUND) {
      activeShape.rectangle.height = 0.0;
    } else {

    }

    activeShape.rectangle.coordinates = Cesium.Rectangle.fromCartesianArray(activeShapePoints);

    this.drawCompleteEvent.raiseEvent(activeShape, this);
    finishDraw(this.drawMode);
  }

  return activeShape;
}


function addMarkerEntity(position, finished) {

  let entity = this.addCachedEntity({
    position: position,
    billboard: Cesium.clone(DEFAULT_STYLE.billboard, true),
    label: Cesium.clone(DEFAULT_STYLE.label, true),
  });

  if (finished) {
    entity.billboard.image = new ZPinBuilder().fromMakiIconIdByImage('marker-no', GlobalConstant.MARKER_HIGHLIGHT_COLOR, GlobalConstant.MARKER_SIZE);
    entity.billboard.heightReference = this.heightReference;
    entity.label.heightReference = this.heightReference;
    this.drawCompleteEvent.raiseEvent(entity, this);

    finishDraw(this.drawMode);
  }
  return entity;
}

function finishDraw(drawMode) {
  floatPoint = false;
  activeShape = undefined;
  activeShapePoints = [];
}

DrawHandler.DEFAULT_STYLE = DEFAULT_STYLE;


export default DrawHandler;