import { NextResponse } from "next/server";
import { logAuthError, mapAuthError } from "@/lib/auth/auth-errors";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirectPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = getSafeRedirectPath(url.searchParams.get("next"));
  const authError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", redirectTo);
    loginUrl.searchParams.set("authError", authError);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logAuthError("auth-callback:exchange-code", error);
        const loginUrl = new URL("/login", url.origin);
        loginUrl.searchParams.set("next", redirectTo);
        loginUrl.searchParams.set("authError", error.message);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      logAuthError("auth-callback:unexpected", error);
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("next", redirectTo);
      loginUrl.searchParams.set("authError", mapAuthError(error).message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
