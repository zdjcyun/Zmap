/*
 * @Author: gisboss
 * @Date: 2020-12-20 22:42:36
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-20 11:56:20
 * @Description: file content
 */

import DataSourceTypeEnum from "./DataSourceTypeEnum.js";
import ZEvent from "../events/ZEvent.js";
import ArcGISImageryProvider from "../layers/provider/ArcGISImageryProvider.js";
import HeatmapImageryProvider from "../layers/provider/HeatmapImageryProvider.js";
import WMSImageryProvider from "../layers/provider/WMSImageryProvider.js";
import UrlImageryProvider from "../layers/provider/UrlImageryProvider.js";
import Model3DUtil from "../utils/Model3DUtil.js";

import ModelOffsetTypeEnum from "../enum/ModelOffsetTypeEnum.js";
import VideoDataSource from "./VideoDataSource.js";
import DynamicImageryDataSource from "./DynamicImageryDataSource.js";
import DistrictDataSource from "./DistrictDataSource.js";
import WaterSurfacePrimitive from "./WaterSurfacePrimitive.js";
import DynamicDataSource from "./DynamicDataSource.js";
import DynamicBillboardCollection from "./DynamicBillboardCollection.js";
import BaseDataSource from "./BaseDataSource.js";
import KrigingImageryProvider from "../layers/provider/KrigingImageryProvider.js";
import TileClassificationPrimitive from "./TileClassificationPrimitive.js";
import CoordTypeEnum from "../enum/CoordTypeEnum.js";
import MapboxImageryProvider from "../layers/provider/MapboxStyleImageryProvider.js";

import LabelExpression from '../../core/LabelExpression.js'
import ZPinBuilder from "../core/ZPinBuilder.js";


function removeFromViewer(viewer, destroy, isRemoveFromPrimitive) {
    let r;
    if (isRemoveFromPrimitive) {
        r = viewer.scene.primitives.remove(this, destroy);
    } else {
        r = viewer.dataSources.remove(this, destroy);
    }

    return r;
}



/**
 * @exports DataSourceLoader
 * @class
 * @classdesc 各种数据源的加载公共类。支持的数据源类型请参考DataSourceTypeEnum。
 * @constructor
 * @param {Cesium.Viewer} viewer viewer原生对象
 */
class DataSourceLoader {

    constructor(viewer) {
        this.viewer = viewer;
        /**
         * @property {ZEvent} errorEvent 数据源错误时触发事件
         * @type {ZEvent}
         */
        this.errorEvent = undefined;

        /**
         * 数据源加载器 
         */
        this.dataSourceLoadHandlers = {
            [DataSourceTypeEnum.DS_GEOJSON]: this.loadGeoJsonDataSource,
            [DataSourceTypeEnum.DS_ARCGIS_MAPSERVER]: this.loadArcGISImageryProvider,
            [DataSourceTypeEnum.DS_IMAGERY_URLTEMPLATE]: this.loadUrlImageryProvider,
            [DataSourceTypeEnum.DS_IMAGERY_HEATMAP]: this.loadHeatmapImageryProvider,
            [DataSourceTypeEnum.DS_IMAGERY_KRIGING]: this.loadKrigingImageryProvider,
            [DataSourceTypeEnum.DS_WMS]: this.loadWMSImageryProvider,

            [DataSourceTypeEnum.DS_KML]: this.loadKmlDataSource,
            [DataSourceTypeEnum.DS_CZML]: this.loadCzmlDataSource,
            [DataSourceTypeEnum.DS_3DTILESET]: this.loadCesium3DTileset,
            [DataSourceTypeEnum.DS_CUSTOM]: this.loadCustomDataSource,
            [DataSourceTypeEnum.DS_WATER]: this.loadWaterDataSource,
            [DataSourceTypeEnum.DS_VIDEO]: this.loadVideoDataSource,
            [DataSourceTypeEnum.DS_DYNAMIC_IMAGERY]: this.loadDynamicImageryDataSource,
            [DataSourceTypeEnum.DS_DYNAMIC]: this.loadDynamicDataSource,
            [DataSourceTypeEnum.DS_DYNAMIC_PRIMITIVE]: this.loadDynamicBillboardCollection,
            [DataSourceTypeEnum.DS_ARCGIS_SHP]: undefined,
            [DataSourceTypeEnum.DS_DISTRICT]: this.loadDistrictDataSource,
            [DataSourceTypeEnum.DS_TILE_CLASSIFICATION]: this.loadTileClassificationDataSource,
        };
    }


    loadDataSource(type, url, options) {
        const handler = this.dataSourceLoadHandlers[type];
        if (!handler) {
            loadDataSourceError.call(this, '数据源type无效');
            return;
        }

        const loadCallback = ds => {
            if (!ds) {
                loadDataSourceError.call(this, '返回的数据源对象为空');
            }
            return ds;
        };

        if (type === DataSourceTypeEnum.DS_CUSTOM) {
            return handler.call(this, options).then(loadCallback);
        }

        return handler.call(this, url, options).then(loadCallback);
    }

    /**
     * 加载GeoJSON数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadGeoJsonDataSource(url, options) {

        let geojsonOptions = options || {};

        if (geojsonOptions.markerColor && typeof geojsonOptions.markerColor === 'string') {
            geojsonOptions.markerColor = Cesium.Color.fromCssColorString(geojsonOptions.markerColor);
        }

        return Cesium.GeoJsonDataSource.load(url, geojsonOptions).then((dataSource) => {
            dataSource.removeFromViewer = removeFromViewer;
            this.viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                var entity  = entities[i];
                //名称用加载数据的一项属性
                //entity.name = entity.properties.XZQMC;
                //获取此时此刻的点集
                //整个Entity API的属性设计是不仅仅考虑是一个常量值，而需要设置一些随时间变换的值。
                //所有的属性类实现 Property 接口, Cesium中定义了很多种属性类。为了读取属性的值，我们需要调用 getValue函数,时间参数传当前场景时间即可。
                //vacr poinitsArray = entity.polygon.hierarchy.getValue(Cesium.clock.currentTime).positions;效果一样 
                var pointsArray = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                //获取entity的polygon的中心点
                var centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
                //将entity的position设置为centerpoint，这里很好奇一个polygon没有position么，
                //如果没有设置，确实为undefined
                 entity.position = centerpoint;

                if(options.label) {
                    const label = LabelExpression.parse(options.label.text, entity)

                    // 注记显示类型：billboard 广告牌， label 平铺注记
                    if(options.label.type === "billboard") { // 广告牌
                        const pinBuild = new ZPinBuilder()
                        // const pin = pinBuild.fromCustomSymbolDefault(Cesium.Color.BLUE,50)
                        // const pin = pinBuild.fromInfoWindow('min',options.label.size[0],options.label.size[1],label,options.label.font,options.label.offset) // max
                        // 文字太长变小
                        // const pin = pinBuild.fromText2("B",Cesium.Color.GREEN,200,options.label.font)
                        const pin = pinBuild.fromUrl(options.label.backgroundImage,options.label.size[0],options.label.size[1],label,options.label.font,options.label.offset) // max

                        // 贴地 ？？、
                        entity.billboard = {
                            image: pin,
                            width: options.label.size[0],
                            height: options.label.size[1],
                            // pixelOffset: new Cesium.Cartesian2(0, 0),   //偏移量
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                            // verticalOrigin: Cesium.VerticalOrigin.BOTTOM, 
                            distanceDisplayCondition: options.label.displayDistance ? new Cesium.DistanceDisplayCondition(options.label.displayDistance[0], options.label.displayDistance[1]) : null,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        };
                    } else { // label
                        //设置标签名称
                        entity.label={
                            backgroundColor: new Cesium.Color(0, 0, 1, 0.4),
                            showBackground: true,
                            font: '12px sans-serif',
                            text: label,
                            // outlineColor: new Cesium.Color.RED,
                            // outlineWidth: 2
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            backgroundPadding: new Cesium.Cartesian2(7, 5),
                            distanceDisplayCondition: options.label.displayDistance ? new Cesium.DistanceDisplayCondition(options.label.displayDistance[0], options.label.displayDistance[1]) : null
                        }
                    }
                }


            }
            return dataSource;
        });
    }



    /**
     * 加载Cesium.Cesium3DTileset数据源
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadCesium3DTileset(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            url: url,
            crs: CoordTypeEnum.wgs84
        });

        return new Cesium.Cesium3DTileset(tsOptions).readyPromise.then((dataSource) => {
            dataSource.name = options.name;

            let offset = options.offset;

            let resultObj = getModelTransformMatrix4(dataSource, offset, options.crs, options.sceneCrs);
            if (resultObj) {
                if (resultObj.needRotation) {
                    dataSource._root.transform = Cesium.Matrix4.IDENTITY;
                }
                dataSource.modelMatrix = resultObj.matrix;
            }

            dataSource.removeFromViewer = removeFromViewer;
            dataSource.isRemoveFromPrimitive = true;
            this.viewer.scene.primitives.add(dataSource);


            return dataSource;
        });

    }


    /**
     * 加载KML数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadKmlDataSource(url, options) {
        let kmlOptions = Cesium.combine((options || {}), {
            camera: this.viewer.scene.camera,
            canvas: this.viewer.scene.canvas,
            name: options.name,
        });

        return Cesium.KmlDataSource.load(url, kmlOptions).then((dataSource) => {
            dataSource.removeFromViewer = removeFromViewer;
            this.viewer.dataSources.add(dataSource);


            return dataSource;
        });
    }

    /**
     * 加载CZML数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadCzmlDataSource(url, options) {
        let czmlOptions = Cesium.combine((options || {}), {
            name: options.name,
        });

        return Cesium.CzmlDataSource.load(url, czmlOptions).then((dataSource) => {
            dataSource.removeFromViewer = removeFromViewer;
            this.viewer.dataSources.add(dataSource);

            return dataSource;
        });
    }



    /**
     * 加载ArcGIS MapServer数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadArcGISImageryProvider(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            id: options.name, //图片图层取id
            url: url
        });

        return Cesium.when(new ArcGISImageryProvider(tsOptions)).then((imgProvider) => {
            imgProvider.addToViewer(this.viewer);
            return imgProvider;
        });

    }




    /**
     * 加载影像URL模板数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadUrlImageryProvider(url, options) {

        let tsOptions = Cesium.combine((options || {}), {
            id: options.name, //图片图层取id
            url: url
        });

        return Cesium.when(new UrlImageryProvider(tsOptions)).then((imgProvider) => {
            imgProvider.addToViewer(this.viewer);


            return imgProvider;
        });
    }


    /**
     * 加载热力图数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadHeatmapImageryProvider(url, options) {

        let tsOptions = Cesium.combine((options || {}), {
            id: options.name, //图片图层取id
            url: url
        });

        return Cesium.when(new HeatmapImageryProvider(this.viewer, tsOptions)).then((imgProvider) => {
            imgProvider.addToViewer(this.viewer);

            return imgProvider;
        });
    }


    /**
     * 加载kriging数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadKrigingImageryProvider(url, options) {

        let tsOptions = Cesium.combine((options || {}), {
            id: options.name, //图片图层取id
            url: url
        });

        return Cesium.when(new KrigingImageryProvider(this.viewer, tsOptions)).then((imgProvider) => {
            imgProvider.addToViewer(this.viewer);

            return imgProvider;
        });
    }



    /**
     * 加载WMS数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadWMSImageryProvider(url, options) {

        let tsOptions = Cesium.combine((options || {}), {
            id: options.name, //图片图层取id
            url: url
        });

        if (!tsOptions.layers) {
            loadDataSourceError.call(this, '数据源options.layers无效', options);
            return;
        }


        return Cesium.when(new WMSImageryProvider(tsOptions)).then((imgProvider) => {
            imgProvider.addToViewer(this.viewer);


            return imgProvider;
        });

    }




    /**
     * 加载动态水面数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadWaterDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url
        });

        return WaterSurfacePrimitive.load(tsOptions.url, tsOptions).then((primitive) => {
            primitive.addToViewer(this.viewer);

            return primitive;
        });
    }


    /**
     * 加载视频数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadVideoDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url
        });

        if (!tsOptions.domId) {
            loadDataSourceError.call(this, '数据源options.domId无效', options);
            return;
        }


        return VideoDataSource.load(tsOptions.url, tsOptions, this.viewer).then((dataSource) => {
            dataSource.addToViewer(this.viewer);

            return dataSource;
        });
    }


    /**
     * 加载图片动态切换的数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadDynamicImageryDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url
        });

        if (!tsOptions.images) {
            loadDataSourceError.call(this, '数据源options.images无效', options);
            return;
        }

        return DynamicImageryDataSource.load(tsOptions.url, tsOptions).then((dataSource) => {
            dataSource.addToViewer(this.viewer);

            return dataSource;
        });

    }


    /**
     * 加载动态数据源 
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadDynamicDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url
        });


        return DynamicDataSource.load(tsOptions.url, tsOptions).then((dataSource) => {
            dataSource.addToViewer(this.viewer);

            return dataSource;
        });

    }

    /**
     * 加载动态primitive数据源
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadDynamicBillboardCollection(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url
        });


        return DynamicBillboardCollection.load(tsOptions.url, tsOptions, this.viewer).then((dataSource) => {
            dataSource.addToViewer(this.viewer);
            return dataSource;
        });
    }


    /**
     * 加载行政区划数据源
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     * @returns {Promise}
     */
    loadDistrictDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url,
            raiseFlyEvent: !0,
        });


        return DistrictDataSource.load(tsOptions.url, tsOptions).then((dataSource) => {
            dataSource.addToViewer(this.viewer);
            return dataSource;
        });
    }


    /**
     * 加载BaseDataSource自定义数据源
     * @param {Object} options 数据源配置对象
     */
    loadCustomDataSource(options) {
        let customOptions = options || {};
        return Cesium.when(new BaseDataSource(customOptions)).then((dataSource) => {

            let entities = customOptions.entities;
            if (entities) {
                for (let i = 0, len = entities.length; i < len; i++) {
                    dataSource.entities.add(entities[i]);
                }
            }
            //添加自定义数据源
            this.viewer.dataSources.add(dataSource);

            return dataSource;
        });
    }


    /**
     * 加载切片模型单体化数据源
     * @param {Strig} url 数据源地址
     * @param {Object} options 数据源配置对象
     */
    loadTileClassificationDataSource(url, options) {
        let tsOptions = Cesium.combine((options || {}), {
            name: options.name,
            url: url,
            color: options.highlightColor,
        });

        return TileClassificationPrimitive.load(tsOptions.url, tsOptions, this.viewer).then((dataSource) => {
            dataSource.addToViewer(this.viewer);
            return dataSource;
        });
    }





}




/**
 * Tileset数据源的模型变化矩阵
 * @private
 * @param {Cesium.Cesium3DTileset} tileset 切片数据集
 * @param {Object} offset 偏移参数对象
 * @param {Number} from 数据源坐标系代号
 * @param {Number} to 目标场景坐标系
 * @param {Cesium.Matrix4} [result] 变化矩阵
 * @returns {null|{needTranslation: boolean, needRotation: *, needScale: (*|boolean), matrix: *}}
 */
function getModelTransformMatrix4(tileset, offset, from, to, result) {
    let needTransCenter = from !== to;
    if (needTransCenter) {
        offset = Cesium.defaultValue(offset, {});
    } else if (!offset || _.isEmpty(offset)) {
        return null;
    }

    if (!result) {
        result = new Cesium.Matrix4();
        Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, result);
    }


    let origin = tileset.boundingSphere.center;
    let center = Cesium.Cartographic.fromCartesian(origin);


    let needTranslation = offset.hasOwnProperty('x') || offset.hasOwnProperty('y') || offset.hasOwnProperty('z');
    let needRotation = offset.heading !== undefined || offset.pitch !== undefined || offset.roll !== undefined;
    let scaleObj = offset.scale;
    let needScale = scaleObj && !_.isEmpty(scaleObj);

    let target = null;
    if (needTransCenter || needTranslation) {
        // 这样统一的纠偏效果不行，中国的坐标系偏移在不同的地方偏移不一样，此方法不行，所以注释掉，不做处理。
        // let centerTrans = needTransCenter ? GeoCoordConverterUtil.coordsConvert(from, to,
        //     Cesium.Math.toDegrees(center.longitude), Cesium.Math.toDegrees(center.latitude)) : undefined;
        let centerTrans = undefined;

        target = getTargetPosition(center, centerTrans, offset);
        if (!needRotation) {
            Model3DUtil.fromTranslation(center, target, result);
        }
    } else {
        target = center;
    }

    if (needRotation) {
        Model3DUtil.fromRotation(target, offset.heading, offset.pitch, offset.roll, result);
    }

    if (needScale) {
        if (scaleObj.scaleX !== undefined || scaleObj.scaleY !== undefined || scaleObj.scaleZ !== undefined) {
            let sx = Cesium.defaultValue(scaleObj.scaleX, 1.0);
            let sy = Cesium.defaultValue(scaleObj.scaleY, 1.0);
            let sz = Cesium.defaultValue(scaleObj.scaleZ, 1.0);
            let scale = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(sx, sy, sz));

            result = Cesium.Matrix4.multiply(result, scale, new Cesium.Matrix4());
        }
    }

    let r = {
        needTranslation: needTranslation,
        needRotation: needRotation,
        needScale: needScale,
        matrix: result
    }
    return r;
}

/**
 * 根据偏移参数获取目标点坐标
 * @param {Cesium.Cartographic} center 模型中心原点
 * @param {Cesium.Cartographic} centerTrans 坐标变换之后的模型中心原点
 * @param {Object} offsetOpt 偏移参数对象
 * @returns {Cesium.Cartographic} 目标点
 */
function getTargetPosition(center, centerTrans, offsetOpt) {
    if (!centerTrans && !offsetOpt) {
        return;
    }
    offsetOpt = Cesium.defaultValue(offsetOpt, {});
    if (_.isNil(offsetOpt.type)) {
        offsetOpt.type = ModelOffsetTypeEnum.OFFSET;
    }
    let offset = {
        x: 0,
        y: 0,
        z: 0
    };
    if (Cesium.defined(offsetOpt.x)) {
        offset.x = Cesium.Math.toRadians(offsetOpt.x);
    }
    if (Cesium.defined(offsetOpt.y)) {
        offset.y = Cesium.Math.toRadians(offsetOpt.y);
    }

    if (centerTrans) {
        centerTrans.x = Cesium.Math.toRadians(centerTrans.x);
        centerTrans.y = Cesium.Math.toRadians(centerTrans.y);
    }

    if (offsetOpt.type === ModelOffsetTypeEnum.TARGET) {
        offset.x = (centerTrans ? (centerTrans.x - center.longitude) : 0) + Cesium.defined(offsetOpt.x) ? offset.x : center.longitude;
        offset.y = (centerTrans ? (centerTrans.y - center.latitude) : 0) + Cesium.defined(offsetOpt.y) ? offset.y : center.latitude;
        offset.z = Cesium.defined(offsetOpt.z) ? offsetOpt.z : center.height;
    } else if (offsetOpt.type === ModelOffsetTypeEnum.OFFSET) {
        offset.x = (centerTrans ? (centerTrans.x - center.longitude) : 0) + center.longitude + offset.x;
        offset.y = (centerTrans ? (centerTrans.y - center.latitude) : 0) + center.latitude + offset.y;
        offset.z = center.height + (Cesium.defined(offsetOpt.z) ? offsetOpt.z : 0);
    }

    let target = Cesium.Cartographic.fromRadians(offset.x, offset.y, offset.z);

    return target;
}


/**
 * 数据源发生错误时调用
 * @private
 * @param {String} error 错误信息
 * @param {Object} data 配置项
 */
function loadDataSourceError(error, data) {
    let msg = {
        error: 1,
        msg: error || '数据源无效'
    };

    if (this.errorEvent) {
        this.errorEvent.raiseEvent(msg, data);
    }
}

export default DataSourceLoader;