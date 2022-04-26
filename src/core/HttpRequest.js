/*
 * @Author: gisboss
 * @Date: 2020-08-28 08:26:59
 * @LastEditors: gisboss
 * @LastEditTime: 2021-05-27 16:45:26
 * @Description: 客户端http请求封装类
 */

//  import axios from 'axios';

let HTTPRequest = {
    get(url, data, options) {
        // return fetch(url, init).then((response) => {
        //     return response.json();
        // });

        return axios.get(url, {
            params: data,
            ...options
        });
    },

    post(url, data, options) {
        // let opt = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: data ? JSON.stringify(data) : '',
        // };
        // 
        // return fetch(url, opt).then((response) => {
        //     return response.json();
        // });

        return axios.post(url, data, options);
    },

    getWithToken(url, data, token, key = 'token') {
        return this.get(url, data, {
            headers: {
                [key]: token
            }
        });
    },

    postWithToken(url, data, token, key = 'token') {
        return this.post(url, data, {
            headers: {
                [key]: token
            }
        });
    }
};


export default HTTPRequest;