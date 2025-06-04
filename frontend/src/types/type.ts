export interface AuthInput {
    username: string,
    password: string,
    email: string,
}

export interface AuthGoogleInput {
    username: string,
    email: string,
    avatar?: string,
    googleId: string,
}

export interface AuthInput {
    username: string;
    password: string;
    email: string;
}

export interface AuthGoogleInput {
    username: string;
    email: string;
    avatar?: string;
    googleId: string;
}

export interface UserData {
    id: string | null;
    username: string | null;
    email: string | null;
    avatar?: string;
    role: string | null;
}

export interface JWTPayload {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    backgroundImage?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  isPremium: boolean;
  planId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

