/*
 * @Author: gisboss
 * @Date: 2020-11-24 15:41:18
 * @LastEditors: gisboss
 * @LastEditTime: 2020-12-09 09:47:55
 * @Description: 封装的点实体类
 */

/**
 * @exports ZBillboard
 * @class
 * @classdesc 封装的点实体类，包含billboard对象与label对象。名字空间map3d.core.ZPointEntity。
 * 不同于PointPrimitive，此类能渲染大量点，只能使用颜色符号化。
 */
class ZBillboard {

    constructor(options) {
        options = Cesium.defaultValue(options, {});
        this.id = options.id || Cesium.createGuid();
        this.name = options.name || '';

        this.properties = options.properties;
        this.description = options.description;

        this._billboardOptions = options.billboard;
        this._labelOptions = options.label;

        /**
         * @property {Cesium.Billboard} 内置点实例对象
         */
        this.billboard = undefined;

        /**
         * @property {Cesium.Label} 内置标注实例对象
         */
        this.label = undefined;

        /**
         * 是否已经销毁
         */
        this.destroyed = false;
    }

    addToCollection(billboardCollection, labelCollection) {
        if (billboardCollection && this._billboardOptions) {
            this.billboard = billboardCollection.add(this._billboardOptions);
            if (this.properties) {
                this.billboard.properties = new Cesium.ConstantProperty(this.properties);
                this.billboard.description = new Cesium.ConstantProperty(this.description);
                }

            }

            if (labelCollection && this._labelOptions) {
                this.label = labelCollection.add(this._labelOptions);
                this.label.text = this.name;
            }
        }

        destroy() {
            this.billboard = null;
            this.label = null;
            return Cesium.destroyObject(this);
        }



    }


    ZBillboard.getInstance = function (billboard, label) {
        const _zpe = new ZBillboard();
        _zpe.name = billboard.name;
        _zpe.id = billboard.id;
        _zpe.properties = billboard.properties;
        _zpe.description = billboard.description;
        _zpe.billboard = billboard;
        _zpe.label = label;
        return _zpe;
    }

    export default ZBillboard;