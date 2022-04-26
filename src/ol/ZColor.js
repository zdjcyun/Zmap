/*
 * @Author: gisboss
 * @Date: 2020-08-21 16:39:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-12 11:44:59
 * @Description: 颜色封装类
 */


/**
 * @exports ZColor
 * @class
 * @classdesc rgba颜色对象类
 * @param r red分量
 * @param g green分量
 * @param b blue分量
 * @param a 透明度
 */
class ZColor {
    constructor(r, g, b, a) {
        this.red = r * 1.0;
        this.green = g * 1.0;
        this.blue = b * 1.0;
        if (a === null || a === undefined) {
            this.alpha = 1.0;
        } else {
            this.alpha = a * 1.0;
        }
        this.__ = {
            red: this.red,
            green: this.green,
            blue: this.blue,
            alpha: this.alpha
        }
    }


    clone() {
        return new ZColor(this.red, this.green, this.blue, this.alpha);
    }

}




/**
 * 将ZColor转换为十六进制表示法。如“#FFFFFF”
 * @param {Object} _color ZColor颜色对象表达形式，必须有red,green,blue分量
 * @returns {String} 十六进制颜色字符串
 * @static
 */
ZColor.toHex = function (_color) {
    let r = _color.red.toString(16);
    let g = _color.green.toString(16);
    let b = _color.blue.toString(16);
    r = r.length === 2 ? r : '0' + r;
    g = g.length === 2 ? g : '0' + g;
    b = b.length === 2 ? b : '0' + b;
    return '#' + r + g + b;
};

/**
 * 将ZColor转换为数组表示法,内部使用
 * @param _color new ZColor(r,g,b,a);
 * @private
 */
ZColor.toArray = function (_color) {
    if (_.isArray(_color)) {
        return _color;
    }
    return [_color.red, _color.green, _color.blue, _color.alpha];
};
/**
 * 从原生对象中获取ZColor对象
 * @param {String|Array} _color 颜色字符串对象或数组。表示方法为#xxxxxx类型或者为[r,g,b,a]
 * @param {Number} alpha 透明度
 * @returns {ZColor} ZColor对象
 * @static
 */
ZColor.from = function (_color, alpha) {
    if (!_color) return null;
    if (alpha === undefined) {
        alpha = 1;
    }
    if (_.isArray(_color)) {
        return new ZColor(_color[0], _color[1], _color[2], _color[3]);
    } else if (_.isString(_color)) {
        if (_color.toLocaleLowerCase().indexOf('rgb') > -1) {
            let rgbStr = _color.substring(_color.indexOf('(') + 1, _color.lastIndexOf(')'));
            let rgbArray = rgbStr.replace(' ', '').split(',');
            return new ZColor(rgbArray[0], rgbArray[1], rgbArray[2], rgbArray.length > 3 ? rgbArray[1] : alpha);
        } else if (_color.toLocaleLowerCase().indexOf('#') > -1) {
            return ZColor.fromHex(_color, alpha);
        }

    }
    return undefined
};

/**
 * 从rgba字符串获取ZColor对象
 * @param {String} _color 颜色字符串。表示方法为rgba(r,g,b,a)
 * @returns {ZColor} ZColor对象
 * @example
 * ZColor.fromRgba("rgba(0,0,0,1)")
 * @static
 */
ZColor.fromRgba = function (rgba) {
    if (rgba.toLocaleLowerCase().indexOf('rgb') > -1) {
        let rgbaStr = rgba.substring(rgba.indexOf('(') + 1, rgba.lastIndexOf(')'));
        let rgbaArray = rgbaStr.split(',');
        return new ZColor(rgbaArray[0], rgbaArray[1], rgbaArray[2], rgbaArray[3]);
    }

    return undefined
};
/**
 * 从十六进制表示中获取颜色对象
 * @param {string} _color 颜色的十六进制表示
 * @param {number} alpha 不透明度
 * @returns {ZColor} ZColor对象
 * @static
 */
ZColor.fromHex = function (_color, alpha) {
    if (!_color) return;
    if (typeof alpha === 'undefined') {
        alpha = 1;
    }
    return new ZColor(parseInt(_color.substring(1, 3), 16), parseInt(_color.substring(3, 5), 16), parseInt(_color.substring(5, 7), 16), alpha);
};

ZColor.default = new ZColor(0,0,0,1);


export default ZColor;