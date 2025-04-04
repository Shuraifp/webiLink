import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const adminAccessToken = req.cookies.get("adminAccessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const adminRefreshToken = req.cookies.get("adminRefreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isUserNonAuthPage = ["/login", "/signup", "/", "/pricing"].includes(pathname);
  const isAdminNonAuthPage = ["/admin/auth/login"].includes(pathname);
  const isUserProtectedPage = pathname.startsWith("/host");
  const isAdminProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/auth/login";

  if (accessToken && isUserNonAuthPage) {
    return NextResponse.redirect(new URL("/host", req.url));
  }
  
  if (adminAccessToken && isAdminNonAuthPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isUserProtectedPage) {
    let user;
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const refreshResponse = await refreshUserAccessToken(req);
      if (!refreshResponse) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Use the refreshed token
      const newAccessToken = refreshResponse.cookies.get("accessToken")?.value;
      user = await decodeAndVerifyToken(newAccessToken!);
    } else {
      user = await decodeAndVerifyToken(accessToken);
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(user));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  
  if (isAdminProtectedPage) {
    let adminUser;
    if (!adminAccessToken) {
      if (!adminRefreshToken) {
        return NextResponse.redirect(new URL("/admin/auth/login", req.url));
      }

      const refreshResponse = await refreshAdminAccessToken(req);
      if (!refreshResponse) {
        return NextResponse.redirect(new URL("/admin/auth/login", req.url));
      }
      const newAdminAccessToken = refreshResponse.cookies.get("adminAccessToken")?.value;
      adminUser = decodeAndVerifyToken(newAdminAccessToken!);
    } else {
      adminUser = decodeAndVerifyToken(adminAccessToken);
    }

    if (!adminUser) {
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin", JSON.stringify(adminUser));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}


// Utils 

async function decodeAndVerifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret);
    return { id: payload._id, username: payload.username, email: payload.email };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

async function refreshUserAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch("http://localhost:5000/api/auth/refresh-userToken", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    // const data = await res.json();
    const response = NextResponse.next();

    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

async function refreshAdminAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get("adminRefreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch("http://localhost:5000/api/auth/refresh-adminToken", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: `adminRefreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const response = NextResponse.next();

    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error refreshing admin token:", error);
    return null;
  }
}

export const config = {
  matcher: ["/", "/login", "/signup", "/admin", "/host", "/admin/auth/login", "/reset-password", "/pricing"],
};
