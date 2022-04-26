import BaseImageryProvider from "./BaseImageryProvider.js";
import ImageryProviderTileStyleEnum from "../enum/ImageryProviderTileStyleEnum.js";

/**
 * @exports GoogleImageryProvider
 * @class
 * @extends Cesium.UrlTemplateImageryProvider
 * @classdesc 谷歌地图切片数据类。无偏注记使用天地图影像注记图层。名字空间map3d.layers.provider.GoogleImageryProvider。
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} [options.url] 切片请求地址
 * @property {String} [options.credit='Google'] 版权信息
 * @property {Number} [options.maximumLevel=22] 切片请求代理地址
 * @property {String} options.tileStyle 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */
class GoogleImageryProvider extends Cesium.UrlTemplateImageryProvider {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        initImageryProvider(options);

        super(options);

        //调用BaseImageryProvider的方法
        this.extendProperty(options);
    }
}



/**
 * 继承属性和方法
 */
BaseImageryProvider.extend(GoogleImageryProvider.prototype);


function initImageryProvider(options) {

    let defaultURL = "";
    switch (options.tileStyle) {
        case ImageryProviderTileStyleEnum.TER_GCJ:
            //官网带注记层的有偏地形图
            // defaultURL = 'https://www.google.cn/maps/vt?lyrs=p&gl=cn&x={x}&y={y}&z={z}';
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=p&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.IMG_GCJ:
            //官网不带注记层
            // defaultURL = 'http://www.google.cn/maps/vt?lyrs=s@850&gl=cn&x={x}&y={y}&z={z}';
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=s&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.IMGANNO_GCJ:
            // defaultURL = 'http://mt{s}.google.cn/vt/lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=h&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.VEC_GCJ:
            //有注记的矢量图
            // defaultURL = 'http://www.google.cn/maps/vt?lyrs=m&gl=cn&x={x}&y={y}&z={z}';
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=m&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.VECANNO_GCJ:
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=m,h&gl=cn&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.IMG:
            //官网不带注记层,无偏移的
            // defaultURL = 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}';
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}&s=Gali';
            break;
        case ImageryProviderTileStyleEnum.IMGANNO:
            let layerId = 'cia';
            let tileMatrixSetId = 'w';
            let token = options.token || '337e4d44090f91bada662f39e0859e71';

            return Object.assign(options, {
                url: `http://t{s}.tianditu.gov.cn/DataServer?T=${layerId}_${tileMatrixSetId}&x={x}&y={y}&l={z}&tk=${token}`,
                maximumLevel: Cesium.defaultValue(options.maximumLevel, 18),
                format: 'image/png',
                tilingScheme: new Cesium.WebMercatorTilingScheme(),
                subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                credit: '天地图'
            });
            // 这个还是有偏
            // defaultURL = 'http://mt{s}.google.cn/vt/lyrs=h&x={x}&y={y}&z={z}&s=Gali';

            break;
        case ImageryProviderTileStyleEnum.VEC:
            break;
        case ImageryProviderTileStyleEnum.VECANNO:
            break;
        case ImageryProviderTileStyleEnum.TER:
            break;
        case ImageryProviderTileStyleEnum.TERANNO:
            break;
        default:
            //有注记的影像图，无偏移
            defaultURL = 'http://mt{s}.google.cn/vt/lyrs=s,h&x={x}&y={y}&z={z}&s=Gali';
            break;
    }

    let url = Cesium.defaultValue(options.url, defaultURL);
    let resource = Cesium.Resource.createIfNeeded(url);

    let maximumLevel = Cesium.defaultValue(options.maximumLevel, 22);


    let credit = Cesium.defaultValue(options.credit, 'Google');
    if (typeof credit === 'string') {
        credit = new Cesium.Credit(credit);
    }

    return Object.assign(options, {
        url: resource,
        credit: credit,
        maximumLevel: maximumLevel,
        subdomains: ['0', '1', '2', '3']
    });
}




export default GoogleImageryProvider;