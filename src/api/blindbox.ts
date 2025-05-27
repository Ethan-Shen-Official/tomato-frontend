import { API_BLINDBOX_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";
import { DrawRequest } from "../utils/type";

export const drawBlindBox = (draw: DrawRequest) => {
    return axios.post(`${API_BLINDBOX_MODULE_PREFIX}`, draw,
    {headers: {'Content-Type': 'application/json'}})
    .then((res) => {
        return res;
    })
}

export const getBlindBoxContent = (id: string) => {
    return axios.get(`${API_BLINDBOX_MODULE_PREFIX}/${id}`)
    .then((res) => {
        return res;
    })
}
