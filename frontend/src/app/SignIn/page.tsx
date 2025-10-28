"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { Typography } from "@mui/material";

const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SignIn() {
    useEffect(() => {
        signIn("google");
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