/**
 * @exports OSMGeoCoderService
 * @class
 * @classdesc OSM地理编码类。不推荐使用。名字空间map3d.geocoder.OSMGeoCoderService
 * @param {Object} [options] 参数配置对象.
 * @param {Object} options.url 请求地址.默认为https://nominatim.openstreetmap.org/search
 */
let OSMGeoCoderService = function (options) {
    this.options = options || {};
    /**
     * 此方法会被内部的地理编码服务对象自动调用
     * @param {String} input 查询关键字
     * @returns {Promise<GeocoderService~Result[]>}
     */
    this.geocode = (input) => {
        var endpoint = this.options.url || 'https://nominatim.openstreetmap.org/search';

        var resource = new Cesium.Resource({
            url: endpoint,
            queryParameters: {
                format: 'json',
                q: input
            }
        });

        return resource.fetchJson()
            .then(function (results) {
                var bboxDegrees;
                return results.map(function (resultObject) {
                    bboxDegrees = resultObject.boundingbox;
                    return {
                        displayName: resultObject.display_name,
                        destination: Cesium.Rectangle.fromDegrees(
                            bboxDegrees[2],
                            bboxDegrees[0],
                            bboxDegrees[3],
                            bboxDegrees[1]
                        )
                    };
                });
            });
    }
};

export default OSMGeoCoderService;
