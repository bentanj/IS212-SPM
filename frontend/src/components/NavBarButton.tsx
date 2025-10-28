import React from 'react'
import { Button } from '@mui/material'
import Link from 'next/link'

interface NavBarButtonProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    iconAsContent?: boolean;
}

const NavBarButton: React.FC<NavBarButtonProps> = ({
    href, icon, title, iconAsContent = false
}) => (
    <Link href={href} color="inherit">
        <Button color="inherit" startIcon={iconAsContent ? null : icon} title={title}
            sx={{ '&:hover': { bgcolor: '#6C9A8B' }, }}>
            {iconAsContent ? icon : title}
        </Button>
    </Link>
)

export default NavBarButton