import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) throw new Error('No token found');

    const expressBackendUrl = 'http://localhost:5000/api/verify-token';
    const res = await fetch(expressBackendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 3. Return Express response
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}