// 一、使用 charles 手机抓包，获取以下参数：
const userConfig = {
  // -----------------------------------------------
  // 1. 打开山姆app，点击购物车，在charles中找到 /sams/trade/cart/getUserCart
  uid: '',//body中
  storeList: '',//body中
  // -----------------------------------------------
  // 2. 【购物车页面】点击结算按钮，在charles中找到 /sams/delivery/portal/getCapacityData
  longitude: '', //headers中
  latitude: '', //headers中
  deviceid: '', //headers中
  authtoken: '', //headers中
  storeDeliveryTemplateId: '', //body中
  perDateList: [], //body中
  // -----------------------------------------------
  // 3. 【结算页面】拦截修改配送时间，模拟支付
  // a. 在charles中找到 ‘/sams/delivery/portal/getCapacityData’，右键点击breakPoints
  // b. 手机上点击配送时间选项，修改response->body中的库存信息，把dateISFull、timeISFull都改为false
  // c. 手机上选择配送时间
  // d. 在charles中找到 '/sams/trade/settlement/commitPay'
  trackinfo: '',//headers中
  storeinfo: '', //body中
  couponList: [], //body中
  addressId: '', //body中
}

// 二、 邮箱配置(非必需，不填则不发送邮件)
const emailConfig = {
  'fromEmail': '', // 发送邮件的邮箱
  'toEmail': '', // 接受邮件的邮箱
  'emailCode': '', // 邮箱授权码， QQ邮箱在 设置 -> 账户 -> POP3/SMTP服务 中开启
  'emailHost': 'smtp.qq.com', // 邮箱服务器地址 如非qq邮箱 请自行更改
}

// 三、 运行配置
const runConfig = {
  'useLogger': true, // 是否开启logger 调试使用
  'runInterval': 5000, // 每一个请求的轮询间隔(ms)
  'maxRunCount': 100,//每个请求的最大重复执行次数
  'isLoop': true, //是否循环执行，为true则一直循环运行直到下单成功，为false则根据maxTime超时则停止
  'maxTime': 10, // 单次运行最长时间,分钟
}

module.exports = { userConfig, emailConfig, runConfig };