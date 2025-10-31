import NextAuth from "next-auth";
import type User from "./IUser";

declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];
    }

    interface User extends User { }

    interface JWT extends User { }
}
