import { API_PRODUCT_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

type Specification = {
    id: string;
    item: string;
    value: string;
    productId: string;
}

type ProductInfo = {
    id: string;
    title: string;
    // price: BigDecimal;
    // rate: Double;
    // description?
    // cover?
    // detail?
    // specifications?
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
    params: id: string
 * @param id
 * @returns product
 */
export const getProduct = (id: String) => {
    return axios.get(`${API_PRODUCT_MODULE_PREFIX}/${id}`,
    )
    .then(res => {
        return res
    })
}

/**
 * 请求方式
    方法: PUT
    路径: /api/products
    config: application/json
 * @param productinfo 
 * @returns update result
 */
export const updateProduct = (productinfo : ProductInfo) => {
    return axios.put(`${API_PRODUCT_MODULE_PREFIX}`,productinfo,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}