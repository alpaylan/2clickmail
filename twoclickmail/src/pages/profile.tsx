import type React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

import InboxIcon from "@mui/icons-material/Inbox";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import LaunchIcon from "@mui/icons-material/Launch";

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { fetchProfile } from "@/lib/requests/data";
import type { EmailObject, ProfileData } from "@/lib/types";
import Layout from "@/components/layout";

export const getServerSideProps: GetServerSideProps = (async (context) => {
	const { token } = context.req.cookies;

	if (!token) {
		return {
			redirect: { destination: "/login", permanent: false },
		};
	}

	const profile = await fetchProfile(token);

	if (!profile) {
		context.res.setHeader(
			"Set-Cookie",
			"token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
		);
		return {
			redirect: { destination: "/login", permanent: false },
		};
	}

	return { props: { profile } };
}) satisfies GetServerSideProps<{ profile: ProfileData }>;

const formatDate = (iso: string | null) => {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const now = new Date();
	const sameYear = d.getFullYear() === now.getFullYear();
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		...(sameYear ? {} : { year: "numeric" }),
	});
};

const previewBody = (body: string) =>
	body.replace(/\s+/g, " ").trim().slice(0, 140);

const InboxRow = ({ mail }: { mail: EmailObject }) => {
	const router = useRouter();
	const recipients = mail.data.to.join(", ") || "(no recipient)";
	const subject = mail.data.subject || "(no subject)";
	const preview = previewBody(mail.data.body);
	const date = formatDate(mail.createdAt);

	const open = () => router.push(`/email/${mail.id}`);

	return (
		<Box
			role="button"
			tabIndex={0}
			onClick={open}
			onKeyDown={(e) => {
				if (e.key === "Enter") open();
			}}
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				height: 40,
				px: 2,
				borderBottom: "1px solid #f1f3f4",
				cursor: "pointer",
				transition: "box-shadow 100ms ease, background-color 100ms ease",
				"&:hover": {
					boxShadow:
						"inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
					backgroundColor: "#ffffff",
					zIndex: 1,
				},
			}}
		>
			<IconButton
				size="small"
				sx={{ color: "#5f6368" }}
				onClick={(e) => e.stopPropagation()}
			>
				<CheckBoxOutlineBlankIcon fontSize="small" />
			</IconButton>
			<IconButton
				size="small"
				sx={{ color: "#5f6368" }}
				onClick={(e) => e.stopPropagation()}
			>
				<StarBorderIcon fontSize="small" />
			</IconButton>

			<Box
				sx={{
					width: 200,
					minWidth: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					fontWeight: 600,
					fontSize: 14,
					color: "#202124",
				}}
				title={recipients}
			>
				{recipients}
			</Box>

			<Box
				sx={{
					flex: 1,
					minWidth: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					fontSize: 14,
				}}
			>
				<Box component="span" sx={{ fontWeight: 600, color: "#202124" }}>
					{subject}
				</Box>
				{preview && (
					<Box component="span" sx={{ color: "#5f6368" }}>
						{" — "}
						{preview}
					</Box>
				)}
			</Box>

			<Box
				sx={{
					width: 80,
					textAlign: "right",
					color: "#5f6368",
					fontSize: 12,
					fontWeight: 500,
				}}
			>
				{mail.count > 0 ? `${mail.count} sent` : "Draft"}
			</Box>

			<Box
				sx={{
					width: 80,
					textAlign: "right",
					color: "#5f6368",
					fontSize: 12,
					fontWeight: 500,
				}}
			>
				{date}
			</Box>

			<Tooltip title="Open">
				<Link href={`/email/${mail.id}`} onClick={(e) => e.stopPropagation()}>
					<IconButton size="small" sx={{ color: "#5f6368" }}>
						<LaunchIcon fontSize="small" />
					</IconButton>
				</Link>
			</Tooltip>
		</Box>
	);
};

const Profile: React.FC = (
	props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
	const { profile } = props as { profile: ProfileData };
	const router = useRouter();

	const q = (router.query.q as string | undefined)?.toLowerCase() ?? "";
	const emails = q
		? profile.emails.filter((m) => {
				const hay = `${m.data.subject} ${m.data.body} ${m.data.to.join(" ")}`.toLowerCase();
				return hay.includes(q);
		  })
		: profile.emails;

	return (
		<Layout>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					px: 2,
					py: 1,
					borderBottom: "1px solid var(--gmail-border)",
				}}
			>
				<InboxIcon sx={{ color: "#5f6368" }} />
				<Typography
					variant="h6"
					sx={{ fontWeight: 500, color: "#202124", flex: 1 }}
				>
					{q ? `Search results for "${q}"` : "My Emails"}
				</Typography>
				<Typography sx={{ color: "#5f6368", fontSize: 12 }}>
					{emails.length} of {profile.emails.length}
				</Typography>
				<Tooltip title="Refresh">
					<IconButton size="small" onClick={() => router.replace(router.asPath)}>
						<RefreshIcon fontSize="small" sx={{ color: "#5f6368" }} />
					</IconButton>
				</Tooltip>
			</Box>

			<Divider />

			{emails.length === 0 ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						py: 10,
						color: "#5f6368",
						gap: 1,
					}}
				>
					<InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />
					<Typography variant="h6" sx={{ color: "#5f6368", fontWeight: 400 }}>
						{q ? "No matching emails" : "No emails yet"}
					</Typography>
					{!q && (
						<Link href="/generate" style={{ color: "#1a73e8", fontWeight: 500 }}>
							Compose your first email
						</Link>
					)}
				</Box>
			) : (
				<Box>
					{emails.map((mail) => (
						<InboxRow key={mail.id} mail={mail} />
					))}
				</Box>
			)}
		</Layout>
	);
};

export default Profile;
