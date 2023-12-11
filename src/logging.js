import log4js from "log4js";

log4js.configure({
    appenders: {
        money: {
            type: 'file',
            filename: './logs/money.log',
        },
        ui: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['ui'],
            level: 'trace'
        },
        s3: {
            appenders: ['money', 'ui'],
            level: 'trace'
        },
        rest: {
            appenders: ['ui'],
            level: 'debug'
        },
        socket: {
            appenders: ['ui'],
            level: 'trace'
        },
        task: {
            appenders: ['money', 'ui'],
            level: 'info'
        }
    }
})

export default log4js