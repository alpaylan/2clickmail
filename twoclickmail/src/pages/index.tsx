// pages/index.tsx

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import Layout from '../components/layout';
import { GetServerSideProps } from 'next';

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = context.req.cookies['session'];
  console.log("Cookie1:", context.req.headers.cookie);
  console.log("Cookie2:", context.req.cookies);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else {
    return {
      redirect: {
        destination: '/profile',
        permanent: false,
      },
    }
  }
}


const Home = () => {
  
  // You can return a loading state or keep it empty if you don't want to show anything before the redirect
  return <Layout>Loading...</Layout>;
};

export default Home;
