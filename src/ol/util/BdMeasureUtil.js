

function _getLoop(a, b, c) {
    while (a > c) a -= c - b;
    while (a < b) a += c - b;
    return a;
}

function _getRange(a, b, c) {
    b != null && (a = Math.max(a, b));
    c != null && (a = Math.min(a, c));
    return a;
}

/**
 * @exports BdMeasureUtil
 * @classdesc 百度地图测量工具类。此类为Object实例，不需要new
 * @class
 */
let BdMeasureUtil = {

    /**
     * 百度经纬度计算长度
     * @param {Number} a_lng 经度1
     * @param {Number} a_lat 纬度1
     * @param {Number} b_lng 经度2
     * @param {Number} b_lat 纬度2
     * @returns {Number} 长度值
     */
    measeureLengthBD09Sphere: function (a_lng, a_lat, b_lng, b_lat) {
        let x1 = Math.PI * this._getLoop(a_lng, -180, 180) / 180;
        let x2 = Math.PI * this._getLoop(b_lng, -180, 180) / 180;
        let y1 = Math.PI * this._getRange(a_lat, -74, 74) / 180;
        let y2 = Math.PI * this._getRange(b_lat, -74, 74) / 180;
        return 6370996.81 * Math.acos(Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1));
    },


    /**
     * 百度经纬度计算面积
     * @param {Array.<Object>} pts 坐标点数组。其格式为:[{x:经度,y:纬度}]
     * @return {Number} 面积值
     */
    measeureAreaBD09Sphere: function (pts) {
        if (!pts || pts.length < 3) {
            return 0;
        }
        let EARTHRADIUS = 6370996.81;
        let totalArea;
        let LowX = 0.0;
        let LowY = 0.0;
        let MiddleX = 0.0;
        let MiddleY = 0.0;
        let HighX = 0.0;
        let HighY = 0.0;
        let AM = 0.0;
        let BM = 0.0;
        let CM = 0.0;
        let AL = 0.0;
        let BL = 0.0;
        let CL = 0.0;
        let AH = 0.0;
        let BH = 0.0;
        let CH = 0.0;
        let CoefficientL = 0.0;
        let CoefficientH = 0.0;
        let ALtangent = 0.0;
        let BLtangent = 0.0;
        let CLtangent = 0.0;
        let AHtangent = 0.0;
        let BHtangent = 0.0;
        let CHtangent = 0.0;
        let ANormalLine = 0.0;
        let BNormalLine = 0.0;
        let CNormalLine = 0.0;
        let OrientationValue = 0.0;
        let AngleCos = 0.0;
        let Sum1 = 0.0;
        let Sum2 = 0.0;
        let Count2 = 0;
        let Count1 = 0;
        let Sum = 0.0;
        let Radius = EARTHRADIUS; //6378137.0,WGS84
        let Count = pts.length;
        for (let i = 0; i < Count; i++) {
            if (i == 0) {
                LowX = pts[Count - 1].x * Math.PI / 180;
                LowY = pts[Count - 1].y * Math.PI / 180;
                MiddleX = pts[0].x * Math.PI / 180;
                MiddleY = pts[0].y * Math.PI / 180;
                HighX = pts[1].x * Math.PI / 180;
                HighY = pts[1].y * Math.PI / 180;
            }
            else if (i == Count - 1) {
                LowX = pts[Count - 2].x * Math.PI / 180;
                LowY = pts[Count - 2].y * Math.PI / 180;
                MiddleX = pts[Count - 1].x * Math.PI / 180;
                MiddleY = pts[Count - 1].y * Math.PI / 180;
                HighX = pts[0].x * Math.PI / 180;
                HighY = pts[0].y * Math.PI / 180;
            }
            else {
                LowX = pts[i - 1].x * Math.PI / 180;
                LowY = pts[i - 1].y * Math.PI / 180;
                MiddleX = pts[i].x * Math.PI / 180;
                MiddleY = pts[i].y * Math.PI / 180;
                HighX = pts[i + 1].x * Math.PI / 180;
                HighY = pts[i + 1].y * Math.PI / 180;
            }
            AM = Math.cos(MiddleY) * Math.cos(MiddleX);
            BM = Math.cos(MiddleY) * Math.sin(MiddleX);
            CM = Math.sin(MiddleY);
            AL = Math.cos(LowY) * Math.cos(LowX);
            BL = Math.cos(LowY) * Math.sin(LowX);
            CL = Math.sin(LowY);
            AH = Math.cos(HighY) * Math.cos(HighX);
            BH = Math.cos(HighY) * Math.sin(HighX);
            CH = Math.sin(HighY);
            CoefficientL = (AM * AM + BM * BM + CM * CM) / (AM * AL + BM * BL + CM * CL);
            CoefficientH = (AM * AM + BM * BM + CM * CM) / (AM * AH + BM * BH + CM * CH);
            ALtangent = CoefficientL * AL - AM;
            BLtangent = CoefficientL * BL - BM;
            CLtangent = CoefficientL * CL - CM;
            AHtangent = CoefficientH * AH - AM;
            BHtangent = CoefficientH * BH - BM;
            CHtangent = CoefficientH * CH - CM;
            AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent) / (Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent));
            AngleCos = Math.acos(AngleCos);
            ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
            BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
            CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;
            if (AM != 0)
                OrientationValue = ANormalLine / AM;
            else if (BM != 0)
                OrientationValue = BNormalLine / BM;
            else
                OrientationValue = CNormalLine / CM;
            if (OrientationValue > 0) {
                Sum1 += AngleCos;
                Count1++;
            }
            else {
                Sum2 += AngleCos;
                Count2++;
            }
        }
        let tempSum1, tempSum2;
        tempSum1 = Sum1 + (2 * Math.PI * Count2 - Sum2);
        tempSum2 = (2 * Math.PI * Count1 - Sum1) + Sum2;
        if (Sum1 > Sum2) {
            if ((tempSum1 - (Count - 2) * Math.PI) < 1)
                Sum = tempSum1;
            else
                Sum = tempSum2;
        }
        else {
            if ((tempSum2 - (Count - 2) * Math.PI) < 1)
                Sum = tempSum2;
            else
                Sum = tempSum1;
        }
        totalArea = (Sum - (Count - 2) * Math.PI) * Radius * Radius;

        return totalArea;
    }

};

export default BdMeasureUtil;