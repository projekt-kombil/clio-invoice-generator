export type ClioCurrentUser = {
  id: number;
  name: string;
};

export type ClioConnectionStatus =
  | {
      connected: true;
      user: ClioCurrentUser;
    }
  | {
      connected: false;
      reason?: string;
    };

export type ClioTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

export type ClioWhoAmIResponse = {
  data?: {
    id?: number;
    name?: string;
  };
};

export type ClioApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};
