import { API_COMMENT_MODULE_PREFIX } from "./_prefix";
import { axios } from "../utils/request";

type Comment = {
  productId: number,
  rating: number,
  content: string,
}

/**
 * 请求方式 
 * 方法：GET
 * 请求路径：/api/comments/{productId}
 * @returns comments
 */
export const getComments = (productId: number) => {
  return axios.get(`${API_COMMENT_MODULE_PREFIX}/${productId}`)
    .then((res) =>{
      return res
    })
}

/**
 * 请求方式
 * 方法：POST
 * 请求路径：/api/comments
 * @params Comment
 * @returns submitRes
 */
export const submitComment = (comment: Comment) => {
  return axios.post(`${API_COMMENT_MODULE_PREFIX}`, comment)
    .then((res) => {
      return res
    })
}

/**
 * 请求方式
 * 方法：DELETE
 * 请求路径：/api/comments/{id}
 * @returns deleteRes
 */
export const deleteComment = (id: number) => {
  return axios.delete(`${API_COMMENT_MODULE_PREFIX}/${id}`)
    .then((res) => {
      return res
    })
}