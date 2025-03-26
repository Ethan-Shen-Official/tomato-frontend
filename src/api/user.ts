import { API_USER_MODULE_PREFIX} from "./_prefix";
import { axios } from "../utils/request";

//contains username,password,name,avatar_url?,role,tele?,email?,location?
type UserInfo = {
    username: string;
    password: string;
    name: string;
    avatar_url?: string;
    role: string;
    tele?: string;
    email?: string;
    location?: string;
}

type LoginReq = {
    username: string;
    password: string;
}

/** headers的cookie是login接口获取所获取的，下面同理。期望由未鉴权返回的错误状态码为401
- 方法: GET
- 路径: /api/accounts/{username}
- Headers: token: xxx */
export const getUserInfo = () => {
    //TODO GET request
}

export const newUser = (userinfo : UserInfo) => {
    //TODO POST request
}

export const handlelogin = (loginreq : LoginReq) => {
    //TODO POST request
}

export const updateInfo = (userinfo : UserInfo) => {
    //TODO PUT request
}
