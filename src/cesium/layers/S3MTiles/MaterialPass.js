/*
 * @Author: gisboss
 * @Date: 2021-02-28 19:04:59
 * @LastEditors: gisboss
 * @LastEditTime: 2021-02-28 19:16:21
 * @Description: file content
 */
function MaterialPass() {
    this.ambientColor = new Cesium.Color();
    this.diffuseColor = new Cesium.Color();
    this.specularColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);
    this.shininess = 50.0;
    this.bTransparentSorting = false;
    this.textures = [];
}

MaterialPass.prototype.isDestroyed = function () {
    return false;
};

MaterialPass.prototype.destroy = function () {
    return destroyObject(this);
};

export default MaterialPass;