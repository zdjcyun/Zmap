import ZGraphic from './ZGraphic.js';
import Fullscreen from '../core/Fullscreen.js';

/**
 * 保存为私有变量，防止对外接口公开
 * @private
 */
let appContext;



/**
 * @exports IMap
 * @classdesc 地图功能操作接口封装。
 * @class
 * @param {ZMapContext} context 地图上下文参数
 */
class IMap {
    constructor(context) {
        appContext = context;
    }


    /**
     * 设置应用程序上下文
     * @param {AppContext} context 上下文
     * @private
     */
    __setAppContext(context) {
        appContext = context;
    }

    /**
     * 使场景全屏显示
     */
    fullscreen() {
        if (Fullscreen.isFullScreen()) {
            Fullscreen.exitFullscreen();
        } else if (Fullscreen.isFullscreenEnabled()) {
            Fullscreen.launchFullscreen(appContext.getMap().getTargetElement());
        }
    }

    /**
     * 地图缩放（放大in，缩小out）
     * @param {string} code 缩放参数。可选值：[in,out]
     * @example mapZoom('in')
     */
    mapZoom(code) {
        if (code === 'out') {
            appContext.getMap().zoomOut(true, 200);
        } else {
            appContext.getMap().zoomIn(true, 200);
        }

    }

    /**
     * 地图缩放到指定层级
     * @param {number} zoom 层级
     * @example mapZoomTo(10)
     */
    mapZoomTo(zoom) {
        appContext.getMap().setZoom(parseInt(zoom), true, 500);
    }

    /**
     * 设置地图范围
     * @param {Object} params 参数对象。
     * @property {Object} params params属性
     * @property {Array<number>} params.extent 范围数组，格式:[xmin,ymin,xmax,ymax]
     * @property {number} [params.from=1] 源数据坐标系代号,默认为wgs84:1
     * (可取值: wgs84:1,webmercator: 2,  gcj02: 3, gcj02mc: 4,  bd09ll: 5,  bd09mc: 6, cgcs2000: 7)，
     * @property {number} [params.to] 目标数据坐标系代号，默认为地图坐标系
     * @example setMapExtent( {extent: [112.547170687, 26.8073250961, 112.5977237131, 26.8411435856601], from:3 })
     */
    setMapExtent(params) {
        let extent = params.extent;
        let from = params.from;
        let to = params.to;
        if (!extent || !_.isArray(extent)) {
            throw new Error('extent参数无效!');
            return;
        }
        from = from || 1;

        let mapView = appContext.getMap().getView();
        let minxyFrom = {
            x: extent[0],
            y: extent[1]
        };
        let minxy = mapView.coordinateTransform(from, to, minxyFrom);

        minxyFrom = {
            x: extent[2],
            y: extent[3]
        };
        let maxxy = mapView.coordinateTransform(from, to, minxyFrom);

        appContext.getMap().setExtent([minxy.x, minxy.y, maxxy.x, maxxy.y], true, 1000);
    }

    /**
     * 地图定位
     * @param {Array<ZGraphic>} features 为ZGraphic要素的JSON数组。具体格式如下:
     * {geometry:<geometry>,symbol:<symbol>,attributes:<Object>}
     * @example
     * [
     * {
     *    geometry: {
     *        geometryType: 'Point',
     *        x: 112.581,
     *        y: 26.8162990000001,
     *        spatialReference: {
     *            wkid: 3//高德地图，谷歌地图经纬度坐标系
     *        }
     *    },
     *    symbol: {
     *        type: 'zPMS',//图片符号
     *        //url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz......',
     *        url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25l......',
     *        width: 24,
     *        height: 24
     *    },
     * //  symbol: {
     * //      type: 'zSMS',//点状线划符号
     * //      style: 'circle',
     * //      size: 8,
     * //      outline: {
     * //          style: 'solid',
     * //          color: [255, 0, 0, 1],
     * //          width: 2
     * //      },
     * //      color: [255, 255, 0, 0.5]
     * //  },
     *    attributes: {
     *        name: '设备',
     *        code: 'sb-001'
     *    }
     * }
     * ]
     */
    mapLocation(features) {

        let gs = featuresToZGraphics(features);

        appContext.getMap().getView().mapLocationBatch(gs, true /*默认清除图层*/ , true);
    }


    /**
     * 清空临时图层,如果要清除全部临时图层，请调用mapRefresh方法
     * @param {String} layerKey 临时图层的键名。取值:locationLayer/tempLayer
     * @example mapLayerClear('locationLayer')
     */
    mapLayerClear(layerKey) {
        appContext.getMap().getView().clearGraphicLayer(layerKey);
    }

    /**
     * 添加图形对象到临时图层
     * @param {Object} params 参数对象。
     * @property {Object} params params属性
     * @property {String} params.layerKey 临时图层的键名。取值:locationLayer/tempLayer
     * @property {ZGraphic} params.features ZGraphic类型的json对象
     * @property {boolean} [params.isclear=true] 添加之前是否清除图层
     * @property {boolean} [params.centermap=false] 是否居中显示地图
     * @example mapLayerAddGraphics('locationLayer')
     */
    mapLayerAddGraphics(params) {
        let layerKey = params.layerKey;
        let features = params.features;
        let isclear = params.isclear;
        let centermap = params.centermap;

        let gs = featuresToZGraphics(features);

        appContext.getMap().getView().addGraphic(layerKey, gs, isclear, centermap);

        return gs;
    }

    /**
     * 刷新地图，清空所有临时图层
     * @example mapRefresh()
     */
    mapRefresh() {
        appContext.getMap().refresh();
    }



}


/**
 * @function {function} featuresToZGraphics 要素转ZGraphic
 * @param {Array} features
 * @return {Array}
 * @private
 */
function featuresToZGraphics(features) {
    let map = appContext.getMap();

    let gs = [];
    for (let f in features) {
        let feat = features[f];
        let sr = feat.geometry.spatialReference;
        if (sr) {
            //追加地图的坐标系参数
            sr.crs = map.crs;
        }
        gs.push(ZGraphic.fromJSON(feat));
    }

    return gs;
}



export default IMap;