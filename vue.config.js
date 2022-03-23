module.exports = {
  // 选项...
  publicPath: process.env.NODE_ENV === 'production'
    ? '/pedestal/'
    : '/',
  devServer: {
    host: 'local.101bank.sh',
    port: 8888,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      // 'Content-Type': 'application/json;charset=utf-8',
    },
    proxy: {
      '/node/galaxy': {
          target: 'http://diweb.101bank.sh',
          secure: false, // 将安全设置为false,才能访问https开头的
          changeOrigin: true,
          logLevel: 'debug',
      },
      '/jwf/core': {
          target: 'http://diweb.101bank.sh',
          secure: false, // 将安全设置为false,才能访问https开头的
          changeOrigin: true,
          logLevel: 'debug',
      },
      '/map/jtlas-app-web': {
        target: 'http://internal.bdp-smart-jtlas-app-v2', // 跨域访问
        ws: true,
        changOrigin: true, // 开启代理
        secure: false, // 将安全设置为false,才能访问https开头的
        pathRewrite: {
          '^/map/jtlas-app-web': '', // 这里理解成用‘/api’代替target里面的地址
        },
      },
      '/map/galaxy-data-ency': {
        target: 'http://internal.bdp-data-ency-v2', // 跨域访问
        ws: true,
        changOrigin: true, // 开启代理
        secure: false, // 将安全设置为false,才能访问https开头的
        pathRewrite: {
          '^/map/galaxy-data-ency': '', // 这里理解成用‘/api’代替target里面的地址
        },
      },
      "/dataapi/api": {
          target: "http://internal.bdp-data-api-service" , // 跨域访问
          pathRewrite: {
              "^/dataapi/api": "" // 这里理解成用‘/api’代替target里面的地址
          }
      },
      '/micro/config': {
        target: 'http://local.101bank.sh/',
        pathRewrite: {
        },
      },
      '/agileBiStatic': {
        target: 'http://local.101bank.sh:23002',
        pathRewrite: {
        },
      },
      '/node/bi': {
        // target: 'http://linking-scheduler.101bank.sh',
        target: 'http://local.101bank.sh:23002',
        pathRewrite: {
        },
      },
      '/node/portal': {
        // target: 'http://linking-scheduler.101bank.sh',
        target: 'http://local.101bank.sh:23004',
        pathRewrite: {
        },
      },
      '/readFile': {
        // target: 'http://linking-scheduler.101bank.sh',
        target: 'http://local.101bank.sh:8885',
        pathRewrite: {
        },
      },
      '/api/req': {
        // target: 'http://linking-scheduler.101bank.sh',
        target: 'http://local.101bank.sh:8885',
        pathRewrite: {
        },
      },
      '/api/reqAsm': {
        // target: 'http://linking-scheduler.101bank.sh',
        target: 'http://local.101bank.sh:8885',
        pathRewrite: {
        },
      },
      '/ide/api': {
        target: 'http://diweb.101bank.sh/', //设置你调用的接口域名和端口号 别忘了加http
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '/'
        //   //这里理解成用‘/api’代替target里面的地址，后面组件中我们掉接口时直接用api代替 比如我要调 用 'http://40.00.100.100:3002/user/add'，直接写‘ / api / user / add’ 即可
        // }
      },
      // /api/sys/query/user'
      // /api/program/find/portalV2
      '/api': {
        target: 'http://linking-asm-core.101bank.sh',
        secure: false, // 将安全设置为false,才能访问https开头的
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': '',
        },
      },
      '/standard/core': {
        target: 'http://linking.101bank.sh',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
        },
      },
      '/gaia/flowyed-api': {
        target: 'http://linking.101bank.sh',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/standard/core': '/',
        // },
      },
      '/gaia/core': {
        target: 'http://linking.101bank.sh',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/standard/core': '/',
        // },
      },
    },
  },
}