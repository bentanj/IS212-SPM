import NextAuth, { User } from "next-auth"
import Google from "next-auth/providers/google"
import { getUserByEmail } from "./utils/Users/getUser";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    jwt: {
        maxAge: 15 * 60
    },
    session: {
        maxAge: 15 * 60
    },
    callbacks: {
        async signIn({ user }: { user: User | null }) {
            // Check if email is not a string, convert it to a string
            const userEmail =
                typeof user?.email === "string" ? user.email : user?.email || "";

            // Check if the user's email is in the Users table
            try {
                const response = await getUserByEmail(userEmail);

                if (!response) {
                    console.error("User not found in database");
                    return "/NoPermission"; // Return redirect URL for unauthorized users
                }
            }
            catch (error) {
                console.error("Error fetching user during sign-in:", error);
                return `/NoPermission`;
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                const userEmail = typeof user.email === "string" ? user.email : user.email || "";
                try {
                    const response = await getUserByEmail(userEmail);

                    if (response) {
                        token.userId = response.userId;
                        token.email = response.email;
                        token.role = response.role;
                        token.department = response.department;
                    }
                } catch (error) {
                    console.error("Error fetching user in JWT callback:", error);
                }
            }
            return token;
        },

        async session({ session, token }) {
            // Add the authorized user fields to the session.user object
            if (token) {
                session.user.userId = token.userId;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.department = token.department;
            }
            return session;
        },
    },
})