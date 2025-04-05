import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const adminAccessToken = req.cookies.get("adminAccessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const adminRefreshToken = req.cookies.get("adminRefreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isHomePage = pathname === "/";
  const isPlansPage = pathname === "/pricing";
  const isUserNonAuthPage = ["/login", "/signup"].includes(
    pathname
  );
  const isAdminNonAuthPage = ["/admin/auth/login"].includes(pathname);
  const isUserProtectedPage = pathname.startsWith("/host");
  const isAdminProtectedPage =
    pathname.startsWith("/admin") && pathname !== "/admin/auth/login";

  if (isHomePage || isPlansPage) {
    let user;
    let response;
    // User
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.next();
      }
      const refreshResult = await refreshUserAccessToken(req);
      if (refreshResult && refreshResult.accessToken) {
        response = refreshResult.response;
        user = await decodeAndVerifyToken(refreshResult.accessToken);
      }
    } else {
      user = await decodeAndVerifyToken(accessToken);
      response = NextResponse.next();
    }
    if (user && response) {
      response.headers.set("x-user", JSON.stringify(user));
    }
    return response;
  }

  if (accessToken && isUserNonAuthPage) {
    return NextResponse.redirect(new URL("/host", req.url));
  }

  if (adminAccessToken && isAdminNonAuthPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isUserProtectedPage) {
    let user;
    let response;
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const refreshResult = await refreshUserAccessToken(req);
      if (!refreshResult || !refreshResult.accessToken) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      response = refreshResult.response;
      user = await decodeAndVerifyToken(refreshResult.accessToken);
    } else {
      user = await decodeAndVerifyToken(accessToken);
      response = NextResponse.next();
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    response.headers.set("x-user", JSON.stringify(user));
    return response;
  }
  if (isAdminProtectedPage) {
    let admin;
    let response;
    if (!adminAccessToken) {
      if (!adminRefreshToken) {
        return NextResponse.redirect(new URL("/admin/auth/login", req.url));
      }
      const refreshResponse = await refreshAdminAccessToken(req);
      if (!refreshResponse || !refreshResponse.adminAccessToken) {
        return NextResponse.redirect(new URL("/admin/auth/login", req.url));
      }
      const newAdminAccessToken = refreshResponse.adminAccessToken;
      response = refreshResponse.response;
      admin = await decodeAndVerifyToken(newAdminAccessToken!);
    } else {
      admin = await decodeAndVerifyToken(adminAccessToken);
      response = NextResponse.next();
    }

    if (!admin) {
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    response.headers.set("x-admin", JSON.stringify(admin));
    return response;
  }

  return NextResponse.next();
}

// Utils

async function decodeAndVerifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload._id,
      username: payload.username,
      email: payload.email,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

async function refreshUserAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-userToken`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to refresh token server");

    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) return null;

    const cookie = parse(setCookie);
    const newAccessToken = cookie.accessToken;

    const nextResponse = NextResponse.next();
    nextResponse.headers.set("Set-Cookie", setCookie);

    return { response: nextResponse, accessToken: newAccessToken };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

async function refreshAdminAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get("adminRefreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-adminToken`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: `adminRefreshToken=${refreshToken}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to refresh token");

    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) return null;
    const cookie = parse(setCookie);
    const newAccessToken = cookie.adminAccessToken;
    console.log("adm side ;", newAccessToken);
    const nextResponse = NextResponse.next();
    nextResponse.headers.set("Set-Cookie", setCookie);
    console.log("last");
    return { response: nextResponse, adminAccessToken: newAccessToken };
  } catch (error) {
    console.error("Error refreshing admin token:", error);
    return null;
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/admin",
    "/host",
    "/admin/auth/login",
    "/reset-password",
    "/pricing",
  ],
};
