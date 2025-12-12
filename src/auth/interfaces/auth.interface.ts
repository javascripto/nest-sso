export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

export interface AuthenticatedUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

export interface AuthTokenResult {
  access_token: string;
  user: AuthenticatedUser;
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
}
