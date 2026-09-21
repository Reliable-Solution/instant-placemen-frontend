import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  const backendUrl = `http://127.0.0.1:5100${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const method = request.method;
  const isBodyAllowed = !["GET", "HEAD"].includes(method);

  let body: ArrayBuffer | undefined = undefined;
  if (isBodyAllowed) {
    try {
      body = await request.arrayBuffer();
    } catch (e) {
      // Body not present
    }
  }

  try {
    const res = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    const resHeaders = new Headers(res.headers);
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Backend communication error", error: err.message },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}
