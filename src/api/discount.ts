import { API_COUPON_MODULE_PREFIX, API_DISCOUNT_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

/**
 * effectTime: string;
 * expireTime: string;
 * use : toISOString() method;
 * like: 2023-10-01T00:00:00.000Z
 */
type Discount  = {
    productId: number;
    rate: number;
    effectTime: string;
    expireTime: string;
}

type CouponType = {
    title: string;
    description: string;
    trigger: number;
    discount: number;
    lastHour: number;
}

type UseRequest = {
    orderId: string;
    couponId: string;
}

export const createCouponType = (couponType: CouponType) => {
    return axios.post(`${API_COUPON_MODULE_PREFIX}/type`, couponType,
        { headers: { "Content-Type": "application/json" } }
    )
    .then(res => {
        return res
    })
}

export const getAllCouponType = () => {
    return axios.get(`${API_COUPON_MODULE_PREFIX}/type`)
    .then(res => {
        return res
    })
}

export const getUserCoupons = () => {
    return axios.get(`${API_COUPON_MODULE_PREFIX}`)
    .then(res => {
        return res
    })
}

export const useCoupon = (useRequest : UseRequest) => {
    return axios.post(`${API_COUPON_MODULE_PREFIX}`,useRequest,
        { headers: {"Content-Type": "application/json" } }
    )
    .then(res => {
        return res
    })
}

export const newDiscount = (discount : Discount) => {
    return axios.post(`${API_DISCOUNT_MODULE_PREFIX}`,discount,
        { headers: {"Content-Type": "application/json"}}
    )
    .then(res => {
        return res
    })
}


export const getDiscount = (productId : string) => {
    return axios.get(`${API_DISCOUNT_MODULE_PREFIX}/${productId}`)
    .then(res => {
        return res
    })
}

export const deleteDiscount = (id : string) => {
    return axios.delete(`${API_DISCOUNT_MODULE_PREFIX}/${id}`)
    .then(res => {
        return res
    })
}