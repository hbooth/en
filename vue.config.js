module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/en/'
    : '/',
  pages: {
    index: {
      entry: 'src/pages/notification/main.js',
      template: 'public/index.html',
      title: 'Notification'
    },
    management: {
      entry: 'src/pages/management/main.js',
      template: 'public/index.html',
      title: 'Management'
    },
  }
}