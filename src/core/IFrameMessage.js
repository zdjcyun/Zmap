/*
 * @Author: gisboss
 * @Date: 2020-08-26 11:48:38
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-28 18:05:56
 * @Description: iframe 消息操作封装类
 */



function receiveParentMessage(messageEvent) {
    var responseMsg = {
        code: 0
    };
    var origin = messageEvent.origin || messageEvent.originalEvent.origin;
    var msgData = messageEvent.data;
    if (!msgData || !_.isString(msgData)) {
        return;
    }
    var data;
    try {
        data = JSON.parse(msgData);
    } catch (e) {
        return;
    }
    if (data.messageid && data.messageid === 'zgis') {
        return;
    }
    if (IFrameMessage.origins.indexOf(origin) < 0) {
        responseMsg.code = 1;
        responseMsg.message = '拒绝此数据源(' + origin + ')请求!';
    } else if (!IFrameMessage.gisModule) {
        responseMsg.code = 2;
        responseMsg.message = '接口对象未初始化完成，请重试!';
    } else if (!data) {
        responseMsg.code = 3;
        responseMsg.message = '数据参数无效!';
    } else {
        var staus = 'ok';
        var result;
        if (data.module == 'map') {
            var fun = IFrameMessage.gisModule.iMap[data.method];
            if (fun) {
                result = fun.call(IFrameMessage.gisModule.iMap, data.params);
            } else {
                staus = 'unsupported';
            }
        } else if (data.module == 'data') {
            var method = IFrameMessage.gisModule.iData[data.method];
            if (method) {
                result = method.call(IFrameMessage.gisModule.iData, data.params);
            } else {
                staus = 'unsupported';
            }
        } else if (data.module == 'map3d') {
            var method3d = IFrameMessage.gisModule.iMap3D[data.method];
            if (method3d) {
                result = method3d.call(IFrameMessage.gisModule.iMap3D, data.params);
            } else {
                staus = 'unsupported';
            }
        } else {
            staus = 'unsupported';
        }
        if (staus === 'unsupported') {
            responseMsg.code = 4;
        }
        responseMsg.message = data.module + '.' + data.method + " is " + staus + ".";
        responseMsg.result = result || {};
    }

    //反馈处理结果给父窗口
    IFrameMessage.postMessage(responseMsg, '*', messageEvent.source);
}



/**
 * @exports IFrameMessage
 * @class
 * @classdesc iframe message配置
 */

let IFrameMessage = {
    /**
     * 方法处理模块
     */
    gisModule: undefined,
    /**
     * @property {Array} origins 允许跨域的源
     */
    origins: [],

    addMessageListner() {
        window.addEventListener('message', receiveParentMessage, false);
    },

    /**
     * 发送消息。追加消息来源标识{messageid:'zgis'}
     * @method
     * @param {Object} data 消息体
     * @param {string} [origins=*] 目标源
     * @param {window} [win=top] 消息发送对象
     */
    postMessage: function (data, origins, win) {
        var d = JSON.stringify(Object.assign({
            messageid: 'zgis'
        }, data));
        var p = win || window.top;
        p.postMessage(d, origins || '*');
    },

    /**
     * 初始化消息跨域源
     * @method
     * @param {Array.<string>} origins 跨域源
     */
    setOrigins: function (origins) {
        if (!origins) {
            return;
        }
        origins.forEach((v) => {
            this.origins.push(v);
        });
        Object.freeze(this.origins);
    },

    /**
     * 设置gis方法处理模块
     */
    setGISModule(module) {
        this.gisModule = module;
    }
};


export default IFrameMessage;