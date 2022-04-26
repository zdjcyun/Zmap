import ZGraphic from '../ZGraphic.js';
import ZSpatialReference from '../ZSpatialReference.js';
import ZDrawEvent from '../event/ZDrawEvent.js';
import ZMapEvent from '../event/ZMapEvent.js';
import ZPoint from '../geometry/ZPoint.js';
import ZMultiPoint from '../geometry/ZMultiPoint.js';
import ZPolyline from '../geometry/ZPolyline.js';
import ZPolygon from '../geometry/ZPolygon.js';
import ZMultiPolygon from '../geometry/ZMultiPolygon.js';
import ZCircle from '../geometry/ZCircle.js';
import ZSimpleMarkerSymbol from '../symbol/ZSimpleMarkerSymbol.js';
import ZSimpleLineSymbol from '../symbol/ZSimpleLineSymbol.js';
import ZSimpleFillSymbol from '../symbol/ZSimpleFillSymbol.js';

var sketch = null;
var geomertryChangeListener = null;


/**
 * @exports ZDrawTool
 * @classdesc 绘图工具类
 * @class
 * @param {ZMap} map 地图对象实例
 * @param {ZGraphicsLayer} layer 临时图层对象
 */
class ZDrawTool {
    constructor(map, layer) {
        this.map = map;
        //草绘图形符号
        this.markerSymbolSketch = ZSimpleMarkerSymbol.DEFAULT;
        this.lineSymbolSketch = ZSimpleLineSymbol.DEFAULT;
        this.fillSymbolSketch = ZSimpleFillSymbol.DEFAULT;
        //图层图形符号
        this.markerSymbol = null;
        this.lineSymbol = null;
        this.fillSymbol = null;

        this.handle = {};
        this.layer = layer;
        this.source = layer.__source; //new ol.source.Vector();//
        this.geometryChangeHandler = null;

        this.__1 = new ol.interaction.Draw({
            source: this.source,
            style: this.markerSymbolSketch.__,
            type: ZDrawTool.POINT
        });
        this.__1.setActive(false);

        this.__2 = new ol.interaction.Draw({
            source: this.source,
            style: this.lineSymbolSketch.__,
            finishCondition: ol.events.condition.doubleClick,
            type: ZDrawTool.POLYLINE,
            freehand: false
        });
        this.__2.setActive(false);

        this.__3 = new ol.interaction.Draw({
            source: this.source,
            style: this.fillSymbolSketch.__,
            //bug fixme ,cannot finish
            //finishCondition: ol.events.condition.doubleClick,
            type: ZDrawTool.POLYGON,
            freehand: false
        });
        this.__3.setActive(false);

        this.__4 = new ol.interaction.Draw({
            source: this.source,
            style: this.fillSymbolSketch.__,
            type: ZDrawTool.EXTENT,
            geometryFunction: new ol.interaction.Draw.createBox(),
            freehand: true
        });
        this.__4.setActive(false);

        this.__5 = new ol.interaction.Draw({
            source: this.source,
            style: this.fillSymbolSketch.__,
            type: ZDrawTool.CIRCLE,
            freehand: true
        });
        this.__5.setActive(false);

        this.map.__.addInteraction(this.__1);
        this.map.__.addInteraction(this.__2);
        this.map.__.addInteraction(this.__3);
        this.map.__.addInteraction(this.__4);
        this.map.__.addInteraction(this.__5);

        var self = this;
        this.map.__.on(ZMapEvent.MOUSEDOUBLECLICK, function (mapEvt) {
            //polyline双击绘制结束
            self.__2.finishDrawing();
        });

        //保存原来的图层选择状态
        this.mapLayerSelectState = this.map.getLayerSelectActive();
    }

    /**
     * 设置几何图形变化事件的处理函数。当草绘图形坐标发生变化就会调用此方法
     * @param {function} handler 处理方法
     */
    setGeometryChangeHandler(handler) {
        this.geometryChangeHandler = handler;
    }

    /**
     * 设置点符号
     * @param {ZSimpleMarkerSymbol} symbol 点符号对象
     */
    setMarkerSymbolSketch(symbol) {
        this.markerSymbolSketch = symbol;
        this.__1.getOverlay().setStyle(symbol.__);
    }

    /**
     * 获取点符号
     * @returns {ZSimpleMarkerSymbol}
     */
    getMarkerSymbolSketch() {
        return this.markerSymbolSketch;
    }

    /**
     * 设置线符号
     * @param {ZSimpleLineSymbol} symbol 线符号对象
     */
    setLineSymbolSketch(symbol) {
        this.lineSymbolSketch = symbol;
        this.__2.getOverlay().setStyle(symbol.__);
    }

    /**
     * 获取线符号
     * @returns {ZSimpleLineSymbol}
     */
    getLineSymbolSketch() {
        return this.lineSymbolSketch;
    }

    /**
     * 设置填充符号
     * @param {ZSimpleFillSymbol} symbol 面填充符号对象
     */
    setFillSymbolSketch(symbol) {
        this.fillSymbolSketch = symbol;
        this.__3.getOverlay().setStyle(symbol.__);
    }

    /**
     * 获取填充符号
     * @returns {ZSimpleFillSymbol}
     */
    getFillSymbolSketch() {
        return this.fillSymbolSketch;
    }



    /**
     * 添加绘图事件监听
     * @param {ZDrawEvent} eventType 绘图事件名
     * @param {function} callback 回调方法。如果是Draw_End事件，则回调方法接收一个ZGraphic参数。
     * 其它事件类型则接收原生事件对象。
     */
    on(eventType, callback) {
        var self = this;
        var drawTool;
        if (this.__1.getActive()) {
            drawTool = this.__1;
        } else if (this.__2.getActive()) {
            drawTool = this.__2;
        } else if (this.__3.getActive()) {
            drawTool = this.__3;
        } else if (this.__4.getActive()) {
            drawTool = this.__4;
        } else if (this.__5.getActive()) {
            drawTool = this.__5;
        }
        var _eventType = eventType;
        if (eventType === ZDrawEvent.DRAW_START) {
            _eventType = 'drawstart';
            var drawStart = function (drawEvent) {
                _drawStartHandler(drawEvent, drawTool, callback, self)
            };
            self.handle[eventType]._drawStartHandler = drawStart;
            drawTool.on(_eventType, drawStart);
        } else if (eventType === ZDrawEvent.DRAW_COMPLETE) {
            _eventType = 'drawend';
            var drawEnd = function (drawEvent) {
                _drawEndHandler(drawEvent, drawTool, callback, self);
                //dispatchEvent
            };
            self.handle[eventType]._drawEndHanlder = drawEnd;
            drawTool.on(_eventType, drawEnd);

        } else {
            drawTool.on(_eventType, callback);
        }
    }


    /**
     * 激活工具
     * @param {string} drawType 绘图类型。可选值：ZDrawTool.POINT，ZDrawTool.POLYLINE，ZDrawTool.POLYGON，ZDrawTool.EXTENT，ZDrawTool.CIRCLE
     */
    activate(drawType) {
        var self = this;
        self.deactivate();
        if (drawType === ZDrawTool.POINT) {
            self.__1.setActive(true);
        } else if (drawType === ZDrawTool.POLYLINE) {
            self.__2.setActive(true);
        } else if (drawType === ZDrawTool.POLYGON) {
            self.__3.setActive(true);
        } else if (drawType === ZDrawTool.EXTENT) {
            self.__4.setActive(true);
        } else if (drawType === ZDrawTool.CIRCLE) {
            self.__5.setActive(true);
        }
    }

    /**
     * 设置工具失效
     */
    deactivate() {
        this.__1.setActive(false);
        this.__2.setActive(false);
        this.__3.setActive(false);
        this.__4.setActive(false);
        this.__5.setActive(false);

        this.__1.getOverlay().getSource().clear();
        this.__2.getOverlay().getSource().clear();
        this.__3.getOverlay().getSource().clear();
        this.__4.getOverlay().getSource().clear();
        this.__5.getOverlay().getSource().clear();

        // unset sketch
        sketch = null;
        if (geomertryChangeListener) {
            ol.Observable.unByKey(geomertryChangeListener);
        }
        //还原图层选择状态
        this.map.setLayerSelectActive(this.mapLayerSelectState);
    }

    /**
     * 增加事件监听。on方法的同义词方法
     * @param {ZDrawEvent} eventType 事件类型
     * @param {function} callback 回调方法
     */
    addEventListener(eventType, callback) {
        this.handle[eventType] = callback;
        this.on(eventType, callback);
    }

    /**
     * 判断是否有事件监听
     * @param {ZDrawEvent} eventType 事件类型
     * @returns {boolean} 已经存在监听方法则返回true,否则返回false
     */
    hasEventListener(eventType) {
        return this.handle.hasOwnProperty(eventType);
    }


    /**
     * 移除事件监听
     * @param {ZDrawEvent} eventType 事件类型
     */
    un(eventType) {
        var _eventType = eventType;
        if (eventType === ZDrawEvent.DRAW_START) {
            _eventType = 'drawstart';
        } else if (eventType === ZDrawEvent.DRAW_COMPLETE) {
            _eventType = 'drawend';
        }
        if (this.handle.hasOwnProperty(eventType)) {
            var handler = this.handle[eventType];
            if (_eventType === 'drawstart') {
                handler = handler._drawStartHandler;
            } else if (_eventType === 'drawend') {
                handler = handler._drawEndHanlder;
            }
            this.__1.un(_eventType, handler);
            this.__2.un(_eventType, handler);
            this.__3.un(_eventType, handler);
            this.__4.un(_eventType, handler);
            this.__5.un(_eventType, handler);
            delete this.handle[eventType];
        }
    }

    /**
     * 移除事件监听.un方法的同义词方法
     * @param {ZDrawEvent} eventType 事件类型
     */
    removeEventListener(eventType) {
        this.un(eventType);
    }

}



function _drawStartHandler(event, drawTool, callback, self) {
    //关闭图层选择状态
    self.map.setLayerSelectActive(false);
    // set sketch
    sketch = event.feature;
    geomertryChangeListener = sketch.getGeometry().on('change', function (evt) {
        if (self.geometryChangeHandler) {
            self.geometryChangeHandler(evt);
        }
    });
    if (callback) {
        callback.call(self, event);
    }
}

function _drawEndHandler(event, drawTool, callback, self) {
    var geometry = event.feature.getGeometry();
    event.feature.setId(event.feature.ol_uid);
    var className = geometry.getType();
    var graphic;
    if (className === 'Point') {
        graphic = new ZGraphic(ZPoint.from(geometry, self.map.wkid()), self.markerSymbol);
    } else if (className === 'MultiPoint') {
        graphic = new ZGraphic(ZMultiPoint.from(geometry, self.map.wkid()), self.markerSymbol);
    } else if (className === 'LineString' ||
        className === 'MultiLineString') {
        graphic = new ZGraphic(ZPolyline.from(geometry, self.map.wkid()), self.lineSymbol);
    } else if (className === 'Polygon') {
        graphic = new ZGraphic(ZPolygon.from(geometry, self.map.wkid()), self.fillSymbol);
    } else if (className === 'MultiPolygon') {
        graphic = new ZGraphic(ZMultiPolygon.from(geometry, self.map.wkid()), self.fillSymbol);
    } else if (className === 'Circle') {
        var center = geometry.getCenter();
        graphic = new ZGraphic(new ZCircle(new ZPoint(center[0], center[1], new ZSpatialReference(self.map.wkid())), geometry.getRadius(), 64), self.fillSymbol);
    }
    //如果源已经设置为self.layer.source，则不用写这行代码
    self.layer.add(graphic);
    if (callback) {
        callback.call(self, graphic);
    }

}

/**
 * @property {string} POINT 点类型
 * @static
 * @type {string}
 */
ZDrawTool.POINT = 'Point';

/**
 * @property {string} POLYLINE 折线类型
 * @static
 * @type {string}
 */
ZDrawTool.POLYLINE = 'LineString';

/**
 * @property {string} POLYGON 面类型
 * @static
 * @type {string}
 */
ZDrawTool.POLYGON = 'Polygon';

/**
 * @property {string} EXTENT 矩形类型
 * @static
 * @type {string}
 */
ZDrawTool.EXTENT = 'Extent';

/**
 * @property {string} CIRCLE 圆类型
 * @static
 * @type {string}
 */
ZDrawTool.CIRCLE = 'Circle';

export default ZDrawTool;