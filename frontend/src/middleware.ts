import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const adminAccessToken = req.cookies.get("adminAccessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const adminRefreshToken = req.cookies.get("adminRefreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isUserNonAuthPage = ["/login", "/signup", "/"].includes(pathname);
  const isAdminNonAuthPage = ["/admin/auth/login"].includes(pathname);
  const isUserProtectedPage = pathname.startsWith("/host");
  const isAdminProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/auth/login";

  if (accessToken && isUserNonAuthPage) {
    return NextResponse.redirect(new URL("/host", req.url));
  }
  
  if (adminAccessToken && isAdminNonAuthPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (!accessToken && isUserProtectedPage) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const refreshResponse = await refreshUserAccessToken(req);
    if (refreshResponse) {
      return refreshResponse;
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  if (!adminAccessToken && isAdminProtectedPage) {
    if (!adminRefreshToken) {
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    const refreshResponse = await refreshAdminAccessToken(req);
    if (refreshResponse) {
      return refreshResponse;
    }

    return NextResponse.redirect(new URL("/admin/auth/login", req.url));
  }

  return NextResponse.next();
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
  matcher: ["/", "/login", "/signup", "/admin", "/host", "/admin/auth/login", "/reset-password"],
};
