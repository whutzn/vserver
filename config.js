/**
 * 数据库配置模块
 */
function getDbConfig() {
    return {
        host: '103.103.68.83',
        port: 3306,
        user: 'videodb',
        password: 'qq123456',
        database: 'gistest',
        multipleStatements: true
    }
}

module.exports = {
    getDbConfig: getDbConfig
}