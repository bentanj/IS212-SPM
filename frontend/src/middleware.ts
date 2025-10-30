import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Allow access to the sign in page without redirect
    if (pathname === "/SignIn" || pathname === "/NoPermission"
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to /SignIn
    if (!req.auth) {
        return NextResponse.redirect(new URL(`/SignIn`, req.url));
    }

    if (pathname === "/reportgeneration" || pathname === "/usermanagement") {
        const userRole = req!.auth!.user!.role;

        if (userRole !== "HR/Admin") {
            // Redirect unauthorized users to /NoPermission
            return NextResponse.redirect(new URL(`/NoPermission`, req.url));
        }
    }

    // Allow authenticated users
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/).*)"],
    debug: true,
};