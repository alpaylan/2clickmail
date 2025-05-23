import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
	Container,
	TextField,
	Button,
	Typography,
	Box,
	Alert,
} from "@mui/material";
import { loginUser } from "@/lib/requests/auth";
import Layout from "@/components/layout";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { fetchProfile } from "@/lib/requests/data";
import Cookies from "js-cookie";
import { cookies } from "next/headers";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { token } = context.req.cookies;
	if (token) {
		const profile = await fetchProfile(token);
		if (!profile) {
      // remove cookies
      context.res.setHeader('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
		} else {
			return {
				redirect: {
					destination: "/profile",
					permanent: false,
				},
			};
		}
	}

	return { props: {} };
};

const Login: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const success = await loginUser(email, password);

		if (success) {
			router.push({
				pathname: "/profile",
			});
		} else {
			setErrorMessage("Invalid email or password");
		}
	};

	return (
		<Layout>
			<Container maxWidth="sm">
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						mt: 8,
					}}
				>
					<Typography component="h1" variant="h4">
						Login
					</Typography>
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ mt: 3, width: "100%" }}
					>
						{errorMessage && <Alert severity="error">{errorMessage}</Alert>}
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Login
						</Button>
					</Box>
				</Box>
			</Container>
		</Layout>
	);
};

export default Login;
