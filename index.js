const myAxios = require('./utils/myAxios')
const { userConfig, emailConfig, runConfig } = require('./config/config');
const { sendEmail } = require('./utils/sendEmail');
const { logger } = require('./utils/logger');
const { exit } = require('process');
const { getDateStr, getDateOfDay } = require('./utils/util');
const runningTask = null //运行定时器
let buyItems = [] //买到的商品列表
async function main () {
  if (Object.values(userConfig).some(item => item === "")) {
    logger(`请先到/config/config.js中完成所有配置`);
    exit(0);
    return;
  }
  const mode = runConfig.isLoop ? '循环执行' : `定时执行，${runConfig.maxTime}分钟后自动停止`
  logger(`开始运行，[模式]${mode}`);
  if (!runConfig.isLoop && runConfig.maxTime && runningTask === null) {
    runningTask = setTimeout(() => {
      logger(`定时执行结束`);
      exit(0);
    }, runConfig.maxTime * 60 * 1000);
  }
  // 下单流程：获取购物车商品=>获取配送时间=>下单
  getCart()
}


let runcount = {
  getCartCount: 0,
  getCapacityDataCount: 0,
  orderCount: 0
}
// 重试过多，重新开始下单流程
function isMaxCount (key) {
  runcount = {
    getCartCount: 0,
    getCapacityDataCount: 0,
    orderCount: 0
  }
  if (runcount[key] > runConfig.maxRunCount) {
    setTimeout(() => {
      main()
    }, runConfig.runInterval)
    return true
  } else {
    runcount[key]++
    return false
  }
}
//获取购物车信息
const getCart = async () => {
  if (isMaxCount("getCartCount")) {
    return
  }
  let url = 'https://api-sams.walmartmobile.cn/api/v1/sams/trade/cart/getUserCart';
  let data = {
    "uid": userConfig.uid,
    "deliveryType": "0",
    "deviceType": 'ios',
    "storeList": userConfig.storeList,
    "parentDeliveryType": 1,
    "homePagelongitude": userConfig.longitude,
    "homePagelatitude": userConfig.latitude
  }
  try {
    let ret = await myAxios(url, data);
    let { floorInfoList } = ret.data.data;
    let { normalGoodsList, amount, quantity } = floorInfoList[0];
    if (amount == 0) {
      logger('【购物车】商品为空');

      setTimeout(() => {
        getCart();
      }, runConfig.runInterval)
      return;
    }
    logger('【购物车】商品获取成功');
    logger(`【购物车】共 ${quantity} 件商品，共 ${amount / 100} 元`)
    let goodsList = normalGoodsList.map(item => {
      return {
        "isSelected": true,
        "quantity": item.quantity,
        "spuId": item.spuId,
        "storeId": item.storeId
      }
    });
    //买到的商品
    buyItems = normalGoodsList.map(item => item.goodsName)
    getCapacityData(goodsList, amount);
  } catch (e) {
    console.error('【购物车】商品获取失败');
    setTimeout(() => {
      getCart();
    }, runConfig.runInterval)
  }
}

//获取配送时间
const getCapacityData = async (goodsList, amount) => {
  let errorText = ""
  if (isMaxCount("orderCount")) {
    return
  }
  let url = 'https://api-sams.walmartmobile.cn/api/v1/sams/delivery/portal/getCapacityData';
  let data = {
    "perDateList": userConfig.perDateList,
    "storeDeliveryTemplateId": userConfig.storeDeliveryTemplateId
  }
  try {
    const ret = await myAxios(url, data);
    let { capcityResponseList } = ret.data.data;
    if (capcityResponseList[0].dateISFull) {
      errorText = '时间已约满'
    }
    let time = capcityResponseList[0].list.filter(item => item.timeISFull === false)[0];
    let {
      startRealTime,
      endRealTime,
      closeDate,
      startTime,
      endTime
    } = time;
    logger(`【成功】获取配送时间：${capcityResponseList[0].strDate} ${startTime} - ${endTime}`);
    logger(`【开始下单】`);
    order(startRealTime, endRealTime, goodsList, amount)
  } catch (error) {
    logger(`【获取配送时间失败】`, errorText || error);
    setTimeout(() => {
      getCapacityData(goodsList, amount);
    }, runConfig.runInterval)

  }
}

//开始下单
const order = async (startRealTime, endRealTime, goodsList, amount) => {
  if (isMaxCount("getCapacityDataCount")) {
    return
  }
  let url = 'https://api-sams.walmartmobile.cn/api/v1/sams/trade/settlement/commitPay'
  let data = {
    "invoiceInfo": {},
    "cartDeliveryType": 2,
    "floorId": 1,
    "amount": amount,
    "purchaserName": "",
    "tradeType": "APP",
    "purchaserId": "",
    "payType": 0,
    "currency": "CNY",
    "channel": "wechat",
    "shortageId": 1,
    "isSelfPickup": 0,
    "orderType": 0,
    "couponList": userConfig.couponList,
    "uid": userConfig.uid,
    "appId": "wx57364320cb03dfba",
    "addressId": userConfig.addressId,
    "deliveryInfoVO": {
      "storeDeliveryTemplateId": userConfig.storeDeliveryTemplateId,
      "deliveryModeId": "1003",
      "storeType": "2"
    },
    "remark": "",
    "storeInfo": userConfig.storeinfo,
    "shortageDesc": "其他商品继续配送（缺货商品直接退款）",
    "payMethodId": "1486659732",
    goodsList: goodsList,
    "settleDeliveryInfo": {
      "expectArrivalTime": startRealTime,
      "expectArrivalEndTime": endRealTime,
      "deliveryType": 0
    },
  }

  try {
    let ret = await myAxios(url, data, userConfig.trackinfo);
    let {
      success,
      msg
    } = ret.data;
    if (success) {
      logger('【抢到菜了】')
      //发送邮件
      sendEmail({
        title: `下单成功通知（${getDateStr()}）`,
        message: `山姆下单成功了，请及时付款！！！\n 买到的商品有：\n ${buyItems.join('    \n')}`
      });
    } else {
      logger(msg);
      setTimeout(() => {
        order(startRealTime, endRealTime, goodsList, amount)
      }, 200)

    }
  } catch (e) {
    logger('【下单失败了】')
    setTimeout(() => {
      order(startRealTime, endRealTime, goodsList, amount)
    }, 200)
  }
}


main()