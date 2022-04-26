/**
 * @exports ZSceneModel
 * @class
 * @classdesc 场景数据模型类。名字空间map3d.models.ZSceneModel。
 * @private
 */
class ZSceneModel {
    constructor(options) {
        this.viewer = options.viewer;
        this.stkTerrainProvider = new Cesium.CesiumTerrainProvider({
            //url: '//assets.agi.com/stk-terrain/world',
            url: 'https://www.supermapol.com/realspace/services/3D-stk_terrain/rest/realspace/datas/info/data/path',
            requestWaterMask: true,
            requestVertexNormals: true,
            credit: ''
        });
        this.ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider({
            ellipsoid: this.viewer.scene.globe.ellipsoid
        });
        this.layers = new LayerCollection();
        this.baseLayer = new BaseLayerModel({type: 'IMAGE'});
        this.isSTKTerrain = false;
        this.analysisObjects = {};
        this.terrainObjects = {};
        this.markerObjects = {};
    }


    addLayer(layerModel, sceneContent, isFlyMode) {
        let me = this;
        if (!layerModel) {
            return;
        }
        let promise = layerModel.addLayer(this, isFlyMode);
        Cesium.when(promise, function (layer) {
            if (Window.iportalAppsRoot != "${resource.rootPath}") {
                let cameraStore = sceneContent.camera;
                let camera = me.viewer.scene.camera;
                camera.flyTo({
                    destination: new Cesium.Cartesian3(cameraStore.position.x, cameraStore.position.y, cameraStore.position.z),
                    orientation: {
                        heading: cameraStore.heading,
                        pitch: cameraStore.pitch,
                        roll: cameraStore.roll
                    }
                });
                let parseObject = sceneContent.parseObject;
                parseObject.initialize();
            }
        })
    }

    addLayers(layers, isFlyMode) {
        if (!layers) {
            return;
        }
        let me = this;
        isFlyMode = isFlyMode == false ? false : true;
        layers.each(function (layerModel, idx) {
            me.addLayer(layerModel, isFlyMode);
        });
    }

    removeLayer(layerModel) {
        if (!layerModel) {
            return;
        }
        if (layerModel.get('type') == 'TERRAIN') {
            this.setTerrain($("#chkTerrain").is(':checked'));
        }
        layerModel.removeLayer(this.viewer);
        if (layerModel.get('originName') === '点云') {
            document.getElementById('japan_pointCloud_tag').style.display = 'none';
        }
    }

    addMarker(markerModel) {
        if (this.defaultKmlLayer) {
            this.defaultKmlLayer.addMarker(markerModel, this, this.currentMarker);
            this.trigger('markerAdded', markerModel);
        }
    }

    removeMarker(markerModel) {
        if (!markerModel) {
            return;
        }
        let entity = markerModel.layer;
        if (this.viewer.entities.contains(entity)) {
            this.viewer.entities.remove(entity);
        } else {
            let ds = this.viewer.dataSources.get(0);
            if (ds && ds.entities.contains(entity)) {
                ds.entities.remove(entity);
            }
        }
    }

    removeCurrentMarker() {
        let marker = this.currentMarker;
        if (marker) {
            this.viewer.entities.remove(marker);
            this.currentMarker = undefined;
        }
    }

    setEnvironment(envState) {
        this.viewer.scene.skyAtmosphere.show = envState.skyAtmosphereShow;
        this.viewer.scene.globe.enableLighting = envState.enableLighting;
        this.viewer.scene.fog.enabled = envState.enableFog;
    }

    setTerrain(isStkTerrain) {
        if (isStkTerrain) {
            this.viewer.terrainProvider = this.stkTerrainProvider;
            this.isSTKTerrain = true;
        } else {
            this.viewer.terrainProvider = this.ellipsoidTerrainProvider;
            this.isSTKTerrain = false;
        }
    }

    setBaseLayer(baseLayerModel) {
        if (!baseLayerModel) {
            return;
        }
        baseLayerModel.setBaseLayer(Cesium, this.viewer);
        this.baseLayer = baseLayerModel;
    }

    createAddMarkerHandler(bubble) {
        let scene = this.viewer.scene;
        let canvas = scene.canvas;
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        let addMarkerHandler = new Cesium.AddMarkerHandler(this.viewer);
        let me = this;
        addMarkerHandler.drawCompletedEvent.addEventListener(function (evt, marker) {
            $('body').removeClass('cur-addMarker');
            let dx = canvasWidth - evt.position.x;
            let dy = canvasHeight - evt.position.y;
            let left, top;
            if (dx > 350) {
                left = evt.position.x + 'px';
            } else {
                left = (evt.position.x - 345) + 'px';
            }
            if (dy > 200) {
                top = evt.position.y + 'px';
            } else {
                top = (evt.position.y - 200) + 'px';
            }
            bubble.$el.css({
                'left': left,
                'top': top
            });
            bubble.$el.show();
            me.currentMarker = marker;
        });
        this.addMarkerHandler = addMarkerHandler;

        let tickChangePosition = function () {
                if (!me.currentMarker) {
                    return;
                }
                let pos = me.currentMarker.position._value;
                let windowPos = new Cesium.Cartesian2();
                Cesium.SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, pos, windowPos);
                windowPos.x = Math.floor(windowPos.x);
                windowPos.y = Math.floor(windowPos.y);
                let dx = canvasWidth - windowPos.x;
                let dy = canvasHeight - windowPos.y;
                let left, top;
                if (dx > 350) {
                    left = windowPos.x + 'px';
                } else {
                    left = (windowPos.x - 345) + 'px';
                }
                if (dy > 200) {
                    top = windowPos.y + 'px';
                } else {
                    top = (windowPos.y - 200) + 'px';
                }
                bubble.el.style.left = left;
                bubble.el.style.top = top;

            } ;
        this.viewer.clock.onTick.addEventListener(tickChangePosition);
        return addMarkerHandler;
    }

    /*
        save : function(){
            let saveData = {};
            if(this.baseLayer && 'IMAGE' != this.baseLayer.get('type')){
                saveData.baseLayer = this.baseLayer.toJSON();
            }
            saveData.isSTKTerrain = this.isSTKTerrain;
            saveData.envState = {
                    enableLighting : this.viewer.scene.globe.enableLighting,
                    skyAtmosphereShow : this.viewer.scene.skyAtmosphere.show,
                    enableFog : this.viewer.scene.fog.enabled
            };
            saveData.layers = [];
            let layers = this.layers;
            for(var i = 0,j = this.layers.length;i < j;i++){
                var layerModel = this.layers.at(i);
                if(layerModel.get("type") !== "KML"){
                    var obj = layerModel.toJSON();
                    saveData.layers.push(obj);
                }

            }
            var camera = this.viewer.scene.camera;
            saveData.camera = {
                    position : {
                        x : camera.position.x,
                        y : camera.position.y,
                        z : camera.position.z
                    },
                    heading : camera.heading,
                    pitch : camera.pitch,
                    roll : camera.roll
            };
            if(this.defaultKmlLayer){
                var entities = [].concat(this.viewer.entities.values);
                var kmlStr = WriteKml.write(entities);
                saveData.kml = kmlStr;
            }
            var saveData = JSON.stringify(saveData);
            $.ajax({
                type: "POST",
                url: "/supermapearth/Workspace",
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                data: saveData,
                success : function (jsonResult) {
                   if(jsonResult){
                       if(jsonResult.status === true){
                           Util.showErrorMsg(Resource.workspaceSaveOK);
                           return ;
                       }
                   }
                   Util.showErrorMsg(Resource.workspaceSaveFail);
                }
            });
        },
        open : function(){
            var me = this;
            $.ajax({
                type: "GET",
                url: "/supermapearth/Workspace",
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function (jsonResult) {
                    var sceneJson = jsonResult.scene;
                    me.parse(jsonResult);
                }
            });
        },
        parse : function(jsonResult) {
            if(!jsonResult){
                return;
            }
            var sceneJson = jsonResult.scene;
            if(sceneJson){
                var envState = sceneJson.envState;
                if(envState){
                    this.setEnvironment(envState);
                }
                if(sceneJson.baseLayer){
                    var baseLayerModel = new BaseLayerModel(sceneJson.baseLayer);
                    this.setBaseLayer(baseLayerModel);
                }
                this.isSTKTerrain = sceneJson.isSTKTerrain;
                if(this.isSTKTerrain == true){
                    this.setTerrain(true);
                }
                var layersJson = sceneJson.layers;
                var layers = new LayerCollection();
                layers.parse(layersJson);
                this.addLayers(layers,false);
                var cameraJson = sceneJson.camera;
                this.setCamera(cameraJson);
            }
            var kmlPath = jsonResult.kml;
            if(kmlPath){
                this.defaultKmlLayer = new KmlLayerModel({
                    name : 'default KML'
                });
                var promise = this.defaultKmlLayer.addLayerByUrl(this.viewer,kmlPath);
                var me = this;
                Cesium.when(promise,function(entities){
                    if(entities && entities.length > 0){
                        me.trigger('layerAdded',me.defaultKmlLayer);
                        for(var i = 0,j = entities.length;i < j;i++){
                            var entity = entities[i];
                            var billboard = entity.billboard;
                            var label = entity.label;
                            if(billboard && label){//暂时只支持billboard -> marker(地标)
                                var name = entity.name;
                                var des = entity.description.getValue();
                                var markerModel = new MarkerModel({
                                    name : name,
                                    description : des
                                });
                                if(me.defaultKmlLayer){
                                    me.defaultKmlLayer.addMarker(markerModel,me,entity);
                                    me.trigger('markerAdded',markerModel);
                                }
                            }
                        }
                    }
                    else{
                        me.defaultKmlLayer = undefined;
                    }

                });
            }

        },
    */
    setCamera(cameraJson) {
        if (!cameraJson) {
            return;
        }

        var camera = this.viewer.scene.camera;
        var ps = cameraJson.position;
        camera.setView({
            destination: new Cesium.Cartesian3(ps.x, ps.y, ps.z),
            orientation: {
                heading: cameraJson.heading,
                pitch: cameraJson.pitch,
                roll: cameraJson.roll
            }
        });
    }


}

export default ZSceneModel;