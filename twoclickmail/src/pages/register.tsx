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

import { registerUser } from "@/lib/requests/auth";
import Layout from "@/components/layout";

const Register: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await registerUser(email, password);
		if (success) router.push({ pathname: "/profile" });
		else setErrorMessage("Failed to register");
	};

	return (
		<Layout showSearch={false}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-start",
					py: { xs: 4, md: 8 },
				}}
			>
				<Paper
					elevation={0}
					sx={{
						width: "100%",
						maxWidth: 448,
						p: { xs: 3, md: 6 },
						border: "1px solid var(--gmail-border)",
						borderRadius: 4,
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
							Create your account
						</Typography>
						<Typography sx={{ fontSize: 14, color: "#5f6368", mt: 1 }}>
							for 2clickmail
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
							autoComplete="new-password"
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
								href="/login"
								style={{ color: "#1a73e8", fontSize: 14, fontWeight: 500 }}
							>
								Sign in instead
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
								Create
							</Button>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Layout>
	);
};

export default Register;
