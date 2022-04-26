/*
 * @Author: gisboss
 * @Date: 2021-02-28 19:04:59
 * @LastEditors: gisboss
 * @LastEditTime: 2021-02-28 19:14:36
 * @Description: file content
 */

function S3MLayerCache() {
    this._list = new Cesium.DoublyLinkedList();
    this._sentinel = this._list.add();
    this._trimTiles = false;
}

S3MLayerCache.prototype.reset = function () {
    this._list.splice(this._list.tail, this._sentinel);
};

S3MLayerCache.prototype.touch = function (tile) {
    let node = tile.cacheNode;
    if (Cesium.defined(node)) {
        this._list.splice(this._sentinel, node);
    }
};

S3MLayerCache.prototype.add = function (tile) {
    if (!Cesium.defined(tile.cacheNode)) {
        tile.cacheNode = this._list.add(tile);
    }
};

S3MLayerCache.prototype.unloadTile = function (layer, tile, unloadCallback) {
    let node = tile.cacheNode;
    if (!Cesium.defined(node)) {
        return;
    }

    this._list.remove(node);
    tile.cacheNode = undefined;
    unloadCallback(layer, tile);
};

S3MLayerCache.prototype.unloadTiles = function (layer, unloadCallback) {
    let trimTiles = this._trimTiles;
    this._trimTiles = false;
    let list = this._list;
    let maximumMemoryUsageInBytes = layer.maximumMemoryUsage * 1024 * 1024;
    let sentinel = this._sentinel;
    let node = list.head;
    while ((node !== sentinel) && ((layer.totalMemoryUsageInBytes > maximumMemoryUsageInBytes) || trimTiles)) {
        let tile = node.item;
        node = node.next;
        if (tile.isDestroyed()) {
            console.log(tile)
        }
        this.unloadTile(layer, tile, unloadCallback);
    }
};

S3MLayerCache.prototype.trim = function () {
    this._trimTiles = true;
};

export default S3MLayerCache;