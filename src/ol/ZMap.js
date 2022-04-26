/*
 * @Author: gisboss
 * @Date: 2020-08-17 19:52:54
 * @LastEditors: gisboss
 * @LastEditTime: 2021-04-29 17:18:37
 * @Description: 地图类
 */


import ZView from './ZView.js';
import ZSpatialReference from './ZSpatialReference.js';
import ZScreenPoint from './geometry/ZScreenPoint.js';
import ZPoint from './geometry/ZPoint.js';
import ZExtent from './geometry/ZExtent.js';
import ZMapEvent from './event/ZMapEvent.js';
import ZGraphicsLayer from './layer/ZGraphicsLayer.js';
import ZLayer from './layer/ZLayer.js';
import ZGraphicUtil from './util/ZGraphicUtil.js';
import CoordTypeEnum from './enum/CoordTypeEnum.js';
import OperationStatusEnum from './enum/OperationStatusEnum.js';
import ZInfoWindow from './widget/ZInfoWindow.js';
import ZTiledMapServiceLayer from './layer/ZTiledMapServiceLayer.js';




/**
 * @typedef {Object} ZMap.InteractionTypeName 交互事件类型对象
 * @property {String} DRAGROTATE 拖拽旋转
 * @property {String} DOUBLECLICKZOOM 双击放大
 * @property {String} DRAGPAN 拖拽平移
 * @property {String} PINCHROTATE 触摸捏旋转
 * @property {String} PINCHZOOM 触摸捏放大
 * @property {String} KEYBOARDPAN 键盘导航平移
 * @property {String} KEYBOARDZOOM 键盘导航放大
 * @property {String} MOUSEWHEELZOOM 鼠标滚轮缩放
 * @property {String} DRAGZOOM 拖拽放大
 */
let interactionTypeName = {
    DRAGROTATE: 'ol.interaction.DragRotate',
    DOUBLECLICKZOOM: 'ol.interaction.DoubleClickZoom',
    DRAGPAN: 'ol.interaction.DragPan',
    PINCHROTATE: 'ol.interaction.PinchRotate',
    PINCHZOOM: 'ol.interaction.PinchZoom',
    KEYBOARDPAN: 'ol.interaction.KeyboardPan',
    KEYBOARDZOOM: 'ol.interaction.KeyboardZoom',
    MOUSEWHEELZOOM: 'ol.interaction.MouseWheelZoom',
    DRAGZOOM: 'ol.interaction.DragZoom'
};


/**
 * @exports ZMap
 * @class
 * @classdesc
 * 地图类构造函数，用于生成一个地图对象。地图对象中默认已经声明了一个ZGraphicsLayer对象，
 * 可以通过graphics属性进行访问，此图层始终保持在地图图层的最上面，脱离图层数组管理。
 * @param {String} context div元素id名,窗口最小宽高默认为200px
 * @param {Object} options 初始化参数.
 * @property {Object} options 参数属性
 * @property {Boolean} options.isIFrame 是否是IFrame模式嵌入
 * @property {Array.<String>} options.origins 允许的源
 * @property {Number} options.crs 自定义坐标系代号
 * @property {Number} options.wkid EPSG代号
 * @property {Number} [options.minZoom=0] 最小显示层级
 * @property {Number} [options.maxZoom=19] 最大显示层级
 * @property {Number} options.zoom  初始显示层级
 * @property {Array} options.center 地图初始中心点
 * @property {Array} [options.extent] 约束范围，超出范围不显示
 * @property {Boolean} [options.scalebarWidget] 是否显示比例尺
 * @property {Object} [options.scalebarWidgetOption] 比例尺控件参数。当scalebarWidget属性为true时有效。
 * @property {Boolean} [options.zoomWidget] 是否显示缩放控件。
 * @property {Object} [options.zoomWidgetOption] 缩放控件参数。当zoomWidget属性为true时有效。
 * @property {Boolean} [options.mapStyleWidget] 是否显示地图风格切换控件。
 * @property {Object} [options.mapStyleWidgetOption] 地图风格切换控件参数。当mapStyleWidget属性为true时有效。
 * @property {Boolean} [options.coordinateWidget] 是否显示坐标提示控件。
 * @property {Object} [options.coordinateWidgetOption] 坐标提示控件参数。当coordinateWidget属性为true时有效。
 * @property {Boolean} [options.copyrightWidget] 是否显示版权控件。
 * @property {Object} [options.copyrightWidgetOption] 版权控件参数。当copyrightWidget属性为true时有效。
 * @property {Boolean} [options.searchBoxWidget] 是否显示搜索框控件。
 * @property {Object} [options.searchBoxWidgetOption] 搜索框控件参数。当searchBoxWidget属性为true时有效。
 * @property {Boolean} [options.cityNavTreeWidget] 是否显示行政区域树导航控件。
 * @property {Object} [options.cityNavTreeWidgetOption] 行政区域树导航控件参数。当cityNavTreeWidget属性为true时有效。
 * @property {Boolean} [options.toolbarWidget] 是否显示工具栏控件。
 * @property {Object} [options.toolbarWidgetOption] 工具栏控件参数。当toolbarWidget属性为true时有效。
 * @property {Boolean} [options.legendWidget] 是否显示图例控件。
 * @property {Object} [options.legendWidgetOption] 图例控件参数。当legendWidget属性为true时有效。
 * @property {Boolean} [options.thematicLayerWidget] 是否显示专题图层控件。
 * @property {Object} [options.thematicLayerWidgetOption] 专题图层控件参数。当thematicLayerWidget属性为true时有效。
 *
 * @see {@link CoordTypeEnum} 自定义坐标系代号
 * @see {@link ZView} 地图视图对象
 */
class ZMap extends ol.Observable {
    constructor(context, options) {
        super();

        this.context = context;
        this.targetElement = this.getTargetElement();
        this.targetElement.classList.add('zgis2d-root');
        this.targetElement.setAttribute('tabindex', '1');

        /**
         * @property {String} id 地图唯一id
         * @type {String}
         */
        this.id = 'ol_zmap_' + context;
        options = options || {};
        /**
         * @property {Object} options 地图参数选项
         * @type {Object}
         */
        this.options = options;
        /**
         * @property {Number} crs 地图参坐标系代号
         * @type {Number}
         * @see CoordTypeEnum
         */
        this.crs = options.crs ? options.crs : CoordTypeEnum.webmercator;

        let wkid = CoordTypeEnum.getWkidByCrs(this.crs);
        let _view = new ol.View({
            projection: 'EPSG:' + wkid,
            minZoom: options.minZoom || 0,
            maxZoom: options.maxZoom || 19,
            resolutions: options.resolutions,
            zoom: options.zoom,
            center: options.center,
            extent: options.extent //约束范围，超出范围不显示
        });

        this.__defaultInteractions = ol.interaction.defaults({
            constrainResolution: true,
            onFocusOnly: false
        });
        this.__defaultInteractions.forEach(function (t, i, array) {
            let type;
            if (i === 0) {
                type = interactionTypeName.DRAGROTATE;
            } else if (i === 1) {
                type = interactionTypeName.DOUBLECLICKZOOM;
                t.setActive(false);
            } else if (i === 2) {
                type = interactionTypeName.DRAGPAN;
            } else if (i === 3) {
                type = interactionTypeName.PINCHROTATE;
            } else if (i === 4) {
                type = interactionTypeName.PINCHZOOM;
            } else if (i === 5) {
                type = interactionTypeName.KEYBOARDPAN;
            } else if (i === 6) {
                type = interactionTypeName.KEYBOARDZOOM;
            } else if (i === 7) {
                type = interactionTypeName.MOUSEWHEELZOOM;
            } else if (i === 8) {
                type = interactionTypeName.DRAGZOOM;
            }
            t.set('type', type, true);
        });

        this.__ = new ol.Map({
            target: context,
            loadTilesWhileAnimating: true,
            view: _view,
            controls: [],
            keyboardEventTarget: this.targetElement,
            interactions: this.__defaultInteractions
        });

        /**
         * @property {ZMap.InteractionTypeName} InteractionTypeName 交互事件类型对象
         */
        this.InteractionTypeName = interactionTypeName;
        //与Map绑定的graphicsLayer，只用于高亮临时显示，不可选中图层要素
        this.__gcLayer = new ZGraphicsLayer({
            id: 'map-gc-vector-layer',
            title: 'map-gc',
            style: ZGraphicsLayer.DEFAULT_HIGHLIGHTSTYLE_KEY
        });
        //这个图层脱离图层组。
        this.tempLayer = new ZGraphicsLayer("zgis_tempLayer");
        this.tempLayer.setZMap(this, true);

        //这里不使用addLayer方式添加，使这个图层始终保持在图层的最上面
        this.__gcLayer.setZMap(this, true);
        //事件句柄，保存已经监听的事件类型和回调函数
        this._eventHandlers = {};

        //默认singleClick选中
        this.layerSelect = new ol.interaction.Select({
            //可选中的图层列表
            layers: function (layer) {
                let s = layer.get('isSelectable');
                return s === undefined ? true : s;
            },
            //单个图层的要素过滤器
            filter: function (feature, layer) {
                let s = feature.get('isSelectable');
                let zlyr = layer.get('wrapper');
                if (!feature.renderer && zlyr.featureRenderer) {
                    feature.renderer = zlyr.featureRenderer;
                }
                return s === undefined ? true : s;
            },
            style: ZGraphicsLayer.DEFAULT_HIGHLIGHTSTYLE
        });
        this.__.addInteraction(this.layerSelect);

        //zgis-widget-footer
        this.mapFooterContainer = document.createElement('div');
        this.mapFooterContainer.style.position = 'absolute';
        this.mapFooterContainer.style.userSelect = 'none';
        this.mapFooterContainer.className = 'zgis-widget-footer';
        this.targetElement.appendChild(this.mapFooterContainer);


        /**
         * @property {ZInfoWindow} infoWindow 信息窗口容器
         */
        this.infoWindow = new ZInfoWindow(options.infoWin);
        this.infoWindow.addToMap(this.__);


        /**
         * @property {Boolean} clickRecenterEnabled=true  ctr+shift+click 重定位中心。默认启用
         */
        this.clickRecenterEnabled = true;
        //添加 默认单击事件
        this.addEventListener(ZMapEvent.SINGLECLICK, __mapSingleClickHandler.bind(this));

        /**
         * @property {Number} operationStatus 地图工具操作状态值。按钮在交互时会动态改变这个属性值
         * @see OperationStatusEnum
         */
        this.operationStatus = OperationStatusEnum.MAP_PAN;


        //把zmap对象包装到属性中
        this.__.setProperties({
            id: this.id,
            crs: this.crs,
            wrapper: this
        });

        /**
         * @property {ZView} view 地图视图对象
         */
        this.view = undefined;

    }


    /**
     * 获取地图视图对象
     * @return {ZView} 视图对象
     */
    getView() {
        return this.view;
    }

    /**
     * 获取地图容器页脚子元素对象
     * @return {HTMLElement}
     */
    getMapFooterContainer() {
        return this.mapFooterContainer;
    }
    /**
     * 获取地图容器顶层元素对象
     * @return {HTMLElement}
     */
    getTargetElement() {
        if (this.targetElement) {
            return this.targetElement;
        }
        let t = this.context;
        if (_.isString(t)) {
            t = document.getElementById(t);
        }
        return t;
    }

    /**
     * 隐藏或显示地图
     */
    toggle(visibility) {
        let t = this.getTargetElement();
        t.style.display = visibility ? 'block' : 'none';
    }

    /**
     * 设置图层要素选中工具的激活状态
     * @param {Boolean} value 激活状态值
     */
    setLayerSelectActive(value) {
        this.layerSelect.setActive(value);
    }

    /**
     * 获取图层要素选中工具是否激活
     * @return {Boolean} 激活状态值
     */
    getLayerSelectActive() {
        return this.layerSelect.getActive();
    }

    /**
     * 添加图层要素选中处理函数
     * @param {ZGraphicsLayer} vectorLayer 矢量图层对象引用
     * @param {Function} handler 处理函数。格式形式为function (selectEvent) {}，接收一个SelectEvent事件对象参数
     */
    addLayerSelectHandler(vectorLayer, handler) {
        vectorLayer.__.set('isSelectable', true);
        return this.layerSelect.on('select', function (se) {
            let target = se.target;
            let graphic = [];
            let f;
            let selected = se.selected;
            for (let sf in selected) {
                f = selected[sf];
                if (target.getLayer(f).get('id') === vectorLayer.__.get('id')) {
                    graphic.push(f);
                }
            }
            se.layer = vectorLayer;
            se.graphic = ZGraphicUtil.graphicsFromFeatures(graphic, true);

            if (handler && se.graphic.length) {
                handler(se);
            }
        });
    }

    /**
     * 移除图层要素选中处理函数
     * @param {function} handler 初始添加监听时的处理函数
     */
    removeLayerSelectHandler(handler) {
        return this.layerSelect.un('select', handler);
    }


    /**
     * 获取交互事件类型对象
     * @param {String} interctionTypeName 交互事件类型枚举字符串值，可选值为ZMap.InteractionTypeName中的具体键值
     * @return {String} 事件类型字符串值
     */
    getInteractionByTypeName(interctionTypeName) {
        let ints = this.__defaultInteractions;
        let item;
        for (let i = 0, len = ints.getLength(); i < len; i++) {
            item = ints.item(i);
            if (item.get('type') === interctionTypeName) {
                return item;
            }
        }
    }

    /**
     * 设置地图切片图层参数，自动刷新
     * @param {ZOnlineMapLayer|ZArcGISTileLayer|ZWMTSLayer} layer 底图切片图层对象引用
     * @param {Object} params 待更新参数对象
     */
    updateTileLayer(layer, params) {
        let wrapper = layer;
        if (wrapper) {
            wrapper.updateParams(params);

            if (wrapper instanceof ZTiledMapServiceLayer) {
                wrapper.refresh();
            }
        }
    }

    /**
     * 设置地图DOM的像素宽高，单位px
     * @param {Number} width 宽度值
     * @param {Number} height 高度值
     */
    setSize(width, height) {
        this.__.setSize([width, height]);
    }
    /**
     * 获取地图DOM的像素宽高
     * @return {Array<Number>} 宽高数组[width,height]
     */
    getSize() {
        return this.__.getSize();
    }

    /**
     * 增加图层，当图层添加到地图后，图层对象属性中自动添加地图对象的引用和图层索引属性
     * @param {ZLayer} layer 图层对象引用
     * @param {Number} [index] 图层添加到地图中的索引位置
     */
    addLayer(layer, index) {
        if (index === undefined) {
            index = -1;
        }

        let lyrs = this.__.getLayers();
        if (_.isArray(layer.__)) {
            let layerindex;
            for (let i = 0; i < layer.__.length; i++) {
                layer.__[i].set(ZLayer.PROPERTY_KEY.ZMAP, this); //'zmap'
                if (lyrs && index > -1) {
                    layerindex = index + i;
                    lyrs.insertAt(index + i, layer.__[i]);
                } else {
                    layerindex = this.__.getLayers().getLength();
                    this.__.addLayer(layer.__[i]);
                }
                layer.__[i].set(ZLayer.PROPERTY_KEY.LAYERINDEX, layerindex);
            }
        } else {
            layer.__.set(ZLayer.PROPERTY_KEY.ZMAP, this);
            if (lyrs && index > -1) {
                layer.__.set(ZLayer.PROPERTY_KEY.LAYERINDEX, index);
                lyrs.insertAt(index, layer.__);
            } else {
                let lyrindex = this.__.getLayers().getLength();
                layer.__.set(ZLayer.PROPERTY_KEY.LAYERINDEX, lyrindex);
                this.__.addLayer(layer.__);
            }
        }

        this.__.setProperties('addedlayer', layer);
        this.__.dispatchEvent(ZMapEvent.LAYER_ADD);
    }

    /**
     * 批量增加图层
     * @param {Array<ZLayer>} layers 图层数组
     */
    addLayers(layers) {
        for (let i = 0; i < layers.length; i++) {
            this.addLayer(layers[i]);
        }
    }

    /**
     * 销毁地图内部Map对象实例
     */
    dispose() {
        this.__.dispose();
    }

    /**
     * 移除图层
     * @param {ZLayer} layer 图层对象引用
     */
    removeLayer(layer) {
        if (_.isArray(layer.__)) {
            for (let i = 0; i < layer.__.length; i++) {
                this.__.removeLayer(layer.__[i]);

            }
        } else {
            this.__.removeLayer(layer.__);
        }
        this.__.setProperties('removedlayer', layer);
        this.__.dispatchEvent(ZMapEvent.LAYER_REMOVE);
    }

    /**
     * 移除所有图层
     */
    removeAllLayers() {
        let layers = this.__.getLayers().getArray();
        while (layers.length > 0) {
            this.__.removeLayer(layers[0]);
        }
    }

    /**
     * 设置地图组件的可见性
     * @param {Boolean} visibility 是否可见
     */
    setVisibility(visibility) {
        this.__.getViewport().style.visibility = visibility ? 'visible' : 'hidden';
    }

    /**
     * 切换图层的可见性
     * @param {String} layerId 图层对象的唯一id属性值
     * @param {Boolean} visibility 是否可见
     */
    toggleLayer(layerId, visibility) {
        let layers = this.__.getLayers();
        layers.forEach(function (item) {
            if (item.get('id') === layerId) {
                item.setVisible(visibility);
            }
        });
    }

    /**
     * 设置地图范围
     * @param {ZExtent|Array} extent 范围对象引用
     * @param {Boolean} [fit] 是否自适应
     * @param {Number} [duration] 时长
     */
    setExtent(extent, fit, duration, callback) {
        this.__.getView().fit(extent.__ ? extent.__ : extent, {
            nearest: fit,
            duration: duration,
            size: this.__.getSize(),
            callback: callback
        });
    }


    /**
     * 获取地图范围
     * @return {ZExtent} 范围对象
     */
    getExtent() {
        return ZExtent.from(this.__.getView().calculateExtent(), this.options.wkid);
    }

    /**
     * 获取地图中心点坐标数组
     * @return {Array.<Number>} 坐标数组
     */
    getCenter() {
        return this.__.getView().getCenter();
    }


    /**
     * 设置地图居中
     * @param {ZPoint|Object} point 地图中心点对象，对象中必须要有x,y属性
     * @param {Boolean} [animation] 是否使用动画
     * @param {Number} [duration] 动画播放时长
     */
    centerAt(point, animation, duration) {
        if (animation) {
            this.__.getView().animate({
                center: [point.x, point.y],
                duration: duration
            });
        } else {
            this.__.getView().setCenter([point.x, point.y]);
        }
    }

    /**
     * 缩放地图并以指定位置点居中地图
     * @param {Number} zoom 缩放级别
     * @param {ZPoint|Object} point 地图中心点对象，对象中必须要有x,y属性
     * @param {Boolean} [animation] 是否动画过渡
     * @param {Number} [duration] 动画时长
     */
    zoomAndCenterAt(zoom, point, animation, duration) {
        let v = this.__.getView();
        if (animation) {
            v.animate({
                zoom: zoom,
                center: [point.x, point.y],
                duration: duration
            });
        } else {
            v.setCenter([point.x, point.y]);
            v.setZoom(zoom);
        }
    }

    /**
     * 设置地图旋转角度
     * @param {Number} angle 旋转角度
     * @param {Boolean} [animation] 是否使用动画
     * @param {Number} [duration] 动画时长
     */
    rotation(angle, animation, duration) {
        if (animation) {
            this.__.getView().animate({
                rotation: angle,
                duration: duration
            });
        } else {
            this.__.getView().setRotation(angle);
        }
    }

    /**
     * 获取地图当前旋转角度
     * @return {Number} 旋转角度值
     */
    getRotation() {
        return this.__.getView().getRotation();
    }

    /**
     * 屏幕坐标转换为地图坐标
     * @param {Number} x 经度值
     * @param {Number} y 纬度值
     * @return {ZPoint} 转换结果ZPoint点对象
     */
    toMap(x, y) {
        let coords = this.__.getCoordinateFromPixel([x, y]);
        let wkid = this.wkid();
        return new ZPoint(coords[0], coords[1], new ZSpatialReference(wkid));
    }
    /**
     * 地图点转换为屏幕坐标
     * @param {ZPoint|Object<x,y>} point 地图点对象，对象中必须要有x,y属性
     * @return {ZScreenPoint} 屏幕点对象
     */
    toScreen(point) {
        let pixel = this.__.getPixelFromCoordinate([point.x, point.y]);
        return new ZScreenPoint(pixel[0], pixel[1]);
    }
    /**
     * 获取地图当前缩放等级
     * @return {Number} 缩放层级
     */
    getZoom() {
        return Math.ceil(this.__.getView().getZoom());
    }
    /**
     * 设置地图当前缩放级别
     * @param {Number} zoom 缩放级别
     * @param {Boolean} [animation] 是否使用动画
     * @param {Number} [duration] 动画时长
     */
    setZoom(zoom, animation, duration) {
        let v = this.__.getView();
        let minZoom = v.getMinZoom() || 0;
        let maxZoom = v.getMaxZoom() || 0;
        if (zoom >= minZoom && zoom <= maxZoom) {
            if (animation) {
                v.animate({
                    zoom: zoom,
                    duration: duration
                });
            } else {
                v.setZoom(zoom);
            }
        }
    }


    /**
     * 地图放大
     * @param {Boolean} [animation] 是否使用动画
     * @param {Number} [duration] 动画时长
     */
    zoomIn(animation, duration) {
        let zoom = this.getZoom();
        let maxZoom = this.getMaxZoom();
        if (zoom === -1 && maxZoom === -1) {
            let extent = this.__.calculateExtent();
            let center = ol.extent.getCenter(extent);
            this.setExtent([(center[0] + extent[0]) / 2,
                (center[1] + extent[1]) / 2,
                (center[2] + extent[0]) / 2,
                (center[3] + extent[1]) / 2
            ], false);
        } else {
            this.setZoom(zoom + 1, animation, duration);
        }
    }
    /**
     * 地图缩小
     * @param {Boolean} [animation] 是否使用动画
     * @param {Number} [duration] 动画时长
     */
    zoomOut(animation, duration) {
        let zoom = this.getZoom();
        let minZoom = this.getMinZoom();
        if (zoom === -1 && minZoom === -1) {
            let extent = this.__.calculateExtent();
            let center = ol.extent.getCenter(extent);
            this.setExtent([2 * extent[0] - center[0],
                2 * extent[1] - center[1],
                2 * extent[2] - center[0],
                2 * extent[3] - center[1]
            ], false);
        } else {
            this.setZoom(zoom - 1, animation, duration);
        }


    }
    /**
     * 获取地图wkid
     * @return {Number} 坐标系代码
     */
    wkid() {
        let code = this.__.getView().getProjection().getCode();
        return code.split(':').pop() * 1;
    }
    /**
     * 屏幕坐标点转换为地图地理坐标点
     * @param {Number} x 屏幕x坐标
     * @param {Number} y 屏幕y坐标
     * @return {ZPoint} 地图坐标点对象
     */
    toMapFromStage(x, y) {
        let coords = this.__.getCoordinateFromPixel([x, y]);
        let wkid = this.wkid();
        return new ZPoint(coords[0], coords[1], new ZSpatialReference(wkid));
    }
    /**
     * 获取当前地图的比例值。地球计算半径为6378137
     * @return {Number} 地图比例值
     */
    getScale() {
        let EARTH_RADIUS = 6378137;
        let wkid = this.wkid();
        let resolution = this.__.getView().getResolution();
        //Web Mercator投影
        if (wkid === 3857 || wkid === 102100 ||
            wkid === 3758 || wkid === 900913) {
            return resolution * 96 / 0.0254;
        } else {
            //经纬度
            return resolution * 96 / 0.0254 * (2 * Math.PI * EARTH_RADIUS / 360);
        }

    }
    /**
     * 获取地图在当前比例尺下的显示范围。给定比例尺，计算在给定比例尺下的显示范围
     * @param {Number} scale 比例值
     * @return {ZExtent} 地图范围对象引用
     */
    getExtentForScale(scale) {
        //地图当前范围
        let extent = this.getExtent();
        let ratio = scale / this.getScale();
        //中心点
        let center = ol.extent.getCenter(extent.__);
        let left = (extent.xmin - center[0]) * ratio + center[0];
        let bottom = (extent.ymin - center[1]) * ratio + center[1];
        let right = (extent.xmax - center[0]) * ratio + center[0];
        let top = (extent.ymax - center[1]) * ratio + center[1];
        return new ZExtent(left, bottom, right, top, new ZSpatialReference(this.wkid()));

    }

    /**
     * 返回与地图绑定的临时图层对象，此图层始终位于所有地图图层的最上面，脱离了图层数组的管理
     * @return {ZGraphicsLayer} 图层对象
     */
    graphics() {
        return this.__gcLayer;
    }

    /**
     * 添加ZGraphic对象到默认graphics矢量图层
     * @param {Array.<ZGraphic>|ZGraphic} gs 要素集合
     * @param {Boolean} [clear=true] 添加之前是否清除图层
     * @returns 添加的要素集
     */
    addGraphics(gs, clear) {
        if (clear === undefined || clear) {
            this.__gcLayer.clear();
        }
        if (!_.isArray(gs)) {
            return this.__gcLayer.add(gs);
        }
        return this.__gcLayer.addList(gs);
    }

    /**
     * 禁用地图点击居中
     */
    disableClickRecenter() {
        this.clickRecenterEnabled = false;
    }
    /**
     * 启用地图点击居中
     */
    enableClickRecenter() {
        this.clickRecenterEnabled = true;
    }
    /**
     * 禁用双击地图缩放
     */
    disableDoubleClickZoom() {
        this.getInteractionByTypeName(this.InteractionTypeName.DOUBLECLICKZOOM).setActive(false);
    }
    /**
     * 启用双击地图缩放
     */
    enableDoubleClickZoom() {
        this.getInteractionByTypeName(this.InteractionTypeName.DOUBLECLICKZOOM).setActive(true);
    }
    /**
     * 禁用键盘导航
     */
    disableKeyboardNavigation() {
        this.getInteractionByTypeName(this.InteractionTypeName.KEYBOARDPAN).setActive(false);
        this.getInteractionByTypeName(this.InteractionTypeName.KEYBOARDZOOM).setActive(false);
    }
    /**
     * 启用地图键盘导航
     */
    enableKeyboardNavigation() {
        this.getInteractionByTypeName(this.InteractionTypeName.KEYBOARDPAN).setActive(true);
        this.getInteractionByTypeName(this.InteractionTypeName.KEYBOARDZOOM).setActive(true);
    }

    /**
     * 获取是否启用滚轮缩放地图
     * @return {Boolean} 是否可滚轮缩放
     */
    isScrollWheelZoom() {
        return this.getInteractionByTypeName(this.InteractionTypeName.MOUSEWHEELZOOM).getActive();
    }

    /**
     * 启用滚轮缩放地图
     */
    enableScrollWheelZoom() {
        return this.getInteractionByTypeName(this.InteractionTypeName.MOUSEWHEELZOOM).setActive(true);
    }

    /**
     * 禁用滚轮缩放地图
     */
    disableScrollWheelZoom() {
        return this.getInteractionByTypeName(this.InteractionTypeName.MOUSEWHEELZOOM).setActive(false);
    }


    /**
     * 获取地图信息提示框对象
     * @return {ZInfoWindow} 信息提示框对象
     */
    getInfoWindow() {
        return this.infoWindow;
    }
    /**
     * 设置infowindow
     * @param {ZInfoWindow} infoWindow 信息提示框对象
     */
    setInfoWindow(infoWindow) {
        this.infoWindow = infoWindow;
    }


    /**
     * 获取地图最大缩放级别
     * @return {Number} 最大级别值
     */
    getMaxZoom() {
        return this.__.getView().getMaxZoom();
    }

    /**
     * 获取地图最小缩放级别
     * @return Number} 最小级别值
     */
    getMinZoom() {
        return this.__.getView().getMinZoom();
    }

    /**
     * 一次性监听事件
     * @param {ZMapEvent} eventType 地图事件类型
     * @param {function} callBack 事件回调方法
     */
    once(eventType, callBack) {
        return this.__.once(eventType, callBack)
    }

    /**
     * 增加地图事件监听
     * @param {String} eventType 事件类型名称。请使用{@see ZMapEvent}中定义的常量
     * @param {Function} callBack 事件的回调函数
     */
    addEventListener(eventType, callBack) {
        let self = this;
        if (!this._eventHandlers[eventType]) {
            this._eventHandlers[eventType] = [];
        }
        let innerCallback = (event) => {
            let wrapper = {};
            if (eventType === ZMapEvent.EXTENTCHANGED) {
                wrapper.extent = ZExtent.from(self.__.getView().calculateExtent(self.__.getSize()));
                wrapper.zoom = self.getZoom();
            }
            if (event.coordinate) {
                wrapper.mapPoint = new ZPoint(event.coordinate[0], event.coordinate[1]);
            }
            if (event.originalEvent) {
                wrapper.screenPoint = new ZScreenPoint(event.originalEvent.screenX, event.originalEvent.screenY);
            }

            Object.assign(event, wrapper);
            if (callBack) {
                return callBack.call(self, event);
            }
        };

        let handlerKey;
        if (ZMapEvent.VIEW_ROTATION === eventType ||
            ZMapEvent.VIEW_ZOOM === eventType) {
            this.__.getView().on(eventType, innerCallback);
        } else {
            handlerKey = this.__.on(eventType, innerCallback);
        }

        this._eventHandlers[eventType].push({
            handler: handlerKey,
            callback: callBack
        });
    }
    /**
     * 移除地图事件监听
     * @param {ZMapEvent} eventType 请使用ZMapEvent中定义的常量值
     * @param {function} callBack 对同一种事件类型可以设置多个监听的回调，因此在解除事件监听的时候，需要传递在设置监听时候的回调函数
     */
    removeEventListener(eventType, callBack) {
        if ((eventType in this._eventHandlers) && callBack) {
            let handlerArray = this._eventHandlers[eventType];
            for (let i = handlerArray.length - 1; i >= 0; i--) {
                if (handlerArray[i]['callback'] === callBack) {
                    //this.__.un(eventType, handlerArray[i]['innerCallback']);
                    ol.Observable.unByKey(handlerArray[i].handler);
                    handlerArray.splice(i, 1);
                }
            }
        }
    }

    /**
     * 根据图层id获取图层对象
     * @param {String} id 图层唯一id值
     * @return {ZLayer} 图层对象
     */
    getLayer(id) {
        if (!id) {
            throw new Error('LayerId is invalid!');
        }
        let lyrs = this.__.getLayers();
        if (lyrs) {
            let layer; // ol/layer/Base~BaseLayer
            for (let i = 0, len = lyrs.getLength(); i < len; i++) {
                layer = lyrs.item(i);
                if (id === layer.get('id')) {
                    break;
                }
            }
            return layer.get(ZLayer.PROPERTY_KEY.WRAPPER);
        }
    }

    /**
     * 获取所有图层
     * @return {Array.<ZLayer>} 图层对象数组
     */
    getLayers() {
        let lyrs = this.__.getLayers();

        if (lyrs) {
            let r = [];
            for (let i = 0, len = lyrs.getLength(); i < len; i++) {
                r.push(lyrs.item(i).get(ZLayer.PROPERTY_KEY.WRAPPER));
            }
            return r;
        }
    }

    /**
     * 获取图层对象索引
     * @param {String} id 图层唯一id值
     * @return {Number} 图层对象索引
     */
    getLayerIndex(id) {
        let lyrs = this.__.getLayers();
        if (lyrs) {
            let layer;
            let idkey = ZLayer.PROPERTY_KEY.ID;
            let lyrIndexKey = ZLayer.PROPERTY_KEY.LAYERINDEX;
            for (let i = 0, len = lyrs.getLength(); i < len; i++) {
                layer = lyrs.item(i);
                if (id === layer.get(idkey)) {
                    return layer.get(lyrIndexKey);
                }
            }
        }
    }


    /**
     * 获取所有图层id
     * @return {Array<String>} 图层id数组
     */
    layerIds() {
        let lyrs = this.__.getLayers().getArray();

        return lyrs.map(function (item) {
            return item.get('id');
        });
    }

    /**
     * 清除图层数组中所有的GraphicLayer临时图层
     */
    clearAllGraphicLayer() {
        let lyrs = this.__.getLayers();
        lyrs.forEach(function (item) {
            if (item.get('type') === 'ZGraphicsLayer') {
                item.getSource().clear();
            }
        });
    }

    /**
     * 地图刷新
     */
    refresh() {
        this.graphics().clear();
        this.tempLayer.clear();
        this.infoWindow.close();
        this.layerSelect.getFeatures().clear();

        this.clearAllGraphicLayer();

        this.__.render();
    }

    /**
     * 销毁资源
     */
    destroy() {
        this.view = null;
        this.__ = null;
    }

}


/**
 * 地图单击内部处理函数
 * @param {ol.MapBrowserEvent} event
 * @private
 */
function __mapSingleClickHandler(event) {
    if (this.clickRecenterEnabled &&
        (event.originalEvent.ctrlKey && event.originalEvent.shiftKey)) {
        this.centerAt(event.mapPoint, true, 500);
    }
}




export default ZMap;