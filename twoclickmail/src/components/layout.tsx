// components/Layout.tsx

import React, { ReactNode } from 'react';
import Navbar from '@/components/navbar';
import Head from 'next/head';
import Footer from '@/components/Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (<>
    <Head>
       <title>Two Click Mail</title> 
    </Head>
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
    </>
  );
};

export default Layout;
