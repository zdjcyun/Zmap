/*
 * @Author: gisboss
 * @Date: 2021-05-06 10:26:35
 * @LastEditors: gisboss
 * @LastEditTime: 2021-08-16 07:56:09
 * @Description: file content
 */
import GeoCoordConverterUtil from "../utils/GeoCoordConverterUtil.js";
/**
 * @exports GaodeGeoCoderService
 * @class
 * @classdesc 高德地理编码类。名字空间map3d.geocoder.GaodeGeoCoderService
 * @param {Object} [options] 参数配置对象.
 * @param {Object} options.url 请求地址.默认为https://restapi.amap.com/v3/place/text
 * @param {Object} options.params 请求参数对象
 * @param {Number} [options.crs=CoordTypeEnum.wgs84] 输出坐标系代号.
 * @see {@link CoordTypeEnum}
 */
import CoordTypeEnum from "../enum/CoordTypeEnum.js";

let GaodeGeoCoderService = function (options) {
    this.options = options || {};
    /**
     * 此方法会被内部的地理编码服务对象自动调用
     * @param {String} input 查询关键字
     * @param {String} geocodeType
     * @returns {Promise<GeocoderService~Result[]>}
     */
    this.geocode = (input, geocodeType) => {
        let endpoint = this.options.url || 'https://restapi.amap.com/v3/place/text';
        let resource = new Cesium.Resource({
            url: endpoint,
            queryParameters: Object.assign({
                keywords: input,
                key: '553075016c03ba5c90701e4a66143c06',
                output: 'JSON'
            }, this.options.params)
        });

        return resource.fetchJsonp()
            .then((d) => {
                if (d && d.status === '1' && d.count) {
                    let poi_list = d.pois;
                    if (poi_list && poi_list.length) {
                        let newResult = [];
                        poi_list.forEach((resultObject) => {
                            let location = resultObject.location;
                            if (!location) {
                                return true;
                            }
                            let xy = location.split(',');
                            let x = xy[0];
                            let y = xy[1];
                            if (!x || !y) {
                                return true;
                            }

                            xy = GeoCoordConverterUtil.coordsConvert(CoordTypeEnum.gcj02, this.options.crs || CoordTypeEnum.wgs84, x, y);
                            newResult.push({
                                displayName: resultObject.name + ' ' + resultObject.cityname + resultObject.adname,
                                destination: Cesium.Cartesian3.fromDegrees(xy.x, xy.y)
                            });
                        });

                        return newResult;
                    }
                }
            });
    }
};

export default GaodeGeoCoderService;
