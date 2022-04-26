const { default: axios } = require('axios');
const { userConfig, runConfig } = require('../config/config');
const headers = {
  'Host': 'api-sams.walmartmobile.cn',
  'Connection': 'keep-alive',
  'Accept': '*/*',
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'User-Agent': 'SamClub/5.0.45 (iPhone; iOS 15.4; Scale/3.00)',
  'device-name': 'iPhone14,3',
  'device-os-version': '15.4',
  'device-id': userConfig.deviceid,
  'longitude': userConfig.longitude,
  'latitude': userConfig.latitude,
  'device-type': 'ios',
  'auth-token': userConfig.authtoken,
  'app-version': '5.0.45.1'
}

function wait (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}
const myAxios = async (url, data, plus) => {
  let res = await axios.post(url, data, {
    headers,
    "track-info": plus
  });
  // await wait(runConfig.runInterval)
  return res
}


module.exports = myAxios