/**
 * @exports DynamicImageryDataSource
 * @class
 * @classdesc 动态图片数据源。名字空间map3d.datasources.provider.DynamicImageryDataSource
 * @constructor
 * @param {Object} options 参数配置对象
 * @param {GeoJsonFeatureCollection|String} options.url 矩形的几何GeoJSON参数对象或URL请求GeoJson地址
 * @param {Array.<String>} options.images 动态云图纹理图片对象或URL请求地址数组
 * @param {Number} [options.refreshInterval=1] 云图切换时间间隔(秒)
 * @param {Number} [options.cloudHeight=10000] 云层地理高度(米)
 */
import BaseDataSource from "./BaseDataSource.js";
import GeoJSONUtil from "../utils/GeoJsonUtil.js";



class DynamicImageryDataSource extends BaseDataSource {
    constructor(options) {

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        options.refreshInterval = Cesium.defaultValue(options.refreshInterval, 1) * 1000;
        options.cloudHeight = Cesium.defaultValue(options.cloudHeight, 10000);

        if (!Cesium.defined(options.url)) {
            throw new Cesium.DeveloperError('options.url is required.');
        }

        super(options);

        /**
         * @property {String} url 数据源
         */
        this.url = options.url;

        /**
         * @property {Object} urlParameters url数据源的请求参数
         * @see {Cesium.Resource}
         */
        this.urlParameters = options.urlParameters;

        /**
         * @property {Array.<String>} images 图片源数组 
         */
        this.images = options.images;

        /**
         * @property {Number} refreshInterval 数据刷新时间间隔
         */
        this.refreshInterval = options.refreshInterval;

        this._refreshImageIntervalId = undefined;

        /**
         * @property {Number} cloudHeight 云层高度
         */
        this.cloudHeight = options.cloudHeight;

        /**
         * @property {Cesium.BoundingSphere} boundingSphere 边界包围球对象
         */
        this.boundingSphere = null;

        //添加清除资源方法
        this.destroyFuns.push(destroy);
    }


    /**
     * 初始化数据源参数
     * @param {Object} url 数据源请求URL
     * @param {Object} [urlParameters] 数据源请求参数。常用的就是携带token
     * @returns {Promise}
     */
    initDataSource(url, urlParameters) {

        // 数据源加载请求Promise 
        let geoPromise;
        if (_.isString(url)) {
            geoPromise = Cesium.Resource.fetchJson(Object.assign({
                url: url,
            }, urlParameters));
        } else {
            geoPromise = Cesium.when(url);
        }

        return geoPromise;
    }


    /**
     * 加载数据
     */
    loadData(options) {
        if (options) {
            if (options.url && options.url !== this.url) {
                this.url = options.url;
            }
            if (options.urlParameters !== this.urlParameters) {
                this.urlParameters = options.urlParameters;
            }
        }

        Cesium.DataSource.setLoading(this, true);
        return this.initDataSource(this.url, this.urlParameters).then((featureCollection) => {
            if (!featureCollection || !featureCollection.features.length) {
                return this;
            }

            const opt = {
                crs: this.crs,
                sceneCrs: this.sceneCrs,
                images: this.images,
                refreshInterval: this.refreshInterval,
                cloudHeight: this.cloudHeight,
            };

            let entities = getRegionEntities.call(this, featureCollection, opt);

            for (let i = 0, len = entities.length; i < len; i++) {
                this.entities.add(entities[i]);
            };

            // 添加边界矩形
            let center = GeoJSONUtil.getCenterFromGeoJson(featureCollection);
            this.boundingSphere = new Cesium.BoundingSphere(
                Cesium.Cartesian3.fromDegreesArrayHeights(center.center)[0], center.distance);

            Cesium.DataSource.setLoading(this, false);

            return this;
        }).otherwise((error) => {
            Cesium.DataSource.setLoading(this, false);
            this.errorEvent.raiseEvent(this, error);
            console.log(error);
            return Cesium.when.reject(error);
        });
    }

}


/**
 * 销毁数据源对象
 */
function destroy() {
    if (this._refreshImageIntervalId) {
        clearInterval(this._refreshImageIntervalId);
    }

    this.boundingSphere = null;
}


function getRegionEntities(featureCollection, options) {

    const geoArray = GeoJSONUtil.getPolygonArrayFromGeoJSON(featureCollection.features, options.crs, options.sceneCrs);

    let refreshInterval = options.refreshInterval;
    let cloudHeight = options.cloudHeight;
    let materialImgs = options.images;
    if (!Array.isArray(materialImgs)) {
        materialImgs = [materialImgs];
    }
    let imageIndex = 0;
    const length = materialImgs.length;
    if (length > 1) {
        // 这里应该用cesium内部的时钟来实现
        // Cesium.JulianDate.secondsDifference(time, startTime)
        if (this._refreshImageIntervalId) {
            clearInterval(this._refreshImageIntervalId);
        }
        this._refreshImageIntervalId = setInterval(() => {
            imageIndex = ++imageIndex % length;
        }, refreshInterval);
    }

    let vs;
    let polygon = {
        //hierarchy: geoArray,
        material: new Cesium.ImageMaterialProperty({
            image: new Cesium.CallbackProperty((time, result) => {
                return materialImgs[imageIndex];
            }, false),
            transparent: true
        }),
        height: cloudHeight,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        extrudedHeight: cloudHeight,
        extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        perPositionHeight: false,
    };
    if (Array.isArray(geoArray)) {
        vs = [];
        for (let i = 0, len = geoArray.length; i < len; i++) {
            vs.push({
                polygon: Object.assign({}, polygon, {
                    hierarchy: geoArray[i]
                })
            });
        };
    } else {
        polygon.hierarchy = geoArray;
        vs = [{
            polygon: polygon
        }];
    }

    return vs;

}


/**
 * 加载数据源
 * @param {Object|String} data 数据源请求地址或直接对象
 * @param {Object} options 数据源参数选项
 * @returns {Promise.<BaseDataSource>}
 */
DynamicImageryDataSource.load = (data, options) => {
    options.url = data;
    return new DynamicImageryDataSource(options).loadData();
}

export default DynamicImageryDataSource;