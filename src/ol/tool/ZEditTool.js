


/**
 * @exports ZEditTool
 * @class
 * @classdesc 编辑工具类
 * @param {ZMap} map 地图对象实例
 * @param {ZGraphicsLayer} layer 临时图层对象
 * @todo 暂时没有实现功能
 */
class ZEditTool extends ol.Observable {
    constructor(map, layer) {
        super();

        this.resultGraphic = null;
        this.layer = layer;
        this.map = map;
        this.__ = {
            select: new ol.interaction.Select({
                condition: ol.events.condition.click,
                layers: layer ? [layer.__] : []
            }),
            operaction: null,
            event: {},
            deactivate: function (map) {
                map.__.removeInteraction(this.select);
                this.operaction ? map.__.removeInteraction(this.operaction) : null;
            },
            setEvents: function () {
                let selectedFeatures = this.select.getFeatures();
                this.select.on('change:active', function () {
                    selectedFeatures.forEach(function (each) {
                        selectedFeatures.remove(each);
                    });
                });
            },
            cb: null,
            changeCallBck: function (e) {
                e.selected[0] && e.selected[0].getGeometry().on('change', function (e) {
                    this.cb(e);
                })
            },
            clickCallBack: null,
            on: function (eventType, cb) {
                switch (eventType) {
                    case ZEditEvent.GRAPHIC_CLICK:
                        this.clickCallBack = cb;
                        this.select.on('select', this.clickCallBack);
                        break;
                    case ZEditEvent.VERTEX_MOVE:
                    case ZEditEvent.VERTEX_MOVE_STOP:
                        this.cb = cb;
                        this.select.on('select', this.changeCallBck);
                        break;
                    case ZEditEvent.EDIT_START:
                        break;
                    case ZEditEvent.EDIT_END:
                        break;
                    case ZEditEvent.EDIT_COMPLETED:
                        this.event.EDIT_COMPLETED = cb;
                        break;
                    case ZEditEvent.ROTATE_STOP:
                        break;
                }
            },
            un: function (eventType) {
                switch (eventType) {
                    case ZEditEvent.GRAPHIC_CLICK:
                        this.select.un('select', clickCallBack);
                    case ZEditEvent.VERTEX_MOVE:
                    case ZEditEvent.VERTEX_MOVE_STOP:
                        this.select.un('select', this.changeCallBck);
                    case ZEditEvent.EDIT_COMPLETED:
                        this.event.EDIT_COMPLETED = null;
                }
            }
        };

        this.deactivate();
        // this.map.__.addControl(this.__);
        // this.markerSymbol = new ZSimpleMarkerSymbol(ZSimpleMarkerSymbol.STYLE_CIRCLE, 2
        //     , new ZSimpleLineSymbol(ZSimpleLineSymbol.STYLE_SOLID, new ZColor(255, 0, 0, 1), 1), new ZColor(255, 0, 0, 0.6));
        // this.lineSymbol = new ZSimpleLineSymbol(ZSimpleLineSymbol.STYLE_SOLID, new ZColor(238, 99, 99, 0.6), 2);
        // this.fillSymbol = new ZSimpleFillSymbol(ZSimpleFillSymbol.STYLE_SOLID, this.lineSymbol, new ZColor(255, 250, 250, 0.5));
        // this.events = new OpenLayers.Events({
        //     eventTypes: [],
        //     object:this,
        // });
        
    };

    /**
     * 激活编辑工具
     * @param editTypes
     * @param graphic
     * @param options
     */
    activate(editTypes, graphic, options) {
        let that = this;
        this.layer ? this.layer.add(graphic) : null;
        this.map.layerEvent.setActive(false);
        switch (editTypes) {
            case ZEditEvent.EDIT_VERTICES:
                this.__.operaction = new ol.interaction.Modify({
                    features: this.__.select.getFeatures()
                });
                break;
            case ZEditEvent.MOVE:
                this.__.operaction = new ol.interaction.Translate({
                    features: this.__.select.getFeatures()
                });
                break;
        }
        this.map.__.addInteraction(this.__.select);
        this.map.__.addInteraction(this.__.operaction);
        this.__.setEvents();
        this.handle['operaction'] = this.__.operaction;
        // this.__.selectFeature(g.__);
        // this.__.mode = editTypes;
        // if (!that.callback) {
        //     that.callback = function (event) {
        //         let geometry = event.feature.geometry;
        //         let Type = geometry.CLASS_NAME;
        //         if (Type === 'OpenLayers.Geometry.Point'
        //             || Type === 'OpenLayers.Geometry.MultiPoint') {
        //             that.resultGraphic = new ZGraphic(ZPoint.from(geometry, that.map.wkid()), that.markerSymbol);
        //         } else if (Type === 'OpenLayers.Geometry.LineString'
        //             || Type === 'OpenLayers.Geometry.MultiLineString') {
        //             that.resultGraphic = new ZGraphic(ZPolyline.from(geometry, that.map.wkid()), that.lineSymbol);
        //         } else if (Type === 'OpenLayers.Geometry.Polygon'
        //             || Type === 'OpenLayers.Geometry.MultiPolygon') {
        //             that.resultGraphic = new ZGraphic(ZPolygon.from(geometry, that.map.wkid()), that.fillSymbol);
        //         }
        //         that.layer.clear();
        //         that.layer.add(that.resultGraphic);
        //         that.events.triggerEvent(ZEditEvent.EDIT_COMPLETED, {
        //             graphic: that.resultGraphic
        //         });
        //         graphic = that.resultGraphic;
        //     }
        // }
        // that.layer.__.events.un({
        //     'afterfeaturemodified': that.callback
        // });
        // that.layer.__.events.on({
        //     'afterfeaturemodified': that.callback
        // });
        // that.__.activate();
    };

    /**
     * 取消编辑状态
     */
    deactivate() {
        this.__.event.EDIT_COMPLETED ? this.__.event.EDIT_COMPLETED() : null;
        this.__.deactivate(this.map);
        this.map.layerEvent.setActive(true);
    };
}

ZEditTool.POINT = 'point';
ZEditTool.POLYLINE = 'polyline';
ZEditTool.POLYGON = 'polygon';
ZEditTool.CIRCLE = 'circle';



export default ZEditTool;