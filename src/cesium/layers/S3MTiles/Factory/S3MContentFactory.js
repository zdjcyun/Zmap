/*
 * @Author: gisboss
 * @Date: 2021-02-28 19:04:59
 * @LastEditors: gisboss
 * @LastEditTime: 2021-02-28 19:19:14
 * @Description: file content
 */
import S3MCacheFileRenderEntity from './S3MCacheFileRenderEntity.js';


let S3MContentFactory = {
    'OSGBFile': function (options) {
        return new S3MCacheFileRenderEntity(options);
    },
    'OSGBCacheFile': function (options) {
        return new S3MCacheFileRenderEntity(options);
    }
};

export default S3MContentFactory;