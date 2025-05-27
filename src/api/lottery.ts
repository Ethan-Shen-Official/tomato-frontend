import { API_LOTTERY_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";
import { PrizeType,Recipient,DrawRequest } from "../utils/type";

type PoolItem = {
    type: PrizeType;
    itemId: string;
    quantity: number;
}

type UpdateRequest = {
    id: string;
    quantity: number;
}

type PrizeOrder = {
    prizeIds: string[];
    recipient: Recipient;
}

export const getLotteryPool = () => {
    return axios.get(`${API_LOTTERY_MODULE_PREFIX}/pool`)
    .then((res) => {
        return res;
    })
}

export const addNewItem = (item: PoolItem) => {
    return axios.post(`${API_LOTTERY_MODULE_PREFIX}/pool`, item,
    {headers: {'Content-Type': 'application/json'}})
    .then((res) => {
        return res;
    })
}

export const updateQuantity = (item: UpdateRequest) => {
    return axios.put(`${API_LOTTERY_MODULE_PREFIX}/pool`, item,
    {headers: {'Content-Type': 'application/json'}})
    .then((res) => {
        return res;
    })
}

export const deleteItem = (id: string) => {
    return axios.delete(`${API_LOTTERY_MODULE_PREFIX}/pool/${id}`)
    .then((res) => {
        return res;
    })
}

export const drawLottery = (draw: DrawRequest) => {
    return axios.post(`${API_LOTTERY_MODULE_PREFIX}/draw`, draw,
    {headers: {'Content-Type': 'application/json'}})
    .then((res) => {
        return res;
    })
}

export const getPrizes = () => {
    return axios.get(`${API_LOTTERY_MODULE_PREFIX}`)
    .then((res) => {
        return res;
    })
}

export const generatePrizeOrder = (order: PrizeOrder) => {
    return axios.post(`${API_LOTTERY_MODULE_PREFIX}/order`, order,
    {headers: {'Content-Type': 'application/json'}})
    .then((res) => {
        return res;
    })
}