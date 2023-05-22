const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `${process.env.CLOUD_INSTANCE}${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback: (logLevel, message, containsPii) => {
        console.log(message)
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    },
  },
}

const REDIRECT_URI = process.env.REDIRECT_URI
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI

export { msalConfig, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI }
