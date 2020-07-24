module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // 设置入口文件
      config.entry('app').clear().add('./src/main-prod.js');

      // 设置打包省略文件
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',  // 深拷贝对象
        echarts: 'echarts', // 报表
        nprogress: 'NProgress', // 进度条
        'vue-quill-editor': 'VueQuillEditor',
        treeTable: 'treeTable'  // 商品分类的 tree 展开
      })

      // 设置isProd
      config.plugin('html').tap(args => {
        args[0].isProd = true;
        return args;
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      // 设置入口文件
      config.entry('app').clear().add('./src/main-dev.js');
    })
  }
}