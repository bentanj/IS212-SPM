"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { Typography } from "@mui/material";

export default function SignIn() {
    useEffect(() => {
        signIn("google", { callbackUrl: "/" });
    }, []);

    return (
        <>
            <title>Sign In</title>

            <Typography variant="h2" textAlign="center" mt={5}>
                Signing In...
            </Typography>
        </>
    );
}