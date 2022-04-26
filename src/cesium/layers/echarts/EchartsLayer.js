import GLMapCoordSystem from './GLMapCoordSystem.js';
import CoordTypeEnum from '../../enum/CoordTypeEnum.js';

const GLMAPKEY = GLMapCoordSystem.type;

/**
 * 
 * @private
 * @param {echarts} echarts 全局echarts对象
 * @param {Cesium.Scene} glmap 场景地图实例 
 */
function echartsRegister(echarts, glmap) {


    echarts.registerCoordinateSystem(GLMAPKEY, GLMapCoordSystem);

    echarts.extendComponentModel({
        type: GLMAPKEY,
        getGLMap: function () {
            return glmap; //this._GLMap;
        },
        defaultOption: {
            // 源数据坐标系
            crs: CoordTypeEnum.wgs84,
            roam: !1
        }
    });

    echarts.extendComponentView({
        type: GLMAPKEY,
        init: function (glMapModel, api) {
            // 这种不显示线
            // this._removableRenderHandler = glmap.postRender.addEventListener(
            //     function () {
            //         api.dispatchAction({
            //             type: "glmapRoam"
            //         });
            //     }, this);

            // 监听相机变化事件可以显示线
            this._removableRenderHandler = glmap.camera.changed.addEventListener(
                function () {
                    api.dispatchAction({
                        type: "glmapRoam"
                    });
                }, this);

        },

        render: function (glMapModel, ecModel, api) {

        },

        dispose: function (t) {
            if (this._removableRenderHandler) {
                this._removableRenderHandler();
            }
        }
    });

    echarts.registerAction({
        type: 'glmapRoam',
        event: 'glmapRoam',
        update: 'updateLayout'
    }, function (payload, ecModel, api) {


    });
}



// window.onresize事件
let winResizeEvents = {};
window.onresize = (e) => {
    _.forEach(winResizeEvents, (v, k) => {
        v(e);
    });
}

/**
 * 
 * @exports map3d.layers.echarts.EchartsLayer
 * @class
 * @classdesc echarts图层
 * @param {Cesium.Scene} map 地图场景对象
 * @param {Object} options 数据选项
 * @param {echarts} [echarts] echarts全局实例对象
 */
class EchartsLayer {
    constructor(map, options) {
        options = options || {};
        this.id = 'el_' + Cesium.createGuid();
        this.map = map;
        this._echarts = options.echarts || echarts;
        this._eOptions = options.eOptions || {};
        this.className = options.className;
        this.initialed = undefined;
        this._init();
    }


    /**
     * 初始化
     */
    _init() {
        if (this.initialed || !this._echarts) {
            return;
        }
        this.echartsContainer = createChartOverlay(this.map, this.className);

        echartsRegister(this._echarts, this.map);

        this.echartsInstance = this._echarts.init(this.echartsContainer);

        addWinResize(this);

        this.setEchartsOption(this._eOptions);

        this.initialed = true;
    }


    /**
     * 销毁实例，销毁后不可再重复使用
     */
    dispose() {
        this.remove();
        this.echartsInstance && (this.echartsInstance.dispose(), this.echartsInstance = null);
        this.initialed = false;

        this.map = undefined;
        this._echarts = undefined;
    }

    /**
     * 获取场景地图
     */
    getMap() {
        return this.map;
    }

    /**
     * 获取根DOM容器
     */
    getContainer() {
        return this.echartsContainer;
    }

    /**
     * 显示
     */
    show() {
        this.echartsContainer.classList.remove('hide');
        this.echartsContainer.classList.add('show');
    }

    /**
     * 隐藏
     */
    hide() {
        this.echartsContainer.classList.remove('show');
        this.echartsContainer.classList.add('hide');
    }

    /**
     * 从DOM中移除根容器
     */
    remove() {
        if (this.echartsInstance) {
            this.echartsInstance.clear();
        }

        if (this.echartsContainer.parentNode) {
            this.echartsContainer.parentNode.removeChild(this.echartsContainer);
            this.echartsContainer = null;
        }

        delete winResizeEvents[this.id];
    }




    /**
     * 重置容器窗口尺寸
     */
    resize() {
        this.map.render();
        let pc = this.map.canvas.parentNode;
        this.echartsContainer.style.width = pc.offsetWidth + 'px';
        this.echartsContainer.style.height = pc.offsetHeight + 'px';
        this.echartsInstance.resize();
    }

    /**
     * 设置echarts.option 数据
     * @param {Object} option 数据选项
     */
    setEchartsOption(option) {
        if (this.echartsInstance) {
            this.echartsInstance.setOption(option);
        }
    }

}

function createChartOverlay(scene, className) {
    scene.canvas.setAttribute("tabIndex", 0);
    const ele = document.createElement('div');
    ele.setAttribute("id", "el_" + Cesium.createGuid());
    if (className) {
        ele.setAttribute("class", className);
    }

    let container = scene.canvas.parentNode;
    const zIndex = container.style.zIndex || 0;
    Object.assign(ele.style, {
        position: "absolute",
        top: "0px",
        left: "0px",
        zIndex: zIndex + 1,
        width: scene.canvas.width + "px",
        height: scene.canvas.height + "px",
        pointerEvents: "none"
    });


    container.appendChild(ele);


    return ele;
}


function addWinResize(_this) {
    let eventKey = _this.id;
    winResizeEvents[eventKey] = _this.resize.bind(_this);
}

export default EchartsLayer;