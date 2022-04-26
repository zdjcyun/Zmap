/**
 * @exports GeometryUtil
 * @class
 * @classdesc 几何图形帮助类。名字空间map3d.utils.GeometryUtil。此类为Object实例，不需要new
 */
let GeometryUtil = {
    /**
     * 判断点是否在球的背面,true为正面可见。
     * @param {Cesium.scene} scene 场景对象
     * @param {Cesium.Cartesian3} point 待检测的点
     * @returns {Boolean} true可见,否则不可见
     */
    isPointVisible:  function (scene, point) {
        const occluder = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, scene.camera.position)
        return occluder.isPointVisible(point);
    }
 
};

/**
 * 构造一个圆坐标数组。步长为1度
 * @method
 * @param {Number} radius 半径
 * @returns {Array.<Cesium.Cartesian2>} 点数组
 */
GeometryUtil.computeCircle = function (radius) {
    let positions = [];
    for (let i = 0; i < 360; i++) {
        let radians = Cesium.Math.toRadians(i);
        positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
    }
    return positions;
};


/**
 * 计算空间两点距离
 * @method
 * @param {Array.<Number>} positions 点数组
 * @returns {Number} 结果距离
 */
GeometryUtil.getSpaceDistance = function (positions) {
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {

        let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
        /**根据经纬度计算出距离**/
        let geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        let s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
        distance = distance + s;
    }
    return distance;
};

/**
 * 更新经纬点的高程
 * @method
 * @param { Cesium.Scene} scene 场景对象
 * @param {Cesium.Cartographic} position 经纬度坐标点
 * @returns {Cesium.Cartographic} 更新了Height属性的经纬度点
 * @see {@link Cesium.Scene.sampleHeight}
 */
GeometryUtil.updateSampleHeight = function (scene, position) {
    //Initiates an asynchronous Scene#sampleHeight query for an array of Cartographic positions using the maximum level of detail for 3D Tilesets in the scene.
    // let promise = scene.sampleHeightMostDetailed(positions);
    // promise.then(function(updatedPosition) {
    //
    // });

    if (!scene.sampleHeightSupported) {
        return;
    }

    let entity = new Cesium.Entity({
        position: position
    });
    let height = scene.sampleHeight(position, [entity]);
    if (Cesium.defined(height)) {
        position.height = height;
    }
    return position;
};

/**
 * 使用向量叉积求面积
 * @method
 * @param {Array.<Number>} points 点数组
 * @returns {Number} 结果面积
 */
GeometryUtil.getSpaceArea = function (points) {
    const pntNum = points.length;
    if (pntNum < 3) {
        return 0;
    }

    let total = 0,
        a = 0,
        b = 0,
        c = 0,
        j = 0,
        k = 0,
        va, vb, vc;
    let firstPnt = points[0];
    //拆分三角曲面
    for (let i = 0; i < pntNum - 2; i += 2) {
        j = (i + 1) % pntNum;
        k = (i + 2) % pntNum;
        // let totalAngle = Angle(points[i], points[j], points[k]);
        va = new Cesium.Cartesian3();
        vb = new Cesium.Cartesian3();
        vc = new Cesium.Cartesian3();
        Cesium.Cartesian3.subtract(points[j], firstPnt, va);
        a = Cesium.Cartesian3.magnitude(va);
        if (a < 0.000000000001) {
            continue;
        }
        Cesium.Cartesian3.subtract(points[k], firstPnt, vb);
        b = Cesium.Cartesian3.magnitude(vb);
        if (b < 0.000000000001) {
            continue;
        }

        Cesium.Cartesian3.cross(va, vb, vc);
        //这里的结果可能为负数，不能取模
        //c = Cesium.Cartesian3.magnitude(vc);
        c = vc.x + vc.y + vc.z;

        let dis_temp1 = this.getSpaceDistance([firstPnt, points[j]]);
        let dis_temp2 = this.getSpaceDistance([firstPnt, points[k]]);
        total += dis_temp1 * dis_temp2 * c / (a * b) * 0.5;
    }

    return total;
};

/**
 * 获取点列表的中心点坐标
 * @method
 * @param {Array.<Number>} points 点数组
 * @param {Cesium.Cartesian3} result 结果点对象
 * @returns {Cesium.Cartesian3} 结果点对象
 */
GeometryUtil.getCenterPoint = function (points, result) {
    const pntNum = points.length;
    if (!result) {
        result = new Cesium.Cartesian3();
    }
    if (pntNum === 0) {
        return result;
    }

    let x = 0,
        y = 0,
        z = 0;

    points.forEach((v, index) => {
        x += v.x;
        y += v.y;
        z += v.z;
    });

    result.x = x / pntNum;
    result.y = y / pntNum;
    result.z = z / pntNum;

    return result;
};

/**
 * 计算方位角
 * @method
 * @param {Array.<Cesium.Cartesian3>} points 点数组
 * @returns {Number} 结果方位角，单位为度
 */
GeometryUtil.getDirectionAngle = function (points, directionVector) {
    const pntNum = points.length;
    if (pntNum < 2) {
        return 0;
    }
    //向量AB
    let vab = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(points[1], points[0], vab);

    // let vNorth = new Cesium.Cartesian3(0, 0, 1);
    // let vc = new Cesium.Cartesian3();
    // Cesium.Cartesian3.cross(vNorth, vab, vc);
    //
    // let c = vc.x + vc.y + vc.z;
    //
    // let mab = Cesium.Cartesian3.magnitude(vab);
    //
    // let angle = Math.asin(c / mab);
    // return Cesium.Math.toDegrees(angle+firstGeoPoint.latitude);

    let pointA = points[0];
    let pointB = points[1];
    //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);

    //为什么需要使用逆矩阵还未弄清楚
    const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
        vab, new Cesium.Cartesian3());

    //归一化
    const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());

    Cesium.Cartesian3.clone(direction, directionVector);

    //heading
    const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
    return Cesium.Math.toDegrees(Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading));
}

/**
 * 还没用到。不能只采地形高。要优化
 * 将绘制线的点数组转为能够在高程上显示的点数组
 * @param {Array.<Number>} positions 点数组，格式为:[lon1, lat1, lon2, lat2, ...]
 * @returns {Promise}
 * @private
 */
GeometryUtil.transferPoints = function (positions) {
    return new Promise((resolve, reject) => {
        let blh_array = [];
        let result = [];
        for (let i = 0; i < positions.length - 2; i += 2) {
            let lon1 = positions[i];
            let lat1 = positions[i + 1];
            let lon2 = positions[i + 2];
            let lat2 = positions[i + 3];
            blh_array = [];

            // 将两个点分为1000等分点
            for (let j = 0; j < 1000; j++) {
                let lon = Cesium.Math.toRadians(Cesium.Math.lerp(lon1, lon2, j / (1000 - 1)));
                let lat = Cesium.Math.toRadians(Cesium.Math.lerp(lat1, lat2, j / (1000 - 1)));
                let cartographic = new Cesium.Cartographic(lon, lat);
                blh_array.push(cartographic);
            }

            // 调用Cesium提供的方法获取每个点的高度
            Cesium.when(Cesium.sampleTerrain(viewer.terrainProvider, 11, blh_array)).then((samples) => {
                let offset = 5.0;

                for (let k = 0; k < samples.length; ++k) {
                    samples[k].height += offset;
                }

                result = result.concat(samples);

                if (i === (positions.length - 4)) {
                    resolve(result);
                }
            });
        }
    });
}

export default GeometryUtil;