import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getRoleFromAuthMetadata, logAuthError, mapAuthError } from "@/lib/auth/auth-errors";
import { getRoleHome } from "@/lib/auth/redirects";

function getSafeRedirectPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

function buildLoginRedirect(origin: string, nextPath: string, authError: string) {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("next", nextPath);
  loginUrl.searchParams.set("authError", authError);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = getSafeRedirectPath(url.searchParams.get("next"));
  const authError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (authError) {
    return buildLoginRedirect(url.origin, redirectTo, authError);
  }

  if (code) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return buildLoginRedirect(url.origin, redirectTo, "Missing Supabase environment variables.");
      }

      const response = NextResponse.next();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logAuthError("auth-callback:exchange-code", error);
        return buildLoginRedirect(url.origin, redirectTo, error.message);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = getRoleFromAuthMetadata(user?.app_metadata?.role, user?.user_metadata?.role);
      const finalRedirect = redirectTo === "/dashboard" ? getRoleHome(role) : redirectTo;
      const redirectResponse = NextResponse.redirect(new URL(finalRedirect, url.origin));
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });

      return redirectResponse;
    } catch (error) {
      logAuthError("auth-callback:unexpected", error);
      return buildLoginRedirect(url.origin, redirectTo, mapAuthError(error).message);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
