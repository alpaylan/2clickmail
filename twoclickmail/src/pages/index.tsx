// pages/index.tsx

import Layout from "../components/layout";
import type { GetServerSideProps } from "next";

import { CircularProgress } from "@mui/material";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const loggedIn = !!context.req.cookies.token;
	const destination = loggedIn ? "/profile" : "/generate";

	return {
		redirect: {
			destination,
			permanent: false,
		},
	};
};

const Home = () => (
	<Layout>
		<CircularProgress />
	</Layout>
);

export default Home;
