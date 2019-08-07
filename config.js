/**
 * 数据库配置模块
 */
function getDbConfig() {
    return {
        host: 'localhost',
        port: 3306,
        user: 'gisdb',
        password: '1234Qwer',
        database: 'gistest',
        multipleStatements: true
    }
}

module.exports = {
    getDbConfig: getDbConfig
}