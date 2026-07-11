import "server-only";

type AppEnv = {
  clioClientId: string;
  clioClientSecret: string;
  clioRedirectUri: string;
  appOrigin: string;
  clioBaseUrl: string;
  clioOrigin: string;
  clioAuthorizeUrl: string;
  clioTokenUrl: string;
  clioDeauthorizeUrl: string;
  tokenEncryptionKey: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getClioOrigin(baseUrl: string): string {
  const url = new URL(baseUrl);
  return url.origin;
}

export function getAppEnv(): AppEnv {
  const clioBaseUrl = requireEnv("CLIO_BASE_URL").replace(/\/$/, "");
  const clioRedirectUri = requireEnv("CLIO_REDIRECT_URI");
  const clioOrigin = getClioOrigin(clioBaseUrl);

  return {
    clioClientId: requireEnv("CLIO_CLIENT_ID"),
    clioClientSecret: requireEnv("CLIO_CLIENT_SECRET"),
    clioRedirectUri,
    appOrigin: new URL(clioRedirectUri).origin,
    clioBaseUrl,
    clioOrigin,
    clioAuthorizeUrl: `${clioOrigin}/oauth/authorize`,
    clioTokenUrl: `${clioOrigin}/oauth/token`,
    clioDeauthorizeUrl: `${clioOrigin}/oauth/deauthorize`,
    tokenEncryptionKey: requireEnv("TOKEN_ENCRYPTION_KEY"),
  };
}
