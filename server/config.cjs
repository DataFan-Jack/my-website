// OAuth 代理配置：在此填入 GitHub OAuth App 的凭据
// 注册地址：https://github.com/settings/developers → OAuth Apps → New OAuth App
//   Homepage URL：http://localhost:5173
//   Authorization callback URL：http://localhost:3001/api/oauth/github/callback
module.exports = {
  port: 3001,
  siteUrl: 'http://localhost:5173',
  providers: {
    github: {
      clientId: '',          // ← 填入你的 Client ID
      clientSecret: '',      // ← 填入你的 Client Secret
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userUrl: 'https://api.github.com/user',
      scope: 'read:user user:email',
      callbackUrl: 'http://localhost:3001/api/oauth/github/callback',
    },
    // 后续加微信/Gitee：在此追加 gitee / wechat 配置即可，前端无需改动
  },
}
