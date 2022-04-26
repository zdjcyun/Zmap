/*
 * @Author: gisboss
 * @Date: 2020-08-26 13:01:49
 * @LastEditors: gisboss
 * @LastEditTime: 2021-04-13 20:48:08
 * @Description: file content
 */

import GeometryUtil from './util/GeometryUtil.js';
import ZSymbol from './symbol/ZSymbol.js';


/**
 * @exports ZGraphic
 * @class
 * @classdesc
 * 矢量图形对象
 * @param {ZGeometry} geometry 几何图形对象
 * @param {ZSymbol} symbol 符号对象
 * @param {Object} attributes 普通属性对象
 */
class ZGraphic {
    constructor(geometry, symbol, attributes) {
        this.geometry = geometry;
        this.symbol = symbol;
        this.attributes = attributes;
        let featureName = "";
        if (this.attributes && this.attributes.name) {
            featureName = this.attributes.name;
        }
        this.__ = new ol.Feature({
            name: featureName,
            labelPoint: this.geometry ? this.geometry.getCenter() : undefined
        });
        if (this.geometry) {
            this.__.setGeometry(this.geometry.__);
        }

        this.__.setStyle(symbol && symbol.__);
        this.__.setProperties({
            attributes: attributes
        }, true);
    }

    /**
     * 设置geometry
     * @param {ZGeometry} geometry 几何图形
     * @returns {ZGraphic} this对象引用
     */
    setGeometry(geometry) {
        this.geometry = geometry;
        this.__.setGeometry(geometry.__);
        return this;
    }

    /**
     * 设置符号
     * @param {ZSymbol} symbol 符号对象
     * @returns {ZGraphic} this对象引用
     */
    setSymbol(symbol) {
        this.symbol = symbol;
        this.__.setStyle(symbol.__);
        return this;
    }

    /**
     * 设置属性
     * @param {Object} attributes 图形属性对象
     * @returns {ZGraphic} this对象引用
     */
    setAttributes(attributes) {
        this.attributes = attributes;
        this.__.setProperties({
            attributes: attributes
        });
        return this;
    }

    /**
     * 转换为JSON字符串表达的对象:{geometry: {}, symbol: {}, attributes: {}}
     * @returns {Object} object对象
     */
    toJSON() {
        return {
            geometry: this.geometry.toJSON(),
            symbol: this.symbol.toJSON(),
            attributes: this.attributes
        }
    }

}

/**
 * 从原生对象中生成Z对象
 * @param {ol/Feature} feature openlayer原生feature对象
 * @param {boolean} [isReference=false] 是否引用原始对象，false表示重新构造新的feature对象
 * @returns {ZGraphic} 新ZGraphic对象
 * @static
 */
ZGraphic.from = function (feature, isReference) {
    let g = new ZGraphic(GeometryUtil.from(feature.getGeometry()),
        ZSymbol.from(feature.getStyle()),
        feature.get('attributes') || feature.getProperties());
    if (isReference) {
        g.__ = feature;
    }
    return g;
};


/**
 * 从json对象生成ZGraphic对象
 * @param {Object} json普通对象
 * @returns {ZGraphic} 新ZGraphic对象
 * @static
 */
ZGraphic.fromJSON = function (json) {
    let geometry = json.geometry;
    let zGeoSrc = GeometryUtil.fromJSON(geometry);
    let geo = zGeoSrc;
    //如果需要变换坐标
    let sr = geometry.spatialReference;
    if (sr && sr.crs !== undefined && sr.wkid !== undefined && (sr.wkid !== sr.crs) /*CoordTypeEnum类型*/ ) {
        let from = sr.wkid;
        let to = sr.crs;
        geo = zGeoSrc.applyTransform(from, to);
    }

    let g = new ZGraphic(
        geo,
        json.symbol ? ZSymbol.fromJSON(json.symbol) : null,
        Object.assign({}, json.attributes));

    return g;
};

export default ZGraphic;