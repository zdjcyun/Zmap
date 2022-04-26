import GlobalConstant from "../core/GlobalConstant.js";

/**
 * @exports CommonUtil
 * @class
 * @classdesc 通用功能帮助类。名字空间map3d.utils.CommonUtil。此类为Object实例，不需要new
 */
let CommonUtil = {
    /**
     * 
     * @param {Array} defaultItems 
     * @param {Array} optionsItems 
     * @param {String} [idKeyName='id']
     * @param {String} [path= undefined]
     */
    updateItems: function (defaultItems, optionsItems, idKeyName, path) {
        let items;
        idKeyName = idKeyName || 'id';
        if (optionsItems && optionsItems.length) {
            let appendedItems = [];
            _.forEach(optionsItems, function (optItem) {
                let foundItem = _.find(defaultItems, {
                    [idKeyName]: optItem[idKeyName]
                });
                if (foundItem) {
                    if (path) {
                        Object.assign(_.get(foundItem, path), _.get(optItem, path));
                    } else {
                        Object.assign(foundItem, optItem);
                    }

                } else {
                    appendedItems.push(optItem);
                }
            });
            items = defaultItems.concat(appendedItems);
        } else {
            items = defaultItems;
        }
        return items || [];
    },

    hasChanged(oldProps, newProps) {
        let changed = false;
        _.forEach(newProps, (nv, nk) => {
            if (!(nk in oldProps) || (nv !== oldProps[nk])) {
                changed = true;
                return false;
            }
        });

        return changed;
    },




};


/**
 * 获取相机当前的焦点
 * @method
 * @param {Cesium.Viewer} viewer Cesium.Viewer实例
 * @param {Boolean} inWorldCoordinates 是否返回世界坐标系下的坐标值，否则返回相机坐标系坐标。@see {@link Camera.worldToCameraCoordinatesPoint}
 * @param {Cesium.Cartesian3} result 结果坐标点
 * @returns {Cesium.Cartesian3}
 */
CommonUtil.getCameraFocus = function (viewer, inWorldCoordinates, result) {
    let scene = viewer.scene;
    let camera = scene.camera;
    if (scene.mode == Cesium.SceneMode.MORPHING) {
        return undefined;
    }
    if (!Cesium.defined(result)) {
        result = new Cesium.Cartesian3();
    }
    if (Cesium.defined(viewer.trackedEntity)) {
        let pos = viewer.trackedEntity.position;
        if (pos) {
            result = pos.getValue(viewer.clock.currentTime, result)
        }
    } else {
        let rayScratch = new Cesium.Ray();
        rayScratch.origin = camera.positionWC;
        rayScratch.direction = camera.directionWC;
        result = scene.globe.pick(rayScratch, scene, result);
    }
    if (!Cesium.defined(result)) {
        return undefined;
    }
    if (scene.mode == Cesium.SceneMode.SCENE2D || scene.mode == Cesium.SceneMode.COLUMBUS_VIEW) {
        result = camera.worldToCameraCoordinatesPoint(result, result);
        if (inWorldCoordinates) {
            result = scene.globe.ellipsoid.cartographicToCartesian(scene.mapProjection.unproject(result, new Cesium.Cartographic()), result);
        }
    } else {
        if (!inWorldCoordinates) {
            result = camera.worldToCameraCoordinatesPoint(result, result);
        }
    }
    return result;
};

/**
 * 根据屏幕坐标拾取世界坐标点。
 * @method
 * @param {Cesium.Scene} scene Cesium.Scene实例
 * @param {Cesium.Cartesian2} mousePosition 鼠标屏幕坐标
 * @param {Cesium.Cartesian3} [result] 结果坐标点
 * @returns {Cesium.Cartesian3}
 */
CommonUtil.pickPosition = function (scene, mousePosition, result) {
    // 这种方式采集的点有问题
    // let result = scene.camera.pickEllipsoid(movement.position, scene.globe.ellipsoid);
    // 射线法只能采集到地形上的点，如果有模型就不正确了。
    // let ray = scene.camera.getPickRay(screenPoint);
    // let result = scene.globe.pick(ray, scene);

    let globe = scene.globe;
    let camera = scene.camera;

    if (!Cesium.defined(globe)) {
        return undefined;
    }

    let depthIntersection;
    if (scene.pickPositionSupported) {
        depthIntersection = scene.pickPosition(mousePosition);
    }

    let ray = camera.getPickRay(mousePosition);
    let rayIntersection = globe.pick(ray, scene);

    let pickDistance = Cesium.defined(depthIntersection) ? Cesium.Cartesian3.distance(depthIntersection, camera.positionWC) : Number.POSITIVE_INFINITY;
    let rayDistance = Cesium.defined(rayIntersection) ? Cesium.Cartesian3.distance(rayIntersection, camera.positionWC) : Number.POSITIVE_INFINITY;

    if (pickDistance < rayDistance) {
        return Cesium.Cartesian3.clone(depthIntersection, result);
    }

    return Cesium.Cartesian3.clone(rayIntersection, result);
}




/**
 * 飞行到目标位置，目标点参数为笛卡尔坐标 (不起作用！！！)
 * @param {Cesium.Scene} scene 场景对象
 * @param {Cesium.Cartesian3} position 目标位置笛卡尔坐标
 * @param {Number} height 要缩放到的高度
 * @returns {*}
 */
CommonUtil.flyToPositionCartesian = function (scene, position, height) {
    let p = transformPositionCartesian(scene, position, height || GlobalConstant.LOCATION_VIEW_HEIGHT);
    return scene.camera.flyTo({
        destination: p,
        orientation: {
            heading: scene.camera.heading,
            pitch: scene.camera.pitch
        },
        easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
        duration: 2.5,
        endTransform: Matrix4.IDENTITY
    });
};

function transformPositionCartesian(scene, position, height) {
    let camera = scene.camera;
    let heading = camera.heading;
    let pitch = camera.pitch;

    if (!Cesium.defined(height)) {
        let positionCartographic = Cesium.Cartographic.fromCartesian(position);
        height = positionCartographic.height * 4;
    }
    let offset = offsetFromHeadingPitchRange(heading, pitch, height);

    let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    Cesium.Matrix4.multiplyByPoint(transform, offset, position);

    return position;
}

function offsetFromHeadingPitchRange(heading, pitch, height) {
    pitch = Cesium.Math.clamp(pitch, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI_OVER_TWO);
    heading = Cesium.Math.zeroToTwoPi(heading) - Cesium.Math.PI_OVER_TWO;

    let pitchQuat = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y, -pitch);
    let headingQuat = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, -heading);
    let rotQuat = Cesium.Quaternion.multiply(headingQuat, pitchQuat, headingQuat);
    let rotMatrix = Cesium.Matrix3.fromQuaternion(rotQuat);

    let offset = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X);
    Cesium.Matrix3.multiplyByVector(rotMatrix, offset, offset);
    Cesium.Cartesian3.negate(offset, offset);
    Cesium.Cartesian3.multiplyByScalar(offset, height, offset);
    return offset;
}


/**
 * 飞行到目标位置。目标点参数为地理坐标
 * @param {Cesium.Scene} scene 场景对象
 * @param {Number} lng 目标位置地理经度坐标
 * @param {Number} lat 目标位置地理纬度坐标
 * @param {Number} height 目标位置高度
 * @param {Object} options scene.camera.flyto参数,除了destination属性
 * @returns {Promise}
 */
CommonUtil.flyToLngLatHeight = function (scene, lng, lat, height, options) {
    return this.flyToDestination(scene, Cesium.Cartesian3.fromDegrees(lng, lat, height), options);
};

/**
 * 飞行动画定位到目标位置
 * @param {Cesium.Scene} scene 场景对象
 * @param {Cesium.Rectangle|Cesium.Cartesian3|Cesium.Cartographic} destination 目标位置
 * @param {Object} [options] scene.camera.flyto参数,除了destination属性
 * @returns {Promise}
 */
CommonUtil.flyToDestination = function (scene, destination, options) {
    let ellipsoid = scene.mapProjection.ellipsoid;

    let finalDestination = destination;

    let promise;
    if (destination instanceof Cesium.Rectangle) {
        // Some return a Rectangle of zero width/height, treat it like a point instead.
        if (Cesium.Math.equalsEpsilon(destination.south, destination.north, Cesium.Math.EPSILON7) &&
            Cesium.Math.equalsEpsilon(destination.east, destination.west, Cesium.Math.EPSILON7)) {
            // destination is now a Cartographic
            destination = Cesium.Rectangle.center(destination);
        } else {
            promise = Cesium.computeFlyToLocationForRectangle(destination, scene);
        }
    } else if (destination instanceof Cesium.Cartesian3) {
        destination = ellipsoid.cartesianToCartographic(destination);
    }

    if (!Cesium.defined(promise)) {
        promise = _computeFlyToLocationForCartographic(destination, scene.terrainProvider);
    }

    return promise.then(function (result) {
        finalDestination = ellipsoid.cartographicToCartesian(result);
    }).always(function () {
        // Whether terrain querying succeeded or not, fly to the destination.
        options.range = Cesium.defaultValue(options.range, GlobalConstant.LOCATION_VIEW_HEIGHT);
        CommonUtil.camerFlyTo(scene.camera, finalDestination, options);
    });
};

function _computeFlyToLocationForCartographic(cartographic, terrainProvider) {
    let availability = Cesium.defined(terrainProvider) ? terrainProvider.availability : undefined;
    if (!Cesium.defined(availability)) {
        return Cesium.when.resolve(cartographic);
    }

    return Cesium.sampleTerrainMostDetailed(terrainProvider, [cartographic])
        .then(function (positionOnTerrain) {
            cartographic = positionOnTerrain[0];
            return cartographic;
        });
}

/**
 * 飞行到目标位置
 * @param {Cesium.Camera} camera 相机对象
 * @param {Cesium.Cartesian3} destination 目标位置
 * @param {Object} [options] scene.camera.flyto参数,除了destination属性
 */
CommonUtil.camerFlyTo = function (camera, destination, options) {
    camera.flyTo({
        destination: destination,
        duration: options.duration || 3,
        orientation: options.orientation,
        complete: () => {
            if((options.orientation && options.orientation.pitch)){
                let pitch = options.orientation.pitch;
                camera.moveBackward(Math.abs(options.range / Math.sin(pitch)));
            }
           
            if (options.complete) {
                options.complete();
            }
        }
    });
};


/**
 * 围绕中心点旋转
 * @param {Cesium.Viewer} viewer Cesium.Viewer对象
 * @param {Cesium.Cartesian3} position 直角坐标中心旋转点
 * @param {Number} [distance=1000] 相机与目标的距离(单位：米)，默认值为 1000 米,如果为负值，则表示以当前相机位置旋转
 * @param {Number} [duration] 旋转时长，单位：秒。如果为负值，表示无限循环，如果不传则默认旋转一周的时长。
 * @param {Number} [pitch=-45] 俯仰角（-90~90），默认-90，-90为相机看向正下方，默认值为 -45 度
 * @param {Number} [angleSpeed=4] 每秒飞行角速度（单位：度/秒），默认值为 4 度
 * @returns {Function} 事件监听器对象
 */
CommonUtil.lookAround = function (viewer, position, distance,
    duration, pitch, angleSpeed) {
    const defaultSpeed = 4;
    //默认保证旋转一圈的时间
    const defaultDuration = (360 / defaultSpeed);
    // 给定相机距离点多少距离飞行，这里取值为1000m
    distance = Cesium.defaultValue(distance, 1000);

    if (distance < 0) {
        distance = Cesium.Cartesian3.distance(viewer.scene.camera.positionWC, position);
    }

    duration = Cesium.defaultValue(duration, defaultDuration);
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-45 度
    pitch = Cesium.Math.toRadians(Cesium.defaultValue(pitch, -45));
    // 每秒转动度数
    angleSpeed = Cesium.defaultValue(angleSpeed, defaultSpeed);

    return _aroundAnimate(viewer, position, distance, duration, pitch, angleSpeed);
};


/**
 * 以相机当前位置，相机方向与地面的交点为中心点开始旋转环视
 * @param {Cesium.Viewer} viewer Cesium.Viewer对象
 * @param {Cesium.Cartesian2} [screenPosition] 屏幕坐标。如果不传，默认为场景画布中心
 * @param {Number} [duration] 旋转时长，单位：秒。如果为负值，表示无限循环，如果不传则默认旋转一周的时长。
 * @param {Number} [angleSpeed=4] 每秒飞行角速度（单位：度/秒），默认值为 4 度
 * @returns {Function} 事件监听器对象
 */
CommonUtil.lookAroundAtCurrentPosition = function (viewer, screenPosition, duration, angleSpeed) {
    const defaultSpeed = 4;
    // 每秒转动度数
    angleSpeed = Cesium.defaultValue(angleSpeed, defaultSpeed);

    //默认保证旋转一圈的时间
    const defaultDuration = (360 / angleSpeed);
    duration = Cesium.defaultValue(duration, defaultDuration);


    const canvas = viewer.scene.canvas;
    const screenCenter = Cesium.defaultValue(screenPosition,
        new Cesium.Cartesian2(canvas.clientWidth * 0.5, canvas.clientHeight * 0.5));

    let position = this.pickPosition(viewer.scene, screenCenter);

    const distance = Cesium.Cartesian3.distance(viewer.scene.camera.positionWC, position);
    const pitch = viewer.scene.camera.pitch;

    return _aroundAnimate(viewer, position, distance, duration, pitch, angleSpeed);
}


function _aroundAnimate(viewer, position, distance, duration, pitch, angleSpeed, ) {
    let startTime = Cesium.JulianDate.fromDate(new Date());

    if (duration > 0) {
        let stopTime = Cesium.JulianDate.addSeconds(startTime, duration, new Cesium.JulianDate());

        viewer.clock.stopTime = stopTime.clone();
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    } else {
        // 无限循环
        viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    }

    viewer.clock.startTime = startTime.clone();
    viewer.clock.currentTime = startTime.clone();
    // 时钟设置为当前系统时间; 忽略所有其他设置。
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
    viewer.clock.shouldAnimate = true;
    // 相机的当前 heading
    let initialHeading = viewer.camera.heading;


    let execution = () => {
        // 当前已经过去的时间，单位s
        let delTime = Cesium.JulianDate.secondsDifference(
            viewer.clock.startTime,
            viewer.clock.currentTime
        );
        let heading = Cesium.Math.toRadians(delTime * angleSpeed) + initialHeading;
        viewer.scene.camera.setView({
            destination: position, // 点的坐标
            orientation: {
                heading: heading,
                pitch: pitch
            }
        });
        viewer.scene.camera.moveBackward(distance);
    };


    //监听点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let stop = (e) => {
        handler.destroy();
        viewer.clock.onStop.removeEventListener(stop);
        viewer.clock.shouldAnimate = false;
        viewer.clock.onTick.removeEventListener(execution);

    };

    if (duration > 0) {
        viewer.clock.onStop.addEventListener(stop);
    }

    handler.setInputAction(stop, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    return viewer.clock.onTick.addEventListener(execution);
}


/**
 * 沿着指定路径飞行
 * @param {Cesium.Viewer} viewer Cesium.Viewer对象
 * @param {Array.<Object>} marks 路径顶点数组。格式如下：
 * {lng: 116.812948, lat: 36.550064, height: 1000, flytime: 5}。height:相机高度(单位米) flytime:相机两个标注点飞行时间(单位秒)
 * @param {Number} pitch 相机飞行时的倾角
 * @param {Number} loop 无限循环飞行
 */
CommonUtil.flyAlongPath = function (viewer, marks, pitch, loop) {
    if (marks.length < 2) {
        throw new Error('Number of path vertices should great than 1.');
        return;
    }
    // 默认倾角
    pitch = Cesium.Math.toRadians(Cesium.defaultValue(pitch, -45));

    viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(marks[0].lng, marks[0].lat, marks[0].height),
        orientation: {
            pitch: pitch
        },
        complete: () => {
            _flyPath(viewer, marks, 1, pitch, loop);
        }
    });


}

function _flyPath(viewer, marks, marksIndex, pitch, loop) {
    _setExtentTime(viewer, marks[marksIndex].flytime);
    let execution = () => {
        let preIndex = marksIndex - 1;
        if (marksIndex == 0) {
            preIndex = marks.length - 1;
        }
        let heading = _bearing(marks[preIndex].lat, marks[preIndex].lng, marks[marksIndex].lat, marks[marksIndex].lng);
        heading = Cesium.Math.toRadians(heading);
        // 当前已经过去的时间，单位s
        let delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
        let originLat = marksIndex == 0 ? marks[marks.length - 1].lat : marks[marksIndex - 1].lat;
        let originLng = marksIndex == 0 ? marks[marks.length - 1].lng : marks[marksIndex - 1].lng;
        let endPosition = Cesium.Cartesian3.fromDegrees(
            (originLng + (marks[marksIndex].lng - originLng) / marks[marksIndex].flytime * delTime),
            (originLat + (marks[marksIndex].lat - originLat) / marks[marksIndex].flytime * delTime),
            marks[marksIndex].height
        );
        viewer.scene.camera.setView({
            destination: endPosition,
            orientation: {
                heading: heading,
                pitch: pitch,
            }
        });

        if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
            viewer.clock.onStop.raiseEvent();
            let pntNum = marks.length - 1;
            if (marksIndex !== pntNum || (marksIndex === pntNum && loop)) {
                _changeCameraHeading(viewer, marks, marksIndex, pitch, loop);
            }
        }
    };

    //监听点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let stop = (e) => {
        handler.destroy();
        viewer.clock.onStop.removeEventListener(stop);
        viewer.clock.shouldAnimate = false;
        viewer.clock.onTick.removeEventListener(execution);
    };

    viewer.clock.onStop.addEventListener(stop);

    handler.setInputAction(stop, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    viewer.clock.onTick.addEventListener(execution);
}

// 相机原地定点转向
function _changeCameraHeading(viewer, marks, marksIndex, pitch, _loop) {
    let nextIndex = marksIndex + 1;
    if (marksIndex == marks.length - 1) {
        nextIndex = 0;
    }
    // 计算两点之间的方向
    let heading = _bearing(marks[marksIndex].lat, marks[marksIndex].lng, marks[nextIndex].lat, marks[nextIndex].lng);

    // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
    let angle = (heading - Cesium.Math.toDegrees(viewer.camera.heading)) / 2;
    // 时间间隔2秒钟
    _setExtentTime(viewer, 2);
    // 相机的当前heading
    let initialHeading = viewer.camera.heading;
    let execution = () => {
        // 当前已经过去的时间，单位s
        let delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
        let heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
        viewer.scene.camera.setView({
            orientation: {
                heading: heading,
                pitch: pitch,
            }
        });

        if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
            viewer.clock.onStop.raiseEvent();

            marksIndex = ++marksIndex >= marks.length ? 0 : marksIndex;
            _flyPath(viewer, marks, marksIndex, pitch, _loop);

        }
    };
    //监听点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let stop = (e) => {
        handler.destroy();
        viewer.clock.onStop.removeEventListener(stop);
        viewer.clock.shouldAnimate = false;
        viewer.clock.onTick.removeEventListener(execution);
    };
    viewer.clock.onStop.addEventListener(stop);
    handler.setInputAction(stop, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    viewer.clock.onTick.addEventListener(execution);
}

// 设置飞行的时间到viewer的时钟里
function _setExtentTime(viewer, time) {
    let startTime = Cesium.JulianDate.fromDate(new Date());
    let stopTime = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());
    viewer.clock.startTime = startTime.clone();
    viewer.clock.stopTime = stopTime.clone();
    viewer.clock.currentTime = startTime.clone();
    viewer.clock.shouldAnimate = true;
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
}

function _bearing(startLat, startLng, destLat, destLng) {
    startLat = Cesium.Math.toRadians(startLat);
    startLng = Cesium.Math.toRadians(startLng);
    destLat = Cesium.Math.toRadians(destLat);
    destLng = Cesium.Math.toRadians(destLng);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    let brngDgr = Cesium.Math.toDegrees(brng);
    return (brngDgr + 360) % 360;
}


export default CommonUtil;