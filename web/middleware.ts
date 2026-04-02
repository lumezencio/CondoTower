import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/auth/login", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname, host } = req.nextUrl;
  const isPublic = PUBLIC.some(p => pathname.startsWith(p));
  const hasAuth = req.cookies.get("auth")?.value;

  // multi-tenant: extrai o subdomínio (acme.condotower.com.br -> "acme")
  const parts = host.split(":")[0].split(".");
  let tenant = parts.length > 2 ? parts[0] : undefined;
   if (!tenant) {
     const t = req.nextUrl.searchParams.get("tenant");
     if (t) tenant = t;
     else tenant = process.env.DEFAULT_TENANT || "default";
   }

  const headers = new Headers(req.headers);
  if (tenant) headers.set("x-tenant", tenant);

  if (!isPublic && !hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers } });
}

// aplica em tudo, exceto estáticos
export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};

