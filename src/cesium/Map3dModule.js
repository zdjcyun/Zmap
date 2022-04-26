/*
 * @Author: gisboss
 * @Date: 2020-08-26 09:38:06
 * @LastEditors: gisboss
 * @LastEditTime: 2020-12-02 14:50:20
 * @Description: 二维GIS地图接口模块
 */

import IFrameMessage from '../core/IFrameMessage.js';
import ZGlobalEvent from './events/ViewerEventType.js';
import IMap3D from './IMap3D.js';

/**
 * @exports Map3d
 * @class
 * @classdesc 此类是对外系统调用GIS接口的二次封装，外系统与GIS系统交互接口由IMap3D对象实现。
 * <p>如果你是通过iframe嵌入页面的方式引用GIS模块，此类已经通过postMessage处理来自IFrame父窗口的命令消息。不需要显示调用,接口类自动添加监听。
 * 如果父窗口要接收来自子窗口的消息，请监听message事件。
 * 父窗口要向子窗口发送消息，请调用postMessage方法。
 * </p>
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage}
 *
 * @param {SceneContext} context 场景上下文
 */
class Map3d {
    constructor(context) {
        this.name = 'map3d';
        this.desc = '3d地图接口对象';

        /**
         * @property {SceneContext} context 场景上下文
         */
        this.context = context;

        /**
         * @property {IMap3D} iMap3D 地图操作类接口
         */
        this.iMap3D = new IMap3D(this.context);

        let mapOpts = this.context.getSceneOptions();
        // 表示使用IFrame方式集成GIS
        if (mapOpts.isIFrame) {
            initMessageHander(mapOpts.origins, this);
        }

    }
}

function initMessageHander(origins, map3dModule) {
    let data = {
        type: ZGlobalEvent.ON_SCENE_INITIALED
    };

    IFrameMessage.setGISModule(map3dModule);

    // 设置允许跨域的源
    IFrameMessage.setOrigins(origins);

    // 添加父窗口消息监听方法
    IFrameMessage.addMessageListner();

    //给父窗口发送消息
    IFrameMessage.postMessage(data);
}

export default Map3d;