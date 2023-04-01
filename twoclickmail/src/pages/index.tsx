// pages/index.tsx

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import Layout from '../components/layout';
import { GetServerSideProps } from 'next';


const Home = () => {
  useEffect(() => {
      if (localStorage.getItem('loggedIn') === 'true') {
        window.location.href = '/profile';  
      } else {
        window.location.href = '/login';
      }
    }, []);
  // You can return a loading state or keep it empty if you don't want to show anything before the redirect
  return <Layout>Loading...</Layout>;
};

export default Home;
