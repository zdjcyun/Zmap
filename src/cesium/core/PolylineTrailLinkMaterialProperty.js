/*
 * @Author: gisboss
 * @Date: 2021-02-03 23:12:43
 * @LastEditors: gisboss
 * @LastEditTime: 2021-02-05 10:50:13
 * @Description: file content
 */

 import PolylineTrailLinkShader from "../shaders/PolylineTrailLinkShader.js";

 

class PolylineTrailLinkMaterialProperty {
    constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this._time = (new Date()).getTime();

        this.color = options.color;
        this.duration = Cesium.defaultValue(options.duration, 3000);
        this._polylineTrailLinkImage = Cesium.defaultValue(options.flowImage, Cesium.buildModuleUrl('./Assets/Textures/flowimg.png'));
    }
}


Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
    return Cesium.Material.PolylineTrailLinkType;
}

PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = this._polylineTrailLinkImage;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}

PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof PolylineTrailLinkMaterialProperty && Cesium.Property.equals(this._color, other._color));
};
 


Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
    fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1),
            image: Cesium.Material.DefaultImageId,
            time: 0
        },
        source: PolylineTrailLinkShader
    },
    translucent: function (material) {
        return true;
    }
});

Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;

export default PolylineTrailLinkMaterialProperty;