

/**
 * @exports GaussKrugerUtil
 * @classdesc 高斯投影工具类。此类为Object实例，不需要new
 * @class
 */
let GaussKrugerUtil = {
    /**
     * @property {String} BEIJING54 北京1954坐标系
     * @type {String}
     */
    BEIJING54: 'BEIJING54',

    /**
     * @property {String} XIAN80 西安1980坐标系
     * @type {String}
     */
    XIAN80: 'XIAN80',

    /**
     * @property {String} CGSC2000 CGSC2000坐标系
     * @type {String}
     */
    CGSC2000: 'CGSC2000',

    /**
     * 高斯投影坐标反算，传入坐标带号，不自己计算
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @param {Number} ZoneWide 带宽
     * @param {Number} projNo 投影带号
     * @param {String} type 投影坐标系类型。可选值:GaussKrugerUtils.BEIJING54,GaussKrugerUtils.XIAN80,GaussKrugerUtils.CGSC2000
     * @return {Array}
     */
    inverseCalc: function (x, y, ZoneWide, projNo, type) {
        let longitude1, latitude1, longitude0, X0, Y0, xval, yval;
        let e1, e2, f, a, ee, NN, T, C, M, D, R, u, fai, iPI;
        iPI = Math.PI / 180.0;
        if (type === this.BEIJING54) {
            a = 6378245.0;
            f = 1.0 / 298.3;
        } else if (type === this.XIAN80) {
            a = 6378140.0;
            f = 1 / 298.257;
        } else {
            a = 6378137.0;
            f = 1 / 298.257222101;
        }
        longitude0 = ZoneWide === 6 ? projNo * 6 - 3 : 3 * projNo;
        longitude0 = longitude0 * iPI;
        X0 = projNo * 1000000 + 500000;
        Y0 = 0
        xval = x - X0;
        yval = y - Y0; //带内大地坐标
        e2 = 2 * f - f * f;
        e1 = (1.0 - Math.sqrt(1 - e2)) / (1.0 + Math.sqrt(1 - e2));
        ee = e2 / (1 - e2);
        M = yval;
        u = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
        fai = u + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * u) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * u) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * u) + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * u);
        C = ee * Math.cos(fai) * Math.cos(fai);
        T = Math.tan(fai) * Math.tan(fai);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(fai) * Math.sin(fai));
        R = a * (1 - e2) / Math.sqrt((1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin
            (fai) * Math.sin(fai)));
        D = xval / NN;
        //计算经度(Longitude) 纬度(Latitude)
        longitude1 = longitude0 + (D - (1 + 2 * T + C) * D * D * D / 6 + (5 - 2 * C + 28 * T - 3 * C * C + 8 * ee + 24 * T * T) * D * D * D * D * D / 120) / Math.cos(fai);
        latitude1 = fai - (NN * Math.tan(fai) / R) * (D * D / 2 - (5 + 3 * T + 10 * C - 4 * C * C - 9 * ee) * D * D * D * D / 24 + (61 + 90 * T + 298 * C + 45 * T * T - 256 * ee - 3 * C * C) * D * D * D * D * D * D / 720);
        return [longitude1 / iPI, latitude1 / iPI]
    },

    /**
     * 高斯投影坐标反算，根据坐标信息自动计算带号
     * @param {Number} x X坐标
     * @param {Number} y Y坐标
     * @param {Number} ZoneWide 带宽
     * @param {String} type 投影坐标系类型。可选值:GaussKrugerUtils.BEIJING54,GaussKrugerUtils.XIAN80,GaussKrugerUtils.CGSC2000
     * @return {Array}
     */
    inverseCalcAuto: function (x, y, ZoneWide, type) {
        let longitude1, latitude1, longitude0, X0, Y0, xval, yval;
        let e1, e2, f, a, ee, NN, T, C, M, D, R, u, fai, iPI;
        iPI = Math.PI / 180.0;
        if (type === this.BEIJING54) {
            a = 6378245.0;
            f = 1.0 / 298.3;
        } else if (type === this.XIAN80) {
            a = 6378140.0;
            f = 1 / 298.257;
        } else {
            a = 6378137.0;
            f = 1 / 298.257222101;
        }

        let projNo = parseInt(x / 1000000);
        longitude0 = ZoneWide === 6 ? projNo * 6 - 3 : 3 * projNo;
        longitude0 = longitude0 * iPI;
        X0 = projNo * 1000000 + 500000;
        Y0 = 0
        xval = x - X0;
        yval = y - Y0; //带内大地坐标
        e2 = 2 * f - f * f;
        e1 = (1.0 - Math.sqrt(1 - e2)) / (1.0 + Math.sqrt(1 - e2));
        ee = e2 / (1 - e2);
        M = yval;
        u = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
        fai = u + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * u) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * u) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * u) + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * u);
        C = ee * Math.cos(fai) * Math.cos(fai);
        T = Math.tan(fai) * Math.tan(fai);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(fai) * Math.sin(fai));
        R = a * (1 - e2) / Math.sqrt((1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin(fai) * Math.sin(fai)) * (1 - e2 * Math.sin
            (fai) * Math.sin(fai)));
        D = xval / NN;
        //计算经度(Longitude) 纬度(Latitude)
        longitude1 = longitude0 + (D - (1 + 2 * T + C) * D * D * D / 6 + (5 - 2 * C + 28 * T - 3 * C * C + 8 * ee + 24 * T * T) * D * D * D * D * D / 120) / Math.cos(fai);
        latitude1 = fai - (NN * Math.tan(fai) / R) * (D * D / 2 - (5 + 3 * T + 10 * C - 4 * C * C - 9 * ee) * D * D * D * D / 24 + (61 + 90 * T + 298 * C + 45 * T * T - 256 * ee - 3 * C * C) * D * D * D * D * D * D / 720);
        return [longitude1 / iPI, latitude1 / iPI]
    },


    /**
     * 高斯投影坐标正算，传入带号，无需自己计算
     * @param {Number} longitude 经度
     * @param {Number} latitude 纬度
     * @param {Number} ZoneWide 带宽
     * @param {Number} projNo 投影带号
     * @param {String} type 投影坐标系类型。可选值:GaussKrugerUtils.BEIJING54,GaussKrugerUtils.XIAN80,GaussKrugerUtils.CGSC2000
     * @return {Array}
     */
    calc: function (longitude, latitude, zoneWide, projNo, type) {
        let longitude1, latitude1, longitude0, X0, Y0, xval, yval;
        let a, f, e2, ee, NN, T, C, A, M, iPI;
        iPI = Math.PI / 180.0;
        if (type === this.BEIJING54) {
            a = 6378245.0;
            f = 1.0 / 298.3;
        } else if (type === this.XIAN80) {
            a = 6378140.0;
            f = 1 / 298.257;
        } else {
            a = 6378137.0;
            f = 1 / 298.257222101;
        }
        longitude0 = zoneWide === 6 ? projNo * 6 - 3 : 3 * projNo;
        longitude0 = longitude0 * iPI;
        longitude1 = longitude * iPI;
        latitude1 = latitude * iPI;
        e2 = 2 * f - f * f;
        ee = e2 * (1.0 - e2);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(latitude1) * Math.sin(latitude1));
        T = Math.tan(latitude1) * Math.tan(latitude1);
        C = ee * Math.cos(latitude1) * Math.cos(latitude1);
        A = (longitude1 - longitude0) * Math.cos(latitude1);
        M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latitude1 - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2
            * e2 / 1024) * Math.sin(2 * latitude1)
            + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latitude1) - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latitude1));
        xval = NN * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ee) * A * A * A * A * A / 120);
        yval = M + NN * Math.tan(latitude1) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
            + (61 - 58 * T + T * T + 600 * C - 330 * ee) * A * A * A * A * A * A / 720);
        X0 = 1000000 * (projNo) + 500000;
        Y0 = 0;
        return [xval + X0, yval + Y0];

    },

    /**
     * 高斯投影坐标反算，根据坐标信息自动计算带号
     * @param {Number} longitude 经度
     * @param {Number} latitude 纬度
     * @param {Number} ZoneWide 带宽
     * @param {String} type 投影坐标系类型。可选值:GaussKrugerUtils.BEIJING54,GaussKrugerUtils.XIAN80,GaussKrugerUtils.CGSC2000
     * @return {Array}
     */
    calcAuto: function (longitude, latitude, zoneWide, type) {
        let longitude1, latitude1, longitude0, X0, Y0, xval, yval;
        let a, f, e2, ee, NN, T, C, A, M, iPI;
        iPI = Math.PI / 180.0;
        if (type === this.BEIJING54) {
            a = 6378245.0;
            f = 1.0 / 298.3;
        } else if (type === this.XIAN80) {
            a = 6378140.0;
            f = 1 / 298.257;
        } else {
            a = 6378137.0;
            f = 1 / 298.257222101;
        }
        let projNo = zoneWide === 6 ? (longitude % 6 === 0 ? parseInt(longitude / 6) : parseInt(longitude / 6) + 1)
            : parseInt(longitude * 1.0 / 3 + 0.5);
        longitude0 = zoneWide === 6 ? projNo * 6 - 3 : 3 * projNo;
        longitude0 = longitude0 * iPI;
        longitude1 = longitude * iPI;
        latitude1 = latitude * iPI;
        e2 = 2 * f - f * f;
        ee = e2 * (1.0 - e2);
        NN = a / Math.sqrt(1.0 - e2 * Math.sin(latitude1) * Math.sin(latitude1));
        T = Math.tan(latitude1) * Math.tan(latitude1);
        C = ee * Math.cos(latitude1) * Math.cos(latitude1);
        A = (longitude1 - longitude0) * Math.cos(latitude1);
        M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latitude1 - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2
            * e2 / 1024) * Math.sin(2 * latitude1)
            + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latitude1) - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latitude1));
        xval = NN * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ee) * A * A * A * A * A / 120);
        yval = M + NN * Math.tan(latitude1) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
            + (61 - 58 * T + T * T + 600 * C - 330 * ee) * A * A * A * A * A * A / 720);
        X0 = 1000000 * projNo + 500000;
        Y0 = 0;
        return [xval + X0, yval + Y0];

    }
};
export default GaussKrugerUtil;