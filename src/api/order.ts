import { API_ORDER_MODULE_PREFIX,API_CART_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

type Order = {
    itemIds: string[];
    recipient: Recipient;
    method: string;
}

type Recipient = {
    name: string;
    telephone: string;
    location: string;
}

/**
 * 请求方式
 *  方法 POST
 * 路径 /api/cart/checkout
 * config Application/json
 * @param order Order
 * @returns addRes
 */
export const addOrder = (order: Order) => {
    return axios.post(`${API_CART_MODULE_PREFIX}/checkout`, order,
        {headers: {"Content-Type": "application/json"}})
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 *  方法 POST
 * 路径 /api/order/:orderId/pay
 * config Application/json
 * @param orderId
 * @returns callRes 
 */
export const callPayment = (orderId: string) => {
    return axios.post(`${API_ORDER_MODULE_PREFIX}/${orderId}/pay`, {},
        {headers: {"Content-Type": "application/json"}})
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 * 方法 GET
 * 路径 /api/order/:orderId
 * @returns orderRes
 */
export const getOrder = (orderId: string) => {
    return axios.get(`${API_ORDER_MODULE_PREFIX}/${orderId}`)
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 * 方法 GET
 * 路径 /api/order
 * @returns orderRes
 */
export const getAllOrders = () => {
    return axios.get(`${API_ORDER_MODULE_PREFIX}`)
    .then((res) => {
        return res;
    })
}