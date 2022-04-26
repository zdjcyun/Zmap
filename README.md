# 一、ZMAP-SDK

中大开源GIS可视化项目

使用es6 语法编写的地图开发sdk。包括了二维GIS sdk for OpenLayers ，三维GIS sdk for Cesium
地图JavaScript API是一套由JavaScript语言编写的应用程序接口，可帮助您在网站中构建功能丰富、交互性强的地图应用，支持PC端和移动端基于浏览器的地图应用开发，且支持HTML5特性的地图开发。

# 二、基础技术框架
Openlayers Cesium

# 三、代码结构
``` lua
MAP-SDK
├── doc             -- 接口文档
│  ├── zgis2d-2.0   -- 二维地图
│  ├── zgis3d-2.0   -- 三维地图
├── libs            -- 第三方库
│  ├── cesium
│  ├── openlayers
│  ├── turf
├── src
│  ├── cesium       -- 基于cesium的三维功能模块
│  ├── core         -- 地图核心模块
│  ├── ol           -- 基于openlayers的二维功能模块
├── test            -- 测试
```

# 四、功能
| 模块                                                  | 模块介绍                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| 基础组件 | 底图切换组件、缩放组件、实时坐标显示组件、比例尺组件、图例组件                  |
| 数据加载 |        天地图、高德地图、百度地图                   |
| 三维模型    |     三维模型可视化            |
| 地图查询 | 空间查询定位 |
| 地图分析 | 叠加分析、缓冲区分析 |

# 五、使用方法
本API库依赖于openlayers.js,lodash.js,axios.js等开源库，并已经在部署包中包含了所有依赖的库。

1. 获得zgis2d
2. 引用zgis2d文件
获得api文件包后，将其完整地部署到你的项目目录（或静态资源服务器），你只需要引入下述两个文件：
```
<link href="你的静态目录/zgis2d-2.0.css" rel="stylesheet"/>     
<script src="你的静态目录/zgis2d-2.0.js"></script>
```

3. 创建map容器
```
<div id="zgis2d"></div>
```

4. 根据地图配置创建地图
```
const config = {
    crs: 1,
    minZoom: 2,
    zoom: 4,
    center: [111.646, 27.895],
    layers: {
        url: [
        window.zgis2d.map2d.model.ZLayerModel.getOnlineBaseMap(
            "tianditu",  "image", "天地图",  "tl_online_tdt"
        ).toJSON()
        ]
    }
};

//创建地图
window.zgis2d.map2d.createMap("zgis2d", config).then(map2dModule => {
    const map = map2dModule.context.getMap();
    map.operationStatus =
        window.zgis2d.map2d.enum.OperationStatusEnum.MAP_QUERY_POINT;
    }
);
```