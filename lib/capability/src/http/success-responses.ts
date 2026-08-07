import { NextResponse } from "next/server";

export function ok<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 200 });
}

export function created<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

export function noContent(): NextResponse<null> {
  return new NextResponse(null, { status: 204 });
}
