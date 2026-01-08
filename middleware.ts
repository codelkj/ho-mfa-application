
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    // Check for Supabase access token cookie (adjust name if needed)
    const token = request.cookies.get("sb-access-token")?.value;
    if (!token && request.nextUrl.pathname !== "/auth/login") {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // In case of any unexpected error, redirect to login (fail safe)
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
