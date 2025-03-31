import { API_USER_MODULE_PREFIX} from "./_prefix";
import { axios } from "../utils/request";

//contains username,password,name,avatar_url?,role,tele?,email?,location?
type UserInfo = {
    username: string;
    password: string;
    name: string;
    avatar?: string;
    role: string;
    telephone?: string;
    email?: string;
    location?: string;
}

type LoginReq = {
    username: string;
    password: string;
}

type UpdateInfo = {
    username: string;
    password?: string;
    name?: string;
    avatar?: string;
    role?: string;
    telephone?: string;
    email?: string;
    location?: string;
}

/**
 * @returns userinfo
 *headers的cookie是login接口获取所获取的，下面同理。期望由未鉴权返回的错误状态码为401
- 方法: GET
- 路径: /api/accounts/{username}
- Headers: token: xxx
 */
export const getUserInfo = (username: String) => {
    return axios.get(`${API_USER_MODULE_PREFIX}/${username}`)
    .then(res => {
        return res
    })
}

/**
 * - 方法: POST
   - 路径: /api/accounts
 * @param userinfo 
 * @returns create result
 */
export const newUser = (userinfo : UserInfo) => {
    return axios.post(`${API_USER_MODULE_PREFIX}`,userinfo,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}

/**
 * 方法: POST
 * 路径: /api/accounts/login
 * @param loginreq 
 */
export const handlelogin = async (loginreq : LoginReq) => {
    return axios.post(`${API_USER_MODULE_PREFIX}/login`,
        loginreq,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}

/**
 * 方法: PUT
 * 路径: /api/accounts
 * Headers: token: xxx
 * @param userinfo 
 */
export const updateInfo = (userinfo : UpdateInfo) => {
    return axios.put(`${API_USER_MODULE_PREFIX}`,userinfo,
        {headers: { 'Content-Type': 'application/json' }})
    .then(res => {
        return res
    })
}
