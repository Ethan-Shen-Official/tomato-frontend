import axios from "axios";

const service = axios.create();

service.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token')
    if (token) {
        config.headers['token'] = token
    }
    return config
  }, error => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response;
    } else {
      console.log(response)
      return Promise.reject(response);
    }
  }, (error) => {
    console.log(error)
    return Promise.reject(error);
  }
)

export {service as axios};