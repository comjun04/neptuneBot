const DiscordOAuth2 = require('discord-oauth2')
const OAuth = new DiscordOAuth2()

function loginURL (settings) {
  return 'https://discord.com/api/oauth2/authorize?client_id=' +
  settings.clientId + '&redirect_uri=' +
  encodeURI(settings.redirectUri) +
  '&response_type=code&scope=identify'
}

async function authorize (authData, code) {
  const data = await OAuth.tokenRequest({ ...authData, code, scope: 'identify', grantType: 'authorization_code' })
  const userData = await OAuth.getUser(data.access_token)
  return { token: data.access_token, userData }
}

module.exports = { loginURL, authorize }
