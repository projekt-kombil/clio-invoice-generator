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

const MIN_TOKEN_ENCRYPTION_KEY_LENGTH = 32;

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireUrlEnv(name: string): string {
  const value = requireEnv(name);

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }
}

function requireTokenEncryptionKey(): string {
  const value = requireEnv("TOKEN_ENCRYPTION_KEY");

  if (value.length < MIN_TOKEN_ENCRYPTION_KEY_LENGTH) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be at least ${MIN_TOKEN_ENCRYPTION_KEY_LENGTH} characters long.`,
    );
  }

  return value;
}

function getClioOrigin(baseUrl: string): string {
  const url = new URL(baseUrl);
  return url.origin;
}

export function getAppEnv(): AppEnv {
  const clioBaseUrl = requireUrlEnv("CLIO_BASE_URL");
  const clioRedirectUri = requireUrlEnv("CLIO_REDIRECT_URI");
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
    tokenEncryptionKey: requireTokenEncryptionKey(),
  };
}
