const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require('path');
const config = require('./src/server/config');
const routes = require('./src/server/routes');

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');
    const webpackMiddleware = require('koa-webpack-middleware');
    const webpackConfig = require('./src/client/build/webpack.dev.conf');
    webpackConfig.then(devConfig => {
        let compile = webpack(devConfig);
        app.use(webpackMiddleware.devMiddleware(compile, {
            publicPath: devConfig.output.publicPath,
            stats: {colors: true}
        }))
            .use(webpackMiddleware.hotMiddleware(compile));
    });
} else {
    app.use(require('koa-static')(path.join(__dirname, '/src/server/public')));
}

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});


app.listen(config.port);

// module.exports = app
