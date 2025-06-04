import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface UserData {
  id: string | null;
  username: string | null;
  email: string | null;
  avatar?: string;
  role: string | null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const webiAuthStatus = req.cookies.get("webiAuthStatus")?.value;
  const webiAdminStatus = req.cookies.get("webiAdminStatus")?.value;
  const webiRefreshToken = req.cookies.get("webiRefreshToken")?.value;
  const webiAdminRefreshToken = req.cookies.get("webiAdminRefreshToken")?.value;
  const webiUser = req.cookies.get("webiUser")?.value;

  console.log("webiAuthStatus:", webiAuthStatus);
  console.log("webiAdminStatus:", webiAdminStatus);
  console.log("webiRefreshToken exists:", !!webiRefreshToken);
  console.log("webiAdminRefreshToken exists:", !!webiAdminRefreshToken);
  console.log("webiUser:", webiUser);

  const isHomePage = pathname === "/";
  const isPlansPage = pathname === "/pricing";
  const isUserNonAuthPage = ["/login", "/signup"].includes(pathname);
  const isAdminNonAuthPage = ["/admin/auth/login"].includes(pathname);
  const isUserProtectedPage =
    pathname.startsWith("/host") || pathname.startsWith("/room/");
  const isAdminProtectedPage =
    pathname.startsWith("/admin") && pathname !== "/admin/auth/login";

  let userAuthStatus: { isAuthenticated: boolean; userId: string; role: string; expiresAt: number } | null = null;
  let adminAuthStatus: { isAuthenticated: boolean; isAdmin: boolean; expiresAt: number } | null = null;
  let userData: UserData | null = null;

  try {
    if (webiAuthStatus) {
      userAuthStatus = JSON.parse(webiAuthStatus);
    }
    if (webiAdminStatus) {
      adminAuthStatus = JSON.parse(webiAdminStatus);
    }
    if (webiUser) {
      userData = JSON.parse(webiUser) as UserData;
    }
  } catch (error) {
    console.error("Error parsing cookies:", error);
  }

  if (isHomePage || isPlansPage) {
    let response = NextResponse.next();
    let user: UserData | null = userData;

    if (userAuthStatus && userAuthStatus.isAuthenticated) {
      if (isTokenExpired(userAuthStatus)) {
        const refreshResult = await refreshUserAccessToken(req, webiRefreshToken);
        if (refreshResult && refreshResult.success) {
          response = refreshResult.response;
          const setCookieHeader = response.headers.get("set-cookie");
          if (setCookieHeader) {
            user = extractUserDataFromSetCookie(setCookieHeader);
          }
        }
      }
    } else if (webiRefreshToken) {
      // No auth status but refresh token exists, try to refresh
      const refreshResult = await refreshUserAccessToken(req, webiRefreshToken);
      if (refreshResult && refreshResult.success) {
        response = refreshResult.response;
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
          user = extractUserDataFromSetCookie(setCookieHeader);
        }
      }
    }

    if (user) {
      response.headers.set("x-user", JSON.stringify(user));
    }
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (userAuthStatus?.isAuthenticated && !isTokenExpired(userAuthStatus) && isUserNonAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (adminAuthStatus?.isAuthenticated && !isTokenExpired(adminAuthStatus) && isAdminNonAuthPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Handle user protected pages
  if (isUserProtectedPage) {
    let response = NextResponse.next();
    let user: UserData | null = userData;

    if (userAuthStatus?.isAuthenticated) {
      if (isTokenExpired(userAuthStatus)) {
        const refreshResult = await refreshUserAccessToken(req, webiRefreshToken);
        if (!refreshResult || !refreshResult.success) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
        response = refreshResult.response;
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
          user = extractUserDataFromSetCookie(setCookieHeader);
        }
      }
    } else if (webiRefreshToken) {
      const refreshResult = await refreshUserAccessToken(req, webiRefreshToken);
      if (!refreshResult || !refreshResult.success) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      response = refreshResult.response;
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        user = extractUserDataFromSetCookie(setCookieHeader);
      }
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    response.headers.set("x-user", JSON.stringify(user));
    return response;
  }

  // Handle admin protected pages
  if (isAdminProtectedPage) {
    let admin = null;
    let response = NextResponse.next();

    if (adminAuthStatus?.isAuthenticated) {
      if (isTokenExpired(adminAuthStatus)) {
        const refreshResult = await refreshAdminAccessToken(req, webiAdminRefreshToken);
        if (!refreshResult || !refreshResult.success) {
          return NextResponse.redirect(new URL("/admin/auth/login", req.url));
        }
        response = refreshResult.response;
        admin = { isAdmin: true };
      } else {
        admin = { isAdmin: true };
      }
    } else if (webiAdminRefreshToken) {
      const refreshResult = await refreshAdminAccessToken(req, webiAdminRefreshToken);
      if (!refreshResult || !refreshResult.success) {
        return NextResponse.redirect(new URL("/admin/auth/login", req.url));
      }
      response = refreshResult.response;
      admin = { isAdmin: true };
    } else {
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    if (!admin) {
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    response.headers.set("x-admin", JSON.stringify(admin));
    return response;
  }

  return NextResponse.next();
}

// Utility functions

function isTokenExpired(authStatus: { expiresAt: number }): boolean {
  return Date.now() > authStatus.expiresAt;
}

function extractUserDataFromSetCookie(setCookieHeader: string): UserData | null {
  try {
    const cookies = setCookieHeader.split(",");
    for (const cookie of cookies) {
      if (cookie.includes("webiUser=")) {
        const match = cookie.match(/webiUser=([^;]+)/);
        if (match) {
          return JSON.parse(decodeURIComponent(match[1])) as UserData;
        }
      }
    }
  } catch (error) {
    console.error("Error extracting user data:", error);
  }
  return null;
}

async function refreshUserAccessToken(req: NextRequest, refreshToken?: string) {
  if (!refreshToken) return { success: false, response: NextResponse.next() };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-userToken`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken};webiRefreshToken=${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!res.ok) {
      console.error("Failed to refresh token, status:", res.status);
      return { success: false, response: NextResponse.next() };
    }

    const setCookieHeaders = res.headers.get("set-cookie");
    if (!setCookieHeaders) {
      console.error("No set-cookie headers in refresh response");
      return { success: false, response: NextResponse.next() };
    }

    const nextResponse = NextResponse.next();
    nextResponse.headers.set("Set-Cookie", setCookieHeaders);

    return { success: true, response: nextResponse };
  } catch (error) {
    console.error("Error refreshing user token:", error);
    return { success: false, response: NextResponse.next() };
  }
}

async function refreshAdminAccessToken(req: NextRequest, refreshToken?: string) {
  if (!refreshToken) return { success: false, response: NextResponse.next() };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-adminToken`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: `adminRefreshToken=${refreshToken};webiAdminRefreshToken=${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!res.ok) {
      console.error("Failed to refresh admin token, status:", res.status);
      return { success: false, response: NextResponse.next() };
    }

    const setCookieHeaders = res.headers.get("set-cookie");
    if (!setCookieHeaders) {
      console.error("No set-cookie headers in admin refresh response");
      return { success: false, response: NextResponse.next() };
    }

    const nextResponse = NextResponse.next();
    nextResponse.headers.set("Set-Cookie", setCookieHeaders);

    return { success: true, response: nextResponse };
  } catch (error) {
    console.error("Error refreshing admin token:", error);
    return { success: false, response: NextResponse.next() };
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/admin",
    "/host",
    "/room/:path*",
    "/admin/auth/login",
    "/reset-password",
    "/pricing",
  ],
};