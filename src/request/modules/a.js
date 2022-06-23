import instance from '../request'

const request1 = (params) => instance.post('a/request1', params)
const request2 = (params) => instance.get('test11', {
    params,
    timeout: 2000,
})

export default {
    request1,
    request2,
}