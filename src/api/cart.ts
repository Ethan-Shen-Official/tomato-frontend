import { API_CART_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

type CartItem = {
    productId: string;
    quantity: number;
}

type UpdateItem = {
    cartItemId: string;
    quantity: number;
}

/**
 * 请求方式
 *  方法 POST
 *  路径 /api/cart
 *  @param item
 *  @returns addRes
 */
export const addToCart = (item: CartItem) => {
    return axios.post(`${API_CART_MODULE_PREFIX}`, item)
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 *  方法 DELETE
 *  路径 /api/cart/:cartItemId
 * @param cartItemId
 * @returns deleteRes
 */
export const deleteFromCart = (cartItemId: string) => {
    return axios.delete(`${API_CART_MODULE_PREFIX}/${cartItemId}`)
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 *  方法 PATCH
 *  路径 /api/cart/:cartItemId
 * config Application/json
 * @param quantity
 * @returns updateRes
 */
export const updateCartItem = (cartItem: UpdateItem) => {
    return axios.patch(`${API_CART_MODULE_PREFIX}/${cartItem.cartItemId}`, { quantity: cartItem.quantity }
    , {headers: {"Content-Type": "application/json"}})
    .then((res) => {
        return res;
    })
}

/**
 * 请求方式
 *  方法 GET
 *  路径 /api/cart
 * @returns cartItems
 */
export const getCartItems = () => {
    return axios.get(`${API_CART_MODULE_PREFIX}`)
    .then((res) => {
        return res;
    })
}