/*
 * @Author: gisboss
 * @Date: 2020-08-27 12:37:11
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-27 12:41:52
 * @Description: 资源模型类
 */

/**
 * @exports ZResModel
 * @class
 * @classdesc 资源模型类。单个资源的参数对象模型。
 *
 * @param {Object} res 图层参数对象
 * @property {Object} res res对象属性
 */

class ZResModel {
    constructor(res) {
        this.id = res.id;
        this.name = res.name;
    }

    getResId() {
        return this.id;
    }

    setResId(id) {
        this.id = id;
    }


    getResName() {
        return this.name;
    }

    setResName(name) {
        this.name = name;
    }
}

export default ZResModel;