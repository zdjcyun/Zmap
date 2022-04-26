/*
 * @Author: gisboss
 * @Date: 2020-08-21 16:58:10
 * @LastEditors: gisboss
 * @LastEditTime: 2020-09-11 10:18:23
 * @Description: file content
 */

 
/**
 * @enum {String} 地图引擎类型枚举
 */
let EngineType = {
    ARCGIS: 'arcgis',
    OPENLAYERS: 'openlayers',
    SUPERMAP: 'supermap',
    CESIUM: 'cesium'
};

export default Object.freeze(EngineType);