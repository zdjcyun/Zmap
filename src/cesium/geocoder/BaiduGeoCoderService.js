/*
 * @Author: gisboss
 * @Date: 2021-05-06 10:26:35
 * @LastEditors: gisboss
 * @LastEditTime: 2021-08-16 07:56:45
 * @Description: file content
 */
import GeoCoordConverterUtil from "../utils/GeoCoordConverterUtil.js";

/**
 * @exports BaiduGeoCoderService
 * @class
 * @classdesc 百度地理编码类。名字空间map3d.geocoder.BaiduGeoCoderService
 * @param {Object} [options] 参数配置对象.
 * @param {Object} options.url 请求地址.默认为https://map.baidu.com/
 * @param {Object} options.params 请求参数对象
 * @param {Number} [options.crs=CoordTypeEnum.wgs84] 输出坐标系代号.
 * @see {@link CoordTypeEnum}
 */
import CoordTypeEnum from "../enum/CoordTypeEnum.js";

let BaiduGeoCoderService = function (options) {
    this.options = options || {};
    /**
     * 此方法会被内部的地理编码服务对象自动调用
     * @param {String} input 查询关键字
     * @param {String} geocodeType
     * @returns {Promise<GeocoderService~Result[]>}
     */
    this.geocode = (input, geocodeType) => {
        let endpoint = this.options.url || 'https://map.baidu.com/';
        let resource = new Cesium.Resource({
            url: endpoint,
            queryParameters: Object.assign({
                // 关键字
                wd: input,
                // 地市
                c: '中国',
                // 范围(12524001.72,3248282.27;12622305.72,3267930.27)
                b: '',
                // 当前页码，如果小于3则减1，大于等于3，则不处理
                pn: 0,
                // 开始条(pagenum - 1) * 10
                nn: 0,
                newmap: 1,
                reqflag: 'pcmap',
                biz: 1,
                from: 'webmap',
                // 'baidu','after_baidu'
                da_par: 'direct',
                pcevaname: 'pc4.1',
                qt: 's',
                // 'pcmappg.poi.page'
                da_src: 'searchBox.button',
                db: 0,
                addr: 0,
                on_gel: 1,
                src: 0,
                device_ratio: 2,
                wd2: '',
                sug: 0,
                l: 19,
                biz_forward: '{"scaler":2,"styles":"pl"}',
                sug_forward: '',
                tn: 'B_NORMAL_MAP',
                ie: 'utf-8'
            }, this.options.params)
        });

        return resource.fetchJsonp()
            .then((d) => {
                if (d && d.result) {
                    let total = d.result.total;
                    let content = d.content;
                    if (total && content && content.length) {
                        let newResult = [];
                        content.forEach((resultObject) => {
                            let x = resultObject.x;
                            let y = resultObject.y;
                            if (!x || !y) {
                                return true;
                            }
                            x = x * 0.01;
                            y = y * 0.01;

                            let xy = GeoCoordConverterUtil.coordsConvert(CoordTypeEnum.bd09mc, this.options.crs || CoordTypeEnum.wgs84, x, y);
                            newResult.push({
                                displayName: resultObject.name + ' ' + resultObject.area_name,
                                destination: Cesium.Cartesian3.fromDegrees(xy.x, xy.y)
                            });
                        });

                        return newResult;
                    }
                }
            });
    }
};

export default BaiduGeoCoderService;
