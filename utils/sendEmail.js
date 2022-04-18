const { SMTPClient } = require('emailjs');
const { emailConfig } = require('../config/config');
const client = new SMTPClient({
  user: emailConfig.fromEmail, // 发送的邮箱
  password: emailConfig.emailCode, // 生成的授权码
  host: emailConfig.emailHost, // 主机，不改
  ssl: true // 开启ssl
});

const emialData = {
  message: '',
  title: ''
};

const orderEmialInfo = {
  address: '',
  price: '',
  times: '',
  products: '',
};


module.exports = {
  orderEmialInfo,
  setMessage (message) {
    emialData.message = message;
  },
  addMessage (message) {
    emialData.message += message;
  },
  setTitle (title) {
    emialData.title = title;
  },
  sendEmail ({
    title = emialData.title || '标题',
    message = emialData.message || '内容'
  }) {
    if (emailConfig.fromEmail && emailConfig.toEmail) {
      // 开始发送邮件
      client.send({
        text: message, // 邮件内容
        from: emailConfig.fromEmail, // 你的邮箱号
        to: emailConfig.toEmail, // 发送给谁的
        subject: title // 邮件主题

      }, function (err) {
        if (!err) {
          console.log('发送通知邮件成功!');
        } else {
          console.error('发送通知邮件失败!');
        }
      });
    } else {
      console.log('邮箱未配置')
    }

  }
};