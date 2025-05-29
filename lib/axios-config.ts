import axios from "axios"

// axios 전역 설정
axios.defaults.withCredentials = true

// 기본 설정
axios.defaults.timeout = 10000
axios.defaults.headers.common["Content-Type"] = "application/json"
axios.defaults.headers.common["Accept"] = "*/*"

export default axios
