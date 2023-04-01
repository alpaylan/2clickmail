// components/Navbar.tsx

import React, { useEffect } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { isLoggedIn } from '@/lib/utils/auth';
import { useRouter } from 'next/router';
import { logoutUser } from '@/lib/requests/auth';

interface NavbarElement { 
    href: string;
    text: string;
}


function navbarElements() {

    if (isLoggedIn()) {
        return [
            {'href': '/profile', 'text': 'Profile'},
            {'href': '/generate', 'text': 'New Email'},
            {'href': '/logout', 'text': 'Logout'}
        ]
    } else {
        return [
            {'href': '/login', 'text': 'Login'},
            {'href': '/register', 'text': 'Register'},
        ]
    }
}

const NavbarButton = ({href, text}: NavbarElement) => {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        router.push(
            {
                pathname: href,
            },
        );
    };

    if (href === '/logout') {
        return (
            <Button onClick={() => {logoutUser(); router.push({pathname: '/'});}} color="inherit" key={text}>{text}</Button>
        );
    }


    return (
        <Button onClick={handleSubmit} color="inherit" key={text}>{text}</Button>
    );
}


const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            <Button color="inherit">Home</Button>
          </Link>
        </Typography>
        <Box>
          {navbarElements().map((element) => NavbarButton(element))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
