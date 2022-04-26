import CommonUtil from "./CommonUtil.js";
import GeoCoordConverterUtil from "./GeoCoordConverterUtil.js";
import Fullscreen from "../../core/Fullscreen.js";
import {
    getDefaultTools
} from "../widgets/NavigationToolWidget.js";
import UIUtil from "./UIUtil.js";

/**
 * @exports map3d.utils.NavigationToolUtil
 * @class
 * @classdesc 三维导航控件帮助类。
 */

const DIFF = 2; //26.18;

let NavigationToolUtil = {


    /**
     * 缩小场景视图
     * @param {ZViewer} zviewer zviewer对象
     */
    zoomOut(zviewer) {
        let __viewer = zviewer.getCesiumViewer();

        // let distanceMeasure = getMeasureDistance(__viewer);

        // let distance = getScaleDistance(__viewer, distanceMeasure, DIFF);

        // __viewer.camera.zoomOut(distance);

        zoomScene(__viewer, false);
    },

    /**
     * 放大场景视图
     * @param {ZViewer} zviewer zviewer对象
     */
    zoomIn(zviewer) {
        let __viewer = zviewer.getCesiumViewer();
        // let distanceMeasure = getMeasureDistance(__viewer);

        // let distance = getScaleDistance(__viewer, distanceMeasure, DIFF);

        // __viewer.camera.zoomIn(distance);

        zoomScene(__viewer, true);
    },

    /**
     * 定位用户当前地理位置
     * @method
     * @param {ZViewer} zviewer zviewer对象
     * @returns {Promise<Object>}
     */
    locationUser(zviewer) {
        let locationOpt = _.find(getDefaultTools(), {
            id: 'location'
        });
        let param = locationOpt.param; //结果解析参数设置
        let resource = new Cesium.Resource({
            url: param.reqURL
        });
        let resultMap = param.resultMap;
        return resource.fetchJsonp()
            .then(d => {
                let status = _.get(d, resultMap.statusKey);
                if (status && status === resultMap.statusValue) {
                    let locX = _.get(d, resultMap.dataXKey);
                    let locY = _.get(d, resultMap.dataYKey);


                    let xy = GeoCoordConverterUtil.coordsConvert(param.crs, param.targetCrs, locX, locY);
                    let destination = new Cesium.Cartesian3.fromDegrees(xy.x, xy.y, 1000);
                    zviewer.getCesiumViewer().camera.flyTo({
                        destination: destination,
                        duration: 3
                    });
                } else {
                    UIUtil.error('定位用户位置失败');
                }
                return d;
            });
    },

    /**
     * 使场景全屏显示
     * @param {ZViewer} zviewer zviewer对象
     */
    fullscreen(zviewer) {
        if (Fullscreen.isFullScreen()) {
            Fullscreen.exitFullscreen();
        } else if (Fullscreen.isFullscreenEnabled()) {
            Fullscreen.launchFullscreen(zviewer.getTargetElement());
        }
    },

    /**
     * 恢复初始视图位置
     * @param {ZViewer} zviewer zviewer对象
     */
    resetHome(zviewer) {
        let initView = zviewer.options.initView;
        let initPostion = initView.destination;
        zviewer.getCesiumViewer().camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(initPostion[0], initPostion[1], initPostion[2]),
            orientation: initView.orientation,
            duration: 3
        });
    },

    /**
     * 指北针组件回到正北方向
     * @param {ZViewer} zviewer zviewer对象
     */
    reduceCompass(zviewer) {
        let viewer = zviewer.getCesiumViewer();
        let center = CommonUtil.getCameraFocus(viewer, true);
        if (!Cesium.defined(center)) {
            return;
        }
        let camera = viewer.camera;
        let globe = viewer.scene.globe;
        let cameraPosition = globe.ellipsoid.cartographicToCartesian(camera.positionCartographic, new Cesium.Cartesian3());
        let surfaceNormal = globe.ellipsoid.geodeticSurfaceNormal(center);
        let focusBoundingSphere = new Cesium.BoundingSphere(center, 0);
        camera.flyToBoundingSphere(focusBoundingSphere, {
            offset: new Cesium.HeadingPitchRange(0,
                Cesium.Math.PI_OVER_TWO - Cesium.Cartesian3.angleBetween(surfaceNormal, camera.directionWC),
                Cesium.Cartesian3.distance(cameraPosition, center)),
            duration: 2
        });
    },

    /**
     * 二维三维场景模式切换
     * @method
     * @param {ZViewer} zviewer zviewer对象
     */
    switchSceneMode(zviewer) {
        let __viewer = zviewer.getCesiumViewer();

        let currentMode = __viewer.scene.mode;
        let switchData = {
            from: currentMode,
        };
        let lngLat;
        if (currentMode === Cesium.SceneMode.SCENE3D) {
            switchData.to = Cesium.SceneMode.SCENE2D;

            let focus = CommonUtil.getCameraFocus(__viewer, true);
            lngLat = Cesium.Cartographic.fromCartesian(focus);
            lngLat.height = __viewer.camera.positionCartographic.height;
        } else if (currentMode === Cesium.SceneMode.SCENE2D) {
            switchData.to = Cesium.SceneMode.SCENE3D;

            lngLat = Cesium.Cartographic.clone(__viewer.camera.positionCartographic);
        }

        switchData.currentPosition = Cesium.Cartesian3.fromRadians(lngLat.longitude, lngLat.latitude, lngLat.height);
        zviewer.scene.SceneModeSwitchEvent.raiseEvent(switchData);

        let switch23DOpt = _.find(getDefaultTools(), {
            id: 'switch23D'
        });
        let class3D = switch23DOpt.icon;
        let class2D = switch23DOpt.param.icon;

        if (currentMode === Cesium.SceneMode.SCENE3D) {
            __viewer.scene.morphTo2D();

            let currentMode3D = document.querySelector(getQuerySelector(class3D));
            if (currentMode3D) {
                currentMode3D.setAttribute('class', class2D);
            }

        } else if (currentMode === Cesium.SceneMode.SCENE2D) {
            __viewer.scene.morphTo3D();
            let currentMode2D = document.querySelector(getQuerySelector(class2D));
            if (currentMode2D) {
                currentMode2D.setAttribute('class', class3D);
            }

        }
    }
};

function getQuerySelector(classes) {
    let cs = classes.split(' ');
    return cs.map(c => '.' + c).join('');
}


function zoomScene(viewer, zoomin) {
    let scene = viewer.scene;
    let camera = scene.camera;

    let relativeAmount = zoomin ? 1 / DIFF : DIFF;

    switch (scene.mode) {
        case Cesium.SceneMode.MORPHING:
            break
        case Cesium.SceneMode.SCENE2D:
            if (zoomin) {
                camera.zoomIn(camera.positionCartographic.height * (1 - relativeAmount));
            } else {
                camera.zoomOut(camera.positionCartographic.height * relativeAmount);
            }

            break
        default:

            let focus;
            let orientation;

            if (viewer.trackedEntity) {
                focus = new Cesium.Cartesian3();
            } else {
                focus = CommonUtil.getCameraFocus(viewer, true);
            }

            if (!Cesium.defined(focus)) {
                // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
                // the focal point.
                let ray = new Cesium.Ray(camera.worldToCameraCoordinatesPoint(scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic)), camera.directionWC);
                focus = Cesium.IntersectionTests.grazingAltitudeLocation(ray, scene.globe.ellipsoid);

                orientation = {
                    heading: camera.heading,
                    pitch: camera.pitch,
                    roll: camera.roll
                };
            } else {
                orientation = {
                    direction: camera.direction,
                    up: camera.up
                };
            }

            let direction = Cesium.Cartesian3.subtract(camera.position, focus, new Cesium.Cartesian3());
            let movementVector = Cesium.Cartesian3.multiplyByScalar(direction, relativeAmount, direction);
            let endPosition = Cesium.Cartesian3.add(focus, movementVector, focus);

            if (viewer.trackedEntity || scene.mode === Cesium.SceneMode.COLUMBUS_VIEW) {
                // sometimes flyTo does not work (jumps to wrong position) so just set the position without any animation
                // do not use flyTo when tracking an entity because during animatiuon the position of the entity may change
                camera.position = endPosition;
            } else {
                camera.flyTo({
                    destination: endPosition,
                    orientation: orientation,
                    duration: 0.5,
                    convert: false
                });
            }
            break;
    }
}

function getMeasureDistance(viewer) {
    let scene = viewer.scene;
    let camera = scene.camera;
    let canvas = scene.canvas;

    let windowPosition = new Cesium.Cartesian2();
    windowPosition.x = canvas.clientWidth / 2;
    windowPosition.y = canvas.clientHeight / 2;
    let ray = camera.getPickRay(windowPosition);

    let intersection;
    let height = scene.globe.ellipsoid.cartesianToCartographic(camera.position).height;
    if (height < 1) {
        intersection = CommonUtil.pickGlobe(scene, windowPosition);
    }

    let distance;
    if (Cesium.defined(intersection)) {
        distance = Cesium.Cartesian3.distance(ray.origin, intersection);
    } else {
        distance = height;
    }

    return distance;
}

function getScaleDistance(viewer, distanceMeasure, diff) {
    let scene = viewer.scene;
    let camera = scene.camera;

    let unitPosition = Cesium.Cartesian3.normalize(camera.position, new Cesium.Cartesian3());
    let unitPositionDotDirection = Cesium.Cartesian3.dot(unitPosition, camera.direction);

    let percentage = 1.0;
    if (Cesium.defined(unitPositionDotDirection)) {
        percentage = Cesium.Math.clamp(Math.abs(unitPositionDotDirection), 0.25, 1.0);
    }

    let ssCameraController = scene.screenSpaceCameraController;
    // distanceMeasure should be the height above the ellipsoid.
    // The zoomRate slows as it approaches the surface and stops minimumZoomDistance above it.
    let minHeight = ssCameraController.minimumZoomDistance * percentage;
    let maxHeight = ssCameraController.maximumZoomDistance;

    let minDistance = distanceMeasure - minHeight;
    let zoomRate = ssCameraController._zoomFactor * minDistance;
    zoomRate = Cesium.Math.clamp(zoomRate, ssCameraController._minimumZoomRate, ssCameraController._maximumZoomRate);


    let rangeWindowRatio = diff / scene.canvas.clientHeight;
    rangeWindowRatio = Math.min(rangeWindowRatio, ssCameraController.maximumMovementRatio);
    let distance = zoomRate * rangeWindowRatio;

    if (distance > 0.0 && Math.abs(distanceMeasure - minHeight) < 1.0) {
        return;
    }

    if (distance < 0.0 && Math.abs(distanceMeasure - maxHeight) < 1.0) {
        return;
    }

    if (distanceMeasure - distance < minHeight) {
        distance = distanceMeasure - minHeight - 1.0;
    } else if (distanceMeasure - distance > maxHeight) {
        distance = distanceMeasure - maxHeight;
    }

    return distance;
}


export default NavigationToolUtil;