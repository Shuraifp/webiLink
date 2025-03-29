import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isNonAuthPage = ["/login", "/signup", "/"].includes(pathname);
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (accessToken && isNonAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!accessToken && isDashboardPage) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const newAccessToken = await refreshAccessToken(req);
    if (newAccessToken) {
      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 1000, // 1 min
      });
      return response;
    }

    // ❌ If refresh fails, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Function to refresh token
async function refreshAccessToken(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch("http://localhost:5000/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

// ✅ Define matcher for middleware
export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};
