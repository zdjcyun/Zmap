import ZEvent from "../../events/ZEvent.js";
import ImageryProviderTileStyleEnum from "../enum/ImageryProviderTileStyleEnum.js";
import BaseImageryProvider from "./BaseImageryProvider.js";
import CoordTypeEnum from "../../enum/CoordTypeEnum.js";
import GeoCoordConverterUtil from "../../utils/GeoCoordConverterUtil.js";
import BaiduMercatorProjection from "./BaiduMercatorProjection.js";

/**
 * @exports BaiduImageryProvider
 * @class
 * @classdesc 百度地图切片数据实现类。名字空间map3d.layers.provider.BaiduImageryProvider。
 * @constructor
 * @param {Object} options 参数配置对象
 * @property {Object} options 参数属性
 * @property {String} options.bigfont 字体风格
 * @property {String} options.tileStyle 切片风格类型 {@link ImageryProviderTileStyleEnum}
 */

class BaiduImageryProvider extends BaseImageryProvider {
    constructor(options) {
        super(options);

        this.initImageryProvider(options);
    }

    initImageryProvider(options) {
        let defaultURL = "";
        this.subdomains = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const TRAFFIC_URL =
            'http://its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2';
        switch (options.tileStyle) {
            case ImageryProviderTileStyleEnum.IMG:
                defaultURL = 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46';
                break;
            case ImageryProviderTileStyleEnum.IMGANNO:
                // defaultURL = 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=' + (bigfont ? "sh" : "sl") + '&scaler=1&p=1';
                defaultURL = 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020';
                break;
            case ImageryProviderTileStyleEnum.VEC_BAIDU_CUSTOM:
                let customid = options.customid || 'midnight';
                defaultURL = 'http://api{s}.map.bdimg.com/customimage/tile?x={x}&y={y}&z={z}&scale=1&customid=' + customid;
                this.subdomains = ['0', '1', '2'];
                break;
            default:
                defaultURL = 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020';
                break;
        }


        this._url = Cesium.Resource.createIfNeeded(defaultURL);
        let tileSize = 256;
        this._tileWidth = tileSize;
        this._tileHeight = tileSize;
        this._maximumLevel = 18;
        this._minimumLevel = 0; //3;

        let crs = this.crs;
        let n, r;
        if (crs === CoordTypeEnum.wgs84) {
            n = 20037726.37;
            r = 12474104.17;

            let res = [];
            for (let z = this._minimumLevel; z <= this._maximumLevel; z++) {
                res[z] = tileSize * Math.pow(2, this._maximumLevel - z);
            }

            this._tilingScheme = new BDMercatorTilingScheme({
                resolutions: res,
                rectangleSouthwestInMeters: new Cesium.Cartesian2(-n, -r),
                rectangleNortheastInMeters: new Cesium.Cartesian2(n, r)
            });
        } else {
            //  r = 33764560;
            // n = 33554054;
            n = 33554054;
            r = 33746824;

            this._tilingScheme = new Cesium.WebMercatorTilingScheme({
                rectangleSouthwestInMeters: new Cesium.Cartesian2(-n, -r),
                rectangleNortheastInMeters: new Cesium.Cartesian2(n, r)
            });
        }



        let credit = Cesium.defaultValue(options.credit, 'BaiDu');
        if (typeof credit === 'string') {
            credit = new Cesium.Credit(credit);
        }
        this._credit = credit;
        this._proxy = options.proxy;
        this._token = options.token;
        this._tileDiscardPolicy = options.tileDiscardPolicy;
        if (!Cesium.defined(this._tileDiscardPolicy)) {
            this._tileDiscardPolicy = new Cesium.DiscardEmptyTileImagePolicy();
        }
        this._errorEvent = ZEvent.ERROR;
        this._useTiles = true;


        this._ready = true;
        this._readyPromise = Cesium.when.defer().resolve(true);


        return this;
    }


    getTileCredits(x, y, level) {
        return undefined;
    };

    pickFeatures(x, y, level, longitude, latitude) {
        return undefined;
    };

    requestImage(x, y, level) {
        if (!this.ready) {
            throw new Cesium.DeveloperError(
                'requestImage must not be called before the imagery provider is ready.'
            )
        }
        let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level);
        let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
        let url = this.url
            .replace('{z}', level)
            .replace('{s}', String(Math.abs(x + y + level) % this.subdomains.length));

        if (this.crs === CoordTypeEnum.wgs84) {
            url = url.replace('{x}', String(x)).replace('{y}', String(-y));
        } else {
            url = url
                .replace('{x}', String(x - xTiles / 2))
                .replace('{y}', String(yTiles / 2 - y - 1))
        }
        return Cesium.ImageryProvider.loadImage(this, url);
    };

}

Object.defineProperties(BaiduImageryProvider.prototype, {
    url: {
        get: function () {
            return this._url.url;
        }
    },
    token: {
        get: function () {
            return this._token;
        }
    },
    proxy: {
        get: function () {
            return this._proxy;
        }
    },
    tileWidth: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("tileWidth must not be called before the imagery provider is ready.");
            return this._tileWidth;
        }
    },
    tileHeight: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("tileHeight must not be called before the imagery provider is ready.");
            return this._tileHeight;
        }
    },
    maximumLevel: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("maximumLevel must not be called before the imagery provider is ready.");
            return this._maximumLevel;
        }
    },
    minimumLevel: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("minimumLevel must not be called before the imagery provider is ready.");
            return this._minimumLevel
        }
    },
    tilingScheme: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("tilingScheme must not be called before the imagery provider is ready.");
            return this._tilingScheme;
        }
    },
    rectangle: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("rectangle must not be called before the imagery provider is ready.");
            return this._tilingScheme.rectangle;
        }
    },
    tileDiscardPolicy: {
        get: function () {
            if (!this._ready)
                throw new Cesium.DeveloperError("tileDiscardPolicy must not be called before the imagery provider is ready.");
            return this._tileDiscardPolicy;
        }
    },
    errorEvent: {
        get: function () {
            return this._errorEvent;
        }
    },
    ready: {
        get: function () {
            return this._ready
        }
    },
    readyPromise: {
        get: function () {
            return this._readyPromise.promise
        }
    },
    credit: {
        get: function () {
            return this._credit
        }
    },
    usingPrecachedTiles: {
        get: function () {
            return this._useTiles
        }
    },
    hasAlphaChannel: {
        get: function () {
            return true;
        }
    },
});


class BDMercatorTilingScheme extends Cesium.WebMercatorTilingScheme {
    constructor(options) {
        super(options);

        let projection = new BaiduMercatorProjection();
        this.resolutions = options.resolutions || [];

        this._projection.project = function (cartographic, result) {
            result = result || {};

            let rx = Cesium.Math.toDegrees(cartographic.longitude);
            let ry = Cesium.Math.toDegrees(cartographic.latitude);

            let bdll = GeoCoordConverterUtil.coordsConvert(CoordTypeEnum.wgs84, CoordTypeEnum.bd09ll, rx, ry);
            bdll.x = Math.min(bdll.x, 180);
            bdll.x = Math.max(bdll.x, -180);
            bdll.y = Math.min(bdll.y, 74.000022);
            bdll.y = Math.max(bdll.y, -71.988531);

            let nc = projection.lngLatToPoint({
                lng: bdll.x,
                lat: bdll.y
            });

            return new Cesium.Cartesian2(nc.x, nc.y)
        };

        this._projection.unproject = function (cartesian, result) {
            result = result || {};
            let bdll = projection.mercatorToLngLat({
                lng: cartesian.x,
                lat: cartesian.y
            });


            let nc = GeoCoordConverterUtil.coordsConvert(CoordTypeEnum.bd09ll, CoordTypeEnum.wgs84, bdll.lng, bdll.lat);

            let x = Cesium.Math.toRadians(nc.x);
            let y = Cesium.Math.toRadians(nc.y);

            return new Cesium.Cartographic(x, y);
        };

    }

    tileXYToNativeRectangle(x, y, level, result) {
        const tileWidth = this.resolutions[level]
        const west = x * tileWidth
        const east = (x + 1) * tileWidth
        const north = ((y = -y) + 1) * tileWidth
        const south = y * tileWidth

        if (!Cesium.defined(result)) {
            return new Cesium.Rectangle(west, south, east, north)
        }

        result.west = west
        result.south = south
        result.east = east
        result.north = north
        return result;
    }


    positionToTileXY(position, level, result) {
        const rectangle = this._rectangle
        if (!Cesium.Rectangle.contains(rectangle, position)) {
            return undefined
        }
        const projection = this._projection
        const webMercatorPosition = projection.project(position)
        if (!Cesium.defined(webMercatorPosition)) {
            return undefined
        }
        const tileWidth = this.resolutions[level]
        const xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth)
        const yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth)
        if (!Cesium.defined(result)) {
            return new Cesium.Cartesian2(xTileCoordinate, yTileCoordinate)
        }
        result.x = xTileCoordinate
        result.y = yTileCoordinate
        return result
    }

}

export default BaiduImageryProvider;