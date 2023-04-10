// pages/index.tsx

import Layout from '../components/layout';
import { GetServerSideProps } from 'next';

import { CircularProgress } from '@mui/material';
export const getServerSideProps: GetServerSideProps = async (context) => {

  const loggedIn = !!context.req.cookies.token;

  if (loggedIn) {
    return {
        redirect: {
            destination: '/profile',
            permanent: false,
        },
    } 
  } else {
      return {
        redirect: {
            destination: '/generate',
            permanent: false,
        },
    }
  }
}


const Home = () => (
  <Layout>
    <CircularProgress />
  </Layout>
);

export default Home;
