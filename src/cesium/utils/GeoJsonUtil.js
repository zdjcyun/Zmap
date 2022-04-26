import GeoCoordConverterUtil from "./GeoCoordConverterUtil.js";
import ZBillboard from "../core/ZBillboard.js";
import CoordTypeEnum from "../enum/CoordTypeEnum.js";
import DynamicDataSource from "../datasources/DynamicDataSource.js";
import CommonUtil from "./CommonUtil.js";
import GlobalConstant from "../core/GlobalConstant.js";


let GEOJSON_TYPE = {
    /**
     * GeoJSON的点类型
     */
    POINT: 'Point',
    /**
     * GeoJSON的线串类型
     */
    LINE_STRING: 'LineString',
    /**
     * GeoJSON的线环类型
     */
    LINEAR_RING: 'LinearRing',
    /**
     * GeoJSON的多边形类型
     */
    POLYGON: 'Polygon',
    /**
     * GeoJSON的多点类型
     */
    MULTI_POINT: 'MultiPoint',
    /**
     * GeoJSON的多线串类型
     */
    MULTI_LINE_STRING: 'MultiLineString',
    /**
     * GeoJSON的多多边形类型
     */
    MULTI_POLYGON: 'MultiPolygon',
    /**
     * GeoJSON的要素类型
     */
    FEATURE: 'Feature',
    /**
     * GeoJSON的几何集合类型
     */
    GEOMETRY_COLLECTION: 'GeometryCollection',
    /**
     * GeoJSON的要素集合类型
     */
    FEATURE_COLLECTION: 'FeatureCollection',

    /**
     * TopoGeoJSON
     */
    TOPOLOGY: 'Topology'
};

/**
 * 转换坐标方法
 * @param {Array.<Number>} coordinates 坐标数组
 * @param {Number} from 源坐标系
 * @param {Number} to 目标坐标系
 * @returns {Cesium.Cartesian3}
 */
function defaultCrsFunction(coordinates, from, to) {
    let myCoords = GeoCoordConverterUtil.coordsConvert(from, to, coordinates[0], coordinates[1]);
    let height = coordinates[2] ? coordinates[2] * 1 : undefined;
    return myCoords ? Cesium.Cartesian3.fromDegrees(myCoords.x, myCoords.y, height) : Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], height);
}

/**
 * @exports GeoJsonUtil
 * @class
 * @classdesc GeoJSON功能帮助类。名字空间map3d.utils.GeoJsonUtil。
 */
let GeoJsonUtil = {

    GEOJSON_TYPE: GEOJSON_TYPE,
    defaultCrsFunction: defaultCrsFunction,


    /**
     * 更新原来的JSON数据 
     * @param {Object} oldGeoJson 
     * @param {Object} newGeoJson 
     * @returns {Array.<Object>} 发生改变的数据列表
     */
    updateGeoJsonSource: function (oldGeoJson, newGeoJson) {
        if (!oldGeoJson) {
            oldGeoJson = newGeoJson;
        }

        let changed = [];
        let type = oldGeoJson.type;
        let newType = newGeoJson.type;
        if (type === GeoJsonUtil.GEOJSON_TYPE.FEATURE_COLLECTION) {
            let feature;
            for (let i = 0, lenOld = oldGeoJson.features.length; i < lenOld; i++) {
                feature = oldGeoJson.features[i];
                if (newType === GeoJsonUtil.GEOJSON_TYPE.FEATURE) {
                    if (feature.id === newGeoJson.id) {
                        if (CommonUtil.hasChanged(feature.properties, newGeoJson.properties)) {
                            Object.assign(feature.properties, newGeoJson.properties);
                            return [{
                                oldIndex: i,
                                newIndex: -1,
                                feature: feature
                            }];
                        }
                    }
                } else if (newType === GeoJsonUtil.GEOJSON_TYPE.FEATURE_COLLECTION) {
                    let newFeature;
                    for (let j = 0, lenNew = newGeoJson.features.length; j < lenNew; j++) {
                        newFeature = newGeoJson.features[j];
                        if (newFeature.id === feature.id) {
                            if (CommonUtil.hasChanged(feature.properties, newFeature.properties)) {
                                Object.assign(feature.properties, newFeature.properties);
                                changed.push({
                                    oldIndex: i,
                                    newIndex: j,
                                    feature: feature
                                });
                            }
                        }
                    }
                }
            }
        } else if (type === GeoJsonUtil.GEOJSON_TYPE.FEATURE) {
            if (newType === GeoJsonUtil.GEOJSON_TYPE.FEATURE) {
                if (oldGeoJson.id === newGeoJson.id) {
                    if (CommonUtil.hasChanged(oldGeoJson.properties, newGeoJson.properties)) {
                        Object.assign(oldGeoJson.properties, newGeoJson.properties);
                        return [{
                            oldIndex: -1,
                            newIndex: -1,
                            feature: oldGeoJson
                        }];
                    }
                }
            } else if (newType === GeoJsonUtil.GEOJSON_TYPE.FEATURE_COLLECTION) {
                let newFeature;
                for (let j = 0, lenNew = newGeoJson.features.length; j < lenNew; j++) {
                    newFeature = newGeoJson.features[j];
                    if (newFeature.id === oldGeoJson.id) {
                        if (CommonUtil.hasChanged(oldGeoJson.properties, newFeature.properties)) {
                            Object.assign(oldGeoJson.properties, newFeature.properties);
                            return [{
                                oldIndex: -1,
                                newIndex: j,
                                feature: oldGeoJson
                            }];
                        }
                    }
                }
            }
        }

        return changed;
    },

    /**
     * 从geoJSON对象获取多边形。包含带洞情况
     * @method
     * @param {Object} polygonGeoJSON 为GeoJsonFeature.geometry类型几何对象。
     * @param {Number} [from=CoordTypeEnum.wgs84] 源坐标系
     * @param {Number} [to=CoordTypeEnum.wgs84] 目标坐标系
     * @returns {Cesium.PolygonHierarchy|Array.<Cesium.PolygonHierarchy>}
     */
    getPolygonFromGeoJSONGeometry: function (polygonGeoJSON, from, to) {
        let geoType = polygonGeoJSON.type;

        if (geoType !== GEOJSON_TYPE.MULTI_POLYGON && geoType !== GEOJSON_TYPE.POLYGON) {
            throw new Cesium.RuntimeError('type属性无效,必须为MultiPolygon或Polygon');
        }
        from = Cesium.defaultValue(from, CoordTypeEnum.wgs84);
        to = Cesium.defaultValue(to, CoordTypeEnum.wgs84);

        let coords = polygonGeoJSON.coordinates;
        let polygonHierarchy;
        if (geoType === GEOJSON_TYPE.MULTI_POLYGON) {
            //是四维数组
            polygonHierarchy = [];
            for (let i = 0, len = coords.length; i < len; i++) {
                polygonHierarchy.push(polygonToPolygonHierarchy(coords[i], from, to));
            }

        } else {
            polygonHierarchy = polygonToPolygonHierarchy(coords, from, to);
        }


        return polygonHierarchy;
    },

    /**
     * 从geoJSON对象获取坐标点列表数组，一般作为线实体的positions属性值。
     * @method
     * @param {Object} geoJSONGeometry 为GeoJsonFeature.geometry类型几何对象。必须是以下类型：
     * 'MultiPolygon', 'Polygon', 'MultiLineString', 'LineString'
     * @param {Number} [from=CoordTypeEnum.wgs84] 源坐标系
     * @param {Number} [to=CoordTypeEnum.wgs84] 目标坐标系
     * @returns {Array.<Cesium.PolygonHierarchy>} 结果坐标点列表。
     */
    getPolylineFromGeoJSONGeometry: function (geoJSONGeometry, from, to) {
        let geoType = geoJSONGeometry.type;

        if ([GEOJSON_TYPE.MULTI_POLYGON,
                GEOJSON_TYPE.POLYGON,
                GEOJSON_TYPE.MULTI_LINE_STRING,
                GEOJSON_TYPE.LINE_STRING
            ].indexOf(geoType) < 0) {
            throw new Cesium.RuntimeError('type属性无效,必须为MultiPolygon或Polygon,MultiLineString或LineString');
        }

        let coords = geoJSONGeometry.coordinates;
        let polylines;
        if (geoType === GEOJSON_TYPE.MULTI_POLYGON) {
            //是四维数组
            polylines = polygonToPolylines(coords[0], from, to);;
            for (let i = 1, len = coords.length; i < len; i++) {
                let lines = polygonToPolylines(coords[i], from, to);
                for (let j = 0, len = lines.length; j < len; j++) { //合并为多条线的点数组
                    polylines.push(lines[j]);
                }
            }
        } else if (geoType === GEOJSON_TYPE.LINE_STRING) { //点数组
            polylines = coordinatesArrayToCartesianArray(coords, defaultCrsFunction, from, to);
        } else {
            //多条线
            polylines = polygonToPolylines(coords, from, to);
        }

        return polylines;
    },

    /**
     * 获取几何要素的中心点坐标
     * @param {Object} geoJSON GeoJSON对象
     * @returns {Object} 结果对象。包含两个属性:center(中心点)，distance(中心点到最大点的距离，
     * 如果输入GeoJSON为单个几何，则返回包围边界矩形对角线长度)
     */
    getCenterFromGeoJson: function (geoJSON) {
        let type = geoJSON.type;
        let centerObj = {};

        if (type === GEOJSON_TYPE.FEATURE_COLLECTION) {
            let featureCollection = turf.featureCollection(geoJSON.features);

            let center = turf.getCoords(turf.center(featureCollection));
            center.push(0);

            let bbox = turf.bbox(featureCollection);
            let distance = turf.distance([bbox[0], bbox[1]], [bbox[2], bbox[3]]);

            centerObj.center = center;
            centerObj.distance = distance * 1000;
        } else if (type === GEOJSON_TYPE.FEATURE) { //GeoJsonFeature
            let f = turf.feature(geoJSON);
            let center = turf.getCoords(turf.center(f));
            center.push(0);

            let bbox = turf.bbox(f);
            let distance = turf.distance([bbox[0], bbox[1]], [bbox[2], bbox[3]]);

            centerObj.center = center;
            centerObj.distance = distance * 1000;
        }

        return centerObj;
    },

    /**
     * 获取点列表的中心点。点坐标格式：[x,y,z,...,x,y,z,....],Z坐标可以没有。如[x,y,...,x,y,....]
     * @param {Array.<Number>} flatCoords 坐标列表
     * @param {Number} [dimension=2] 坐标维数
     * @returns {Object} 返回中心点坐标与到边界的半径距离
     */
    getCenterFromPositions(flatCoords, dimension) {
        dimension = dimension || 2;
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        let maxX = -180;
        let maxY = -90;
        let maxZ = 0;
        let len = flatCoords.length;
        let mol = len % dimension;
        let pntNum = parseInt(String(len / dimension));
        if (mol > 0) {
            throw new Cesium.RuntimeError('坐标维度不匹配:dimension=' + dimension);
        }
        for (let i = 0; i < len; i = i + dimension) {
            sumX += flatCoords[i];
            sumY += flatCoords[i + 1];

            maxX = Math.max(maxX, flatCoords[i]);
            maxY = Math.max(maxY, flatCoords[i + 1]);

            if (dimension === 3) {
                sumZ += flatCoords[i + 2];
                maxZ = Math.max(maxZ, flatCoords[i + 2]);
            }

        }
        let center = [sumX / pntNum, sumY / pntNum, sumZ / pntNum];

        let from = Cesium.Cartesian3.fromDegrees(center[0], center[1], center[2]);
        let to = Cesium.Cartesian3.fromDegrees(maxX, maxY, maxZ);
        let distance = Cesium.Cartesian3.distance(from, to);

        return {
            center: center,
            distance: distance
        };
    },


    /**
     * 获取多边形几何要素集合。兼容有洞的情况
     * @param {Array.<GeoJsonFeature>} geoJSONFeatures GeoJSON Feature对象数组
     * @param {Number} [from=CoordTypeEnum.wgs84] 源坐标系
     * @param {Number} [to=CoordTypeEnum.wgs84] 目标坐标系
     * @returns {Array.<Cesium.PolygonHierarchy>} 结果多边形列表。
     */
    getPolygonArrayFromGeoJSON: function (geoJSONFeatures, from, to) {
        if (!geoJSONFeatures || geoJSONFeatures.length === 0) {
            return;
        }
        let r = [];
        for (let i = 0, len = geoJSONFeatures.length; i < len; i++) {
            let p = this.getPolygonFromGeoJSONGeometry(geoJSONFeatures[i].geometry, from, to);
            if (Array.isArray(p)) {
                for (let j = 0, len2 = p.length; j < len2; j++) {
                    r.push(p[j]);
                }
            } else {
                r.push(p);
            }
        }
        return r;
    },

    /**
     * 获取线要素的几何点坐标集合
     * @param {Array.<GeoJSONFeature>} geoJSONFeatures GeoJSON Feature对象数组
     * @param {Number} [from=CoordTypeEnum.wgs84] 源坐标系
     * @param {Number} [to=CoordTypeEnum.wgs84] 目标坐标系
     * @returns {Array.<Cesium.Cartesian3>} 结果坐标点列表。
     */
    getPolylineArrayFromGeoJSON: function (geoJSONFeatures, from, to) {
        if (!geoJSONFeatures || geoJSONFeatures.length === 0) {
            return;
        }
        let r = [];
        for (let i = 0, len = geoJSONFeatures.length; i < len; i++) {
            let p = this.getPolylineFromGeoJSONGeometry(geoJSONFeatures[i].geometry, from, to);
            if (Array.isArray(p)) {
                for (let j = 0, len2 = p.length; j < len2; j++) {
                    r.push(p[j]);
                }
            } else {
                r.push(p);
            }

        };
        return r;
    },

    /**
     * 坐标变换
     * @param {FeatureCollection|Feature|Geometry} geoJSON GeoJSON对象
     * @param {Number} from 源坐标系
     * @param {Number} to 目标坐标系
     * @returns {GeoJSON} 结果geoJSON对象。
     */
    coordsTransform: function (geoJSON, from, to) {
        let resultGeoJSON;
        if (!geoJSON) {
            return resultGeoJSON;
        }
        if (from === to) {
            return geoJSON;
        }

        let type = geoJSON.type;
        if (type === GEOJSON_TYPE.FEATURE_COLLECTION) {
            resultGeoJSON = {
                type: type,
                features: []
            };

            let features = geoJSON.features;
            for (let i = 0, len = features.length; i < len; i++) {
                resultGeoJSON.features.push(featureTransform(features[i], from, to));
            }

        } else if (type === GEOJSON_TYPE.FEATURE) {
            resultGeoJSON = featureTransform(geoJSON, from, to);
        } else {
            resultGeoJSON = geometryTransform(geoJSON, from, to);
        }

        return resultGeoJSON;
    },


    /**
     * geoJSON 要素对象或要素集转换为Cesium实体类
     * @param {GeoJSONFeature|GeoJSONFeatureCollection} geoJSON 源数据geoJson
     * @param {Object} [options] 参数选项
     * @returns {Array.<Cesium.Entity>} 返回转换后的Entity对象集合
     */
    geoJSONToEntities: function (geoJSON, options) {
        let es = [];
        let type = geoJSON.type;
        options.crsFunction = Cesium.defaultValue(options.crsFunction, defaultCrsFunction);
        if (type === GEOJSON_TYPE.FEATURE_COLLECTION) {
            for (let i = 0, len = geoJSON.features.length; i < len; i++) {
                let r = processFeature(geoJSON.features[i], options);
                for (let n = 0, len = r.length; n < len; n++) {
                    es.push(r[n]);
                }
            };
        } else if (type === GEOJSON_TYPE.FEATURE) {
            let r = processFeature(geoJSON, options);
            for (let n = 0, len = r.length; n < len; n++) {
                es.push(r[n]);
            }
        } else {
            throw new Cesium.RuntimeError('不支持的GeoJSON对象类型: ' + type);
        }

        return es;
    },

    /**
     * geoJSON 要素对象或要素集转换为Cesium 图元类
     * @param {GeoJSONFeature|GeoJSONFeatureCollection} geoJSON 源数据geoJson
     * @param {Object} [options] 参数选项
     * @returns {Array.<Cesium.Primitive>} 返回转换后的Entity对象集合
     */
    geoJSONToPrimitives: function (geoJSON, options) {
        options = options || {};
        options.primitive = true;

        return this.geoJSONToEntities(geoJSON, options);
    },


    /**
     * 根据过滤条件获取FeatureCollection
     * @param {Object|String} urlOrFeatures GeoJsonFeatureCollection源数据集或为请求地址
     * @param {Object} cql_filter 过滤条件对象
     * @param {String} [cql_filter_key] 过滤条件对象组合成一个条件对象的键名
     * @returns {Promise}
     */
    getFeatureCollection: function (urlOrFeatures, cql_filter, cql_filter_key) {
        let fc = [];

        if (_.isPlainObject(urlOrFeatures)) {
            if (cql_filter) {
                let nfs = _.filter(url.features, function (feature) {
                    if (_.hasIn(feature, 'properties')) {
                        return _.filter([feature.properties], cql_filter) !== undefined;
                    } else {
                        return false;
                    }
                });
                fc = Object.assign({}, urlOrFeatures, {
                    features: nfs
                });
            } else {
                fc = urlOrFeatures;
            }
            return Cesium.when(fc);
        } else if (_.isString(urlOrFeatures)) {
            let obj = {};
            if (cql_filter_key) {
                let cql_filterValue = [];
                _.forEach(cql_filter, function (v, k) {
                    cql_filterValue.push(k + '=' + v);
                    cql_filterValue.push(' and ');
                });
                if (cql_filterValue.length) {
                    obj[cql_filter_key] = _.dropRight(cql_filterValue, 1).join('');
                }
            } else {
                obj = cql_filter;
            }


            return Cesium.Resource.fetchJson({
                url: urlOrFeatures,
                queryParameters: obj
            });
        }
    },


    /**
     * 给每个点获取高度值
     * @param {GeoJSONFeature|GeoJSONFeatureCollection} geoJSON 源数据geoJson
     * @param {Object} [options] 参数选项
     */
    sampleHeight(geoJSON, options) {
        let es = [];
        let type = geoJSON.type;
        options = Cesium.defaultValue(options, {});
        options.from = Cesium.defaultValue(options.from, CoordTypeEnum.wgs84);
        options.to = Cesium.defaultValue(options.to, CoordTypeEnum.wgs84);
        options.crsFunction = Cesium.defaultValue(options.crsFunction, defaultCrsFunction);
        if (type === GEOJSON_TYPE.FEATURE_COLLECTION) {
            for (let i = 0, len = geoJSON.features.length; i < len; i++) {
                let r = sampleFeature(geoJSON.features[i], options);
                for (let n = 0, len = r.length; n < len; n++) {
                    es.push(r[n]);
                }
            };
        } else if (type === GEOJSON_TYPE.FEATURE) {
            let r = sampleFeature(geoJSON, options);
            for (let n = 0, len = r.length; n < len; n++) {
                es.push(r[n]);
            }
        } else {
            throw new Cesium.RuntimeError('不支持的GeoJSON对象类型: ' + type);
        }

        return es;
    },
};


////////////////////////////////////////////////////
// 内部方法

/**
 * 根据要素的中心点采集高程
 * @private
 * @param {GeoJsonFeature|Object} feature 
 * @param {Object} options 选项参数
 */
function sampleFeature(feature, options) {
    let center = turf.getCoords(turf.center(feature));
    let centerTrans = options.crsFunction(center, options.from, options.to);
    let lngLatPosition = Cesium.Cartographic.fromCartesian(centerTrans);
    GeometryUtil.updateSampleHeight(scene, lngLatPosition);

    let coords = [lngLatPosition.longitude, lngLatPosition.latitude];
    feature.properties.height = centerTrans.height;
    return turf.point(coords, feature.properties, feature.id ? {
        id: feature.id
    } : undefined);
}

/**
 * GeoJson的三维数组转换为Cesium多边形层级对象
 * @private
 * @param {Array} coords 三维坐标数组
 * @returns {Cesium.PolygonHierarchy|Array.<Cesium.PolygonHierarchy>}
 */
function polygonToPolygonHierarchy(coordinates, from, to) {
    let holes = [];
    for (let i = 1, len = coordinates.length; i < len; i++) {
        holes.push(
            new Cesium.PolygonHierarchy(
                coordinatesArrayToCartesianArray(coordinates[i], defaultCrsFunction, from, to)
            )
        );
    }

    let positions = coordinates[0];
    return new Cesium.PolygonHierarchy(
        coordinatesArrayToCartesianArray(positions, defaultCrsFunction, from, to),
        holes
    );
}

//三维数组转换线数组
function polygonToPolylines(coords, from, to) {
    let positions = [];
    for (let i = 0, len = coords.length; i < len; i++) {
        positions.push(coordinatesArrayToCartesianArray(coords[i], defaultCrsFunction, from, to));
    }
    return positions;
}



/**
 * 要素坐标变换
 * @private
 */
function featureTransform(feature, from, to) {
    return {
        type: feature.type,
        properties: Cesium.clone(feature.properties || {}, true),
        geometry: geometryTransform(feature.geometry, from, to)
    };
}

function geometryTransform(geometry, from, to) {
    let geoType = geometry.type;
    let coords = geometry.coordinates;

    let resultGeoJSON = {
        type: geoType,
        coordinates: ''
    };
    // 一维数组
    if (geoType === GEOJSON_TYPE.POINT) {
        resultGeoJSON.coordinates = pointTransform(coords, from, to);
    } else if (geoType === GEOJSON_TYPE.MULTI_POINT || geoType === GEOJSON_TYPE.LINE_STRING) {
        // 二维数组
        let resultCoords = [];
        for (let i = 0, len = coords.length; i < len; i++) {
            resultCoords.push(pointTransform(coords[i], from, to));
        }

        resultGeoJSON.coordinates = resultCoords;
    } else if (geoType === GEOJSON_TYPE.POLYGON || geoType === GEOJSON_TYPE.MULTI_LINE_STRING) {
        // 三维数组
        let resultCoords = [];
        for (let i = 0, len = coords.length; i < len; i++) {
            let pathNew = [];
            for (let j = 0, len2 = coords[i].length; j < len2; j++) {
                pathNew.push(pointTransform(coords[i][j], from, to));
            }
            resultCoords.push(pathNew);
        }

        resultGeoJSON.coordinates = resultCoords;
    } else if (geoType === GEOJSON_TYPE.MULTI_POLYGON) {
        // 四维数组
        let resultCoords = [];

        for (let i = 0, len = coords.length; i < len; i++) {
            let polygonNew = [];
            for (let j = 0, len2 = coords[i].length; j < len2; j++) {
                let ringNew = [];
                for (let k = 0, len3 = coords[i][j].length; k < len3; k++) {
                    ringNew.push(pointTransform(coords[i][j][k], from, to));
                };
                polygonNew.push(ringNew);
            };

            resultCoords.push(polygonNew);
        };

        resultGeoJSON.coordinates = resultCoords;
    } else {
        throw new Cesium.RuntimeError('Geometry类型无效:' + geoType);
    }

    return resultGeoJSON;
}

function pointTransform(coord, from, to) {
    let resultPnt = GeoCoordConverterUtil.coordsConvert(from, to, coord[0], coord[1]);

    let coordinates = [resultPnt.x, resultPnt.y];
    if (coord.length > 2) {
        coord.forEach((xyz, index) => {
            if (index > 1) {
                coordinates.push(xyz);
            }
        });
    }

    return coordinates;
}


///////////////////////////////////////////////////////////
//GeoJson 转换成实体类处理


/**
 * 默认的标注样式
 * @param options
 * @private
 */
let DEFAUL_LABEL = {
    text: '',
    font: GlobalConstant.LABEL_FONT,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: GlobalConstant.LABEL_OUTLINE_WIDTH,
    outlineColor: GlobalConstant.LABEL_OUTLINE_COLOR,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    scaleByDistance: undefined, //new Cesium.NearFarScalar(1.0e5, 1.0, 1.0e8, 0),
    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e8, 0),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.01, 1.0e5),
    disableDepthTestDistance: 1.0e8,
};


let geometryTypeHandlers = {
    GeometryCollection: processGeometryCollection,
    LineString: processLineString,
    MultiLineString: processMultiLineString,
    MultiPoint: processMultiPoint,
    MultiPolygon: processMultiPolygon,
    Point: processPoint,
    Polygon: processPolygon,
    //Topology : processTopology
};

/**
 * 要素实体创建
 * @private
 * @param feature
 * @param options
 * @returns {Array.<Cesium.Entity>}
 */
function processFeature(feature, options) {
    if (feature.geometry === null) {
        return [];
    }

    if (!Cesium.defined(feature.geometry.type)) {
        throw new Cesium.RuntimeError('feature.geometry.type is required.');
    }

    let geometryType = feature.geometry.type;
    let geometryTypeOK = _.find(GEOJSON_TYPE, (v, k) => {
        return geometryType === v;
    });

    let handler = geometryTypeHandlers[geometryType];

    if (!Cesium.defined(geometryTypeOK) || !handler) {
        throw new Cesium.RuntimeError('不支持的geometry类型: ' + geometryType);
    }

    return handler(feature.id, feature.geometry, feature.properties, options);
}


/**
 * 几何集合处理
 * @private
 * @param geometryCollection
 * @param options
 * @returns {Array.<Cesium.Entity>}
 */
function processGeometryCollection(geometryCollection, options) {
    let r = [];
    let geometries = geometryCollection.geometries;
    let geometryType;
    for (let i = 0, len = geometries.length; i < len; i++) {
        let geo = geometries[i];
        geometryType = geo.type;
        let handler = geometryTypeHandlers[geometryType];

        if (!Cesium.defined(geometryType) || !handler) {
            continue;
        }

        r = r.concat(handler(undefined, geo, undefined, options));
    }
    return r;
}


/**
 * 点实体
 * @private
 * @param geometry
 * @param properties
 * @param options
 * @returns {Array.<Cesium.Entity>}
 */
function processPoint(featureId, geometry, properties, options) {
    let billboard = {};
    // 水平对齐默认为剧中对齐，这里只要设置垂直对齐即可
    billboard.verticalOrigin = new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM);

    let coordinates = geometry.coordinates;
    if (coordinates.length === 2 || options.clampToGround) {
        billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    } else {
        billboard.heightReference = options.heightReference || Cesium.HeightReference.BOTH;
    }

    if (options.scaleByDistance) {
        billboard.scaleByDistance = options.scaleByDistance;
    }
    billboard.disableDepthTestDistance = options.disableDepthTestDistance || DEFAUL_LABEL.disableDepthTestDistance;
    billboard.distanceDisplayCondition = options.distanceDisplayCondition;
    billboard.position = options.crsFunction(coordinates, options.crs, options.sceneCrs);
    billboard.image = DynamicDataSource.getSymbolConstantProperty(properties, options);

    // 如果配置了原生选项，优先级大于默认选项
    if (options.billboard) {
        Object.assign(billboard, options.billboard);
    }

    let result = [];
    if (options.primitive) {
        let point = createPointBillboard(featureId, properties, billboard, options);
        result.push(point);
    } else {
        let entity = createPointEntity(featureId, properties, billboard, options);
        result.push(entity);
    }

    return result;
}

/**
 * 创建实体类对象
 * @private
 * @param featureId
 * @param properties
 * @param describe
 * @returns {Cesium.Entity}
 */
function createObject(featureId, properties, describe) {
    let id = featureId || properties.id || Cesium.createGuid();
    let entity = new Cesium.Entity({
        id: id
    });
    if (Cesium.defined(properties)) {
        entity.properties = properties;

        entity.description = DynamicDataSource.buildDecription(properties, describe, entity);

    }

    return entity;
}

function processLineString(featureId, geometry, properties, options) {
    let coordinates = geometry.coordinates;
    if (coordinates.length === 0 || coordinates[0].length === 0) {
        return;
    }

    let materialType = Cesium.defaultValue(options.materialType, Cesium.Material.ColorType);
    let strokeWidth = options.strokeWidth;
    let strokeColor = options.stroke;
    let outlineStroke = Cesium.defaultValue(options.outlineStroke, Cesium.Color.BLUE);
    let outlineWidth = Cesium.defaultValue(options.outlineWidth, 1);
    let style = null;

    if (Cesium.defined(properties)) {
        let sw = properties[DynamicDataSource.StylePropertyIdentifier.STROKE_WIDTH];
        if (Cesium.defined(sw)) {
            strokeWidth = sw;
        }

        let sc = DynamicDataSource.getGeometryProperty(properties, strokeColor, DynamicDataSource.StylePropertyIdentifier.STROKE);
        if (Cesium.defined(sc)) {
            strokeColor = sc;
        }

        let osw = properties[DynamicDataSource.StylePropertyIdentifier.OUTLINE_WIDTH];
        if (Cesium.defined(osw)) {
            outlineWidth = osw;
        }
        let osc = DynamicDataSource.getGeometryProperty(properties, outlineStroke, DynamicDataSource.StylePropertyIdentifier.OUTLINE_STROKE);
        if (Cesium.defined(osc)) {
            outlineStroke = osc;
        }

        // 单字段多值
        if(Object.keys(options.symbols).length === 1){
            strokeWidth = options.symbols[0].width;
            strokeColor = options.symbols[0].stroke
        }else if(Object.keys(options.symbols).length > 1) {  // fieldName 除去
            style = options.symbols[properties[options.symbols.fieldName]]
            strokeWidth = style.strokeWidth;
            strokeColor = new Cesium.ColorMaterialProperty(style.stroke)
            materialType = Cesium.defaultValue(style.materialType, Cesium.Material.ColorType);
        }
    }

    let polyline = {
        show: Cesium.defaultValue(options.show, true),
        //granularity: Cesium.defaultValue(options.granularity, Cesium.Math.RADIANS_PER_DEGREE),
        arcType: Cesium.defaultValue(options.arcType, Cesium.ArcType.GEODESIC),
        clampToGround: Cesium.defaultValue(options.clampToGround, false),
        shadows: Cesium.defaultValue(options.shadows, Cesium.ShadowMode.DISABLED),
        classificationType: Cesium.defaultValue(options.classificationType, Cesium.ClassificationType.BOTH),
        zIndex: Cesium.defaultValue(options.zIndex, 0),
    };
    if (Cesium.defined(options.depthFailMaterial)) {
        polyline.depthFailMaterial = options.depthFailMaterial;
    }
    if (Cesium.defined(options.distanceDisplayCondition)) {
        polyline.distanceDisplayCondition = options.distanceDisplayCondition;
    }

    polyline.width = new Cesium.ConstantProperty(strokeWidth);
    if (materialType === Cesium.Material.ColorType) {
        polyline.material = strokeColor;
    } else if (materialType === Cesium.Material.PolylineOutlineType) {
        polyline.material = new Cesium.PolylineOutlineMaterialProperty({
            color: strokeColor.color,
            outlineColor: outlineStroke.color,
            outlineWidth: outlineWidth,
        });
    } else if (materialType === Cesium.Material.PolylineGlowType) {
        polyline.material = new Cesium.PolylineGlowMaterialProperty({
            color: strokeColor.color,
            glowPower: options.glowPower,
            taperPower: options.taperPower
        });
    } else if (materialType === Cesium.Material.PolylineDashType) {
        polyline.material = new Cesium.PolylineDashMaterialProperty({
            color: strokeColor.color,
            gapColor: Cesium.defaultValue(options.gapColor, Cesium.Color.TRANSPARENT),
            dashLength: options.dashLength || style.dashLength,// 短划线长度
            dashPattern: options.dashPattern || style.dashPattern
        });
    } else if (materialType === Cesium.Material.PolylineArrowType) {
        polyline.material = new Cesium.PolylineArrowType({
            color: strokeColor.color,
        });
    } else if (materialType === Cesium.Material.PolylineTrailLinkType) {
        polyline.material = new Cesium.PolylineTrailLinkMaterialProperty({
            color: strokeColor.color,
            duration: options.duration,
            flowImage: options.flowImage,
        });
    }

    let positions = coordinatesArrayToCartesianArray(coordinates, options.crsFunction, options.crs, options.sceneCrs);
    polyline.positions = positions;

    if (coordinates[0].length > 2) {
        polyline.clampToGround = false;
    } else {
        polyline.clampToGround = true;
    }

    let result = [];

    //以图元方式创建对象
    if (options.primitive) {
        // polyline.releaseGeometryInstances = Cesium.defaultValue(options.releaseGeometryInstances, false);
        // let primitive = createPolygonPrimitive(featureId, properties, options.describe, polyline);

        // result.push(primitive);
    } else {
        let entity = createObject(featureId, properties, options.describe);
        entity.polyline = polyline;

        result.push(entity);
    }


    return result;
}

function processPolygon(featureId, geometry, properties, options) {
    let coordinates = geometry.coordinates;
    if (coordinates.length === 0 || coordinates[0].length === 0) {
        return;
    }

    let strokeWidth = options.strokeWidth;
    let strokeColor = options.stroke;
    let fillColor = options.fill;
    if (Cesium.defined(properties)) {
        let sw = properties[DynamicDataSource.StylePropertyIdentifier.STROKE_WIDTH];
        if (Cesium.defined(sw)) {
            strokeWidth = sw;
        }

        let sc = DynamicDataSource.getGeometryProperty(properties, options.stroke, DynamicDataSource.StylePropertyIdentifier.STROKE);
        if (Cesium.defined(sc)) {
            strokeColor = sc;
        }

        let fc = DynamicDataSource.getGeometryProperty(properties, options.fill, DynamicDataSource.StylePropertyIdentifier.FILL);
        if (Cesium.defined(fc)) {
            fillColor = fc;
        }

        // 单字段多值
        if(Object.keys(options.symbols).length === 1){
            strokeWidth = options.symbols[0].width;
            strokeColor = options.symbols[0].stroke
            fillColor = options.symbols[0].fill
        }else if(Object.keys(options.symbols).length > 1) {  // fieldName 除去
            const style = options.symbols[properties[options.symbols.fieldName]]
            console.log('style',style);
            strokeWidth = style.strokeWidth;
            strokeColor = new Cesium.ColorMaterialProperty(style.stroke)
            fillColor = new Cesium.ColorMaterialProperty(style.fill)
        }
    }

    let polygon = {
        show: Cesium.defaultValue(options.show, true),
        heightReference: Cesium.defaultValue(options.heightReference, Cesium.HeightReference.NONE),
        extrudedHeightReference: Cesium.defaultValue(options.extrudedHeightReference, Cesium.HeightReference.NONE),
        stRotation: Cesium.defaultValue(options.stRotation, 0.0),
        fill: Cesium.defaultValue(fillColor ? true : false, true), // fillColor  options.fill
        perPositionHeight: Cesium.defaultValue(options.perPositionHeight, false),
        closeBottom: Cesium.defaultValue(options.closeBottom, true),
        closeTop: Cesium.defaultValue(options.closeTop, true),
        arcType: Cesium.defaultValue(options.arcType, Cesium.ArcType.GEODESIC),
        shadows: Cesium.defaultValue(options.shadows, Cesium.ShadowMode.DISABLED),
        classificationType: Cesium.defaultValue(options.classificationType, Cesium.ClassificationType.BOTH),
        zIndex: Cesium.defaultValue(options.zIndex, 0),
    }; //new Cesium.PolygonGraphics();

    if (options.extrudedHeight) {
        polygon.extrudedHeight = options.extrudedHeight;
    }
    if (Cesium.defined(options.distanceDisplayCondition)) {
        polygon.distanceDisplayCondition = options.distanceDisplayCondition;
    }

    // 边线有问题？？？ 使用 polyline 表示边线
    // polygon.outline = new Cesium.ConstantProperty(true);
    // polygon.outlineColor = strokeColor;
    // polygon.outlineWidth = new Cesium.ConstantProperty(strokeWidth);
    if(fillColor){ //  options.fill
        polygon.material = fillColor;
    }
    polygon.arcType = Cesium.ArcType.RHUMB;

    let holes = [];
    for (let i = 1, len = coordinates.length; i < len; i++) {
        holes.push(
            new Cesium.PolygonHierarchy(
                coordinatesArrayToCartesianArray(coordinates[i], options.crsFunction, options.crs, options.sceneCrs)
            )
        );
    }

    let positions = coordinates[0];
    polygon.hierarchy = new Cesium.PolygonHierarchy(
        coordinatesArrayToCartesianArray(positions, options.crsFunction, options.crs, options.sceneCrs),
        holes
    );

    if (positions[0].length > 2) {
        polygon.perPositionHeight = new Cesium.ConstantProperty(true);
    } else if (!options.clampToGround) {
        polygon.height = 0;
    }

    let result = [];

    //以图元方式创建对象
    if (options.primitive) {
        polygon.releaseGeometryInstances = Cesium.defaultValue(options.releaseGeometryInstances, false);
        let primitive = createPolygonPrimitive(featureId, properties, options.describe, polygon);

        result.push(primitive);
    } else {
        let entity = createObject(featureId, properties, options.describe);
        entity.polygon = polygon;
        if(strokeColor && strokeWidth && strokeWidth > 0) {
            const polyline = {
                positions: entity.polygon.hierarchy._value.positions,
                material: strokeColor,
                width: strokeWidth,
                zIndex: polygon.zIndex + 1,
            }
            entity.polyline = polyline;
        }
        result.push(entity);
    }


    return result;
}

// 二维数据转换
function coordinatesArrayToCartesianArray(coordinates, crsFunction, from, to) {
    let len = coordinates.length;
    let positions = [];
    for (let i = 0; i < len; i++) {
        positions[i] = crsFunction(coordinates[i], from, to);
    }
    return positions;
}


function processMultiPoint(featureId, geometry, properties, options) {
    let coordinates = geometry.coordinates;
    let len = coordinates.length;
    let entities = [];
    for (let i = 0; i < len; i++) {
        let pntEntity = processPoint(featureId, {
            coordinates: coordinates[i]
        }, properties, options);

        if (pntEntity.length > 0) {
            entities.push(pntEntity[0]);
        }
    }
    return entities;
}

function processMultiLineString(featureId, geometry, properties, options) {
    let coordinates = geometry.coordinates;
    let entities = [];
    coordinates.forEach((polylinePnts, index) => {
        let polyEntity = processLineString(featureId + '_' + index, {
            coordinates: polylinePnts
        }, properties, options);

        if (polyEntity.length > 0) {
            entities.push(polyEntity[0]);
        }

    });

    return entities;
}

function processMultiPolygon(featureId, geometry, properties, options) {
    let coordinates = geometry.coordinates;
    let entities = [];
    coordinates.forEach((polygonPnts, index) => {
        let polyEntity = processPolygon(featureId + '_' + index, {
            coordinates: polygonPnts
        }, properties, options);

        if (polyEntity.length > 0) {
            entities.push(polyEntity[0]);
        }

    });

    return entities;
}

function createPointEntity(featureId, properties, billboardOptions, options) {
    let bg = new Cesium.BillboardGraphics();
    bg.heightReference = billboardOptions.heightReference;
    bg.verticalOrigin = billboardOptions.verticalOrigin;
    bg.scaleByDistance = billboardOptions.scaleByDistance;
    bg.disableDepthTestDistance = billboardOptions.disableDepthTestDistance;
    bg.distanceDisplayCondition = billboardOptions.distanceDisplayCondition;
    bg.image = billboardOptions.image;
    bg.width = options.markerSize;
    bg.height = options.markerSize;

    let entity = createObject(featureId, properties, options.describe);
    entity.billboard = bg;
    entity.position = billboardOptions.position;

    // 是否需要标注
    let label = options.label;
    if (label) {
        entity.label = new Cesium.LabelGraphics(Object.assign(Cesium.clone(DEFAUL_LABEL), {
            text: entity.name || '',
            pixelOffset: Cesium.Cartesian2.fromElements(0, -(options.markerSize + GlobalConstant.LABEL_OFFSET_DETAL_Y)),
            heightReference: bg.heightReference,
            disableDepthTestDistance: billboardOptions.disableDepthTestDistance,
        }, label));
    }

    entity.updateAppearance = function (props) {
        if (!CommonUtil.hasChanged(this.properties.getValue(), props)) {
            return false;
        }
        this.properties = new Cesium.ConstantProperty(props);
        let oldName = this.name;
        this.description = DynamicDataSource.buildDecription(props, options.describe, this);
        this.billboard.image = DynamicDataSource.getSymbolConstantProperty(props, options);

        if (oldName !== this.name) {
            this.label.text = this.name;
        }

        return true;

    };

    return entity;
}



function createPointBillboard(featureId, properties, billboardOptions, options) {
    let id = featureId || properties.id || Cesium.createGuid();
    billboardOptions.id = id;


    let labelOptions = options.label;
    // 是否需要标注 
    if (labelOptions) {
        labelOptions = Object.assign(Cesium.clone(DEFAUL_LABEL), {
            id: id,
            text: '',
            position: billboardOptions.position,
            pixelOffset: Cesium.Cartesian2.fromElements(0, -(options.markerSize + GlobalConstant.LABEL_OFFSET_DETAL_Y)),
            heightReference: billboardOptions.heightReference,
            disableDepthTestDistance: billboardOptions.disableDepthTestDistance,
        }, labelOptions);
    }


    let zPointEntity = new ZBillboard({
        id: id,
        billboard: billboardOptions,
        label: labelOptions,
    });

    //挂载属性信息
    if (Cesium.defined(properties)) {
        zPointEntity.properties = properties;
        zPointEntity.description = DynamicDataSource.buildDecription(properties, options.describe, zPointEntity);
    }

    return zPointEntity;
}


function createPolygonPrimitive(featureId, properties, describe, primitiveOption) {
    let id = featureId || properties.id || Cesium.createGuid();

    let g = (polygon, _id) => {
        return new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: polygon,
                perPositionHeight: Cesium.defaultValue(primitiveOption.perPositionHeight, true),
                height: Cesium.defaultValue(primitiveOption.height, 0.0),
                extrudedHeight: Cesium.defaultValue(primitiveOption.extrudedHeight, 0.0),
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
            }),
            // attributes: {
            //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(primitiveOption.material.color.getValue())
            // },
            id: _id
        });
    };

    let geometryInstances;
    //可以为数组
    let polygonHierarchy = primitiveOption.hierarchy;
    if (Array.isArray(polygonHierarchy)) {
        geometryInstances = [];
        _.forEach(polygonHierarchy, (p, index) => {
            geometryInstances.push(g(p, id + '_' + index));
        });
    } else {
        geometryInstances = g(polygonHierarchy, id);
    }



    let primitive = new Cesium.GroundPrimitive({
        show: true, // 默认隐藏
        allowPicking: true,
        releaseGeometryInstances: primitiveOption.releaseGeometryInstances,
        geometryInstances: geometryInstances,
        // appearance: new Cesium.PerInstanceColorAppearance({
        //     translucent: false,
        //     closed: true
        // }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: Cesium.Material.ColorType,
                    uniforms: {
                        color: primitiveOption.material.color.getValue()
                    }
                }
            }),
            aboveGround: true,
        }),
        classificationType: Cesium.ClassificationType.BOTH
    });

    //挂载属性信息
    if (Cesium.defined(properties)) {
        primitive.properties = properties;
        primitive.description = DynamicDataSource.buildDecription(properties, describe, primitive);
    }

    primitive.id = id;

    primitive.updateAppearance = function (properties) {
        this.properties = properties;
        let fc = DynamicDataSource.getGeometryProperty(properties, undefined, DynamicDataSource.StylePropertyIdentifier.FILL);
        if (Cesium.defined(fc)) {
            this.appearance.material.uniforms.color = fc.color.getValue();
        }
    }

    return primitive;
}



export default GeoJsonUtil;