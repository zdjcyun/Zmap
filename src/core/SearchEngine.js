/*
 * @Author: gisboss
 * @Date: 2020-08-26 15:12:56
 * @LastEditors: gisboss
 * @LastEditTime: 2020-08-26 15:14:26
 * @Description: 搜索引擎
 */

 /**
  * ElasticSearch
  */
let se = {
    config: {
        host: '127.0.0.1',
        port: 9200
    },
    _getUrl: function () {
        return this.config.host + ':' + this.config.port;
    },
    /**
     * 更新服务端主机参数配置
     * @param {Object} params 主机ip，端口参数
     */
    updateConfig: function (params) {
        params = params || {};
        if (params.host === this.config.host && params.port === this.config.port) {
            return;
        }
        $.extend(this.config, params);
        this.getClient(true);
    },

    /**
     * 查询
     * @param {Object} params 查询参数
     * 参数格式请参考官网文档<a href="https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/16.x/api-reference-7-2.html#api-search-7-2">client.search</a>接口说明
     */
    search: function (params) {
        // params = params || {};
        // var index = params.index || '*';
        // var query = params.query || {};
        // return $.when($.ajax({
        //     type: "post",
        //     contentType: 'application/json',
        //     data: JSON.stringify(query),
        //     url: this._getUrl() + '/' + index + '/_search'
        // }));

        return this.getClient().search(params);
    },

    searchTemplate: function (params) {
        return this.getClient().searchTemplate(params);
    },
    /**
     * 获取elasticsearch.jquery客户端实例
     * @param {boolean} [recreate] 是否重新读取配置重新创建客户端
     * @return {$.es.Client}
     */
    getClient: function (recreate) {
        if (recreate || !this.client) {
            this.client = new $.es.Client({
                hosts: this._getUrl()
            });
        }
        return this.client;
    }
};


export default se;