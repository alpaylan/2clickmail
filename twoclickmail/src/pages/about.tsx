import * as React from "react";
import Layout from "@/components/layout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import GitHubIcon from "@mui/icons-material/GitHub";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Link from "next/link";

const About = () => {
	return (
		<Layout showSearch={false}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					px: 3,
					py: 2,
					borderBottom: "1px solid var(--gmail-border)",
				}}
			>
				<InfoOutlinedIcon sx={{ color: "#5f6368" }} />
				<Typography variant="h6" sx={{ fontWeight: 500 }}>
					About
				</Typography>
			</Box>
			<Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
				<Typography sx={{ fontSize: 14, color: "#202124", mb: 2 }}>
					2clickmail lets you compose an email once, get a shareable link, and
					send it from anywhere — no inbox required on the sender's side.
				</Typography>
				<Typography sx={{ fontSize: 14, color: "#5f6368", mb: 3 }}>
					Anyone with the link opens their own mail client pre-filled with your
					recipients, subject, and body. Useful for petitions, outreach, group
					emails, or any "click here to send a templated email" flow.
				</Typography>

				<Divider sx={{ my: 3 }} />

				<Typography
					sx={{ fontSize: 12, color: "#5f6368", mb: 1, fontWeight: 500 }}
				>
					Source
				</Typography>
				<Box
					component="a"
					href="https://github.com/alpaylan/2clickmail"
					target="_blank"
					rel="noreferrer"
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: 1,
						color: "#1a73e8",
						fontSize: 14,
						"&:hover": { textDecoration: "underline" },
					}}
				>
					<GitHubIcon fontSize="small" />
					github.com/alpaylan/2clickmail
				</Box>
			</Box>
		</Layout>
	);
};

export default About;
