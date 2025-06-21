import { API_PRODUCT_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

export type UpdateInfo = {
    id: string;
    title?: string;
    price?: number;
    rate?: number;
    description?: string;
    cover?: string;
    detail?: string;
    specifications?: specification[];
}

type AddInfo = {
    title: string;
    price: number;
    rate: number;
    description?: string;
    cover?: string;
    detail?: string;
    specifications?: specification[];
} 

type specification = {
    id?: string;
    item: string;
    value: string;
    productId?: string;
}

type productAmount = {
    id: string;
    amount: number;
}

type searchQuery = {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    minRate?: number;
    maxRate?: number;
    minComment?: number;
    maxComment?: number;
    excludeOutOfStock?: boolean;
    hasDiscount?: boolean;
}


/**
 * 请求方式
    方法: GET
    路径: /api/products
    config: none
 * @returns products
 */
export const getProducts = () => {
    return axios.get(`${API_PRODUCT_MODULE_PREFIX}`,
    )
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: GET
    路径: /api/products/{id}
    config: none
 * @param id
 * @returns productinfo
 */
export const getProductById = (id: string) => {
    return axios.get(`${API_PRODUCT_MODULE_PREFIX}/${id}`)
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: PUT
    路径: /api/products
    config: application/json
 * @param UpdateInfo
 * @returns update result
 */
export const updateProduct = (productinfo : UpdateInfo) => {
    return axios.put(`${API_PRODUCT_MODULE_PREFIX}`,productinfo,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: POST
    路径: /api/products
    config: application/json
    * @param AddInfo
    * @returns add result
*/
export const addProduct = (productinfo : AddInfo) => {
    return axios.post(`${API_PRODUCT_MODULE_PREFIX}`,productinfo,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: DELETE
    路径: /api/products/{id}
    config: none
 * @param id
 * @returns delete result
 */
export const deleteProduct = (id: string) => {
    return axios.delete(`${API_PRODUCT_MODULE_PREFIX}/${id}`)
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: PATCH
    路径: /api/products/stockpile/{id}
    config: application/json
    * @param productinfo
    * @returns update result
 */
export const updateStockpile = (productinfo : productAmount) => {
    return axios.patch(`${API_PRODUCT_MODULE_PREFIX}/stockpile/${productinfo.id}`,{ amount: productinfo.amount },
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}

/**
 * 请求方式
 *  方法: GET
 *  路径: /api/products/stockpile/{id}
 *  config: none
 * @param id
 * @returns product stockpile
 * */
export const getStockpile = (id: string) => {
    return axios.get(`${API_PRODUCT_MODULE_PREFIX}/stockpile/${id}`)
    .then(res => {
        return res
    })
}

export const searchProducts = (query: searchQuery) => {
    return axios.get(`${API_PRODUCT_MODULE_PREFIX}/search`, {
        params: query
    })
    .then(res => {
        return res
    })
}