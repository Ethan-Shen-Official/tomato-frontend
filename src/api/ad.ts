import { API_ADVERTISEMENT_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

type Ad = {
    title: string;
    content: string;
    imgUrl: string;
    productId: string;
}

type AdUpdate = {
    id: string;
    title?: string;
    content?: string;
    imgUrl?: string;
    productId: string;
}

/**
 * 请求方式
 * 方法 GET
 * 路径 /api/advertisements
 * config Application/json
 * @param ad
 * @returns addRes
 */
export const newAd = (ad: Ad) => {
    return axios.post(`${API_ADVERTISEMENT_MODULE_PREFIX}`, ad,
        {headers: { 'Content-Type': 'application/json' }}
    ).then(res => {
        return res;
    })
}

/**
 * 请求方式
 * 方法 GET
 * 路径 /api/advertisements/
 * @returns deleteRes
 */
export const getAd = () => {
    return axios.get(`${API_ADVERTISEMENT_MODULE_PREFIX}`)
        .then(res => {
            return res;
        })
}

/**
 * 请求方式
 * 方法 PUT
 * 路径 /api/advertisements/
 * config Application/json
 * @param ad 
 * @returns updateRes
 */
export const updateAd = (ad: AdUpdate) => {
    return axios.put(`${API_ADVERTISEMENT_MODULE_PREFIX}`, ad,
        {headers: { 'Content-Type': 'application/json' }}
    ).then(res => {
        return res;
    })
}

/**
 * 请求方式
 * 方法 DELETE
 * 路径 /api/advertisements/:id
 * @returns deleteRes
 * @param id
 */
export const deleteAd = (id: string) => {
    return axios.delete(`${API_ADVERTISEMENT_MODULE_PREFIX}/${id}`)
        .then(res => {
            return res;
        })
}