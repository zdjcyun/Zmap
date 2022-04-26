/*
 * @Author: gisboss
 * @Date: 2020-08-27 12:37:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-09 14:59:17
 * @Description: 图层数据模型
 */

import LayerSourceTypeEnum from '../enum/LayerSourceTypeEnum.js';


/**
 * 图层源类型对应的参数选项模板
 * @private
 */
let LayerOptionsMap = {
    [LayerSourceTypeEnum.ONLINE]: {
        layerType: 'image',
        extent: ''
    },
    [LayerSourceTypeEnum.WMS]: {
        params: {
            layers: '',
            cql_filter: '1 = 1'
        },
        wkid: 4326,
        visible: true,
        postMessage: true,
        postMsgFilter: {
            fields: [],
            geometry: false
        },
        isSelectable: false,
        showInfoWin: true,
        minZoom: 0,
        legend: {
            visible: false,
            format: 'image/png',
            statistics: '',
            rules: [{
                name: 'Single symbol',
                title: '填充符号',
                value: '0',
                total: ''
            }]
        }
    },
    [LayerSourceTypeEnum.WFS]: {
        layers: '',
        filter: {
            default: '1=1'
        },
        wkid: 4326,
        visible: true,
        postMessage: true,
        postMsgFilter: {
            fields: [],
            geometry: false
        },
        isSelectable: false,
        showInfoWin: true,
        minZoom: 0,
        renderer: {
            type: 'simple',
            symbol: {
                type: 'zSFS',
                style: 'solid',
                outline: {
                    style: 'solid',
                    color: [51, 153, 204, 1],
                    width: 2
                },
                color: [220, 220, 220, 0.8]
            }
        }
    },

    [LayerSourceTypeEnum.FEATURE]: {
        layers: '',
        filter: {
            default: '1=1'
        },
        wkid: 4326,
        visible: true,
        postMessage: true,
        postMsgFilter: {
            fields: [],
            geometry: false
        },
        isSelectable: false,
        showInfoWin: true,
        minZoom: 0,
        format: "geojson",
        renderer: {
            type: 'simple',
            symbol: {
                type: 'zSFS',
                style: 'solid',
                outline: {
                    style: 'solid',
                    color: [51, 153, 204, 1],
                    width: 2
                },
                color: [220, 220, 220, 0.8]
            }
        }
    },

};



/**
 * @exports ZLayerModel
 * @class
 * @classdesc 图层模型类。单个图层的参数对象模型。
 *
 * @param {Object} layerInfo 图层参数对象
 * @property {Object} layerInfo layerInfo对象属性
 * @property {String} layerInfo.id 图层唯一id
 * @property {String} layerInfo.name 图层名称
 * @property {LayerTypeEnum} layerInfo.type 图层类型
 * @property {LayerSourceTypeEnum} layerInfo.sourcetype 图层数据源类型
 * @property {Number} layerInfo.order 图层在地图图层加载时的顺序编号
 * @property {Number} layerInfo.status 图层状态。小于0表示不加载
 * @property {String} layerInfo.url 图层地址
 * @property {Object} layerInfo.options 图层其它参数配置对象
 * @property {String} layerInfo.groupid 图层组id
 * @property {String} layerInfo.groupname 图层组名称
 * @property {Number} layerInfo.grouporder 图层组加载顺序编号
 *
 * @example
 * {
 *   'name': '高德影像',
 *   'id': 'tl_online_gaode_image',
 *   'type': 'tile',
 *   'sourcetype': 'online',
 *   'order': 0,
 *   'status': 1,
 *   'url': 'gaode',
 *   'options': {
 *       'maptype': 'image',
 *       'extent': ''
 *   },
 *   'groupid': 'basemap',
 *   'groupname': '基础底图',
 *   'grouporder': 0
 * }
 */
class ZLayerModel {
    constructor(layerInfo) {
        this.id = layerInfo.id;
        this.name = layerInfo.name;
        this.type = layerInfo.type;
        this.sourcetype = layerInfo.sourcetype;
        this.status = layerInfo.status;
        this.url = layerInfo.url;
        this.order = layerInfo.order;
        this.options = layerInfo.options;
        this.groupid = layerInfo.groupid;
        this.groupname = layerInfo.groupname;
        this.grouporder = layerInfo.grouporder;
    }

    /**
     * 深度复制
     */
    clone() {
        return new ZLayerModel(this.toJSON());
    }

    /**
     * 转换为普通Json对象。options对象为深度复制
     * @returns {Object} 返回深度复制后的Object对象。
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            sourcetype: this.sourcetype,
            status: this.status,
            url: this.url,
            order: this.order,
            options: this.options,
            groupid: this.groupid,
            groupname: this.groupname,
            grouporder: this.grouporder,
        };
    }

    /**
     * 给options属性添加新属性配置
     * @param {Object} configObj 要追加的新配置属性
     * @returns {ZLayerModel} 返回this对象
     */
    appendOptionsContent(configObj) {
        if (!this.options) {
            this.options = {};
        }

        _.forEach(configObj, (value, key) => {
            if (_.isPlainObject(value) && this.options[key]) {
                Object.assign(this.options[key], value);
            } else {
                this.options[key] = value;
            }
        });
        return this;
    }

    /**
     * 根据图层类型预设参数选项值
     * @param {String} layerSourceType 图层类型 @see {@link LayerSourceTypeEnum}
     * @param {Object} options 参数选项
     */
    getOptionsByLayer(layerSourceType) {
        return LayerOptionsMap[layerSourceType];
    }


}

/**
 * 获取在线底图配置。通过调用toJSON可以转为普通Object对象。
 * @param {String} [mapType=gaode] 地图平台类型。如gaode @see {@link LayerSourceTypeEnum}
 * @param {String} [layerType=image] 地图图层风格类型。如image @see {@link MapStyleEnum}
 * @param {String} [name=高德影像] 图层名称
 * @param {String} [id='tl_online_' + mapType + '_' + layerType] 图层id
 * @param {String} [groupid=basemap] 图层组id
 * @param {String} [groupname=基础底图] 图层组名称
 *  * @param {Number} [grouporder=1] 图层组序号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getOnlineBaseMap = (mapType, layerType, name, id, groupid, groupname) => {
    return new ZLayerModel({
        'name': name || '高德影像',
        'id': id || ('tl_online_' + mapType + '_' + layerType),
        'type': 'tile',
        'sourcetype': 'online',
        'order': 0,
        'status': 1,
        'url': mapType || 'gaode',
        'options': {
            'layerType': layerType || 'image',
            'extent': ''
        },
        'groupid': groupid || 'basemap',
        'groupname': groupname || '基础底图',
        'grouporder': 0
    });
}

/**
 * 获取WMS图层配置。
 * @param {String} url 图层URL
 * @param {String} layers 要加载的图层内容名称。参考WMS标准
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='dl_wms_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getWMSLayer = (url, layers, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return new ZLayerModel({
        'name': name,
        'id': id || ('dl_wms_' + layers),
        'type': 'dynamic',
        'sourcetype': 'wms',
        'order': layerOrder || 1,
        'status': 1,
        'url': url,
        'options': {
            'params': {
                'layers': layers,
            },
            'wkid': wkid || 4326,
            'visible': true,
            'isSelectable': false,
            'showInfoWin': true,
        },
        'groupid': groupid || 'dynamic_groupid',
        'groupname': groupname || '动态图层组名称',
        'grouporder': grouporder || 1
    });
}

/**
 * 获取WMS图层配置。
 * @param {String} url 图层URL
 * @param {String} layers 要加载的图层内容名称。参考WMS标准
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='dl_wms_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getArcGISWMSLayer = (url, layers, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return ZLayerModel.getWMSLayer(url, layers, layerOrder, name, id, groupid, groupname, grouporder, wkid)
        .appendOptionsContent({
            "showInfoWin": true,
            featureInfoFormat: 'application/geojson',
            params: {
                EXCEPTIONS: 'text/xml',
            }
        });
}


/**
 * 获取ArcGIS WFS图层配置。
 * @param {String} url 图层URL
 * @param {String} layers 要加载的图层内容名称。参考WMS标准
 * @param {Object} renderer 图层渲染器配置。
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='fl_wfs_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getArcGISWFSLayer = (url, layers, renderer, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return ZLayerModel.getWFSLayer(url, layers, renderer, layerOrder, name, id, groupid, groupname, grouporder, wkid)
        .appendOptionsContent({
            formatType: 'geojson',
            outputFormat: 'geojson',
            version: '2.0.0'
        });
}

/**
 * 获取WFS图层配置。
 * @param {String} url 图层URL
 * @param {String} layers 要加载的图层内容名称。参考WMS标准
 * @param {Object} renderer 图层渲染器配置。
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='fl_wfs_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getWFSLayer = (url, layers, renderer, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return new ZLayerModel({
        'name': name,
        'id': id || ('fl_wfs_' + layers),
        'type': 'feature',
        'sourcetype': 'wfs',
        'order': layerOrder || 1,
        'status': 1,
        'url': url,
        'options': {
            'layers': layers,
            'visible': true,
            // 'filter': {
            //     'default': '1=1',
            // },
            'wkid': wkid || 4326,
            'showInfoWin': true,
            'isSelectable': false,
            'renderer': renderer,
        },
        'groupid': groupid || 'dynamic_groupid',
        'groupname': groupname || '动态图层组名称',
        'grouporder': grouporder || 1
    });
}

/**
 * 获取Feature图层配置。
 * @param {String} url 图层URL
 * @param {Object} renderer 图层渲染器配置。
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='fl_feature_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getFeatureLayer = (url, renderer, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return new ZLayerModel({
        'name': name,
        'id': id || ('fl_feature_' + layerOrder),
        'type': 'feature',
        'sourcetype': 'feature',
        'order': layerOrder || 1,
        'status': 1,
        'url': url,
        'options': {
            'format': 'geojson',
            'visible': true,
            // 'filter': {
            //     'default': '1=1',
            // },
            'wkid': wkid || 4326,
            'showInfoWin': true,
            'isSelectable': false,
            'renderer': renderer,
        },
        'groupid': groupid || 'dynamic_groupid',
        'groupname': groupname || '动态图层组名称',
        'grouporder': grouporder || 1,
    });
}

/**
 * 获取arcgis动态图层配置。
 * @param {String} url 图层URL
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='dl_arcgis_' + layers] 图层id 
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号。
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号。
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getArcGISDynamicLayer = (url, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return new ZLayerModel({
        'name': name,
        'id': id || ('dl_arcgis_' + layerOrder),
        'type': 'dynamic',
        'sourcetype': 'arcgis',
        'order': layerOrder || 1,
        'status': 1,
        'url': url,
        'options': {
            'visible': true,
            'wkid': wkid || 4326,
        },
        'groupid': groupid || 'dynamic_groupid',
        'groupname': groupname || '动态图层组名称',
        'grouporder': grouporder || 1
    });
}


/**
 * 获取图片图层配置。
 * @param {String} url 图层URL
 * @param {Number} [layerOrder=1] 图层加载的顺序号
 * @param {String} [name=undefined] 图层界面显示名称
 * @param {String} [id='il_' + layers] 图层id
 * @param {String} [groupid] 图层组id
 * @param {String} [groupname] 图层组名称
 * @param {Number} [grouporder=1] 图层组序号
 * @param {Number} [wkid=4326] 要加载的图层坐标系代号
 * @returns {ZLayerModel} 底图配置ZLayerModel对象
 */
ZLayerModel.getImageLayer = (url, layerOrder, name, id, groupid, groupname, grouporder, wkid) => {
    return new ZLayerModel({
        'name': name || '图片图层',
        'id': id || ('il_image_' + layerOrder),
        'type': 'image',
        'sourcetype': 'online',
        'order': layerOrder || 1,
        'state': 1,
        'url': url,
        'options': {
            'visible': true,
            'wkid': wkid || 4326,
        },
        'groupid': groupid || 'image_groupid',
        'groupname': groupname || '图片图层组名称',
        'grouporder': grouporder || 1
    });
}

export default ZLayerModel;