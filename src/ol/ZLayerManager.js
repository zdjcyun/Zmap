import HttpRequest from '../core/HttpRequest.js';

/**
 * @exports ZLayerManager
 * @class
 * @classdesc 图层配置管理类。初始加载的图层配置由本类完成，组织图层树结构，保存图层相关配置。
 * 只有图层配置加载请求完成后才开始初始化地图图层加载。
 * @param {Object} options 图层对象参数
 * @property {Object} options 参数属性
 * @property {string|Array} options.url 图层配置请求地址或者为源始数组对象。
 * @property {Object} options.options 图层请求的其它参数选项。
 * @example
 * (1) 图层配置请求地址
 *
 * {
 *     "url": "http://127.0.0.1/webgis/gis/api/geo/config/layer",
 *     "options": {
 *           "mapid": 1
 *     }
 * }
 *
 * (2) 图层配置源始数组对象。具体图层参数说明请参考{@link LayerModel}
 *
 * {
 * url:[{
 *   "mapid": 1,
 *   "name": "高德影像",
 *   "id": "tl_online_gaode_image",
 *   "type": "tile",
 *   "sourcetype": "online",
 *   "order": 0,
 *   "state": 1,
 *   "url": "gaode",
 *   "options": {
 *       "layerType": "image",
 *       "extent": ""
 *   },
 *   "groupid": "basemap",
 *   "groupname": "基础底图",
 *   "grouporder": 0
 * },
 * {
 *    "mapid": 1,
 *    "name": "行政区划",
 *    "id": "dl_wms_china_district",
 *    "type": "dynamic",
 *    "sourcetype": "wms",
 *    "order": 1,
 *    "state": 1,
 *    "url": "http://127.0.0.1/geoserver/hs_science_city/wms",
 *    "options": {
 *        "params": {
 *            "layers": "china_district"
 *        },
 *        "strategy": {
 *            "0-5": "subtype in (100,400)",
 *            "6-10": "subtype  in (200,400)",
 *            "11-30": "subtype=300"
 *        },
 *        "wkid": 4326
 *    },
 *    "groupid": "infrastructure",
 *    "groupname": "基础设施",
 *    "grouporder": 1
 * }]
 * @see LayerModel
 */
class ZLayerManager {
    constructor(map, options) {

        this.options = options || {};
        this.map = map;
        /**
         * @property {Array} config 图层源始配置数组
         */
        this.config = null;
        /**
         * @property {Array} configTree 图层配置进行图层分组构建的树结构
         */
        this.configTree = null;

        /**
         * 配置是否已加载
         */
        this.loaded = false;
    }

    async init(success) {
        this.loaded = false;

        let reqUrl = this.options.url;

        if (_.isString(reqUrl)) {
            let params = this.options.options;
            try {
                const resolve = await HttpRequest.get(reqUrl, params);

                if (resolve.status !== 200) {
                    throw new Error(`request layer url failed! response status >> ${resolve.status}`);
                }
                let data = resolve.data;
                if (data.code !== 0) {
                    console.error(data.msg);
                    return;
                }

                this.config = parserConfig(data.data);
                this.configTree = this.buildLayerTree(this.config);

                this.loaded = true;
            } catch (error) {
                console.log('request layer url failed!');
                throw error;
            }
        } else if (_.isArray(reqUrl)) {
            this.config = reqUrl;
            this.configTree = this.buildLayerTree(this.config);
            this.loaded = true;
        }

        return this.config;

    }



    /**
     * 构建图层分层结构树
     * @example
     * [{
     *     id: 'basemap',
     *     name: '底图', open: true, nocheck: false,
     *     children: []
     * }]
     * @method
     * @param {Array} layerConfig 图层配置数组
     * @return {Array} 图层树
     */
    buildLayerTree(layerConfig) {

        let lyrTree = [];

        let layerGroupCache = {};
        let layerGroupChildren;
        for (let i = 0, len = layerConfig.length; i < len; i++) {
            let item = Object.assign({}, layerConfig[i]);
            let gid = item['groupid'];
            if (!layerGroupCache[gid]) {
                layerGroupCache[gid] = {
                    id: gid,
                    name: item['groupname'],
                    order: item['grouporder'],
                    open: true,
                    nocheck: false,
                    children: []
                };
            }
            layerGroupChildren = layerGroupCache[gid].children;

            if (item.options && item.options.visible !== undefined) {
                item.checked = item.options.visible;
            } else {
                item.checked = true;
            }
            delete item.url;


            layerGroupChildren.push(item);
        }

        _.forEach(layerGroupCache, function (item) {
            item.children.sort(sortOrder);

            let pChecked = false;
            _.forEach(item.children, function (childItem) {
                if (childItem.checked) {
                    pChecked = true;
                    return false;
                }
            });
            item.checked = pChecked;
            lyrTree.push(item);
        });

        lyrTree.sort(sortOrder);

        return lyrTree;
    }



    /**
     * 更新配置
     * @param {String} layerId 图层唯一id
     * @param {Object} object 图层新配置对象
     */
    updateConfigTree(layerId, object) {
        _.forEach(this.configTree, function (item) {
            if (item.id === layerId) {
                Object.assign(item, object);
                if ('checked' in object) {
                    _.forEach(item.children, function (childItem) {
                        childItem.checked = object.checked;
                    });
                }
                return false;
            } else {
                let pCheckedCount = false;
                _.forEach(item.children, function (childItem) {
                    if (childItem.id === layerId) {
                        Object.assign(childItem, object);
                    }
                    if (childItem.checked) {
                        pCheckedCount = true;
                    }
                });
                item.checked = pCheckedCount;
            }
        });
    }

    /**
     * 根据图层id获取图层配置
     * @param {String} layerId 图层唯一id
     * @returns {Object}
     */
    getConfigById(layerId) {
        let r = undefined;
        _.forEach(this.configTree, function (item) {
            if (item.id === layerId) {
                r = item;
                return false;
            } else {
                _.forEach(item.children, function (childItem) {
                    if (childItem.id === layerId) {
                        r = item;
                        return false;
                    }
                });
                if (r) {
                    return false;
                }
            }
        });

        return r;
    }

    /**
     * 根据图层id获取源始图层配置(没有进行树状层次分析)
     * @param {String} layerId 图层唯一id
     * @returns {Object}
     */
    getOriginalConfigById(layerId) {
        let r = undefined;
        _.forEach(this.config, function (item) {
            if (item.id === layerId) {
                r = item;
                return false;
            }
        });

        return r;
    }

    /**
     * 根据图例配置的可见性获取图例图层数组
     * @param {boolean} [visible=true] 根据图例的可见性过滤
     * @returns {Array}
     */
    getLegendLayers(visible) {
        let r = [];
        visible = visible === undefined ? true : visible;
        _.forEach(this.config, function (item) {
            let l = item.options.legend;
            if (!l) {
                return;
            }
            let v = l.visible;
            if ((v && !visible) || (!v && visible)) {
                return;
            }
            r.push(item);
        });

        return r;
    }


}


function parserConfig(config) {
    if (!config) {
        return [];
    }
    _.forEach(config, function (item) {
        // console.log(item.options);
        if (item.options && _.isString(item.options)) {
            item.options = JSON.parse(item.options);
        }
    });
    return config;
}



/**
 * 组、图层都降序排列
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 * @private
 */
function sortOrder(a, b) {
    return b.order - a.order;
}

export default ZLayerManager;