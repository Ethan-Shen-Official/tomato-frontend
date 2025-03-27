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
