import Roles from "./TRoles";

export default interface User {
    userId: number;
    name: string;
    email: string;
    role: Roles;
    department: string;
}