/*
 * @Author: gisboss
 * @Date: 2020-12-03 14:39:58
 * @LastEditors: gisboss
 * @LastEditTime: 2021-03-16 09:21:07
 * @Description: file content
 */

import CoordTypeEnum from "../enum/CoordTypeEnum.js";
import ZEvent from "../events/ZEvent.js";

let defaultFlyOptions = {
    offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_TWO, 0),
    raiseFlyEvent: true
};



/**
 * @exports map3d.datasources.BasePrimitive
 * @class
 * @extends Cesium.Primitive
 * @classdesc 自定义扩展数据源基类。
 */
class BasePrimitive extends Cesium.Primitive {
    /** 
     * @constructor
     * @param {Object} options 参数配置对象
     * @param {String} options.name 数据源的名称
     * @param {Number} [options.crs=CoordTypeEnum.wgs84] 源数据的坐标系
     * @param {Number} [options.sceneCrs=CoordTypeEnum.wgs84] 场景底图的坐标系
     */
    constructor(options) {
        options.name = Cesium.defaultValue(options.name, 'BasePrimitive_' + Cesium.createGuid());
        options.crs = Cesium.defaultValue(options.crs, CoordTypeEnum.wgs84);
        options.sceneCrs = Cesium.defaultValue(options.sceneCrs, CoordTypeEnum.wgs84);

        super(options);

        this.extendProperty(options);
    }

    extendProperty(options) {

        /**
         * @property {String} name 实例名称标识 
         */
        this.name = options.name;

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
        this.destroyFuns = [Cesium.Primitive.prototype.destroy];


        /**
         * @property {Cesium.BoundingSphere} boundingSphere 边界包围球对象
         */
        this.boundingSphere = null;
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
     * @returns {Promise.<BasePrimitive>}
     */
    addToViewer(viewer, index) {
        return Cesium.when(viewer.scene.primitives.add(this, index));
    }

    /**
     * 把数据源从Cesium.Viewer对象场景中移除。
     * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
     * @param {Boolean} [destroy=undefined] 是否销毁数据源对象
     */
    removeFromViewer(viewer, destroy) {
        if (destroy) {
            return viewer.scene.primitives.removeAndDestroy(this);
        }
        return viewer.scene.primitives.remove(this);
    }

    /**
     * 飞向数据源到可视范围
     * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
     * @param {Object} [options] 飞行参数。@see {@link Cesium.Viewer.Camera#flyTo}
     * @returns {Promise.<Boolean>}
     */
    flyTo(viewer, options) {
        let opt = {};
        if (!options) {
            Object.assign(opt, defaultFlyOptions);
        } else {
            Object.assign(opt, defaultFlyOptions, options);
        }
        //飞行完成事件
        opt.complete = () => {
            if (opt.raiseFlyEvent) {
                this.flyCompleteEvent.raiseEvent(this);
            }
        }

        let flyHandler = (primitive) => {
            return Cesium.defaultValue(viewer.camera.flyToBoundingSphere(
                this.boundingSphere, opt), true);
        };
        return this.readyPromise ? this.readyPromise.then(flyHandler) : Cesium.when(flyHandler());
    }

    /**
     * 销毁对象资源
     */
    destroy() {
        // 移除事件
        if (this.flyCompleteEvent) {
            this.flyCompleteEvent.removeAll();
            this.flyCompleteEvent = null;
        }

        let desLength = this.destroyFuns.length;
        for (let i = desLength - 1; i > 0; --i) {
            this.destroyFuns[i].call(this);
        }

        this.destroyFuns.length = 0;
        this.boundingSphere = null;

        //调用基类代码
        let r = (desLength > 0 && this.destroyFuns[0]) ? this.destroyFuns[0].call(this) : Cesium.destroyObject(this);
        this.destroyFuns.length = 0;

        return r;
    };

    /**
     * 数据显示与隐藏切换
     * @param {Boolean} visible 是否显示对象
     */
    toggle(visible) {
        this.show = visible;
    }

    /**
     * 加载数据
     * @returns {Promise.<BasePrimitive>}
     */
    loadData(options) {
        return this.initDataSource(options).otherwise((error) => {
            this._error = error;
            this._state = Cesium.PrimitiveState.FAILED;
            return this._readyPromise.reject(error);
        });
    }
}


BasePrimitive.extend = (targetPrototype) => {
    targetPrototype.extendProperty = BasePrimitive.prototype.extendProperty;
    targetPrototype.addToViewer = BasePrimitive.prototype.addToViewer;
    targetPrototype.removeFromViewer = BasePrimitive.prototype.removeFromViewer;
    targetPrototype.flyTo = BasePrimitive.prototype.flyTo;
    targetPrototype.loadData = BasePrimitive.prototype.loadData;
    targetPrototype.toggle = BasePrimitive.prototype.toggle;
    targetPrototype.initDataSource = BasePrimitive.prototype.initDataSource;
    targetPrototype.destroy = BasePrimitive.prototype.destroy;
}

export default BasePrimitive;