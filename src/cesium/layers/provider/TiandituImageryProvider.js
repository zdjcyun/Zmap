/*
 * @Author: gisboss
 * @Date: 2020-08-31 16:43:41
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-22 16:56:53
 * @Description: file content
 */
import ImageryProviderTileStyleEnum from "../enum/ImageryProviderTileStyleEnum.js";
import BaseImageryProvider from "./BaseImageryProvider.js";

/**
 * @exports TiandituImageryProvider
 * @class
 * @extends map3d.layers.provider.BaseImageryProvider
 * @classdesc 天地图地图切片数据类。名字空间map3d.layers.provider.TiandituImageryProvider。
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} [options.url] 切片请求地址
 * @property {String} [options.credit='天地图'] 版权信息
 * @property {Number} [options.maximumLevel=18] 切片请求代理地址
 * @property {String} [options.token] 切片请求token
 * @property {String} [options.tileStyle] 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */


class TiandituImageryProvider extends Cesium.UrlTemplateImageryProvider {
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
BaseImageryProvider.extend(TiandituImageryProvider.prototype);


function initImageryProvider(options) {

    var token = options.token || 'b88cc8129fe0cd5595a5551efe937c5f';
    var tileMatrixSetId = 'w';
    var layerId;
    var format = 'image/png';
    var tilingScheme = new Cesium.WebMercatorTilingScheme();
    switch (options.tileStyle) {
        case ImageryProviderTileStyleEnum.IMG:
            layerId = "img";
            format = 'image/jpeg';
            break;
        case ImageryProviderTileStyleEnum.IMGANNO:
            layerId = "cia";
            break;
        case ImageryProviderTileStyleEnum.TER:
            layerId = "ter";
            break;
        case ImageryProviderTileStyleEnum.TERANNO:
            layerId = "cta";
            break;
        case ImageryProviderTileStyleEnum.VECANNO:
            layerId = "cva";
            break;
        default:
            layerId = "vec";
            format = 'image/jpeg';
            break;
    }
    // 服务域名
    let tdtUrl = 'https://t{s}.tianditu.gov.cn';


    Object.assign(options, {
        url: `${tdtUrl}/DataServer?T=${layerId}_${tileMatrixSetId}&x={x}&y={y}&l={z}&tk=${token}`,
        maximumLevel: Cesium.defaultValue(options.maximumLevel, 18),
        format: format,
        tilingScheme: tilingScheme,
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        credit: options.credit || '天地图'
    });

    // if (['ter', 'cta'].indexOf(layerId) > -1) {
    //     // wmts方式有很多空白图片
    //     let url = `${tdtUrl}/${layerId}_${tileMatrixSetId}/wmts?Service=WMTS&Request=GetTile&Version=1.0.0&Style={style}&Format=tiles&layer=${layerId}&TileMatrixSet={TileMatrixSet}&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&tk=${token}`;
    //     //&serviceMode=KVP
    //     return Object.assign(options, {
    //         url: url,
    //         layer: layerId,
    //         style: 'default',
    //         tileMatrixSetID: tileMatrixSetId,
    //     });

    // }

    return options;
}



export default TiandituImageryProvider;