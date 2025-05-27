//import axios from 'axios';
//import { API_TOOLS_MODULE_PREFIX } from './_prefix';

export const uploadimg = ((payload: any) => {
    //TODO POST request
    //return empty
    if (!payload) {

    }
    return new Promise((resolve) => {
        resolve({
            code: 200,
            msg: 'success',
            data: {
                url: ''
            }
        });
    })
    .then((res) => {
        return res;
    })
})