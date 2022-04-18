
const fs = require('fs');
const path = require('path');
const { getDateStr, getDateOfDay } = require('./util');

const logPath = path.resolve(__dirname, `../_log/log${getDateOfDay()}.log`);

if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, '', 'utf-8');
}

const main = {
  logger (str, e) {
    console.log(`${str}`, e ? e : '')
    fs.appendFileSync(logPath, `${getDateStr()}: ${str}\n`);
  }
};

module.exports = main;