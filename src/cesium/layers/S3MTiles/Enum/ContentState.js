/*
 * @Author: gisboss
 * @Date: 2021-02-28 19:04:59
 * @LastEditors: gisboss
 * @LastEditTime: 2021-02-28 19:19:35
 * @Description: file content 
 */


let ContentState = {
    UNLOADED: 0,
    LOADING: 1,
    PARSING: 2,
    READY: 3,
    FAILED: 4
};

export default Object.freeze(ContentState);