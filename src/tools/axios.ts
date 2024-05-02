import util from 'util'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export async function axios请求<返回类型 = any>(options: AxiosRequestConfig<any>): Promise<返回类型> {
  try {
    var r = await axios.request(options)
    return r.data
  } catch (e) {
    if (e instanceof AxiosError && e.response != null) {
      var { status, statusText, data } = e.response
      throw new Error(util.format('axios错误: %O, 错误码: %O, 消息: %O', statusText, status, data))
    }
    throw e
  }
}
