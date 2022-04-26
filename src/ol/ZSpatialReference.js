/*
 * @Date: 2022-04-26 14:40:18
 * @LastEditTime: 2022-04-26 15:11:26
 */
/**
 * @exports ZSpatialReference
 * @class
 * @classdesc 空间参考对象类
 * @param {number} wkid 坐标系EPSG代号
 */
class ZSpatialReference {
    constructor(wkid) {
        this.wkid = wkid;
        this.__ = {
            wkid: wkid
        };
    }


    /**
     * 判断两个空间参考对象类是否相同
     * @param {ZSpatialReference} sr 空间参考对象
     * @return {boolean} 同一坐标系返回为true,否则为fale
     */
    equals(sr) {
        return this.wkid === sr.wkid;
    }

    /**
     * 是否为互联网投影坐标参考系：3857，3758，102100，900913
     * @return {boolean} 为投影坐标系返回true,否则为false
     */
    isWebMercator() {
        return this.wkid === 3857 || this.wkid === 102100
            || this.wkid === 3758 || this.wkid === 900913;
    }


}

export default ZSpatialReference;