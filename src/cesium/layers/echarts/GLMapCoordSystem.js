/*
 * @Author: gisboss
 * @Date: 2020-10-27 10:15:28
 * @LastEditors: gisboss
 * @LastEditTime: 2020-10-28 15:35:12
 * @Description: file content
 */

import GeoCoordConverterUtil from '../../utils/GeoCoordConverterUtil.js';
import GeometryUtil from '../../utils/GeometryUtil.js';

const GLMAPKEY = 'GLMap';

const dimensions = ['lng', 'lat'];

class GLMapCoordSystem {
    /**
     * 坐标系
     * @param {Cesium.Scene} scene 
     * @param {*} api 
     */
    constructor(scene, api) {
        this._GLMap = scene;
        this.dimensions = dimensions;
        this.mapOffset = [0, 0];
        this.crs = null;
        this.type = GLMAPKEY;
    }


    setMapOffset(mapOffset) {
        this.mapOffset = mapOffset || [0, 0];
    }


    setCrs(crs) {
        this.crs = crs;
    }

    getGLMap() {
        return this._GLMap;
    }

    dataToPoint(data) {

        if (!isPointVisible(this._GLMap, data)) {
            return [];
        }

        coordsConvert(data, this.crs, this._GLMap.crs);

        let e = [99999, 99999];
        data[0] = fixLng(data[0]);
        data[1] = fixLat(data[1]);
        let i = Cesium.Cartesian3.fromDegrees(data[0], data[1], data[2] || 0.0);
        if (!i) return e;
        let n = this._GLMap.cartesianToCanvasCoordinates(i);
        if (!n) return e;
        return !(Cesium.Cartesian3.angleBetween(this._GLMap.camera.position, i) > Cesium.Math.toRadians(75)) && [n.x - this.mapOffset[0], n.y - this.mapOffset[1]];
    }

    pointToData(pt) {
        let mapOffset = this.mapOffset;

        let offsetPnt = new Cesium.cartesian3(pt[0] + mapOffset[0], pt[1] + mapOffset[1], 0);
        let i = this._GLMap.globe.ellipsoid.cartesianToCartographic(offsetPnt);

        return [i.lng, i.lat];
    }

    getViewRect() {
        //let api = this._api;
        // return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
        let pc = this._GLMap.convas.parentNode;
        return new echarts.graphic.BoundingRect(0, 0, pc.offsetWidth, pc.offsetHeight);
    }

    getRoamTransform() {
        return echarts.matrix.create();
    }

}


function fixLat(lat) {
    return lat >= 90 ? 89.99999999999999 : lat <= -90 ? -89.99999999999999 : lat
}

function fixLng(lng) {
    return lng >= 180 ? 180 : lng <= -180 ? -180 : lng;
}

GLMapCoordSystem.type = GLMAPKEY;

GLMapCoordSystem.dimensions = dimensions;

GLMapCoordSystem.getDimensionsInfo = function () {
    return GLMapCoordSystem.dimensions;
};

GLMapCoordSystem.create = function (ecModel, api) {
    let coordSys;

    ecModel.eachComponent(GLMAPKEY, function (GLMapModel) {
        //let viewportRoot = api.getZr().painter.getViewportRoot();


        let _glmap = GLMapModel.getGLMap();
        // //如果还没有初始化地图
        // if (!_glmap) {
        //     _glmap = GLMapCoordSystem.glMap;
        //     GLMapModel._GLMap = _glmap;
        // } 

        coordSys = new GLMapCoordSystem(_glmap, api);
        coordSys.setMapOffset(GLMapModel.get('mapOffset'));

        coordSys.setCrs(GLMapModel.get('crs'));

        GLMapModel.coordinateSystem = coordSys;
    });

    ecModel.eachSeries(function (seriesModel) {
        if (seriesModel.get('coordinateSystem') === GLMAPKEY) {
            seriesModel.coordinateSystem = coordSys;
        }
    });
};


function isPointVisible(scene, data) { 
    return GeometryUtil.isPointVisible(scene,Cesium.Cartesian3.fromDegrees(data[0], data[1]));
}

function coordsConvert(data, srcCrs, targetCrs) {
    let newPnt = GeoCoordConverterUtil.coordsConvert(srcCrs, targetCrs, data[0], data[1]);
    data[0] = newPnt.x;
    data[1] = newPnt.y;

    return data;
}

export default GLMapCoordSystem;