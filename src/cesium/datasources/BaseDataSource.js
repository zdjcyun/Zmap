/*
 * @Author: gisboss
 * @Date: 2020-12-03 14:39:58
 * @LastEditors: gisboss
 * @LastEditTime: 2021-04-08 11:13:14
 * @Description: file content
 */

import CoordTypeEnum from "../enum/CoordTypeEnum.js";
import ZEvent from "../events/ZEvent.js";

let defaultFlyOptions = {
    offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_TWO + 0.27925, 0),
    raiseFlyEvent: true
};

/**
 * @exports map3d.datasources.BaseDataSource
 * @class
 * @extends Cesium.CustomDataSource
 * @classdesc 自定义扩展数据源基类。
 */
class BaseDataSource extends Cesium.CustomDataSource {
    /** 
     * @constructor
     * @param {Object} options 参数配置对象
     * @param {String} options.name 数据源的名称
     * @param {Number} [options.crs=CoordTypeEnum.wgs84] 源数据的坐标系
     * @param {Number} [options.sceneCrs=CoordTypeEnum.wgs84] 场景底图的坐标系
     */
    constructor(options) {
        options.name = Cesium.defaultValue(options.name, 'BaseDataSource_' + Cesium.createGuid());
        options.crs = Cesium.defaultValue(options.crs, CoordTypeEnum.wgs84);
        options.sceneCrs = Cesium.defaultValue(options.sceneCrs, CoordTypeEnum.wgs84);

        super(options.name);

        this.extendProperty(options);
    }


    extendProperty(options) {
        /**
         * @property {Number} crs 数据源坐标系 
         * @see {@link CoordTypeEnum}
         */
        this.crs = options.crs;

        /**
         * @property {Number} sceneCrs 数据源坐标系 
         * @see {@link CoordTypeEnum}
         */
        this.sceneCrs = options.sceneCrs;

        /**
         * @property {ZEvent} flyCompleteEvent 飞行定位完成事件
         */
        this.flyCompleteEvent = ZEvent.getInstance('flyComplete');

        /**
         * @property {Array.<Function>} destroyFuns 销毁资源需要调用的清除方法列表
         */
        this.destroyFuns = [Cesium.CustomDataSource.destroy];
    }

    /**
     * 初始化数据源参数
     * @param {Object} options 参数对象
     * @returns {Promise}
     */
    initDataSource(options) {
        return Cesium.when(true);
    }

    /**
     * 把数据源添加到Cesium.Viewer对象场景中。
     * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
     * @param {Number} [index=undefined] 被添加到的数据源集合中的索引，默认在尾部追加
     * @returns {Promise.<Cesium.DataSource>}
     */
    addToViewer(viewer, index) {
        return viewer.dataSources.add(this, index);
    }

    /**
     * 把数据源从Cesium.Viewer对象场景中移除。
     * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
     * @param {Boolean} [destroy=undefined] 是否销毁数据源对象
     */
    removeFromViewer(viewer, destroy) {
        if (this.entities.values.length > 0) {
            this.entities.removeAll();
        }

        if (destroy) {
            this.destroy();
        }

        return viewer.dataSources.remove(this, destroy);
    }

    /**
     * 飞向数据源到可视范围
     * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
     * @param {Object} [options] 飞行参数
     * @returns {Promise.<Boolean>}
     */
    flyTo(viewer, options) {
        if (this._isLoading) {
            return Cesium.when(true);
        }

        let opt = {};
        if (!options) {
            Object.assign(opt, defaultFlyOptions);
        } else {
            Object.assign(opt, defaultFlyOptions, options);
        }

        return viewer.flyTo(this, opt).then(() => {
            if (opt.raiseFlyEvent) {
                this.flyCompleteEvent.raiseEvent(this);
            }
        });
    }


    /**
     * 数据显示与隐藏切换
     * @param {Boolean} visible 是否显示对象
     */
    toggle(visible) {
        this.show = visible;
    }

    /**
     * 加载数据
     * @param {Object} options 数据加载参数对象
     * @returns {Promise.<BaseDataSource>}
     */
    loadData(options) {
        Cesium.DataSource.setLoading(this, true);
        return this.initDataSource(options).then(() => {
            Cesium.DataSource.setLoading(this, false);
        }).otherwise((error) => {
            Cesium.DataSource.setLoading(this, false);
            this.errorEvent.raiseEvent(this, error);
            console.log(error);
            return Cesium.when.reject(error);
        });
    }

    /**
     * 根据属性条件过滤实体对象
     * @param {Array.<Object>} filterProperties 过滤条件对象
     * @param {Boolean} [visible=true] 满足条件的实体显示可见性
     * @returns {Array.<Entity>} 满足过滤条件的实体对象
     */
    filterEntity(filterProperties, visible) {
        //如果为空，则认为全部选择
        let allMatched = filterProperties ? false : true;

        if (!Array.isArray(filterProperties)) {
            filterProperties = [filterProperties];
        }

        let entities = this.entities.values;
        let entity;
        let results = [];
        visible = Cesium.defaultValue(visible, true);
        for (let i = 0, len = entities.length; i < len; i++) {
            entity = entities[i];

            if (allMatched) {
                entity.show = visible;
                results.push(entity);
                continue;
            }

            let eProps = entity.properties.getValue();
            let notMatched = false;
            for (let j = 0, lenFilter = filterProperties.length; j < lenFilter; j++) {
                if (!_.isMatch(eProps, filterProperties[j])) {
                    notMatched = true;
                    break;
                }
            }
            if (notMatched) {
                entity.show = !visible;
            } else {
                entity.show = visible;
                results.push(entity);
            }
        }

        return results;
    }

    /**
     * 销毁数据源对象
     */
    destroy() {
        if (this.flyCompleteEvent) {
            this.flyCompleteEvent.removeAll();
            this.flyCompleteEvent = null;
        }
        let desLength = this.destroyFuns.length;
        for (let i = desLength - 1; i > 0; --i) {
            this.destroyFuns[i].call(this);
        }


        let r = (desLength > 0 && this.destroyFuns[0]) ? this.destroyFuns[0].call(this) : Cesium.destroyObject(this);
        this.destroyFuns.length = 0;

        return r;
    }

}



BaseDataSource.extend = (targetPrototype) => {
    targetPrototype.extendProperty = BaseDataSource.prototype.extendProperty;
    targetPrototype.initDataSource = BaseDataSource.prototype.initDataSource;
    targetPrototype.addToViewer = BaseDataSource.prototype.addToViewer;
    targetPrototype.removeFromViewer = BaseDataSource.prototype.removeFromViewer;
    targetPrototype.flyTo = BaseDataSource.prototype.flyTo;
    targetPrototype.loadData = BaseDataSource.prototype.loadData;
    targetPrototype.toggle = BaseDataSource.prototype.toggle;
    targetPrototype.filterEntity = BaseDataSource.prototype.filterEntity;
    targetPrototype.destroy = BaseDataSource.prototype.destroy;
}

export default BaseDataSource;