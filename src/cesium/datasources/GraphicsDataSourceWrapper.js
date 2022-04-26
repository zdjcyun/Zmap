/*
 * @Author: gisboss
 * @Date: 2021-04-07 17:06:24
 * @LastEditors: gisboss
 * @LastEditTime: 2021-12-28 16:00:23
 * @Description: file content
 */

import DataSourceManager from "./DataSourceManager.js";

/**
 * @class map3d.datasources.GraphicsDataSourceWrapper
 * @constructor
 * @param {Cesium.Viewer} viewer 原生Cesium.Viewer对象
 * @param {Object} options 参数选项对象
 */
class GraphicsDataSourceWrapper {
    constructor(viewer, options) {
        options = Cesium.defaultValue(options, {});
        this._name = options.id || "GraphicsDataSource_" + Cesium.createGuid();
        this._cachedCustomDataSource = new Cesium.CustomDataSource(this._name);
        this._cachedPrimitiveCollection = new Cesium.PrimitiveCollection();
        this._cachedPrimitiveCollection.name = this._name;

        viewer.dataSources.add(this._cachedCustomDataSource, options.index);
        viewer.scene.primitives.add(this._cachedPrimitiveCollection, options.index);
    }

    /**
     * 添加图形对象
     * @param {Object} graphic 参数对象
     * @param {Boolean} [primitive=false] 是否以primitive方式添加
     * @returns {Entity|Primitive} Cesium原生对象
     */
    add(graphic, primitive) {
        let resultGraphic;
        if (graphic.id === undefined) {
            graphic.id = this._name + Cesium.createGuid();
        }

        if (primitive) {
            resultGraphic = this._cachedPrimitiveCollection.add(graphic);
        } else {
            resultGraphic = this._cachedCustomDataSource.entities.add(graphic);
        }

        return resultGraphic;
    }

    /**
     * 移除图形对象
     * @param {String|Entity|Primitive} graphic 
     * @returns {Boolean} 是否成功
     */
    remove(graphic) {
        if (_.isString(graphic)) {
            let entity = this._cachedCustomDataSource.entities.getById(graphic);
            if (entity) {
                return this._cachedCustomDataSource.entities.remove(entity);
            } else {
                let length = this._cachedPrimitiveCollection.length;
                for (let i = 0; i < length; ++i) {
                    let p = primitives.get(i);
                    if (p.id === graphic) {
                        return this._cachedPrimitiveCollection.remove(p);
                    }
                }
            }
        } else if (entity instanceof Cesium.Entity) {
            return this._cachedCustomDataSource.entities.remove(graphic);
        } else if (this._cachedPrimitiveCollection.contains(graphic)) {
            return this._cachedPrimitiveCollection.remove(graphic);
        }
        return false;
    }

    /**
     * 清除所有图形
     */
    removeAll() {
        this._cachedCustomDataSource.entities.removeAll();
        this._cachedPrimitiveCollection.removeAll();
    }

    /**
     * 统计个数
     * @returns {Number}
     */
    length() {
        return this._cachedCustomDataSource.entities.values.length + this._cachedPrimitiveCollection.length;
    }

    /**
     * 销毁对象资源
     */
    destroy() {

        if (this._cachedCustomDataSource.entities.values.length > 0) {
            this._cachedCustomDataSource.entities.removeAll();
        }
        viewer.dataSources.remove(this._cachedCustomDataSource, true);

        viewer.scene.primitives.remove(this._cachedPrimitiveCollection);
        this._cachedPrimitiveCollection.destroy();

        Cesium.destroyObject(this);
    }
}

export default GraphicsDataSourceWrapper;