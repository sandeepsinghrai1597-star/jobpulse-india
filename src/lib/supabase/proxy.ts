import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSafeFallbackRole(role: unknown) {
  if (role === "employer" || role === "candidate") {
    return role;
  }

  return "candidate";
}

function getRoleFromAuthMetadata(appMetadataRole: unknown, userMetadataRole: unknown) {
  if (appMetadataRole === "admin") {
    return "admin";
  }

  if (appMetadataRole === "employer" || appMetadataRole === "candidate") {
    return appMetadataRole;
  }

  return getSafeFallbackRole(userMetadataRole);
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isCandidateRoute = pathname.startsWith("/dashboard");
  const isEmployerRoute = pathname.startsWith("/employer");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isCandidateRoute || isEmployerRoute || isAdminRoute;

  if (!isProtectedRoute) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    currentUser?.role ??
    getRoleFromAuthMetadata(
      user.app_metadata?.role,
      user.user_metadata?.role,
    );

  if (
    (isCandidateRoute && role !== "candidate") ||
    (isEmployerRoute && role !== "employer" && role !== "admin") ||
    (isAdminRoute && role !== "admin")
  ) {
    const redirectPath = role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return response;
}
