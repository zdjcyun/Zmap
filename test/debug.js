/**
 * 应用程序入口
 */
import HTTPRequest from '../src/core/HttpRequest.js';
import {
    map2d as zgis2d
} from '../src/ol/Map2d.js';
import testData from '../test/test_data.js';

// var zgis2d = zgis2d.map2d;

// 使用html静态代码比较合适
// zgis2d.showLoadingDiv();

zgis2d.createMap('root', {
    isIFrame: 1,
    origins: ['http://127.0.0.1:5500'],
    crs: 1,
    minZoom: 3,
    zoom: 10,
    center: [112.987049115, 28.1606368204],
    locationLayerOptions: {
        "isSelected": true,
        "fields": "name,x,y"
    },
    infoWin: {
        mapAutoCenter: false,
        hideCloseButton: true,
    },
    layers: {
        url: [
            zgis2d.model.ZLayerModel.getOnlineBaseMap('tianditu', 'image', '天地图影像', 'tl_online_tdt').appendOptionsContent({
            }).toJSON(),
            testData.getDataConfig_csdt(),
        ],
    },
    searchBoxWidgetOption: {
        visible: true,
        queryfilter: {
            selector: 'city',
            defaultFilterName: '长沙市',
            defaultFilterCode: '430100'
        },
        suggestapi: {
            active: 'bdmapapi'
        },
        queryapi: {
            active: 'bdmapapi'
        }
    },
}).then(mapInitialed);


/**
 * 地图模块初始化完成
 * @param {Map2d} map2dModule 
 */
function mapInitialed(map2dModule) {

    map2dModule.context.getMap().operationStatus = zgis2d.enum.OperationStatusEnum.MAP_QUERY_POINT;
    zgis2d.hideLoadingDiv();

    map2dModule.context.getMap().getView().addDefaultWidget(
        [{
                name: 'copyright'
            },
            {
                name: 'coordinate',
                options: {
                    crs: 3
                }
            },
            {
                name: 'scalebar'
            },
            {
                name: 'zoom'
            },
            {
                name: 'mapStyle',
                options: {
                    items: [{
                            id: 'map_image',
                            mapType: 'tianditu',
                        },
                        {
                            id: 'map_street',
                            mapType: 'tianditu',
                        },
                        {
                            id: 'map_terrain',
                            mapType: 'tianditu',
                            visible: false,
                        },
                        {
                            id: 'map_cloudmap',
                            mapType: 'cloudmap',
                            text: "气象云图",
                            imageUrl: "./img/cloudmap.jpg",
                            layerIndex: 10,
                            visible: true,
                        },
                    ],
                    itemChangeHandler: function (eventData) {
                        debugger
                        console.log(eventData);
                    }
                }
            },
            {
                name: "legend",
                options: {
                    title: '设备图例',
                    layers: [{
                        id: "lyr_device",
                        name: "设备图层",
                        options: {
                            legend: {
                                rules: [{
                                        title: "泥石流",
                                        name: `./img/marker/icon_nishiliu.png`,
                                        value: "1",
                                        total: "",
                                    },
                                    {
                                        title: "滑坡",
                                        name: `./img/marker/icon_huapo.png`,
                                        value: "2",
                                        total: "",
                                    },
                                    {
                                        title: "塌陷",
                                        name: `./img/marker/icon_taxian.png`,
                                        value: "3",
                                        total: "",
                                    },
                                    {
                                        title: "崩塌",
                                        name: `./img/marker/icon_bengta.png`,
                                        value: "4",
                                        total: "",
                                    },
                                ],
                            },

                        }

                    }],
                },
            },
        ]);

    let legendWidget = map2dModule.context.getMap().getView().getWidget('legendWidget');
    legendWidget.legendClickEvent.addEventListener(zgis2d.widget.ZLegendWidget.LEGEND_CLICK_EVENT_TYPE, (p) => {
        console.log(p, 'legend');
    });

    let map = map2dModule.context.getMap();

    map.infoWindow.setOffset([0, -10]);
    map.infoWindow.infoTemplate.setTemplate(function (attr, fields) {
        return "aaa";
    });

    let lyr = map.getView().featureLayer["fl_wkk"];
    lyr.addEventListener(zgis2d.event.ZLayerEvent.MOUSEMOVE, function (e) {
        if (map.operationStatus !== zgis2d.enum.OperationStatusEnum.MAP_QUERY_POINT) {
            return;
        }
        if (e.graphic.length) {
            let lyrOpts = e.target.options;
            let hoverInfoWin = lyrOpts.hoverInfoWin;
            let g = e.graphic[0];
            g.setSymbol(zgis2d.symbol.ZPictureMarkerSymbol.fromJSON(lyrOpts.highlightSymbol));
            if (hoverInfoWin) {
                let result = map.infoWindow.setGraphic(g);
                if (result) {
                    map.infoWindow.show();
                }
            }
            map.addGraphics(g);
        } else {
            if (!map.graphics().isEmpty()) {
                map.graphics().clear();
            }
            map.infoWindow.hide();
        }
    });

    map.graphics().addEventListener(zgis2d.event.ZLayerEvent.SINGLECLICK, function (e) {
        if (e.graphic.length) {
            let g = e.graphic[0];
            let attr = g.attributes;
            let params = {
                lng: g.geometry.x,
                lat: g.geometry.y,
                tailingNo: attr.tailingNo,
                city: attr.city,
                name: attr.name,
                level: attr.level,
                tailingStatus: attr.tailingStatus,
                top: attr.top,
                securityofficer: attr.securityofficer,
                securityofficertel: attr.securityofficertel,
            };

            lyr.__source.once(zgis2d.event.ZLayerEvent.GRAPHIC_LOADED, function (event) {
                let fs = lyr.filter({
                    city: '娄底市'
                }, true);
                lyr.__source.forEachFeature(function (f) {
                    if (f.show === false) {
                        lyr.__source.removeFeature(f);
                    }
                });
            });

            lyr.refresh();

        }

    });
}

/**
 * 添加气象云图
 */
function addLayer_qxyt() {
    let layeroption = zgis2d.model.ZLayerModel.getImageLayer(
        'http://127.0.0.1:8180/gis/gisserver/qx/findSKListDraw', 1, "降水", null, 'qx', '气象数据', 'hnqx'
    ).appendOptionsContent({ //
        options: {
            imageLoadFunction: function (image, src) {
                let token = 'WBB_837c329a00df5bb53fd0962fce01c5af19adb8a69a-cswj';

                HTTPRequest.postWithToken(src, {
                    areacode: '430000000000',
                    stime: '2021-05-08 06',
                    etime: '2021-05-08 07',
                    r: Math.random()
                }, token).then((respose) => {
                    image.getImage().src = 'data:image/png;base64,' + respose.data;
                });

            },
            extent: [61.16, 4.25, 138.21, 54.48],
        }
    });
    let lyrtemp = zgis2d.enum.LayerSourceTypeEnum.getInstance(zgis2d.enum.LayerTypeEnum.LAYER_TYPE_IMAGE, layeroption.sourcetype.toLowerCase(), layeroption);
    map.addLayer(lyrtemp, layeroption.order);

    let yt = zgis2d.model.ZLayerModel.getImageLayer(
        "http://127.0.0.1:8180/gis/gisserver/qx/img/yuntuimg/YUNTU/BIGIMG/SEVP_NSMC_WXBL_FY4A_ETCC_ACHN_LNO_PY_20210616012300000.JPG",
    ).appendOptionsContent({ //
        options: {
            extent: [61.16, 4.25, 138.21, 54.48],
        }
    });
    let lyr2 = zgis2d.enum.LayerSourceTypeEnum.getInstance(zgis2d.enum.LayerTypeEnum.LAYER_TYPE_IMAGE, yt.sourcetype.toLowerCase(), yt);
    map.addLayer(lyr2, yt.order);
}

/**
 * 添加GIS平台接口图层
 */
function addLayerFromGisPlatform() {
    const layeroption = zgis2d.model.ZLayerModel.getWFSLayer(
        'http://127.0.0.1:9800/gis-map/ZdMapService/zdgis/1459065129506639874?key=040c293d8fa177f73ea92fb3b882093ccf7415cad75e65460dceb85ff139ce9a3c57381ec026b7ed16339a9160e9684eab7e216936036c72298fa924f8c6e2f86489c9e6c21a0a3b94925e8c3e3a62021e324d6a72cc1da468631829b006c743aac191b98b2195f568c93da14dfb7cc6e6baa1655d90aace2c94241e4e9a7fef91',
        "zdgis:res2_4m",
        {
            "type": "uniquevalue",
            "valueFieldName": "gbcode",
            "symbol": [{
                    "value": "31060",
                    "symbol": {
                        "type": "zSMS",
                        "style": "circle",
                        "color": "#1890FF",
                        "size": 6,
                        "angle": 0,
                        "xoffset": 0,
                        "yoffset": 0,
                        "outline": {}
                    }
                },
                {
                    "value": "default",
                    "symbol": {
                        "type": "zPMS",
                        url: 'http://192.168.10.74:9000/zdgis/map-style/marker_65e4e83f-94d3-47ef-8a16-03d66d653ead.png',
                        width: 64,
                        height: 64,
                        scale: 0.5
                    }
                }
            ]
        },
        null,
        2,
        "测试",
        null,
        "layerPreview",
        "图层预览",
        1,
        4326
    )
    .appendOptionsContent({
        filter: {
            default: 'gid <= 1000'
        }
    })
    .toJSON();
    console.log(layeroption)
    const layer = zgis2d.enum.LayerSourceTypeEnum.getInstance(zgis2d.enum.LayerTypeEnum.LAYER_TYPE_FEATURE,
        zgis2d.enum.LayerSourceTypeEnum.WFS, layeroption);
    map.addLayer(layer);
}