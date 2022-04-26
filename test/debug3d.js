/**
 * 应用程序入口
 */

// // 开发模式
import {
  map3d as zgis3d
} from "../src/cesium/Map3d.js";

// import GeometryUtil from "../src/cesium/utils/GeometryUtil.js";
// import IdentifyUtil from "../src/cesium/utils/IdentifyUtil.js";
// import DataSourceTypeEnum from "../src/cesium/datasources/DataSourceTypeEnum.js";
// import ArrowPolyline from '../src/cesium/core/ArrowPolyline.js'

const { GeometryUtil,IdentifyUtil,DataSourceTypeEnum,ArrowPolyline} = zgis3d;

// 生产模式
// const zgis3d = window.zgis3d.map3d;

// 使用html静态代码比较合适
// zgis3d.showLoadingDiv();

window.CESIUM_BASE_URL = "../libs/cesium178/";

// 三维场景参数
const gisOptions = {
  origins: [
    "http://localhost:8080",
  ],
  theme: "zgis-theme-dark", //"zgis-theme-deepblue", // 
  isIFrame: false,
  enablePostMessage: true,
  enableMovePickEntity: false,
  infoBox: false, // true
  selectionIndicator: false, // 原生绿色选择框
  depthTestAgainstTerrain: true,
  disableDefaultLeftDblClick: true,
  disableDefaultLeftClick: false,
  globeHidden: 0,
  geocoder: 'gaode',//baidu,gaode, osm
  // initView: {
  //   "destination": [
  //     111.31565598012409,
  //     -4.105499057003728,
  //     3294384.0903837183
  //   ],
  //   "orientation": {
  //     "heading": 0.24976439144375773,
  //     "pitch": -52.18185400103746,
  //     "roll": 0.30587330196020546
  //   }
  // },
  baseLayer: {
    id: "tdt_img",
    // showanno: true,
    crs: 1,
    // id: "baidu_vec_midnight",
    // id: 'mapboxstyle_dark_vec',
  },
  terrainLayer: {
    // id: "chinaTerrain",
    // visible: false,
    // id: "hunanTerrain",
    // visible: true,
    // id: 'customTerrain',
    // url: 'http://10.88.89.76:8000/',
  },
  widgets: {
    navigationToolWidget: true,
    legendWidget: {
      layers: [{
        id: "lyr_device",
        name: "设备图层",
        rules: [{
            title: "泥石流",
            name: `./img/marker/icon_nishiliu.png`,
            value: "1",
            total: "",
          },
          {
            title: "滑坡",
            name: `./img/marker/icon_huapo.png`,
            value: "2",
            total: "",
          },
          {
            title: "塌陷",
            name: `./img/marker/icon_taxian.png`,
            value: "3",
            total: "",
          },
          {
            title: "崩塌",
            name: `./img/marker/icon_bengta.png`,
            value: "4",
            total: "",
          },
        ],
      }, ],
    },
    // drawToolWidget: {
    //   tools: [{
    //     id: "point",
    //     visible: true,
    //   }, ],
    //   activeEventListener: (tool, tooltip) => {

    //   }
    // },
    measureToolWidget: {
      tools: [{
        id: "location",
        visible: true,
      }],
      drawCompleteEventListener: function (entity, drawHandler) {
        if (drawHandler.drawMode === zgis3d.enum.DrawModeEnum.POINT ||
          drawHandler.drawMode === zgis3d.enum.DrawModeEnum.MARKER) {
          const cartographic = drawHandler.viewer.getCesiumViewer().scene.globe.ellipsoid.cartesianToCartographic(
            entity.position.getValue()
          )

          console.log({
            longitude: (cartographic.longitude / Math.PI) * 180,
            latitude: (cartographic.latitude / Math.PI) * 180,
            height: cartographic.height
          })
        } else if (drawHandler.drawMode === zgis3d.enum.DrawModeEnum.POLYLINE) {
          // console.log(entity.polyline.positions.getValue(), '线坐标位置')
          let ellipsoid = drawHandler.viewer.getCesiumViewer().scene.globe.ellipsoid;
          let pnts = entity.polyline.positions.getValue();
          let coords = [];
          for (let i = 0; i < pnts.length; i++) {
            const cartographic = ellipsoid.cartesianToCartographic(
              pnts[i]
            )
            coords.push([
              (cartographic.longitude / Math.PI) * 180,
              (cartographic.latitude / Math.PI) * 180,
              cartographic.height
            ]);
          }

          let bdJson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coords
              },
              properties: {
                name: 'polyline'
              }
            }]
          };
          var file = new File([JSON.stringify(bdJson)], {
            type: "text/plain;charset=utf-8"
          });
          saveAs(file, 'polyline.geojson');
        } else if (drawHandler.drawMode === zgis3d.enum.DrawModeEnum.POLYGON) {

          //console.log(JSON.stringify(entity.polygon.hierarchy.getValue().positions), '面坐标位置');
          //
          let ellipsoid = drawHandler.viewer.getCesiumViewer().scene.globe.ellipsoid;
          let pnts = entity.polygon.hierarchy.getValue().positions;
          let coords = [];
          for (let i = 0; i < pnts.length; i++) {
            const cartographic = ellipsoid.cartesianToCartographic(
              pnts[i]
            )
            coords.push([
              (cartographic.longitude / Math.PI) * 180,
              (cartographic.latitude / Math.PI) * 180,
              cartographic.height
            ]);
          }

          let bdJson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coords]
              },
              properties: {
                name: 'polygon'
              }
            }]
          };
          var file = new File([JSON.stringify(bdJson)], {
            type: "text/plain;charset=utf-8"
          });
          saveAs(file, 'polygon.geojson');
        }
      }
    },
    // 布点组件
    // distributeToolWidget: {
    //   mode: zgis3d.enum.ToolModeEnum.COMPONENT,
    //   addToViewer: false, /// ???
    //   distributeCompleteEventListener: function(entity) {
    //       console.log(entity)
    //   }
    // },
    identifyToolWidget: {
      identifyEventHandler: function (position, zviewer) {
        // 世界坐标转换为经纬度
        var ellipsoid=zviewer.getCesiumViewer().scene.globe.ellipsoid;
        var cartesian3=new Cesium.Cartesian3(position.x,position.y,position.z);
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        
        var lng=Cesium.Math.toDegrees(cartographic.longitude);
        var lat=Cesium.Math.toDegrees(cartographic.latitude);
        var alt=cartographic.height;
        //console.log('position:',lng,',',lat,',',alt);

        // 取管道线数据
        const pipeEntitiesDatasource = zviewer
          .getDataSourceManager()
          .getDataSource({
            id: "centerline",
            type: DataSourceTypeEnum.DS_DYNAMIC,
          });
        let entity = IdentifyUtil.identifyLine(
          position,
          pipeEntitiesDatasource.entities.values
        );

        if (!entity) {
          zviewer.getDataSourceManager().clearCachedDataSource();
          return;
        }
        let polylinePos = entity.polyline.positions.getValue();

        var radius = entity.properties.radius.getValue() * 1.05; //应该为管道实体的半径加0.1或者0.2
        var polyline_positions = new Array();
        var polyline_cartographics =
          window.Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(
            polylinePos
          );
        for (var i = 0; i < polyline_cartographics.length; i++) {
          polyline_cartographics[i].height -= radius;
          polyline_positions[i] =
            window.Cesium.Ellipsoid.WGS84.cartographicToCartesian(
              polyline_cartographics[i]
            );
        }

        zviewer.getDataSourceManager().removeCachedEntity("selectedPL");

        zviewer.getDataSourceManager().addCachedEntity({
          name: "Red tube with rounded corners",
          polylineVolume: {
            positions: polyline_positions,
            shape: GeometryUtil.computeCircle(radius),
            material: window.Cesium.Color.YELLOW.withAlpha(0.5),
          },
          id: "selectedPL",
        });
      },
    }
  },
  drawOptions: {
    // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
    isClear: false,
  }
}

// 创建三维场景
zgis3d.createScene("root3d", gisOptions,initViewInitialed).then((map3dModule) => {
  //console.log("地图加载完成...");
  fileDrag(map3dModule)
});

/**
 * 地图模块初始化完成
 * @param {Map3d} map3dModule
 */
function initViewInitialed(map3dModule, viewer) {

  zgis3d.hideLoadingDiv();

  window.map3dModule = map3dModule;

  // 黑色背景泛光效果
  // viewer.updateSceneBloom();
  // viewer.updateSkyBox(/*new Cesium.SkyBox({
  //   sources: {
  //     positiveX: './img/skybox/posx.png',
  //     negativeX: './img/skybox/negx.png',
  //     positiveY: './img/skybox/posy.png',
  //     negativeY: './img/skybox/negy.png',
  //     positiveZ: './img/skybox/posz.png',
  //     negativeZ: './img/skybox/negz.png'
  //   }
  // })*/);
  // viewer.updateSceneShadows(false);

  const testData = getTestData()
  // 添加数据源
  viewer.addDataSources(testData).then((data) => {

    console.log("添加数据源完成",data);

    dataSourceLoadedComplated()

  }).then((dataset) => {

    console.log("数据集加载完成",dataset);

      // Cesium.Resource.fetchJson({
      //   url: './data/bjpg.GeoJSON',
      // }).then((data) => {
      //   let bdJson = zgis3d.utils.GeoJsonUtil.coordsTransform(data, 3, 2);
      //   var file = new File([JSON.stringify(bdJson)], {
      //     type: "text/plain;charset=utf-8"
      //   });
      //   saveAs(file, 'bj_pg_district.GeoJSON');
      // });




      // addMapVLayer(viewer.getCesiumViewer());
      // addMapVlayerBubble(viewer.getCesiumViewer());
      // addMapVlayerBubble2(viewer.getCesiumViewer());
      // addMapVlayerGrid(viewer.getCesiumViewer());
      // addMapVLayerChoropleth(viewer.getCesiumViewer());
      // addMapVLayerCluster(viewer.getCesiumViewer());
      // addMapVLayerCategory(viewer.getCesiumViewer());


      // 点击有问题
      // addS3MLayer(viewer.getCesiumViewer(), {
      //   context: viewer.getCesiumViewer().scene._context,
      //   url: './data/s3m/ConfigS3M.scp'
      // });


      // const result = viewer.geocoder.geocode('长沙市').then((res) => {
      //   debugger
      //   console.log(res)
      // })
  });

  // 添加GIS平台数据
  loadGisPlatformInterface(map3dModule)
  
    // （布点工具）按钮绑定事件
    // window.document.getElementById("btnDistribute").addEventListener('click',() => {
    //   map3dModule.context.viewer.widgetCollection.widgetMap.distributeToolWidget.activateTool()  // widgetCollection.getWidget
    // })

    // window.document.getElementById("btnClearDistribute").addEventListener('click',() => {
    //   map3dModule.context.viewer.widgetCollection.widgetMap.distributeToolWidget.clearResult()
    // })
}

function dataSourceLoadedComplated(data) {
  // console.log(viewer.getCurrentCameraView()); 
      //   viewer.getCesiumViewer().camera.setView({
      //     "destination": new Cesium.Cartesian3.fromDegreesArrayHeights([
      //         112.07336739458088,
      //         6.892229591172006,
      //         5308294.443683064
      //     ])[0],
      //     "orientation": {
      //         "heading": 6.226336605379375,
      //         "pitch": -1.2464537584220516,
      //         "roll": 0.0006396956875285298
      //     }
      // });


      // 唐山桥梁
      // addModel(window.map3dModule, "./data/tangshanbridge.glb", "tangshanqiaoliang");
      // // let origin = Cesium.Cartesian3.fromDegrees(112.8758969759,28.119355217,8);
      // let origin = Cesium.Cartesian3.fromDegrees(118.17445534, 39.74140, 0);// 唐山
      // let entity = viewer.getCesiumViewer().entities.add({
      //   // position: Cesium.Cartesian3.fromDegrees(118.17445534, 39.74126898, 0),// 唐山
      //   position: origin,
      //   orientation: Cesium.Transforms.headingPitchRollQuaternion(
      //     origin,
      //     // new Cesium.HeadingPitchRoll(Cesium.Math.PI_OVER_TWO, 0, 0) // heading,pitch, roll
      //     new Cesium.HeadingPitchRoll(0.03, 0, 0) // heading,pitch, roll
      //   ),
      //   model: {
      //     uri: "./data/tangshanbridge.glb",
      //   },
      // });

      // 高支模
      // addModel(window.map3dModule, "./data/ylex6.glb", 'gzm');
      // let origin = Cesium.Cartesian3.fromDegrees(112.8758969759, 28.119355217, 0);
      // let entity = viewer.getCesiumViewer().entities.add({
      //   position: origin,
      //   orientation: Cesium.Transforms.headingPitchRollQuaternion(
      //     origin,
      //     new Cesium.HeadingPitchRoll(0, 0.0, 0) // heading,pitch, roll 
      //   ),
      //   model: {
      //     uri: "./data/ylex.glb",
      //     scale: 10,
      //     shadows: Cesium.ShadowMode.DISABLED
      //   },
      // });

      // viewer.getCesiumViewer().trackedEntity = entity;

      // viewer._drawHandler.activate(DrawModeEnum.POINT,'点击布点')
      // viewer._drawHandler.drawCompleteEvent.addEventListener((entity)=>{
      //   console.log(entity,'entity');
      // })


      // // 中大管线
      // let origin = Cesium.Cartesian3.fromDegrees(112.8758969759, 28.119355217, 0);
      // let entity = viewer.getCesiumViewer().entities.add({
      //   position: origin,
      //   orientation: Cesium.Transforms.headingPitchRollQuaternion(
      //     origin,
      //     new Cesium.HeadingPitchRoll(0, 0.0, 0) // heading,pitch, roll 
      //   ),
      //   model: {
      //     uri: "./data/zdjc_pipeline.gltf",
      //     //scale: 10,
      //     shadows: Cesium.ShadowMode.DISABLED
      //   },
      // });

      // viewer.getCesiumViewer().trackedEntity = entity;

      // 管网模型       
      // let origin = Cesium.Cartesian3.fromDegrees(117.08269500020841,31.654180021322 , -20.2);
      // let entity = viewer.getCesiumViewer().entities.add({
      //   position: origin,
      //   orientation: Cesium.Transforms.headingPitchRollQuaternion(
      //     origin,
      //     new Cesium.HeadingPitchRoll(Math.PI / 2, 0.0, 0) // heading,pitch, roll 
      //   ),
      //   model: {
      //     uri: "./data/gw_shihua.glb",
      //     //scale: 1.0,
      //     // shadows: Cesium.ShadowMode.DISABLED
      //   },
      // });
      // viewer.getCesiumViewer().trackedEntity = entity;

      // 隧道模型
      // let origin = Cesium.Cartesian3.fromDegrees(112.8758969759, 28.119355217, 0);
      // let entity = viewer.getCesiumViewer().entities.add({
      //   position: origin,
      //   orientation: Cesium.Transforms.headingPitchRollQuaternion(
      //     origin,
      //     new Cesium.HeadingPitchRoll(Math.PI / 4, 0.0, 0) // heading,pitch, roll 
      //   ),
      //   model: {
      //     uri: "./data/隧道.glb",
      //     scale: 0.6,
      //     shadows: Cesium.ShadowMode.DISABLED
      //   },
      // });      
      // viewer.getCesiumViewer().trackedEntity = entity;

      // let legendWidget = viewer.widgetCollection.getWidget('legendWidget');
      // legendWidget.legendClickEvent.addEventListener((params) => {
      //   console.log(params, 'legend');
      // });


      // data[0].style = new Cesium.Cesium3DTileStyle({
      //   color: 'rgba(255,255,255,0.5)'
      // });

      // data[0].style = new Cesium.Cesium3DTileStyle({
      //   color: {
      //     conditions: [
      //       // ['${HEIGHT} >= 100', 'color("purple", 0.5)'],
      //       // ['${HEIGHT} >= 50', 'color("red")'],
      //       ['true', 'color("white")']
      //     ]
      //   }
      // });

      // viewer.getCesiumViewer().scene.primitives.add(new Cesium.ClassificationPrimitive({
      //   geometryInstances: new Cesium.GeometryInstance({
      //     geometry: new Cesium.PolygonGeometry({
      //       polygonHierarchy: new Cesium.PolygonHierarchy(
      //         Cesium.Cartesian3.fromDegreesArray([
      //           108.960361, 34.220310,
      //           108.960870, 34.220302,
      //           108.960866, 34.219848,
      //           108.960365, 34.219837,
      //           108.960361, 34.220310
      //         ])
      //       ),
      //       extrudedHeight: 110,
      //        debugShowBoundingVolume:true,
      //        debugShowShadowVolume:true,
      //       //vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      //     }),
      //     attributes: { //顶点着色器属性
      //       color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1, 0, 0, 1)),
      //       show: new Cesium.ShowGeometryInstanceAttribute(true), //确定是否显示几何实例
      //     },
      //     id: '测试'
      //   }),
      //   classificationType: Cesium.ClassificationType.BOTH //是否影响地形
      // }));
      // data[0].style = new Cesium.Cesium3DTileStyle({
      //     color: "color('rgba(255,255,255,0.5)')",
      //   // color: {
      //   //     evaluateColor: function (feature, result) {
      //   //       return new Cesium.Color(1, 1, 1, 0.5);
      //   //     }
      //   // },
      //   show: true,
      // });

      // zgis3d.utils.EffectUtil.circleScanPostStage(viewer.getCesiumViewer(), {
      //   lng: 112.87849778954987, 
      //     lat: 28.118542259200254,
      // }, 100, Cesium.Color.GREEN, 3);

      // zgis3d.utils.EffectUtil.radarScanPostStage(viewer.getCesiumViewer(), {
      //   lng: 112.87849778954987, 
      //     lat: 28.118542259200254,
      // }, 100, Cesium.Color.RED, 3);

      // zgis3d.utils.EffectUtil.ellipsoidFade(viewer, {
      //   radius: 200,
      //   center: {
      //     lng: 112.87849778954987,
      //     lat: 28.118542259200254,
      //   },
      //   duration: 3000,
      //   color: Cesium.Color.RED,
      //   from: 3,
      //   to: 5
      // });

      // map3dModule.iMap3D.addMouseMoveListener((ed) => {
      //   console.log(ed.data);
      //   if (!ed.data) {
      //     return;
      //   }
      // });

      // map3dModule.iMap3D.sceneLocation({
      //   features: [{
      //     type: "Feature",
      //     properties: {
      //       name: "设备名称2"
      //     },
      //     geometry: {
      //       type: "Point",
      //       crs: 1, //1、wgs84, 3、高德地图，中国谷歌地图经纬度坐标系
      //       coordinates: [112.87849778954987, 28.118542259200254, 1000]
      //     }
      //   }],
      //   orientation: {
      //     pitch: Math.PI / 180 * -35
      //   },
      //   duration: 3
      // });

      // zgis3d.utils.EffectUtil.doubleCircleRipple(viewer, {
      //   radius: 200,
      //   center: {
      //     lng: 112.97637439500011,
      //     lat: 28.195263761000035
      //   },
      //   duration: 3000,
      //   gradient: 0,
      //   color: Cesium.Color.RED,
      //   count: 3,
      //   from: 3,
      //   to: 5
      // });

      // zgis3d.utils.EffectUtil.rain(viewer.getCesiumViewer());
      //zgis3d.utils.EffectUtil.snow(viewer.getCesiumViewer());
      //zgis3d.utils.EffectUtil.fog(viewer.getCesiumViewer());
      //  zgis3d.utils.EffectUtil.skyline(viewer.getCesiumViewer());

      // let entity = viewer.getCesiumViewer().entities.add({
      //   name: "动态立体墙",
      //   wall: {
      //     positions: Cesium.Cartesian3.fromDegreesArray([117.154815, 31.853495, 117.181255, 31.854257, 117.182284, 31.848255, 117.184748, 31.840141, 117.180557, 31.835556, 117.180023, 31.833741, 117.166846, 31.833737, 117.155531, 31.833151, 117.154787, 31.835978, 117.151994, 31.839036, 117.150691, 31.8416, 117.151215, 31.844734, 117.154457, 31.848152, 117.154815, 31.853495]),
      //     maximumHeights: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600],
      //     minimumHeights: [43.9, 49.4, 38.7, 40, 54, 51, 66.7, 44.6, 41.2, 31.2, 50.1, 53.8, 46.9, 43.9],
      //     material: new Cesium.PolylineTrailLinkMaterialProperty({
      //       color: Cesium.Color.ORANGE,
      //       duration: 6000,
      //       flowImage: './img/colors5.png'
      //     })
      //   }
      // });
      // viewer.getCesiumViewer().zoomTo(entity);

      // console.log(data[2].boundingSphere);
      // map3dModule.iMap3D.lookAround(data[2].boundingSphere.center, {
      // position: {
      //   from: 3,
      //   to: 5
      // },
      //   distance: 3000
      // });

      // CommonUtil.flyToDestination(viewer.getCesiumViewer().scene,
      //   Cesium.Cartesian3.fromDegrees(112.87849778954987, 28.118542259200254, 10), {
      //     orientation: {
      //       pitch: -0.1
      //     },
      //     pitchAdjustHeight:100,
      //     height:10
      //   });
      // const bbox =[132.447, 46.3186, 135.0858, 53.5579]
      // const rect = window.Cesium.Rectangle.fromDegrees(bbox[0], bbox[1], bbox[2], bbox[3]);
      // //const boundingSphere = window.Cesium.BoundingSphere.fromRectangle3D(rect);
      // viewer.getCesiumViewer().camera.flyTo({
      //   destination:rect
      // });


      setTimeout(() => {

        // 修改行政边界
        // data[data.length - 1].refresh({
        //   urlParams: {
        //     cql_filter: "dcode='430200'",
        //   },
        // }).then((ds) => {
        //   console.log(ds);
        //   ds.flyTo(map3dModule.context.viewer.getCesiumViewer());
        // });
        // data[data.length - 1].flyTo(map3dModule.context.viewer.getCesiumViewer());

        // // 移除数据源
        // viewer.getDataSourceManager().removeDataSources({
        //     id: 'zdjcyq',
        //     type: zgis3d.datasources.DataSourceTypeEnum.DS_3DTILESET,
        // });

      }, 10000);

      // let echartsData = getEchartsData('GLMap');

      // echartsData.forEach((option) => {
      //     new zgis3d.layers.echarts.EchartsLayer(map3dModule.context.viewer.getCesiumViewer().scene, {
      //         eOptions: option
      //     });
      // });
}

/**
 * 添加GIS平台数据
 * @param {*} map3dModule 
 */
function loadGisPlatformInterface(map3dModule) {
  //const lyrDs= map3dModule.iMap3D.loadZdGISScene('http://10.88.89.76:9800/gis-map/ZdMapService/zdgis/','1471013004503314434',{key:'38fe15751d9542bfae6ac20af3ddaba8'});
  //const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://192.168.10.78:9080/api/gis-map/ZdMapService/zdgis/','1481099076324065282',{key:'6a7f67c07c9e48c28b3b56df299405df'});
  // WFS 线
  // const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://10.88.91.64:9800/gis-map/ZdMapService/zdgis/','1497020637369679874',{key:'6a7f67c07c9e48c28b3b56df299405df'}); 
  // WFS 面
  // const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://10.88.91.64:9800/gis-map/ZdMapService/zdgis/','1480817083088998402',{key:'6a7f67c07c9e48c28b3b56df299405df'}); 
  // lyrDs.then(ds=> console.log(ds,'lyrDs') )
  //const lyrDs= map3dModule.iMap3D.loadZdGISScene('http://10.88.89.76:9800/gis-map/ZdMapService/zdgis/','1471013004503314434',{key:'38fe15751d9542bfae6ac20af3ddaba8'});
  //const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://10.88.89.76:9800/gis-map/ZdMapService/zdgis/','1461496945500037122',{key:'38fe15751d9542bfae6ac20af3ddaba8'});
  // WFS 线
  //const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://10.88.91.64:9800/gis-map/ZdMapService/zdgis/','1479743191624773633',{key:'6a7f67c07c9e48c28b3b56df299405df'}); 
  // WFS 面
  //const lyrDs= map3dModule.iMap3D.loadZdGISLayer('http://10.88.91.64:9800/gis-map/ZdMapService/zdgis/','1479743191624773633',{key:'6a7f67c07c9e48c28b3b56df299405df'}); 
  // lyrDs.then(ds=> {
  //   console.log(ds,'lyrDs')
  //   map3dModule.context.viewer.getDataSourceManager().addEvent.addEventListener((data, dataSource) => {
  //     const llll = map3dModule.context.viewer.getDataSourceManager().getDataSource({ type:ds.type, id:ds.id })
  //     const g32 = dataSource
  //     console.log(1111,g32);
  //   })
  // })
}

/**
 * 支持文件拖拽到地图
 * @param {*} map3dModule 
 */
function fileDrag(map3dModule) {
  /**
    * 页面禁用拖拽上传时 浏览器默认打开图片
    */
  document.addEventListener('drop', function (e) {
    e.preventDefault()
  }, false)
  document.addEventListener('dragover', function (e) {
    e.preventDefault()
  }, false)

  // document.getElementById('body').addEventListener('drageoverHandler', function (e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   e.dataTransfer.dropEffect = "none"
  // }, false)
  // 浏览器支持文件拖拽
  var dropzone = document.getElementById('root3d');
  var support = ('draggable' in dropzone) || ('ondrapstart' in dropzone && 'ondrop' in dropzone);
  if(support){
    const dropEventHandle = function(e) {
      var length = e.dataTransfer.items.length;
      for (var i = 0; i < length; i++) {
        var entry = e.dataTransfer.items[i].webkitGetAsEntry();
        const file = e.dataTransfer.items[i].getAsFile();
        if (entry && entry.isFile) {

          // 地图中心点
          var rectangle = map3dModule.context.getViewer().getCesiumViewer().camera.computeViewRectangle();
          var west =rectangle.west / Math.PI * 180;
          var north = rectangle.north / Math.PI * 180;
          var east = rectangle.east / Math.PI * 180;
          var south = rectangle.south / Math.PI * 180;
          var centerx=(west+east)/2;
          var cnetery=(north+south)/2;

          // 调整摄像机视角 - 俯视 -- 切换到二维模式 TODO
          const camera = map3dModule.context.getViewer().getCesiumViewer().camera
          //世界坐标转换为经纬度
          var ellipsoid=map3dModule.context.getViewer().getCesiumViewer().scene.globe.ellipsoid;
          var cartographic=ellipsoid.cartesianToCartographic(camera.position);
          var lat=Cesium.Math.toDegrees(cartographic.latitude);
          var lng=Cesium.Math.toDegrees(cartographic.longitude);
          var alt=cartographic.height;
          map3dModule.context.getViewer().getCesiumViewer().scene.camera.setView({
            destination : Cesium.Cartesian3.fromDegrees(centerx,cnetery,alt),
            orientation : {
              heading : 0,
              pitch : -90, // TODO  视角有问题
              roll : 0,
            }
          });

          console.log('isFile',entry);
          const url = URL.createObjectURL(file);
          console.log('url',url);

          const picDataRes = zgis3d.models.ZDataSourceModel.getDynamicImageryModel(
              'temp_file', {
                  type: 'FeatureCollection',
                  features: [{
                      geometry: {
                          type: 'Polygon',
                          coordinates: [
                              [
                                  // [74.02, -59.63],  // 卫星云图
                                  // [154.1, -59.63],  // 卫星云图
                                  // [-154.1, 59.63],  // 卫星云图
                                  // [74.02, 59.63],   // 卫星云图
                                  // [74.02, -59.63]   // 卫星云图
                                  // [112.878423, 28.1185186, 46.55],
                                  // [112.878423, 28.1185186, 26.55],
                                  // [112.87829318, 28.11830767, 26.55],
                                  // [112.87829318, 28.11830767, 46.55],
                                  // [112.878423, 28.1185186, 46.55]
                                  [112.3778423, 27.5985186, 46.55],
                                  [113.92978423, 27.5985186, 26.55],
                                  [113.92978423, 28.57830767, 26.55],
                                  [112.3778423, 28.57830767, 46.55],
                                  [112.3778423, 27.5985186, 46.55]
                              ]
                          ]

                      }
                  }]
              }, {
                  images: [
                      // 'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120730.png',
                      // 'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120800.png',
                      // 'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120930.png',
                      // 'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904121130.png'
                      url
                  ],
                  cloudHeight: 10000
              },
              true, false, '位图', '位图',
          ).toJSON()
          // map3dModule.context.getViewer().addDataSources(picDataRes)

          // 添加到DIV
          var gisRootDiv=document.getElementById("root3d");
          var div=document.createElement("div");
          div.id = "imageFile"
          div.setAttribute("focused",false)
          const height = document.body.clientHeight
          const width = document.body.clientWidth
          console.log('heigth,width',height,width);
          const top = height / 4
          const left = width / 4
          div.style.cssText = 'position:absolute;width:50%;height:50%;top:' + top + 'px;left:' + left + 'px;'
          div.innerHTML = "<img src='" + url + "' style='width: 100%;height:100%;object-fit: cover;'></img>";
          gisRootDiv.appendChild(div);

          // div.addEventListener('drop', function (e) {
          //   e.preventDefault()
          // }, false)
          // div.addEventListener('dragover', function (e) {
          //   e.preventDefault()
          // }, false)
          // document.getElementById("imageFile").addEventListener("mousemove",(event) => {
          //   //if the left button was not pressed,return
          //   if(window.event.button!= 1)
          //   {
          //     return 0;
          //   }
          //   document.getElementById("imageFile").style.top = window.event.y-118/2-document.all.imageFile.offsetTop
          //   document.getElementById("imageFile").style.left = window.event.x-236/2-document.all.imageFile.offsetLeft
            
          //   // window.event.returnValue=false;
          // })
          // 图片移动效果
          document.getElementById("imageFile").onmousedown = function (ev) {
            let oEvent = ev;
            // 浏览器有一些图片的默认事件,这里要阻止
            oEvent.preventDefault();
            let disX = oEvent.clientX - document.getElementById("imageFile").offsetLeft;
            let disY = oEvent.clientY - document.getElementById("imageFile").offsetTop;
            gisRootDiv.onmousemove = function (ev) {
              oEvent = ev;
              oEvent.preventDefault();
              let x = oEvent.clientX - disX;
              let y = oEvent.clientY - disY;
      
              // 图形移动的边界判断
              x = x <= 0 ? 0 : x;
              x = x >= gisRootDiv.offsetWidth - document.getElementById("imageFile").offsetWidth ? gisRootDiv.offsetWidth - document.getElementById("imageFile").offsetWidth : x;
              y = y <= 0 ? 0 : y;
              y = y >= gisRootDiv.offsetHeight - document.getElementById("imageFile").offsetHeight ? gisRootDiv.offsetHeight - document.getElementById("imageFile").offsetHeight : y;
              document.getElementById("imageFile").style.left = x + 'px';
              document.getElementById("imageFile").style.top = y + 'px';
            }
      
            // 图形移出父盒子取消移动事件,防止移动过快触发鼠标移出事件,导致鼠标弹起事件失效
            gisRootDiv.onmouseleave = function () {
              gisRootDiv.onmousemove = null;
              gisRootDiv.onmouseup = null;
            }
      
            // 鼠标弹起后停止移动
            gisRootDiv.onmouseup = function () {
              gisRootDiv.onmousemove = null;
              gisRootDiv.onmouseup = null;
            }
          }
          document.getElementById("imageFile").addEventListener("click",(event) => {

            document.getElementById("imageFile").style.cursor = "move"
            if(document.getElementById("imageFile").getAttribute("focused") === "false"){
              document.getElementById("imageFile").style.cssText += "border:2px solid green;"
              // 绘制四个角点
              var lbdiv = document.createElement("div");
              const lbdivTop = document.getElementById('imageFile').offsetHeight - 5;
              const lbdivLeft = - 5 - 2; // 角点宽/ 2 + image box border 
              lbdiv.style.cssText = "position:absolute;width:10px;height:10px;background-color:green;top:" + lbdivTop + "px;left:" + lbdivLeft + "px;"
              document.getElementById("imageFile").appendChild(lbdiv)

              var ltdiv = document.createElement("div");
              const ltdivTop = -5;
              const ltdivleft = -5 - 2; // 角点宽/ 2 + image box border 
              ltdiv.style.cssText = "position:absolute;width:10px;height:10px;background-color:green;top:" + ltdivTop + "px;left:" + ltdivTop + "px;"
              document.getElementById("imageFile").appendChild(ltdiv)
              
              var rbdiv = document.createElement("div");
              const rbdivTop = document.getElementById('imageFile').offsetHeight - 5;
              const rbdivLeft = document.getElementById('imageFile').offsetWidth - 5 - 2; // 角点宽/ 2 + image box border 
              rbdiv.style.cssText = "position:absolute;width:10px;height:10px;background-color:green;top:" + rbdivTop + "px;left:" + rbdivLeft + "px;"
              document.getElementById("imageFile").appendChild(rbdiv)
              
              var rtdiv = document.createElement("div");
              const rtdivTop = - 5;
              const rtdivLeft = document.getElementById('imageFile').offsetWidth - 5 - 2; // 角点宽/ 2 + image box border 
              rtdiv.style.cssText = "position:absolute;width:10px;height:10px;background-color:green;top:" + rtdivTop + "px;left:" + rtdivLeft + "px;"
              document.getElementById("imageFile").appendChild(rtdiv)
              
              lbdiv.addEventListener('mouseover',()=>{lbdiv.style.cursor = "sw-resize"})
              ltdiv.addEventListener('mouseover',()=>{ltdiv.style.cursor = "nw-resize"})
              rbdiv.addEventListener('mouseover',()=>{rbdiv.style.cursor = "se-resize"})
              rtdiv.addEventListener('mouseover',()=>{rtdiv.style.cursor = "ne-resize"})

              //工具栏
              var toolbarDiv = document.createElement("div");
              toolbarDiv.id = "imageFileToolbar"
              toolbarDiv.style.cssText = 'background-color:white;position:relative;width:100%;height:50px;top:0;left:0;text-align:right;line-height:50px;'
              toolbarDiv.innerHTML = "<span>图片范围</span><input id='imageRect' style='width:400px;' /><button id='btnQuit'>退出</button><button id='btnComputeRect'>确定</button>"
              document.getElementById("imageFile").appendChild(toolbarDiv)

              const computeRect = function(top,left,width,height) {
                const topleftPoint = new Cesium.Cartesian2(left,top)
                let pick = map3dModule.context.getViewer().getCesiumViewer().scene.camera.pickEllipsoid(topleftPoint);
                // 转经纬度坐标
                let cartographic = Cesium.Cartographic.fromCartesian(pick);
                let x = Cesium.Math.toDegrees(cartographic.longitude);
                let y = Cesium.Math.toDegrees(cartographic.latitude);

                const bottomleftPoint = new Cesium.Cartesian2(left,top + document.getElementById("imageFile").clientHeight)
                let blcartographic = Cesium.Cartographic.fromCartesian(map3dModule.context.getViewer().getCesiumViewer().scene.camera.pickEllipsoid(bottomleftPoint));

                const toprightPoint = new Cesium.Cartesian2(left + document.getElementById("imageFile").clientWidth,top)
                let trcartographic = Cesium.Cartographic.fromCartesian(map3dModule.context.getViewer().getCesiumViewer().scene.camera.pickEllipsoid(toprightPoint));
                
                const bottomrightPoint = new Cesium.Cartesian2(left + document.getElementById("imageFile").clientWidth,top + document.getElementById("imageFile").clientHeight)
                let brcartographic = Cesium.Cartographic.fromCartesian(map3dModule.context.getViewer().getCesiumViewer().scene.camera.pickEllipsoid(bottomrightPoint));

                return x + ' ' + y + "," + Cesium.Math.toDegrees(blcartographic.longitude) + " " + Cesium.Math.toDegrees(blcartographic.longitude) + 
                "," + Cesium.Math.toDegrees(trcartographic.longitude) + " " + Cesium.Math.toDegrees(trcartographic.longitude) + 
                "," + Cesium.Math.toDegrees(brcartographic.longitude) + " " + Cesium.Math.toDegrees(brcartographic.longitude);
              }
              // 计算当前范围
              const mapRect = computeRect(document.getElementById("imageFile").offsetTop,document.getElementById("imageFile").offsetLeft,document.getElementById("imageFile").width,document.getElementById("imageFile").height);
              document.getElementById("imageRect").value = mapRect
              document.getElementById("btnComputeRect").addEventListener("click",() => {
                // 计算当前范围
                const mapRect = computeRect(document.getElementById("imageFile").offsetTop,document.getElementById("imageFile").offsetLeft,document.getElementById("imageFile").width,document.getElementById("imageFile").height);
                document.getElementById("imageRect").value = mapRect
              })
              document.getElementById("btnQuit").addEventListener("click",() => {
                document.getElementById("imageFile").remove()
                gisRootDiv.addEventListener("drop",dropEventHandle)
              })

              // 图片缩放效果
              rbdiv.onmousedown = function (e) {
                // 阻止冒泡,避免缩放时触发移动事件
                e.stopPropagation();
                e.preventDefault();
                let pos = {
                  'w': document.getElementById('imageFile').offsetWidth,
                  'h': document.getElementById('imageFile').offsetHeight,
                  'x': e.clientX,
                  'y': e.clientY
                };
                gisRootDiv.onmousemove = function (ev) {
                  ev.preventDefault();
                  // 设置图片的最小缩放为30*30
                  let w = Math.max(30, ev.clientX - pos.x + pos.w)
                  let h = Math.max(30, ev.clientY - pos.y + pos.h)
          
                  // 设置图片的最大宽高
                  w = w >= gisRootDiv.offsetWidth - document.getElementById('imageFile').offsetLeft ? gisRootDiv.offsetWidth - document.getElementById('imageFile').offsetLeft : w
                  h = h >= gisRootDiv.offsetHeight - document.getElementById('imageFile').offsetTop ? gisRootDiv.offsetHeight - document.getElementById('imageFile').offsetTop : h
                  document.getElementById('imageFile').style.width = w + 'px';
                  document.getElementById('imageFile').style.height = h + 'px';
                }
                gisRootDiv.onmouseleave = function () {
                  gisRootDiv.onmousemove = null;
                  gisRootDiv.onmouseup = null;
                }
                gisRootDiv.onmouseup = function () {
                  gisRootDiv.onmousemove = null;
                  gisRootDiv.onmouseup = null;
                }
              }
            }
            document.getElementById("imageFile").setAttribute("focused",true)
          })
          dropzone.removeEventListener("drop",dropEventHandle)
        } else if (entry && entry.isDirectory) {
          console.log('isDirectory');
        } else if(entry == null && file) { // 网页上的图片？？？
          console.log('...');
        }
      }
    };

    dropzone.addEventListener("drop",dropEventHandle)
  } else {
    console.log('不支持文件拖拽');
  }
}

/**
 * 添加模型（entity）
 * @param {Map3D} _map3dModule 
 * @param {string} uri 
 */
function addModel(_map3dModule, uri, id) {

  modelLoaedComplated(_map3dModule)

  let origin = Cesium.Cartesian3.fromDegrees(118.17445534, 39.74126898, 0); // 唐山
  let origintem = Cesium.Cartesian3.fromDegrees(169.17645534, 39.74126898, 0); // 唐山
  let entity = _map3dModule.context.getViewer().getCesiumViewer().entities.add({
    id: id,
    position: origin,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      origin,
      new Cesium.HeadingPitchRoll(0.03, 0, 0)
    ),
    model: {
      uri: uri,
    },
  });
  // console.log('_map3dModule_map3dModule_map3dModule：',_map3dModule.context.getViewer().getCesiumViewer().camera)
  // 加载三维模型后定位到模型
  _map3dModule.context.getViewer().getCesiumViewer().camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(118.1765704, 39.73974898, 50),
    orientation: {
      heading: -0.8,
      pitch: 0.0522350017940196,
      roll: -0.01,
    },
  });
  // _map3dModule.context.getViewer().getCesiumViewer().trackedEntity = entity;

}

/**
 * 三维模型加载完成后 添加坐标轴
 * @param {Map3D} _map3dModule 
 */
function modelLoaedComplated(_map3dModule) {
  // 监听Viewer.entities.collectioniChanged 事件
  _map3dModule.context.getViewer().getCesiumViewer().entities.collectionChanged.addEventListener( evt => {
    // 定位
    let position = evt._entities.values[0].position.getValue(Cesium.JulianDate.now());
    const options = {
      destination:position,
      orientation: {
        // heading : Cesium.Math.toRadians(175.0),
        pitch : Cesium.Math.toRadians(-60.0)
      },
      // pitchAdjustHeight:1000,
      height:1000000,
      complete: initAxis(_map3dModule)    // 飞行完成后回调
    }
   // _map3dModule.context.getViewer().getCesiumViewer().camera.flyTo(options);
  })
}

/**
 * 点击模型后添加坐标系
 * @param {Map3D} _map3dModule 
 * @returns 
 */
function initAxis(_map3dModule) {
  // TODO 调试
  const isEdit = true
  // 判断是否开启编辑模式
  if(!isEdit)return;

  let handler = new Cesium.ScreenSpaceEventHandler(_map3dModule.context.getViewer().getCesiumViewer().canvas);
  let pickedObject = null
  let leftDownFlag = false

  const handlerMouseClick = function (evt) {
    let cartesian = _map3dModule.context.getViewer().getCesiumViewer().scene.pickPosition(evt.position);
    // if (Cesium.defined(cartesian)) {
    //     let headingPitchRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0));
    //     let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
    // }
    pickedObject = _map3dModule.context.getViewer().getCesiumViewer().scene.pick(evt.position); 
    if (pickedObject instanceof Cesium.Cesium3DTileFeature) {

    }
    //判断是否拾取到模型
    if ( pickedObject ){

      // let m = pickedObject.primitive.modelMatrix;// 带旋转模型的矩阵
      // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(0)); // rtaleX表示水平方向旋转的度数
      // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(m, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
      // pickedObject.primitive.modelMatrix = newMatrix4

      // ============================================   privite  ====================================
      // //pickedObject.primitive.color = new Cesium.Color(0, 1.0, 0, 0.5); //选中模型后高亮  
      // const material = Cesium.Material.fromType('Color');
      // material.uniforms.color = new Cesium.Color(1.0, 0.0, 0.0, 1.0);
      
      // pickedObject.primitive.appearance = new Cesium.MaterialAppearance({
      //   material : material,
      //   faceForward : true
      // });
      
      // pickedObject.primitive.appearance.material = material
      // // pickedObject.primitive.appearance.material.uniforms.color = new Cesium.Color(0, 1.0, 0, 0.5);
      // // 在模型比较小或者模型颜色比较深的时候，高亮效果不明显
      // // 可以设置模型的colorBlendMode为replace模式，这样就将模型都替换成颜色了
      
      // pickedObject.primitive.colorBlendMode = Cesium.ColorBlendMode.REPLACE;
      // // 可以在模型周边设置轮廓线
      // // entity.model.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);
      // pickedObject.primitive.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);
      // pickedObject.primitive.silhouetteSize = 3.0;

      // ===============================================  entity 高亮 ==========================================
      // // pickedObject.model.colorBlendMode = Cesium.ColorBlendMode.REPLACE;
      // pickedObject.id.model.color = new Cesium.Color(0.0, 1, 1, 1.0);
      // pickedObject.id.model.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);

      // 添加坐标轴
      // addAxis(_map3dModule, pickedObject.primitive)// evt._entities.values[0]
      addAxis(_map3dModule, pickedObject)

      // 鼠标事件
      // handler.setInputAction(function (movement) {
      //   pickedObject = _map3dModule.context.getViewer().getCesiumViewer().scene.pick(movement.position);
      //   console.log('down', pickedObject);
      //   if(Cesium.defined(pickedObject)){
      //       if (pickedObject.primitive.isCesium3DTileset == undefined ){
      //           leftDownFlag = true;
      //           document.body.style.cursor = 'pointer';
      //           _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = false;//锁定相机
      //           pickedObject.primitive.color = new Cesium.Color(0, 1, 0, 1); //选中模型后高亮
      //           pickedObject.primitive.silhouetteSize = 3.0;//选中模型后高亮
      //       }
      //   }
      // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      
      // handler.setInputAction(function () {
      //   console.log('up', pickedObject);
      //   pickedObject.primitive.color = new Cesium.Color(1, 1, 1, 1);
      //   pickedObject.primitive.silhouetteSize = 0;
      //   leftDownFlag = false;
      //   pickedObject = null;
      //   _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = true;//解除锁定相机
      //   handler.destroy();//销毁左键监听事件
      //   document.body.style.cursor = 'default';
      // }, Cesium.ScreenSpaceEventType.LEFT_UP);
  
      // handler.setInputAction((movement) => {
      //     if ( leftDownFlag && pickedObject.primitive.modelMatrix ) {
      //         // ************g关键代码：cartesian的值************
      //         let ray = _map3dModule.context.getViewer().getCesiumViewer().camera.getPickRay(movement.endPosition);
      //         let cartesian = _map3dModule.context.getViewer().getCesiumViewer().scene.globe.pick(ray, _map3dModule.context.getViewer().getCesiumViewer().scene);
      //         let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0),0,0);
      //         let m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
      //         pickedObject.primitive.modelMatrix = m;
  
      //     }
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
  }
  const handleMouseMove = function(evt) {
    let cartesian = _map3dModule.context.getViewer().getCesiumViewer().scene.pickPosition(evt.endPosition);
    // if (Cesium.defined(cartesian)) {
    //     let headingPitchRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0));
    //     let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
    // }
    pickedObject = _map3dModule.context.getViewer().getCesiumViewer().scene.pick(evt.endPosition); 
    if (pickedObject instanceof Cesium.Cesium3DTileFeature) {

    }
    //判断是否拾取到模型
    if ( pickedObject ){

      // let m = pickedObject.primitive.modelMatrix;// 带旋转模型的矩阵
      // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90)); // rtaleX表示水平方向旋转的度数
      // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(m, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
      // pickedObject.primitive.modelMatrix = newMatrix4

      // ============================================   privite  ====================================
      // //pickedObject.primitive.color = new Cesium.Color(0, 1.0, 0, 0.5); //选中模型后高亮  
      // const material = Cesium.Material.fromType('Color');
      // material.uniforms.color = new Cesium.Color(1.0, 0.0, 0.0, 1.0);
      
      // pickedObject.primitive.appearance = new Cesium.MaterialAppearance({
      //   material : material,
      //   faceForward : true
      // });
      
      // pickedObject.primitive.appearance.material = material
      // // pickedObject.primitive.appearance.material.uniforms.color = new Cesium.Color(0, 1.0, 0, 0.5);
      // // 在模型比较小或者模型颜色比较深的时候，高亮效果不明显
      // // 可以设置模型的colorBlendMode为replace模式，这样就将模型都替换成颜色了
      
      // pickedObject.primitive.colorBlendMode = Cesium.ColorBlendMode.REPLACE;
      // // 可以在模型周边设置轮廓线
      // // entity.model.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);
      // pickedObject.primitive.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);
      // pickedObject.primitive.silhouetteSize = 3.0;

      // ===============================================  entity 高亮 ==========================================
      // pickedObject.model.colorBlendMode = Cesium.ColorBlendMode.REPLACE;
      pickedObject.id.model.color = new Cesium.Color(0.0, 1, 1, 1.0);
      pickedObject.id.model.silhouetteColor = new Cesium.Color(1.0, 0, 0, 1.0);

      // 添加坐标轴
      addAxis(_map3dModule, pickedObject.primitive)// evt._entities.values[0]

      // 鼠标事件
      // handler.setInputAction(function (movement) {
      //   pickedObject = _map3dModule.context.getViewer().getCesiumViewer().scene.pick(movement.position);
      //   console.log('down', pickedObject);
      //   if(Cesium.defined(pickedObject)){
      //       if (pickedObject.primitive.isCesium3DTileset == undefined ){
      //           leftDownFlag = true;
      //           document.body.style.cursor = 'pointer';
      //           _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = false;//锁定相机
      //           pickedObject.primitive.color = new Cesium.Color(0, 1, 0, 1); //选中模型后高亮
      //           pickedObject.primitive.silhouetteSize = 3.0;//选中模型后高亮
      //       }
      //   }
      // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      
      // handler.setInputAction(function () {
      //   console.log('up', pickedObject);
      //   pickedObject.primitive.color = new Cesium.Color(1, 1, 1, 1);
      //   pickedObject.primitive.silhouetteSize = 0;
      //   leftDownFlag = false;
      //   pickedObject = null;
      //   _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = true;//解除锁定相机
      //   handler.destroy();//销毁左键监听事件
      //   document.body.style.cursor = 'default';
      // }, Cesium.ScreenSpaceEventType.LEFT_UP);
  
      // handler.setInputAction((movement) => {
      //     if ( leftDownFlag && pickedObject.primitive.modelMatrix ) {
      //         // ************g关键代码：cartesian的值************
      //         let ray = _map3dModule.context.getViewer().getCesiumViewer().camera.getPickRay(movement.endPosition);
      //         let cartesian = _map3dModule.context.getViewer().getCesiumViewer().scene.globe.pick(ray, _map3dModule.context.getViewer().getCesiumViewer().scene);
      //         let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0),0,0);
      //         let m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
      //         pickedObject.primitive.modelMatrix = m;
  
      //     }
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
  }
  // 点击事件
  handler.setInputAction(handlerMouseClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // handler.setInputAction(handleMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/**
 * 以primitive中心点，添加坐标轴
 * @param {Map3D} _map3dModule 地图对象
 * @param {Object} pickedObject 拾取到的实体对象
 */
function addAxis(_map3dModule, pickedObject) {
  
  // 参考：https://www.icode9.com/content-4-804134.html
  // https://blog.csdn.net/xietao20/article/details/116721963
  // https://blog.csdn.net/xtfge0915/article/details/105277427/
  // https://blog.csdn.net/caozl1132/article/details/111549414

  // entity.readyPromise.then(m => {
    // const center1 = Cesium.Matrix4.getTranslation(
    //     m.modelMatrix,
    //     new Cesium.Cartesian3()
    // );
    // const center1 = evt._entities.values[0].position
    // let position = pickedObject.boundingSphere.center; //.getValue(Cesium.JulianDate.now());//求出当前事件entity的位置

    // let transform = evt._entities.values[0]._root.transform;//从对象得到位置矩阵
    
    const boundingShpere = pickedObject.primitive.boundingSphere;
    let position = pickedObject.id.position.getValue();// boundingShpere.center
    const radius = boundingShpere.radius

    let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);//东-北-上参考系构造出4*4的矩阵

    // 向上的向量
    const vectorNormalUp = new Cesium.Cartesian3()
    const vZ = new Cesium.Cartesian3(0, 0, 1)
    Cesium.Cartesian3.normalize(position.clone(), vectorNormalUp)

    // 向右的向量
    const vectorNormalRight = new Cesium.Cartesian3()
    // 由z轴向上 地表向上两个向量叉乘, 则可以得出, 向右的向量
    Cesium.Cartesian3.cross(vZ, vectorNormalUp, vectorNormalRight)

    // 向前的向量
    const vectorNormalFront = new Cesium.Cartesian3()
    Cesium.Cartesian3.cross(vectorNormalRight, vectorNormalUp, vectorNormalFront)
    Cesium.Cartesian3.multiplyByScalar(vectorNormalFront, -1, vectorNormalFront)
    
    const axisX = new ArrowPolyline({
        id: "axisX",
        color: Cesium.Color.GREEN,
        position: position,
        width: 10,
        headWidth: 3,
        length: radius * 2 + 50,
        headLength: 3
    });
    const axisY = new ArrowPolyline({
        id: "axisY",
        color: Cesium.Color.BLUE,
        position: position,
        width: 10,
        headWidth: 3,
        length: radius * 2 + 50,
        headLength: 3
    });
    const axisZ = new ArrowPolyline({
      id: "axisZ",
      color: Cesium.Color.RED,
      position: position,
      width: 10,
      headWidth: 3,
      length: radius * 2 + 50,
      headLength: 3
    });

    axisX.direction = vectorNormalRight
    axisX.unit = Cesium.Cartesian3.UNIT_X

    axisY.direction = vectorNormalFront
    axisY.unit = Cesium.Cartesian3.UNIT_Y

    
    axisZ.direction = vectorNormalUp
    axisZ.unit = Cesium.Cartesian3.UNIT_Z




    /** Z轴绕Y轴逆时针旋转90度到到X轴，Z轴绕X轴旋转逆时针旋转90度得到Y轴 */

    // x轴
    const mx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90));
    const rotationX = Cesium.Matrix4.fromRotationTranslation(mx); 
    // 矩阵相乘
    Cesium.Matrix4.multiply(
        axisX.geometryInstances[0].modelMatrix,
        rotationX,
        axisX.geometryInstances[0].modelMatrix
    );
    Cesium.Matrix4.multiply(
        axisX.geometryInstances[1].modelMatrix,
        rotationX,
        axisX.geometryInstances[1].modelMatrix
    );

    // y轴
    const my = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90));
    const rotationY = Cesium.Matrix4.fromRotationTranslation(my);
    Cesium.Matrix4.multiply(
        axisY.geometryInstances[0].modelMatrix,
        rotationY,
        axisY.geometryInstances[0].modelMatrix
    );
    Cesium.Matrix4.multiply(
        axisY.geometryInstances[1].modelMatrix,
        rotationY,
        axisY.geometryInstances[1].modelMatrix
    );
    
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisX)
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisY)
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisZ)

    // 坐标轴坐标圈
    const axisSpherePoints = [];
    for (let i = 0; i <= 360; i += 3) {
        const sin = Math.sin(Cesium.Math.toRadians(i));
        const cos = Math.cos(Cesium.Math.toRadians(i));
        const x = radius * cos;
        const y = radius * sin;
        axisSpherePoints.push(new Cesium.Cartesian3(x, y, 0));
    }
    // z轴 坐标圆
    const axisSphereZ = createAxisSphere(
        "axisSphereZ",
        axisSpherePoints,
        matrix,
        Cesium.Color.RED
    );
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisSphereZ);
    // y
    const axisSphereY = createAxisSphere(
        "axisSphereY",
        axisSpherePoints,
        matrix,
        Cesium.Color.BLUE
    );
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisSphereY);
    Cesium.Matrix4.multiply(
        axisSphereY.geometryInstances.modelMatrix,
        rotationY,
        axisSphereY.geometryInstances.modelMatrix
    );
    // x
    const axisSphereX = createAxisSphere(
        "axisSphereX",
        axisSpherePoints,
        matrix,
        Cesium.Color.GREEN
    );
    _map3dModule.context.getViewer().getCesiumViewer().scene.primitives.add(axisSphereX);
    Cesium.Matrix4.multiply(
        axisSphereX.geometryInstances.modelMatrix,
        rotationX,
        axisSphereX.geometryInstances.modelMatrix
    );

    axisSphereX.direction = vectorNormalRight
    axisSphereY.direction = vectorNormalFront
    axisSphereZ.direction = vectorNormalUp

    // 交互事件
    let leftDownFlag = false; // 左键是否按下
    let pickedAxis = null;  // 
    let handler = new Cesium.ScreenSpaceEventHandler( _map3dModule.context.getViewer().getCesiumViewer().canvas);
    handler.setInputAction(function (evt) {
      leftDownFlag = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
    handler.setInputAction(function (evt) {
      leftDownFlag = false
      _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = true
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
    // 点击事件
    handler.setInputAction(function (evt) {
      let cartesian = _map3dModule.context.getViewer().getCesiumViewer().scene.pickPosition(evt.endPosition);
      if (Cesium.defined(cartesian)) {
          let headingPitchRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0));
          let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
      }
      pickedAxis = _map3dModule.context.getViewer().getCesiumViewer().scene.pick(evt.endPosition); //判断是否拾取到模型
      if ( pickedAxis && leftDownFlag){

        _map3dModule.context.getViewer().getCesiumViewer().scene.screenSpaceCameraController.enableRotate = false
        const pickPoint = _map3dModule.context.getViewer().getCesiumViewer().scene.pickPosition(evt.endPosition)

        let id = pickedAxis.id._id ? pickedAxis.id._id : pickedAxis.id

        if(id.indexOf("axisX") > -1) { // x轴水平位移
          console.log("开始X轴方向水平位移");

          precessTranslation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          );
        } else if(id.indexOf("axisY") > -1) {
          console.log("开始Y轴方向水平位移");
          
          precessTranslation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          );
        } else if(id.indexOf("axisZ") > -1) {
          console.log("开始Z轴方向垂直位移");

          precessTranslation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          );
        } else if(id.indexOf("axisSphereX") > -1) {
          console.log("开始绕X轴旋转");
          // let m = pickedAxis.primitive.modelMatrix;// 带旋转模型的矩阵
          // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rtaleX)); // rtaleX表示水平方向旋转的度数
          // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(m, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
          // // pickedAxis.primitive.modelMatrix = newMatrix4
          // pickedObject.primitive.modelMatrix = newMatrix4
          
          precessRotation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          )

        } else if(id.indexOf("axisSphereY") > -1) {
          console.log("开始Y轴旋转");
          
          precessRotation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          )
        } else if(id.indexOf("axisSphereZ") > -1) {
          console.log("开始Z轴旋转");
          
          precessRotation(evt,pickedAxis,pickPoint,_map3dModule.context.getViewer().getCesiumViewer(),
          axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject
          )
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // pickedObject.id.position.setValue(Cesium.Cartesian3.fromDegrees(118.1737,39.7407,0.04));
}

/**
 * 平移
 * @param {*} e 鼠标事件
 * @param {*} axis 
 * @param {*} pickPoint 
 * @param {*} viewer 地图视图对象
 * @param {*} axisX X轴
 * @param {*} axisY Y轴
 * @param {*} axisZ Z轴
 * @param {*} axisSphereX 
 * @param {*} axisSphereY 
 * @param {*} axisSphereZ 
 * @param {*} position 
 * @param {*} pickedObject 
 */
function precessTranslation(e,axis,pickPoint,viewer,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject) {
  const pickRay = new Cesium.Ray() // 从摄像头发出与视窗上一点相交的射线
  viewer.camera.getPickRay(e.startPosition, pickRay)
  const startPosition = rayPlaneIntersection(pickRay, viewer.camera.direction, pickPoint)
  viewer.camera.getPickRay(e.endPosition, pickRay)
  const endPosition = rayPlaneIntersection(pickRay, viewer.camera.direction, pickPoint)
  const moveVector = new Cesium.Cartesian3()
  Cesium.Cartesian3.subtract(endPosition, startPosition, moveVector)
  const moveLength = Cesium.Cartesian3.dot(axis.primitive.direction, moveVector)
  translation(moveVector, axis.primitive.unit, moveLength,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject)
}

function precessRotation(e,axis,pickPoint,viewer,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject) {
  let cartesian3 = viewer.scene.pickPosition(e.startPosition)
  Cesium.Cartesian3.subtract(cartesian3, position, cartesian3)
  const vtStart = projectOnPlane(cartesian3, axis.primitive.direction)

  cartesian3 = viewer.scene.pickPosition(e.endPosition)
  Cesium.Cartesian3.subtract(cartesian3, position, cartesian3)
  const vtEnd = projectOnPlane(cartesian3, axis.primitive.direction)

  const cartesian = Cesium.Cartesian3.cross(vtStart, vtEnd, new Cesium.Cartesian3())

  const angle = Cesium.Math.toDegrees(Cesium.Cartesian3.angleBetween(cartesian, axis.primitive.direction))
  // 利用叉乘性质判断方向
  let rotateAngleInRadians = Cesium.Cartesian3.angleBetween(vtEnd, vtStart)
  if (angle > 1) {
      rotateAngleInRadians = -rotateAngleInRadians
  }

  console.log('旋转角度', rotateAngleInRadians);


  let mx = null
  if (axis.id === 'axisSphereX') {
      mx = Cesium.Matrix3.fromRotationX(rotateAngleInRadians)
  } else if (axis.id === 'axisSphereY') {
      mx = Cesium.Matrix3.fromRotationY(rotateAngleInRadians)
  }else if (axis.id === 'axisSphereZ') {
      mx = Cesium.Matrix3.fromRotationZ(rotateAngleInRadians)
  }
  const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
  rotation(rotationX, axis, rotateAngleInRadians,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject)
}

/**
 * 平移
 * @param moveVector 移动向量
 * @param unit 单位
 * @param moveLength 移动距离
 * @Param xyz轴，xyz轴圈，中心点，模型
 */
function translation (moveVector, unit, moveLength,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject) {
  // axisX.translation(moveVector, unit, moveLength)
  // axisY.translation(moveVector, unit, moveLength)
  // axisZ.translation(moveVector, unit, moveLength)
  // axisSphereX.translation(moveVector, unit, moveLength)
  // axisSphereY.translation(moveVector, unit, moveLength)
  // axisSphereZ.translation(moveVector, unit, moveLength)
  Cesium.Matrix4.multiplyByTranslation(
    axisX.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisX.modelMatrix
  )
  Cesium.Matrix4.multiplyByTranslation(
    axisY.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisY.modelMatrix
  )
  Cesium.Matrix4.multiplyByTranslation(
    axisZ.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisZ.modelMatrix
  )
  Cesium.Matrix4.multiplyByTranslation(
    axisSphereX.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisSphereX.modelMatrix
  )
  Cesium.Matrix4.multiplyByTranslation(
    axisSphereY.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisSphereY.modelMatrix
  )
  Cesium.Matrix4.multiplyByTranslation(
    axisSphereZ.modelMatrix,
    Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
    axisSphereZ.modelMatrix
  )

  let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);//东-北-上参考系构造出4*4的矩阵
  Cesium.Matrix4.multiplyByTranslation(
    transform,
      Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
      transform
  )
  Cesium.Matrix4.getTranslation(transform, position)
  //pickedObject.id.position.setValue(position);//更新enity的位置

  pickedObject.id.position = position

  console.log(position,'position');
  console.log(pickedObject.id.orientation,'orientation')


  // Cesium.Matrix4.subtract(pickedObject.modelMatrix, matrix4, matrix4)
  // const cartesian3 = Cesium.Matrix4.getTranslation(matrix4, new Cesium.Cartesian3())
  // Cesium.Matrix4.multiplyByTranslation(
  //     this.auxiliaryBall.modelMatrix,
  //     cartesian3,
  //     this.auxiliaryBall.modelMatrix
  // )
}

/**
 * 旋转
 * @param {Cesium.Matrix4} rotationX 旋轉角度
 * @param axis{AxisSphere}
 * @param rotateAngleInRadians
 */
function rotation (rotationX, axis, rotateAngleInRadians,axisX,axisY,axisZ,axisSphereX,axisSphereY,axisSphereZ,position,pickedObject) {
  // this.axisSphereX.rotationAxis(rotationX)
  // this.axisSphereY.rotationAxis(rotationX)
  // this.axisSphereZ.rotationAxis(rotationX)
  // this.axisX.rotationAxis(rotationX)
  // this.axisY.rotationAxis(rotationX)
  // this.axisZ.rotationAxis(rotationX)
  Cesium.Matrix4.multiply(
    axisSphereX.modelMatrix,
    rotationX,
    axisSphereX.modelMatrix,
  )
  Cesium.Matrix4.multiply(
    axisSphereY.modelMatrix,
    rotationX,
    axisSphereY.modelMatrix,
  )
  Cesium.Matrix4.multiply(
    axisSphereZ.modelMatrix,
    rotationX,
    axisSphereZ.modelMatrix,
  )
  Cesium.Matrix4.multiply(
    axisX.modelMatrix,
    rotationX,
    axisX.modelMatrix,
  )
  Cesium.Matrix4.multiply(
    axisY.modelMatrix,
    rotationX,
    axisY.modelMatrix,
  )
  Cesium.Matrix4.multiply(
    axisZ.modelMatrix,
    rotationX,
    axisZ.modelMatrix,
  )
  // rotateVectorByAxisForAngle(axisX.direction, axis.primitive.direction, rotateAngleInRadians)
  // rotateVectorByAxisForAngle(axisY.direction, axis.primitive.direction, rotateAngleInRadians)
  // rotateVectorByAxisForAngle(axisZ.direction, axis.primitive.direction, rotateAngleInRadians)

  // let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);//东-北-上参考系构造出4*4的矩阵
  // Cesium.Matrix4.multiply(
  //   transform,
  //   rotationX,
  //   transform
  // )
  // let transform=Cesium.Matrix4.fromTranslationQuaternionRotationScale(position,orientation,new Cesium.Cartesian3(1,1,1),new Cesium.Matrix4());//得到entity的位置朝向矩阵
  // transform = Cesium.Matrix4.multiply(
  //     transform,
  //     rotationX,
  //     transform
  //   )
  // let q = new Cesium.Quaternion();
  // 为了兼容高版本的Cesium，因为新版cesium中getRotation被移除
  if (!Cesium.defined(Cesium.Matrix4.getRotation)) {
    Cesium.Matrix4.getRotation = Cesium.Matrix4.getMatrix3;
  }
  // // 旋转矩阵
  // // let m3 = Cesium.Matrix4.getRotation(transform,new Cesium.Matrix3());//得到3*3的旋转矩阵
  // let m3 = Cesium.Matrix4.getRotation(transform,new Cesium.Matrix3());//得到3*3的旋转矩阵
  // // 根据提供的Matrix3实例计算四元数
  // Cesium.Quaternion.fromRotationMatrix(m3, q);//将旋转矩阵转换成齐次坐标
  // // 计算旋转角(弧度)
  // var hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);
  // const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
  // pickedObject.id.orientation = orientation;//更新entity的朝向


  // var m1 = Cesium.Transforms.eastNorthUpToFixedFrame(
  //   Cesium.Matrix4.getTranslation(rotationX, new Cesium.Cartesian3()),
  //   Cesium.Ellipsoid.WGS84,
  //   new Cesium.Matrix4()
  // );
  // // 矩阵相除
  // var m3 = Cesium.Matrix4.multiply(
  //   Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()),
  //   rotationX,
  //   new Cesium.Matrix4()
  // );

    // 位置矩阵
    let orientation, position1 = pickedObject.id.position.getValue(Cesium.JulianDate.now());
    if (!pickedObject.id.orientation) {
      let heading = Cesium.Math.toRadians(0);
      let pitch = Cesium.Math.toRadians(0);
      let roll = Cesium.Math.toRadians(0);
      let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      orientation = Cesium.Transforms.headingPitchRollQuaternion(position1, hpr);
      pickedObject.id.orientation = orientation
    }
    orientation = pickedObject.id.orientation.getValue(Cesium.JulianDate.now())
    let transform = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      position1, // translation
      orientation, // rotation
      new Cesium.Cartesian3(1, 1, 1), // scale
      new Cesium.Matrix4());
    
    // 旋转后矩阵
    let transform2 = Cesium.Matrix4.multiply(transform, rotationX, new Cesium.Matrix4());
    // 设置旋转后的方向
    let quaternion = new Cesium.Quaternion();
    let m3 = Cesium.Matrix4.getRotation(transform2, new Cesium.Matrix3());//得到3*3的旋转矩阵
    Cesium.Quaternion.fromRotationMatrix(m3, quaternion);//将旋转矩阵转换成齐次坐标
    pickedObject.id.orientation.setValue(quaternion);//更新entity的朝向
  // // 得到旋转矩阵
  // var mat3 = Cesium.Matrix4.getMatrix3(m3, new Cesium.Matrix3());
  // // 计算四元数
  //  var q = Cesium.Quaternion.fromRotationMatrix(m3);
  // // // // 计算旋转角(弧度)
  // var hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);
  // console.log('hpr',hpr);
  // const orientation1 = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
  // pickedObject.id.orientation = orientation1;//更新entity的朝向


  // console.log('hpr',hpr,'rotateAngleInRaidians',rotateAngleInRadians,);
  // const number = Cesium.Math.toDegrees(rotateAngleInRadians)
  // // axis.updateAngle(number)

  // 当前模型 矩阵
  console.log('当前位置',pickedObject.id.position.getValue());
  // 计算旋转角(弧度)
  var hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
  console.log('当前欧拉角',hpr)
}

function rayPlaneIntersection(ray, cameraDirection, pickPoint) {
  if (!pickPoint) {
      throw new Error("cuowu")
  }
  const number = Cesium.Cartesian3.dot(cameraDirection, pickPoint);
  const number1 = Cesium.Cartesian3.dot(cameraDirection, ray.origin);
  const number2 = Cesium.Cartesian3.dot(cameraDirection, ray.direction);
  const t = (number - number1) / number2
  let result = new Cesium.Cartesian3()
  return Cesium.Cartesian3.add(ray.origin, Cesium.Cartesian3.multiplyByScalar(ray.direction, t, result), result)
}

function  projectOnPlane(vp, vn) {
  const vt = new Cesium.Cartesian3()
  const multi = new Cesium.Cartesian3()
  const divide = new Cesium.Cartesian3()
  const cartesian3 = Cesium.Cartesian3.multiplyByScalar(vn, Cesium.Cartesian3.dot(vp, vn), multi);
  Cesium.Cartesian3.divideByScalar(
      cartesian3,
      Cesium.Cartesian3.dot(vn, vn),
      divide
  )
  Cesium.Cartesian3.subtract(vp, divide, vt)
  return vt
}

/**
* 通过轴旋转角度
* @param vector
* @param axis
* @param angle
*/
function rotateVectorByAxisForAngle(vector, axis, angle){
   const rotateQuaternion = normalizingQuaternion(Cesium.Quaternion.fromAxisAngle(axis, angle, new Cesium.Quaternion()))
   const quaternion = cartesian3ToQuaternion(vector)
   Cesium.Quaternion.multiply(
       Cesium.Quaternion.multiply(
           rotateQuaternion,
           quaternion,
           quaternion
       ),
       Cesium.Quaternion.inverse(rotateQuaternion, new Cesium.Quaternion()),
       quaternion
   )
   vector.x = quaternion.x
   vector.y = quaternion.y
   vector.z = quaternion.z
   return quaternion
}

function cartesian3ToQuaternion(cartesian3) {
  return new Cesium.Quaternion(
      cartesian3.x,
      cartesian3.y,
      cartesian3.z,
      0
  )
}

/**
 * 四元数？？？  //归一化
 * @param {} quaternion 
 * @returns 
 */
function normalizingQuaternion(quaternion) {
  // Normalize( q ) = q/ |q| = q / (x*x + y*y + z*z + w*w)
  // 将四元数按比例除以提供的标量
  return Cesium.Quaternion.divideByScalar(
      quaternion,
      1, //moduloQuaternion(quaternion),
      quaternion
  )
}

function moduloQuaternion(quaternion) {

}

// 设置模型的方位
function setModelDirection( longitude, latitude, direction){
  var center = Cesium.Cartesian3.fromDegrees(longitude, latitude,0);
  var heading = Cesium.Math.toRadians(direction);
  var pitch = 0;
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(center, hpr);

  return orientation;
}

/**
 * 创建坐标轴（坐标圆）
 * @param {*} id 
 * @param {*} position 
 * @param {*} matrix 
 * @param {*} color 
 * @returns 
 */
function createAxisSphere(id, position, matrix, color) {
  const geometry = new Cesium.PolylineGeometry({
      positions: position,
      width: 10
  });
  const instnce = new Cesium.GeometryInstance({
      geometry: geometry,
      id: id,
      attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
  });
  return new Cesium.Primitive({
      geometryInstances: instnce,
      appearance: new Cesium.PolylineColorAppearance({
          translucent: false
      }),
      modelMatrix: matrix
  });
}

function addS3MLayer(viewer, options) {
  let layer = new zgis3d.layers.s3mtiles.S3MTilesLayer(options);

  viewer.scene.primitives.add(layer);

  layer.readyPromise.then(function (s3mlyr) {
    viewer.scene.camera.setView({
      destination: s3mlyr.rectangle,
      orientation: {
        heading: 5.213460518239332,
        pitch: -0.5150671720144846
      }
    });
  }).otherwise(function (error) {
    console.log(error);
  });
}


function onDistribute() {
  console.log('onDistribute...');
}

/********************************************************************** == 测试数据 == ******************************************************************* */

/**
 * 获取测试数据
 * @returns 
 */
function getTestData() {
  let datas = [];

  datas.push(    getTestData_geojson_nanyue_building()  );

    // getTestData_kml_zhogndaRange(),

    // getTestData_3dtiles_shihuachang(),

    // getTestData_3dtiles_zhongda(),

    // getTestData_3dtiles_huangcaishuiku(),

    // zgis3d.models.ZDataSourceModel.getWaterModel(
    //   'huangchaishuiku',
    //   './data/huangchaishuiku.geojson', {
    //     // perPositionHeight: true,
    //     // extrudedHeight: 388.5,
    //     // height: 4,
    //     crs: 1
    //   },
    //   false, false, '黄材水库动态水面', '宁乡黄材水库动态水面',
    // ).toJSON(),

    // getTestData_wms_china(),

    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //   'zdjcyq',
    //   'http://113.247.236.85:8180/gis/gisserver/model/wkk/chenzhou_ylg/tileset.json', {
    //     offset: {

    //     },

    //   },
    //   true, true, '郴州烟冷沟尾矿库'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getKmlModel(
    //   'xinhuaxian_wrch',
    //   // './data/xinghuaxian_hebing.kml', 
    //   './data/xinhuaxian_wrch.kml', 
    //   {
    //     offset: {

    //     },

    //   },
    //   true, true, '新化县水源保护区'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //   'hn_cs_main_building',
    //   './data/cs_main_bld_wgs84/tileset.json', {
    //     crs: 1,
    //   },
    //   true, true, '长沙市主城区建筑物白盒模型'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   "centerline",
    //   "./data/shihuacenterline.json", {
    //     crs: 1,
    //     primitive: 0,
    //     // materialType: Cesium.Material.PolylineGlowType,
    //     // flowImage: './img/colors2.png',
    //     stroke: Cesium.Color.fromCssColorString("#FFFF00").withAlpha(0.01),
    //     // strokeWidth: 10,

    //   },
    //   true,
    //   false,
    //   "管道中心线",
    //   "管道中心线"
    // ).toJSON(),



    // {
    //     type: '3dtileset',
    //     id: 'mdx_bridge',
    //     desc: '重庆磨刀溪大桥',
    //     label: '磨刀溪大桥',
    //     visible: false,
    //     flyto: false,
    //     url: 'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/mdx/tileset.json',
    //     options: {
    //         // mdxjm
    //         //   offset: {
    //         //     type: 1,
    //         //     x: 106.37336911,
    //         //     y: 29.38204889,
    //         //     z: 4,//210,
    //         // 	   roll:0.03
    //         // },
    //         // mdx
    //         offset: {
    //             type: 1,
    //             x: 106.37306911,
    //             y: 29.38204889,
    //             z: 70, //210,
    //             scale: {
    //                 scaleX: 3,
    //                 scaleY: 3,
    //                 scaleZ: 3,
    //             },
    //             heading: 140,
    //         },
    //         // mdx2
    //         //   offset: {
    //         //     type: 1,
    //         //     z: 14,
    //         // },
    //     }
    // },
    // {
    //     type: '3dtileset',
    //     id: 'cyq_bridge',
    //     desc: '重庆创业桥',
    //     label: '创业桥',
    //     visible: false,
    //     flyto: false,
    //     url: 'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/cyq/tileset.json',
    //     options: {
    //         offset: {
    //             type: 1,
    //             z: 26,
    //         },
    //     }
    // },
    // {
    //     type: '3dtileset',
    //     id: 'tgl_bridge',
    //     desc: '重庆铁公立大桥',
    //     label: '铁公立大桥',
    //     visible: false,
    //     flyto: false,
    //     url: 'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/tgl/tileset.json',
    //     options: {
    //         offset: {
    //             type: 1,
    //             z: 15,
    //         },
    //     }
    // },

    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //   '4310020001',
    //   'http://81.71.76.96:9001/gis/gisserver/wkk/chenzhou_xlg/tileset.json', {
    //     offset: {
    //       type: 1,
    //       x: 112.939849,
    //       y: 25.679715,
    //       z: 566, //550.3,//566,
    //       scale: {
    //         scaleX: 40,
    //         scaleY: 40,
    //         scaleZ: 40,
    //       },
    //       heading: 217.4,
    //     },
    //     cameraView: {
    //       offset: {
    //         range: 660,
    //         heading: 3.942562699796988,
    //         pitch: -0.1042470017940196,
    //         roll: 6.281159267781888,
    //       },
    //     }
    //   },
    //   true, true, '西岭沟尾矿库', '湖南省郴州市西岭沟尾矿库'
    // ).toJSON(),
    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //   '4309230002',
    //   'http://81.71.76.96:9001/gis/gisserver/wkk/yiyang_shibanchong/tileset.json', {
    //     offset: {
    //       type: 1,
    //       z: 400,
    //     },
    //     cameraView: {
    //       destination:{
    //         lng:110.84549829727145, 
    //         lat:28.263750471683636, 
    //         height:374.6035190896622
    //       },
    //       offset: {
    //         heading: 6.2831853071794495,
    //         pitch: -0.45000599123878162
    //       },
    //       range:130
    //     }
    //   },
    //   false, false, '石板冲尾矿库', '湖南省益阳市石板冲尾矿库'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getImagerURLTemplateModel(
    //     'imagery_urltemplate_zdjcyq',
    //     'http://113.247.236.85:8180/gis/gisserver/image/zdjc/{z}/{x}/{y}.png',
    //     {
    //         rectangle: Cesium.Rectangle.fromDegrees(112.877128118869, 28.1167807662312, 112.880702850607, 28.1193284593599)
    //     },
    //     true, true, '中大园区影像', '中大检测园区影像图层'
    // ).toJSON(),




    // zgis3d.models.ZDataSourceModel.getCustomModel(
    //   'custom_zdjc_label',
    //   undefined, {
    //     entities: [{
    //       name: '中大检测',
    //       position: Cesium.Cartesian3.fromDegrees(112.87849778954987, 28.118542259200254, 0),
    //       billboard: {
    //         width: 32,
    //         height: 32,
    //         image: './img/marker/marker.png',
    //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //         scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e8, 0)
    //       },
    //       label: {
    //         text: '中大检测',
    //         font: '18px 微软雅黑',
    //         pixelOffset: Cesium.Cartesian2.fromElements(0, -48),
    //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //         scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e8, 0),
    //         pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e8, 0)
    //       },
    //       properties: {
    //         deviceName: '设备名称',
    //         deviceId: '设备ID'
    //       }
    //     }]
    //   }, false, false
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getCustomModel(
    //   'custom_zdjc_piple',
    //   undefined, {
    //     entities: [{
    //       name: '岳麓区检测园区自来水管道',
    //       position: window.Cesium.Cartesian3.fromDegrees(112.87406723, 28.11994829, 8),
    //       orientation: window.Cesium.Transforms.headingPitchRollQuaternion(
    //         window.Cesium.Cartesian3.fromDegrees(112.87406723, 28.11994829, 8),
    //         new window.Cesium.HeadingPitchRoll(window.Cesium.Math.PI_OVER_TWO, 0, 0) // heading,pitch, roll
    //       ),
    //       model: {
    //         uri: 'data/zdjc_pipeline.gltf'
    //       },
    //       properties: {
    //         deviceName: '岳麓区检测园区自来水管道',
    //         deviceId: '管道ID'
    //       }
    //     }]
    //   }, true, true
    // ).toJSON()



    // zgis3d.models.ZDataSourceModel.getWaterModel(
    //   'zdjc_ych',
    //   './data/zdjc_river.json', {
    //     geometryOptions: {
    //       perPositionHeight: false,
    //       extrudedHeight: 8.5,
    //       height: 4
    //     },
    //     crs: 1
    //   },
    //   true, false, '湖南湘江动态水面', '湖南省湘江面状水系',
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getWaterModel(
    //     'hn_xiangjiang_d',
    //     'http://113.247.236.85:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Ariver&maxFeatures=50&outputFormat=application%2Fjson', {
    //         // perPositionHeight: false,
    //         // extrudedHeight: 8.5,
    //         // height: 4,
    //         crs: 1
    //     },
    //     true, true, '湖南湘江动态水面', '湖南省湘江面状水系',
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //   "tiles_dyt",
    //   "http://47.92.159.240:9025/oblique/build/dayanta/tileset.json", {
    //     offset: {
    //       type: 0,
    //       z: 2,
    //     },
    //     alpha: 0.1
    //   },
    //   true,
    //   0,
    //   "大雁塔",
    //   "大雁塔"
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getTileClassificationModel(
    //   "tcp_dyt",
    //   "./data/build.json", {
    //     // debugShowBoundingVolume: true,
    //     // debugShowShadowVolume: true,
    //     geometryOptions: {
    //       // perPositionHeight: false,
    //       // extrudedHeight: 457,
    //       // height: 450,
    //     },

    //     crs: 1,
    //   },
    //   true,
    //   1,
    //   "单体化",
    //   "单体化"
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getVideoModel(
    //   'hn_video',
    //   // 'http://113.247.236.85:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Abuilding&maxFeatures=50&outputFormat=application%2Fjson',
    //   {
    //     type: 'FeatureCollection',
    //     features: [{
    //       geometry: {
    //         type: 'Polygon',
    //         coordinates: [
    //           [
    //             [112.878423, 28.1185186, 46.55],
    //             [112.878423, 28.1185186, 26.55],
    //             [112.87829318, 28.11830767, 26.55],
    //             [112.87829318, 28.11830767, 46.55],
    //             [112.878423, 28.1185186, 46.55]
    //           ]
    //         ]
    //       }
    //     }]
    //   }, {
    //     crs: 3,
    //     domId: 'myVideo',
    //     stRotation:90
    //   },
    //   true, true, '视频投射', '任意多边形视频投射',
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicImageryModel(
    //     'hn_cloudmap', {
    //         type: 'FeatureCollection',
    //         features: [{
    //             geometry: {
    //                 type: 'Polygon',
    //                 coordinates: [
    //                     [
    //                         [74.02, -59.63],
    //                         [154.1, -59.63],
    //                         [-154.1, 59.63],
    //                         [74.02, 59.63],
    //                         [74.02, -59.63]
    //                         // [112.878423, 28.1185186, 46.55],
    //                         // [112.878423, 28.1185186, 26.55],
    //                         // [112.87829318, 28.11830767, 26.55],
    //                         // [112.87829318, 28.11830767, 46.55],
    //                         // [112.878423, 28.1185186, 46.55]
    //                     ]
    //                 ]

    //             }
    //         }]
    //     }, {
    //         images: [
    //             'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120730.png',
    //             'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120800.png',
    //             'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904120930.png',
    //             'http://113.247.236.85:8180/gis/gisserver/cloudmap/IMK201904121130.png'
    //         ],
    //         cloudHeight: 10000
    //     },
    //     true, false, '动态云图', '中国动态云图',
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getWMSModel(
    //     'hssc_building',
    //     'http://113.247.236.85:8180/geoserver/hs_science_city/wms',
    //     {
    //         layers: 'hs_science_city:building',
    //         rectangle: new Cesium.Rectangle.fromDegrees(112.579551696777, 26.815658569335, 112.583061218262, 26.82043457)
    //     },
    //     true,false,'建筑楼宇','衡山科学城智慧园区建筑楼宇',
    // ).toJSON(),
    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   "cs_project_station", {
    //     type: "FeatureCollection",
    //     features: [{
    //         geometry: {
    //           type: "Point",
    //           coordinates: [113.03567, 28.13541],
    //         },
    //         properties: {
    //           name: "轨道项目1",
    //           id: "PR2021022200000",
    //         },
    //       },
    //       {
    //         geometry: {
    //           type: "Point",
    //           coordinates: [112.819549, 28.347458],
    //         },
    //         properties: {
    //           name: "轨道项目2",
    //           id: "PR2021022200001",
    //         },
    //       },
    //       {
    //         geometry: {
    //           type: "Point",
    //           coordinates: [113.03176, 28.1844],
    //         },
    //         properties: {
    //           name: "轨道项目3",
    //           id: "PR2021022200002",
    //         },
    //       },
    //       {
    //         geometry: {
    //           type: "Point",
    //           coordinates: [112.98623, 28.25585],
    //         },
    //         properties: {
    //           name: "轨道项目4",
    //           id: "PR2021022200003",
    //         },
    //       },
    //     ],
    //   }, {
    //     customSymbol: 2,
    //     markerSymbol: "iot_metro_normal",
    //     markerColor: undefined, //Cesium.Color.RED,
    //     markerSize: 48,
    //     primitive: 1,
    //     crs: 3,
    //     refresh: 0,
    //     refreshInterval: 0.25 * 60, // 秒
    //     scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e6, 0),
    //     stroke: Cesium.Color.RED,
    //     strokeWidth: 10,
    //     label: false,
    //   },
    //   true,
    //   true,
    //   "项目列表",
    //   "项目列表"
    // ).toJSON(), 

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   "cs_metro_station",
    //   "./data/cs_metro_station.json", {
    //     customSymbol: 2,
    //     markerSymbol: "iot_metro",
    //     markerColor: undefined, //Cesium.Color.RED,
    //     markerSize: 24,
    //     primitive: 0,
    //     crs: 3,
    //     scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.0e6, 0),
    //     stroke: Cesium.Color.RED,
    //     strokeWidth: 10,
    //     label: {
    //       show: true,
    //       font: "10px 黑体",
    //     },
    //   },
    //   true,
    //   false,
    //   "长沙地铁站",
    //   "长沙地铁站"
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   "cs_metro_line",
    //   "./data/cs_metro_line.json", {
    //     crs: 3,
    //     primitive: 0,
    //     materialType: Cesium.Material.PolylineTrailLinkType,
    //     //flowImage: './img/colors2.png',
    //     stroke: Cesium.Color.fromCssColorString("#38A9DF"),
    //     strokeWidth: 6,
    //   },
    //   true,
    //   false,
    //   "长沙地铁线",
    //   "长沙地铁线"
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getGeoJsonModel(
    //     'zdjc_bridge_device',
    //     'http://113.247.236.85:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Adevices3d&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=mapid%3D1',
    //     {
    //         markerSymbol: 'iot_device',
    //         markerColor: Cesium.Color.GREEN,
    //         markerSize: 48,
    //     },
    //     true,true,'桥梁监控设备','中大检测对面小桥上的监控设备',
    // ).toJSON(), 

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   '4310020001',
    //   'http://192.168.10.6:8888/device/geo/all/pond/4310020001', {
    //     urlParameters: {
    //       headers: {
    //         "Content-Type": "application/json;charset=utf-8",
    //         Authorization: "eyJhbGciOiJIUzI1NiJ9.eyJiaXpfZGF0YV9maWVsZCI6IntcImF1dGhJZFwiOlwiMDM2YjU4ZGEtOGY0ZS00N2EyLThkNjMtN2FhYTVkMGJiNTUwXCJ9IiwiZXhwIjoxNjE1OTA0OTE1fQ.VNedAyr1NUY_A99Wwzg3ucOhExahZtkVqze3TbGdWZU"
    //       }
    //     },
    //     clampToGround: false,
    //     customSymbol: 1,
    //     markerSize: 48,
    //     markerSymbol: 'iot_device',
    //     // markerColor: ,
    //     primitive: 1,
    //     crs: 1,
    //     refresh: 0,
    //     refreshInterval: 5 * 60, // 秒
    //     markerSymbolCallBack: function (property) {
    //       // 图标
    //       return 'iot_device';
    //     },
    //     label: {
    //       show: true,
    //       heightReference: 0,
    //     }
    //   },
    //   true, true, "", ""
    // ).toJSON(),

    // 椒花水库
    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //   'PR2021100900000',
    //   'http://10.88.90.54:8000/monitor-project/getGisSensorInfo', {
    //     urlParameters: {
    //       headers: {
    //         "Content-Type": "application/json;charset=utf-8",
    //         Authorization: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI1MzJkZmNiMWYyYjI0ZDNiOWE2ZjgxOGFlMzExMmNjYSIsInVzZXIiOiJhZG1pbiIsInN1YiI6ImFkbWluIn0.9-59itRszl7n924ixXxGkLnR4TddacsjWp7vl6aDvx6u8uOZkkBNYC-Ojww3_zPYGM3IsxRKymmgMguACteRqw"
    //       }
    //     },
    //     clampToGround: false,
    //     customSymbol: 1,
    //     markerSize: 48,
    //     markerSymbol: 'iot_device',
    //     // markerColor: ,
    //     primitive: 1,
    //     crs: 1,
    //     refresh: 0,
    //     refreshInterval: 5 * 60, // 秒
    //     markerSymbolCallBack: function (property) {
    //       debugger
    //       // 图标
    //       return 'iot_device';
    //     },
    //     label: {
    //       show: true,
    //       heightReference: 0,
    //     }
    //   },
    //   true, true, "", ""
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getHeatmapImageryModel(
    //     'zdjc_dz_device',
    //     //'http://42.48.99.10:5002/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Abase_site_gis&maxFeatures=10000&outputFormat=application%2Fjson&timestamp=1596869264803',
    //     (function getData(length) {
    //         var data = [];
    //         for (var i = 0; i < length; i++) {
    //             var x = Math.random() + 112.97637439500011;
    //             var y = Math.random() + 28.195263761000035;
    //             var value = Math.random() * 100;
    //             data.push({
    //                 x: x,
    //                 y: y,
    //                 value: value,
    //             });
    //         }
    //         return data;
    //     })(3000),

    //     {
    //         heatmapOptions: {
    //             // minValue: 0,
    //             // maxValue: 100,
    //             valueField: "value",
    //             radius: 20,
    //         }
    //     },
    //     true,
    //     false,
    //     '',
    //     ''
    // ).toJSON(),


    // zgis3d.models.ZDataSourceModel.getKrigingImageryModel(
    //     'zdjc_dz_device',
    //     'http://42.48.99.10:5002/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Abase_site_gis&maxFeatures=10000&outputFormat=application%2Fjson&timestamp=1596869264803', {

    //         defaultAlpha: 0.5,
    //         valueField: "typeid",
    //         krigingOptions: {
    //             colors: zgis3d.core.ZColorMap.DEFAULT,
    //             gridMaxNum: 300
    //         }
    //     },
    //     true,
    //     false,
    //     '',
    //     ''
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //     'zdjc_dz_device',
    //     //'http://42.48.99.10:5002/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Abase_site_gis&maxFeatures=10000&outputFormat=application%2Fjson&timestamp=1596869264803',
    //     // 'http://113.247.236.85:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Adevices3d&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=mapid%3D4',
    //     'http://113.247.236.85:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Adevices3d&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=mapid%3D2',
    //     {
    //         crs: 1, //3,
    //         primitive: 0,
    //         customSymbol: 1,
    //         //blendOption: Cesium.BlendOption.OPAQUE,
    //         //markerColor: undefined,
    //         markerSymbolCallBack: function (property) {
    //             return 'iot_device';
    //         },
    //         // markerColor: Cesium.Color.fromCssColorString('#000088'),
    //         refresh: true,
    //         refreshInterval: 0.2 * 60, // 秒
    //         refreshCallback: function (geoJSON) {
    //             console.log('this is refreshCallback:' + geoJSON);
    //             // geoJSON.features.forEach((f, index) => {
    //             //     f.properties['marker-color'] = "#FF0000";
    //             // });
    //             return geoJSON;
    //         },
    //         label: {
    //             show: true
    //         }
    //     },
    //     true, true, '地质灾害监控设备', '中大检测怀化市的地质灾害监控设备'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //     'zdjc_dz_factor_analysis',
    //     //'http://192.168.10.74:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Achina_district&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=dcode%20%3C%3E%20%27431200%27%20and%20dcode%20like%20%274312__%27',
    //     'http://192.168.10.74:8180/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Achina_district&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=dcode%20like%20%27431200%27', {
    //         crs: 3,
    //         clampToGround: 1,
    //         primitive: 1,
    //         strokeWidth: 40,
    //         refreshInterval: 0.3 * 60, // 秒
    //         refreshCallback: function (geoJSON) {
    //             console.log('this is refreshCallback:' + geoJSON);
    //             // geoJSON.features.forEach((f, index) => {
    //             //     f.properties['marker-color'] = "#FF0000";
    //             // });
    //             return geoJSON;
    //         },
    //         label: {
    //             show: true
    //         }
    //     },
    //     true, true, '怀化市单因子分析', '中大检测怀化市的单因子分析'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
    //     'zdjc_dz_device',
    //     `http://106.55.43.6:8304/monitorPoint/all/geo-json`, {
    //         customSymbol: 1,
    //         clampToGround: false,
    //         markerSymbol: 'iot_device',
    //         markerColor: undefined,
    //         primitive: 1,
    //         refresh: 1,
    //         refreshInterval: 5 * 60, // 秒
    //         markerSymbolCallBack: function (property) {
    //             return 'iot_device';
    //         },
    //         markerColorCallBack: function (property) {
    //             return '#FF0000';
    //         },
    //         label: {
    //             show: false,
    //         }
    //     },
    //     true, false, '桥梁监控设备', '青海神箭大桥监控设备'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.get3DTileSetModel(
    //     'qh_sj_bridge',
    //     'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/sjbridge/tileset.json', {
    //         offset: {
    //             type: 1,
    //             x: 102.03642,
    //             y: 35.945923,
    //             z: 2162,
    //             scale: {
    //                 scaleX: 24.8,
    //                 scaleY: 24.8,
    //                 scaleZ: 24.8,
    //             },
    //             heading: 344.2,
    //             pitch: 2.2
    //         },
    //         cameraView: {
    //             offset: {
    //                 range: 300,
    //                 heading: 5.83954490570259,
    //                 pitch: -0.2887695872905886,
    //                 roll: 6.2807374074082745
    //             },
    //         }
    //     },
    //     true, true, '神箭大桥', '青海省神箭大桥'
    // ).toJSON(),

    // zgis3d.models.ZDataSourceModel.getDistrictModel(
    //   'district_hn_cs',
    //   'http://113.247.236.85:8180/geoserver/hs_science_city/ows', {
    //     crs: 3,
    //     renderToPolygon: 0,
    //     urlParams: {
    //       typeName: 'hs_science_city:china_district',
    //       // cql_filter: "dcode='632701'",
    //       cql_filter: "dcode='430100'",
    //     },
    //   }, true, false, '怀化市', '湖南省怀化市行政边界'
    // ).toJSON(),

  return datas
}

// 中大检测园区测图范围（kml）
function getTestData_kml_zhogndaRange() {
  return zgis3d.models.ZDataSourceModel.getKmlModel(
      'kml_zdjc',
      './data/zdjc.kml', {
        crs: 1,
      },
      true, false, '中大检测园区测图范围'
    ).toJSON()
}

// 中大检测园区
function getTestData_3dtiles_zhongda() {
  return zgis3d.models.ZDataSourceModel.get3DTileSetModel(
      'zdjcyq',
      'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/zdjc_3dtiles0606/tileset.json', {
        offset: {
        },
      },
      true, true, '中大检测园区'
    ).toJSON()
}

// 石化厂（3dtiles）
function getTestData_3dtiles_shihuachang() {
  return zgis3d.models.ZDataSourceModel.get3DTileSetModel(
      'marshuagongyuanqu',
      'http://113.247.236.85:8180/gis/gisserver/model/3dtiles/marsShiHua3D/tileset.json', { },
      true, true, '石化厂'
    ).toJSON()
}

// 黄材水库（3dtiles）
function getTestData_3dtiles_huangcaishuiku() {
  return zgis3d.models.ZDataSourceModel.get3DTileSetModel(
      '4301810001',
      'http://111.230.194.242:9001/data/gisdata/huangcai/tileset.json', {
        offset: {
          type: 1,
          z: 261,
        },
        cameraView: {
          offset: {
            range: 2000,
            heading: 6.007368753067183,
            pitch: -2.7378746160997918,
          },
        }
      },
      false, true, '黄材水库', '黄材水库'
    ).toJSON()
}

// 唐山桥梁监测设备（geojson）
function getTestData_geojson_tangshanjianceshebei() {
  return zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel('tangshan_device',
      'http://192.168.10.6:9468/point/home/gis/PR2021052000001',
      //'http://192.168.10.74:9080/geoserver/hs_science_city/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hs_science_city%3Atsdevices3d&outputFormat=application%2Fjson',
      {
        urlParameters: {
          headers: {
            Authorization: 'eyJhbGciOiJIUzI1NiJ9.eyJiaXpfZGF0YV9maWVsZCI6IntcImF1dGhJZFwiOlwiMTA2XCJ9IiwiZXhwIjoxNjM1MjUzNjI0fQ.2ruFvLTGdSN8vk3TL_MVxyBhsGn6gHlODRKoYdEel7Q'
          }
        },
        crs: 1, //3,
        clampToGround: false,
        primitive: 1, //?  1  0 
        customSymbol: 2,
        markerSize: 48,
        //blendOption: Cesium.BlendOption.OPAQUE,
        markerColor: null,
        markerColorCallBack: function (property) { //可设置颜色、大小
          // if(property["position"] != "主塔")property['marker-size'] = 96;
          // 桥面上的图标 和 非索力计  图片 96
          if (property["mpAddr"].indexOf('塔') == -1 && (property.gisDevices[0] && property.gisDevices[0].customName.indexOf('TSSL') == -1)) property['marker-size'] = 96;

          return property["marker-color"];
        },
        markerSymbolCallBack: function (property) {
          // 桥面：竖向加速度传感器 应变传感器 温度传感器 温湿度传感器 静力水准仪 横向加速度传感器 纵向加速度传感器 竖向地震传感器 横向地震传感器 纵向地震传感器 
          // 主塔：风速风向仪 加速度传感器 温度传感器 静力水准仪 应变传感器
          // 斜拉索：索力传感器

          //if(property["position"] != "主塔")property['marker-size'] = 96;//图标大小在 markerSumbolCallBack之后，所以这里无效
          // 
          let status = (property.monitorPointStatus || 'normal').toLowerCase();
          status = (status !== 'normal' && status !== '正常' && status !== '告警') ? 'other' : status;

          if (status == '正常') status = 'normal'
          if (status == '告警') status = 'alarm'
          if (property.monitorIndicatorValue == "振动") { //竖向加速度传感器 单向加速度
            // 单向加速度（震动） 塔上
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tszd_${status}_s`;
            }
            return `iot_bridge_tszd_${status}`;
          } else if (property.monitorIndicatorValue == "应力应变") { //应变传感器

            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tsyb_${status}_s`;
            }
            return `iot_bridge_tsyb_${status}`;
          } else if (property.monitorIndicatorValue == "倾斜") {
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tsjsd_${status}_s`;
            }
            return `iot_bridge_tsjsd_${status}`;
          } else if (property.monitorIndicatorValue == "温度") {
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tswd_${status}_s`;
            }
            return `iot_bridge_tswd_${status}`;
          } else if (property.monitorIndicatorValue == "温湿度") {
            return `iot_bridge_tswsd_${status}`;
          } else if (property.monitorIndicatorValue == "动态位移") { // 静力水准仪
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tssz_${status}_s`;
            }
            return `iot_bridge_tssz_${status}`;
          } else if (property.monitorIndicatorValue == "加速度") { //加速度传感器
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tsjsd_${status}_s`;
            }
            return `iot_bridge_tsjsd_${status}`;
          } else if (property.monitorIndicatorValue == "振动") { //纵向加速度传感器
            return `iot_bridge_tszd_${status}`;
          } else if (property.monitorIndicatorValue == "地震监测") { //竖向地震传感器
            return `iot_bridge_tsdz_${status}`;
          } else if (property.monitorIndicatorValue == "地震监测") { //横向地震传感器
            return `iot_bridge_tsdz_${status}`;
          } else if (property.monitorIndicatorValue == "地震监测") { //纵向地震传感器
            return `iot_bridge_tsdz_${status}`;
          } else if (property.monitorIndicatorValue == "索力") { //索力传感器
            return `iot_bridge_tssl_${status}_s`;
          } else if (property.monitorIndicatorValue == "风速风向") { //风速风向仪
            return `iot_bridge_tsfsfx_${status}_s`;
          } else if (property.monitorIndicatorValue == "表面位移") { //表面位移
            if (property.mpAddr.indexOf('塔') > -1) {
              return `iot_bridge_tsbm_${status}_s`;
            }
            return `iot_bridge_tsbm_${status}`;
          }
        },
        // markerColor: Cesium.Color.fromCssColorString('#000088'),
        refresh: true,
        refreshInterval: 605, // 秒  10 分钟 05 秒
        refreshCallback: function (geoJSON) {
          geoJSON.features.forEach((f, index) => {
            if (property["mpAddr"].indexOf('塔') == -1 && (property.gisDevices[0] && property.gisDevices[0].customName.indexOf('TSSL') == -1)) property['marker-size'] = 96;
          });
          return geoJSON;
        },
        label: false,
        billboard: {
          pixelOffset: window.Cesium.Cartesian2.fromElements(0, 0),
          disableDepthTestDistance: 1, //Number.POSITIVE_INFINITY,//没有此选项 深度监测失效？
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(2.0e2, 1, 6.0e2, 0.0),
          translucencyByDistance: new Cesium.NearFarScalar(2.0e2, 1, 6.0e2, 0.0),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 500.0),
        }
      },
      true, true, '唐山桥梁监测设备', '唐山桥梁监测设备'
    ).toJSON()
}

// 中国矢量wms服务？
function getTestData_wms_china() {
  return {
    "id": "1453620821977796610",
    "type": 10,
    "label": "中国",
    "description": "bou1_4p",
    "url": "http://127.0.0.1:9800/gis-map/ZdMapService/zdgis/1453621249855524866?key=040c293d8fa177f73ea92fb3b882093ccf7415cad75e65460dceb85ff139ce9a3c57381ec026b7ed16339a9160e9684eab7e216936036c72298fa924f8c6e2f86489c9e6c21a0a3b94925e8c3e3a62021e324d6a72cc1da468631829b006c743aac191b98b2195f568c93da14dfb7cc6e6baa1655d90aace2c94241e4e9a7fef91",
    "flyto": false,
    "visible": true,
    "options": {
        "parameters": {
            "format": "image/png",
            "transparent": true
        },
        "layers": "zdgis:bou1_4p"
    }
  }
}

function getTestData_xyz_nanyue_google_img() {
  return zgis3d.models.ZDataSourceModel.getImagerURLTemplateModel(
      'imagery_urltemplate_hnny_google',
      'http://113.247.236.85:8180/gis/gisserver/model/ny/yingxiang/{z}/{x}/{y}.png', {
        rectangle: Cesium.Rectangle.fromDegrees(112.559943328883, 27.1890699331633, 112.78035337005, 27.3372403641521)
      },
      true, false, '南岳主城区影像', '南岳主城区谷歌离线影像图层'
    ).toJSON()
}

function getTestData_xyz_nanyue_img() {
  return zgis3d.models.ZDataSourceModel.getImagerURLTemplateModel(
      'imagery_urltemplate_hnny_wrj',
      'http://113.247.236.85:8180/gis/gisserver/model/ny/wurenjiyingxiang/{z}/{x}/{y}.png', {
        rectangle: Cesium.Rectangle.fromDegrees(112.559943328883, 27.1890699331633, 112.78035337005, 27.3372403641521)
      },
      true, false, '南岳主城区影像', '南岳主城区无人机正射影像图层'
    ).toJSON()
}

function getTestData_3dtiles_nanyue_building() {
  return zgis3d.models.ZDataSourceModel.get3DTileSetModel(
      'hn_ny_main_building_bm',
      'http://113.247.236.85:8180/gis/gisserver/model/ny/bm/tileset.json', {
        crs: 1,
      },
      true, true, '南岳主城区建筑物白盒模型'
    ).toJSON()
}

function getTestData_3dtiles_nanyue_qingxiesheying() {
  return zgis3d.models.ZDataSourceModel.get3DTileSetModel(
      'hn_ny_main_building_qx',
      'http://113.247.236.85:8180/gis/gisserver/model/ny/qingxiesheying/tileset.json', {
        crs: 1,
        offset: {
          type: 0,
          z: 30, //210, 
        },
      },
      true, true, '南岳主城区建筑物倾斜模型'
    ).toJSON()
}

function getTestData_geojson_nanyue_road() {
  return zgis3d.models.ZDataSourceModel.getDynamicGeoJsonModel(
      "hnny_road_line",
      "http://113.247.236.85:8180/gis/gisserver/model/ny/json/hnny_road.json", {
        crs: 1,
        primitive: 0,
        materialType: Cesium.Material.PolylineGlowType,
        //flowImage: './img/colors2.png',
        stroke: Cesium.Color.fromCssColorString("#FFFF00"),
        strokeWidth: 10,
      },
      true,
      false,
      "南岳主城区道路线",
      "南岳主城区道路线"
    ).toJSON()
}

function getTestData_geojson_nanyue_building() {
  return zgis3d.models.ZDataSourceModel.getGeoJsonModel(
      'hn_ny_main_building',
      'http://113.247.236.85:8180/gis/gisserver/model/ny/json/hnny_building.json', {
        fill: Cesium.Color.fromAlpha(Cesium.Color.GREEN, 0.5),
        clampToGround: true,
        label: {
          type: "billboard",  // 注记显示类型：billboard 广告牌， label 平铺注记
          backgroundImage: "http://localhost:8080/test/img/minInfoWindow.png", // http绝对路径
          size: [200,134],    // label窗口大小 注意高宽比和背景图片一致
          text: "层数：[FLOOR]", // "层数：[FLOOR]，高度：[HEIGHT]（米）",
          font: {
            size: 18,
            color: Cesium.Color.RED,
          },
          offset: [50,25], // [-40,40], // 窗口坐标系，向下、向右为正
          displayDistance: [0,200],
        }
      },
      true, true, '南岳主城区建筑物', '南岳主城区建筑物',
    ).toJSON()
}