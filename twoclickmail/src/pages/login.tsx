import type React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import {
	TextField,
	Button,
	Typography,
	Box,
	Alert,
	Paper,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { loginUser } from "@/lib/requests/auth";
import Layout from "@/components/layout";
import type { GetServerSideProps } from "next";
import { fetchProfile } from "@/lib/requests/data";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { token } = context.req.cookies;
	if (token) {
		const profile = await fetchProfile(token);
		if (!profile) {
			context.res.setHeader(
				"Set-Cookie",
				"token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
			);
		} else {
			return {
				redirect: { destination: "/profile", permanent: false },
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
		if (success) router.push({ pathname: "/profile" });
		else setErrorMessage("Invalid email or password");
	};

	return (
		<Layout showSearch={false}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-start",
					py: { xs: 4, md: 8 },
					minHeight: "100%",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						width: "100%",
						maxWidth: 448,
						p: { xs: 3, md: 6 },
						border: "1px solid var(--gmail-border)",
						borderRadius: "8px",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							mb: 3,
						}}
					>
						<MailOutlineIcon sx={{ fontSize: 36, color: "#1a73e8", mb: 1 }} />
						<Typography
							sx={{ fontSize: 24, fontWeight: 400, color: "#202124" }}
						>
							Sign in
						</Typography>
						<Typography sx={{ fontSize: 14, color: "#5f6368", mt: 1 }}>
							to continue to 2clickmail
						</Typography>
					</Box>

					<Box component="form" onSubmit={handleSubmit}>
						{errorMessage && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{errorMessage}
							</Alert>
						)}
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email address"
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
						<Box
							sx={{
								mt: 4,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Link
								href="/register"
								style={{ color: "#1a73e8", fontSize: 14, fontWeight: 500 }}
							>
								Create account
							</Link>
							<Button
								type="submit"
								variant="contained"
								sx={{
									backgroundColor: "#0b57d0",
									"&:hover": { backgroundColor: "#0842a0" },
									boxShadow: "none",
								}}
							>
								Next
							</Button>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Layout>
	);
};

export default Login;
