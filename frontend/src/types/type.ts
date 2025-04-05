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
    // googleId?: string | null;
}



