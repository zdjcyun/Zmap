import ZPoint from '../geometry/ZPoint.js';
import ZMultiPoint from '../geometry/ZMultiPoint.js';
import ZPolyline from '../geometry/ZPolyline.js';
import ZPolygon from '../geometry/ZPolygon.js';
import ZMultiPolygon from '../geometry/ZMultiPolygon.js';
import ZGraphic from '../ZGraphic.js';
import ZSpatialReference from '../ZSpatialReference.js';
import HTTPRequest from '../../core/HttpRequest.js';


/**
 * @exports ZGraphicUtil
 * @classdesc ZGraphic的工具类。此类为Object实例，不需要new
 * @class
 */
let ZGraphicUtil = {

    /**
     * 从原生要素数组生成Z对象数组
     * @param {Array<ol.Feature>} features 原生要素数组
     * @param {Boolean} isReference 是否引用原始对象，false表示重新构造新的feature对象
     * @param {Number} [crs=0] 坐标参考系代号
     * @returns {Array}
     */
    graphicsFromFeatures: function (features, isReference, crs) {
        let graphics = [];
        let geo;
        for (let i = 0, len = features.length; i < len; i++) {
            geo = features[i].getGeometry();
            if (geo) {
                geo.set('crs', crs, true);
            }
            graphics.push(ZGraphic.from(features[i], isReference === undefined ? true : isReference));
        }
        return graphics;
    },

    /**
     * 从GeoJSON要素转Z对象
     * @param {Object} feature GeoJSON要素对象
     * @returns {ZGraphic} ZGraphic对象
     * @see https://www.oschina.net/translate/geojson-spec?print
     */
    geoJSONToZGraphic: function (feature) {
        let attr = feature.properties;
        let geo = feature.geometry;

        let sr = feature.crs ? (feature.crs.wkid || 4326) : 4326;
        let srs = new ZSpatialReference(sr);

        let zGeo = null;
        let geotype = geo.type;

        if (geotype === 'LineString' || geotype === 'MultiLineString') {
            zGeo = new ZPolyline(geo.coordinates, srs);
        } else if (geotype === 'Polygon') {
            zGeo = new ZPolygon(geo.coordinates, srs);
        } else if (geotype === 'MultiPolygon') {
            zGeo = new ZMultiPolygon(geo.coordinates, srs);
        } else if (geotype === 'Point') {
            zGeo = new ZPoint(geo.coordinates, srs);
        } else if (geotype === 'MultiPoint') {
            zGeo = new ZMultiPoint(geo.coordinates, srs);
        }

        return new ZGraphic(zGeo, null, attr);
    },

    /**
     * 从Z对象转GeoJSON要素
     * @param {ZGraphic} graphic ZGraphic对象
     * @todo 未实现功能
     */
    zGraphicToGeoJSON: function (graphic) {
        throw new Error('未实现');
    },

    /**
     * 获取graphic列表的边界范围
     * @param {Array<ZGraphic>} graphics ZGraphic数组
     * @return {ZExtent} 矩形范围对象
     */
    getGraphicsExtent: function (graphics) {
        if (!graphics || !_.isArray(graphics)) {
            return;
        }
        let ext;
        for (let index in graphics) {
            let g = graphics[index];
            if (!g.geometry) {
                continue;
            }
            let tmp = g.geometry.getExtent();
            //组合范围
            if (!ext) {
                ext = tmp;
            } else {
                if (ext.xmin > tmp.xmin) {
                    ext.setXmin(tmp.xmin);
                }
                if (ext.ymin > tmp.ymin) {
                    ext.setYmin(tmp.ymin);
                }
                if (ext.xmax < tmp.xmax) {
                    ext.setXmax(tmp.xmax);
                }
                if (ext.ymax < tmp.ymax) {
                    ext.setYmax(tmp.ymax);
                }
            }
        }

        return ext;
    },


    /**
     * 根据过滤条件获取FeatureCollection
     * @param {Object|String} urlOrFeatures GeoJsonFeatureCollection源数据集或为请求地址
     * @param {Object} cql_filter 过滤条件对象
     * @param {String} [cql_filter_key=cql_filter] 过滤条件对象的键名
     * @returns {Promise} 
     */
    getFeatureCollection: function (urlOrFeatures, cql_filter, cql_filter_key) {
        let fc = [];

        if (_.isPlainObject(urlOrFeatures)) {
            if (cql_filter) {
                let nfs = _.filter(url.features, function (feature) {
                    if (_.hasIn(feature, 'properties')) {
                        return _.filter([feature.properties], cql_filter) !== undefined;
                    } else {
                        return false;
                    }
                });
                fc = Object.assign({}, urlOrFeatures, {
                    features: nfs
                });
            } else {
                fc = urlOrFeatures;
            }
            return new Promise((resolve) => {
                resolve(fc);
            });
        } else if (_.isString(urlOrFeatures)) {

            let obj = {};
            if (!cql_filter_key) {
                cql_filter_key = 'cql_filter';
                let cql_filterValue = [];
                _.forEach(cql_filter, function (v, k) {
                    cql_filterValue.push(k + '=' + v);
                    cql_filterValue.push(' and ');
                });
                if (cql_filterValue.length) {
                    obj[cql_filter_key] = _.dropRight(cql_filterValue, 1).join('');
                }
            } else {
                obj = cql_filter;
            }


            return HTTPRequest.get(url, obj);
        }
    },



};

export default ZGraphicUtil;