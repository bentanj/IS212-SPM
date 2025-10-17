import { Roles } from '@/types';

export interface User {
    userId: number;
    name: string;
    email: string;
    role: Roles;
    department: string;
}