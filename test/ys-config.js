/**
 * 应用程序入口
 */

// // 开发模式
import {
    map3d as zgis3d
} from '../src/cesium/Map3d.js';

// 生产模式
// const zgis3d = zgis.map3d;

// 使用html静态代码比较合适
// zgis3d.showLoadingDiv();

window.CESIUM_BASE_URL = '../libs/cesium175/';

zgis3d.createScene('root', {
    theme: 'zgis-theme-deepblue',
    isIFrame: false,
    enablePostMessage: true,
    infoBox: true,
    depthTestAgainstTerrain: false,
    disableDefaultLeftDblClickHandler: true,
    disableDefaultLeftClickHandler: false,
    bottomToolbar: false,
    baseLayer: {
        id: 'google_img', //tdt_img
        showanno: true
    },
    terrainLayer: {
        id: 'chinaTerrain',
        visible: true,
    },
    widgets: {
        navigationToolWidget: false,
        legendWidget: {
            layers: [{
                id: 'lyr_device',
                name: '',
                rules: [{
                        title: '崩塌',
                        name: `./img/marker/icon_bengta.png`,
                        value: '1',
                    },
                    {
                        title: '滑坡',
                        name: `./img/marker/icon_huapo.png`,
                        value: '2',
                    }
                ]
            }]
        }
    },
    addDataSources: 1,
    ds: [
        zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
            'zdjc_dz_device',
            `http://127.0.0.1:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Adevices3d&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=mapid%3D2`, {
                crs: 1,
                primitive: 0,
                refresh: true,
                refreshInterval: 0.5 * 60, // 秒
                customSymbol: 1,
                label: {
                    show: true,
                },
            },
            true, false, '地质灾害监控设备', '地质灾害监控设备'
        ).toJSON(),
        zgis3d.models.ZDataSourceModel.getDistrictModel(
            'district_qh_ys',
            'http://127.0.0.1:8180/geoserver/hs_science_city/ows', {
                crs: 3,
                urlParams: {
                    typeName: 'hs_science_city:china_district',
                    cql_filter: "dcode='632701'",
                },
            }, true, true, '行政区划'
        ).toJSON(),
    ],
}).then((map3dModule) => {
    let viewer = map3dModule.context.getViewer();
    zgis3d.hideLoadingDiv();
});