/*
 * @Author: gisboss
 * @Date: 2020-08-26 09:38:06
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-30 09:35:04
 * @Description: 二维GIS地图接口模块
 */

import IFrameMessage from '../core/IFrameMessage.js';
import ZGlobalEvent from './event/ZGlobalEvent.js';
import IMap from './IMap.js';

/**
     * @exports Map2d
     * @class
     * @classdesc 此类是对外系统调用GIS接口的二次封装，外系统与GIS系统交互全部由此类下的接口实现。
     * <p>如果你是通过iframe嵌入页面的方式引用GIS模块，此类已经通过postMessage处理来自IFrame父窗口的命令消息。不需要显示调用,接口类自动添加监听。
     * 如果父窗口要接收来自子窗口的消息，请监听message事件。
     * 父窗口要向子窗口发送消息，请调用postMessage方法。
     * </p>
     * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage}
     * @param {ZMapContext} context 地图上下文
     */
class Map2d {
    constructor(context) {
        this.name = 'map2d';
        this.desc = '二维地图接口对象';

        /**
         * @property {ZMapContext} context 地图上下文
         */
        this.context = context;

        /**
         * @property {IMap} iMap 地图操作类接口
         */
        this.iMap = new IMap(this.context);

        let mapOpts = this.context.getMapOptions();
        // 表示使用IFrame方式集成GIS
        if (mapOpts.isIFrame) {
            initMessageHander(mapOpts.origins,this);
        }

    }
}

function initMessageHander(origins,map2dModule) {
    let data = {
        type: ZGlobalEvent.ON_MAP_INITIALED
    };
    
     IFrameMessage.setGISModule(map2dModule);

    // 设置允许跨域的源
    IFrameMessage.setOrigins(origins);

    // 添加父窗口消息监听方法
    IFrameMessage.addMessageListner();

    //给父窗口发送消息
    IFrameMessage.postMessage(data);
}

export default Map2d;