const md5 = require('md5');
const utf8 = require('utf8');
const base64 = require('base-64');
const axios = require('axios');
const config = require('./config.js');


function toDub(n) { return n < 10 ? '0' + n : n }

//当前时间yyyyMMddHHmmss
function getTimeStr() {
    const date = new Date();
    return date.getFullYear().toString() + toDub(date.getMonth() + 1) + toDub(date.getDate()) + toDub(date.getHours()) + toDub(date.getMinutes()) + toDub(date.getSeconds());
}

/**
 * [getUrl description]
 * @param  {[type]} param [要发送的内容]
 * @param  {[type]} to    [短信接收手机号]
 * @return {[type]}       [promise]
 */
var getResult = function(param, to) {
    const SoftVersion = '2014-06-30';
    const baseURL = 'https://api.ucpaas.com';
    const timeStr = getTimeStr();
    const SigParameter = md5(config.AccountSid + config.token + timeStr).toUpperCase();

    const bytes = utf8.encode(config.AccountSid + ':' + timeStr);
    const Authorization = base64.encode(bytes);

    const url = `${baseURL}/${SoftVersion}/Accounts/${config.AccountSid}/Messages/templateSMS/?sig=${SigParameter}`;

    return axios({
        method: 'post',
        url: url,
        data: {
            templateSMS: {
                appId: config.appId,
                param: param,
                templateId: config.templateId,
                to: to
            }
        },
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json",
            "Authorization": Authorization
        }
    })
}

module.exports.getResult = getResult
