//I take this logger from txAdmin created by tabarra (https://github.com/tabarra/txAdmin). It's a cool web panel to Manage & Monitor your FiveM Server remotely. Go and check it out!
const chalk = require('chalk');

function logInfo(msg, nametag = null) {
    console.log(chalk.blue(`${!nametag ? "[+]" : `[${nametag}]`} [INFO]`) + ' ' + msg);
}

function logWarn(msg, nametag = null) {
    console.log(chalk.yellow(`${!nametag ? "[+]" : `[${nametag}]`} [WARN]`) + ' ' + msg);
}

function logError(msg, nametag = null) {
    console.log(chalk.red(`${!nametag ? "[+]" : `[${nametag}]`} [ERROR]`) + ' ' + msg);
}

module.exports = {
    logInfo,
    logWarn,
    logError
}