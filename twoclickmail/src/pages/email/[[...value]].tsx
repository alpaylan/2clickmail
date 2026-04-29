// React Imports
import React, { useEffect, useState } from "react";

// Next Imports
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

// Material UI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputBase from "@mui/material/InputBase";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsappIcon from "@mui/icons-material/WhatsApp";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Local Imports
import { fetchEmail, fetchProfile, postMail } from "@/lib/requests/data";
import type {
	EmailData,
	EmailGetRequest,
	EmailIncrementSentCountRequest,
} from "@/lib/types";
import { generateMailto } from "@/lib/common";

// Local Components
import Layout from "@/components/layout";
import copy from "copy-to-clipboard";

export type EmailMetadata = {
	value: string;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { direct, value: query_value } = context.query as {
		direct?: string;
		value?: string;
	};
	const { value: params_value } = context.params ?? { value: undefined };

	const value = (params_value ? params_value[0] : undefined) || query_value;
	const emailObject = await fetchEmail({ value } as EmailGetRequest);
	if (!emailObject) {
		return { redirect: { destination: "/", permanent: false } };
	}

	if (direct) {
		await postMail({
			mode: "increment_sent_count",
			id: value,
		} as EmailIncrementSentCountRequest);
		return {
			redirect: {
				destination: generateMailto(emailObject.data),
				permanent: false,
			},
		};
	}

	const loggedIn = !!context.req.cookies.token;
	let mailOwnedByUser = false;

	if (loggedIn) {
		// biome-ignore lint/style/noNonNullAssertion: checked above
		const profile = await fetchProfile(context.req.cookies.token!);
		if (!profile) {
			return { redirect: { destination: "/", permanent: false } };
		}
		const emailIds = profile.emails.map((email) => email.id);
		if (emailIds.includes(value as string)) mailOwnedByUser = true;
	}

	return { props: { loggedIn, emailObject, value, mailOwnedByUser } };
};

const RecipientGroup = ({
	label,
	values,
	editMode,
	onChange,
}: {
	label: string;
	values: string[];
	editMode: boolean;
	onChange: (next: string[]) => void;
}) => {
	if (!editMode && values.length === 0) return null;
	return (
		<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
			<Typography
				sx={{ width: 36, color: "#5f6368", fontSize: 12, mt: 0.5 }}
			>
				{label}:
			</Typography>
			<Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
				{editMode ? (
					<TextField
						variant="standard"
						size="small"
						fullWidth
						value={values.join(", ")}
						onChange={(e) =>
							onChange(
								e.target.value
									.split(/,| |;/)
									.map((s) => s.trim())
									.filter(Boolean),
							)
						}
						InputProps={{ disableUnderline: true, sx: { fontSize: 13 } }}
					/>
				) : (
					values.map((v) => (
						<Chip
							key={v}
							label={v}
							size="small"
							sx={{
								backgroundColor: "#e8f0fe",
								color: "#1a73e8",
								borderRadius: 999,
								fontSize: 12,
							}}
						/>
					))
				)}
			</Box>
		</Box>
	);
};

const formatDate = (iso?: string | null) => {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

const senderInitial = (emails: string[]) => {
	const first = emails[0]?.trim();
	return (first?.[0] ?? "?").toUpperCase();
};

const senderName = (emails: string[]) => {
	const first = emails[0]?.trim();
	if (!first) return "(no recipient)";
	return first.split("@")[0];
};

const MailViewer = ({
	loggedIn,
	mailOwnedByUser,
	emailData,
	metadata,
}: {
	loggedIn: boolean;
	mailOwnedByUser: boolean;
	emailData: EmailData;
	metadata: EmailMetadata;
}) => {
	const router = useRouter();
	const mailto = generateMailto(emailData);

	const [editMode, setEditMode] = useState(false);
	const [to, setTo] = useState(emailData.to);
	const [cc, setCc] = useState(emailData.cc);
	const [bcc, setBcc] = useState(emailData.bcc);
	const [subject, setSubject] = useState(emailData.subject);
	const [body, setBody] = useState(emailData.body);
	const [previewText, setPreviewText] = useState(
		emailData.body.length > 100
			? `${emailData.body.substring(0, 100)}...`
			: emailData.body,
	);

	useEffect(() => {
		setPreviewText(
			emailData.body.length > 100
				? `${emailData.body.substring(0, 100)}...`
				: emailData.body,
		);
	}, [emailData.body]);

	const url = `${process.env.PUBLIC_URL}/email/${metadata.value}`;

	const clickEditButton = async () => {
		if (!mailOwnedByUser) {
			alert(
				loggedIn
					? "You can only edit mails that you have created"
					: "Please login to edit the mail",
			);
			return;
		}
		if (editMode) {
			const newEmailData = { to, cc, bcc, subject, body };
			const res = await postMail({
				mode: "update",
				id: metadata.value,
				email: newEmailData,
			});
			if (!res) router.reload();
		}
		setEditMode(!editMode);
	};

	const handleReuse = async () => {
		if (!loggedIn) {
			alert("Please login to reuse the mail");
			return;
		}
		const uniqueId = await postMail({ mode: "generate", email: emailData });
		if (uniqueId) {
			router.push({ pathname: "/email", query: { value: uniqueId } });
		}
	};

	const handleSend = () => {
		postMail({
			mode: "increment_sent_count",
			id: metadata.value,
		} as EmailIncrementSentCountRequest);
		window.open(mailto, "_blank");
	};

	const handleCopyLink = () => copy(url);
	const handleTweet = () => {
		const text = encodeURIComponent(
			`Check out this email campaign for ${subject}:`,
		);
		window.open(
			`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
			"_blank",
		);
	};
	const handleWhatsapp = () => {
		const text = encodeURIComponent(
			`Check out this email campaign for ${subject}:`,
		);
		window.open(
			`https://wa.me/?text=${text} ${encodeURIComponent(url)}`,
			"_blank",
		);
	};

	return (
		<>
			<Head>
				<title>{subject || "(no subject)"}</title>
				<meta property="og:title" content={subject} />
				<meta property="og:description" content={previewText} />
				<meta
					property="og:image"
					content={`${process.env.PUBLIC_URL}/api/og/email?subject=${encodeURIComponent(
						subject,
					)}&preview=${encodeURIComponent(previewText)}`}
				/>
				<meta property="og:url" content={url} />
				<meta property="og:type" content="website" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={subject} />
				<meta name="twitter:description" content={previewText} />
			</Head>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 0.5,
					px: 1,
					py: 0.5,
					borderBottom: "1px solid var(--gmail-border)",
				}}
			>
				<Tooltip title="Back to inbox">
					<IconButton size="small" onClick={() => router.push("/profile")}>
						<ArrowBackIcon fontSize="small" sx={{ color: "#5f6368" }} />
					</IconButton>
				</Tooltip>
				<Box sx={{ flex: 1 }} />
				<Tooltip title="Print">
					<IconButton size="small" onClick={() => window.print()}>
						<PrintIcon fontSize="small" sx={{ color: "#5f6368" }} />
					</IconButton>
				</Tooltip>
				<Tooltip title="More">
					<IconButton size="small">
						<MoreVertIcon fontSize="small" sx={{ color: "#5f6368" }} />
					</IconButton>
				</Tooltip>
			</Box>

			<Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
				{editMode ? (
					<InputBase
						fullWidth
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Subject"
						sx={{ fontSize: 22, fontWeight: 400, mb: 2 }}
					/>
				) : (
					<Typography
						sx={{
							fontSize: 22,
							fontWeight: 400,
							color: "#202124",
							mb: 2,
							wordBreak: "break-word",
						}}
					>
						{subject || "(no subject)"}
					</Typography>
				)}

				<Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
					<Avatar
						sx={{
							bgcolor: "#1a73e8",
							width: 40,
							height: 40,
							fontSize: 16,
						}}
					>
						{senderInitial(to)}
					</Avatar>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "baseline",
								gap: 1,
								flexWrap: "wrap",
							}}
						>
							<Typography
								sx={{ fontWeight: 600, fontSize: 14, color: "#202124" }}
							>
								{senderName(to)}
							</Typography>
							<Typography sx={{ color: "#5f6368", fontSize: 13 }}>
								to {to.length} recipient{to.length === 1 ? "" : "s"}
							</Typography>
							<Box sx={{ flex: 1 }} />
							<Typography sx={{ color: "#5f6368", fontSize: 12 }}>
								{formatDate(metadata.createdAt)}
							</Typography>
						</Box>
						<Box sx={{ mt: 1 }}>
							<RecipientGroup
								label="To"
								values={to}
								editMode={editMode}
								onChange={setTo}
							/>
							<RecipientGroup
								label="Cc"
								values={cc}
								editMode={editMode}
								onChange={setCc}
							/>
							<RecipientGroup
								label="Bcc"
								values={bcc}
								editMode={editMode}
								onChange={setBcc}
							/>
						</Box>
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{editMode ? (
					<InputBase
						fullWidth
						multiline
						minRows={12}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Compose body"
						sx={{
							fontSize: 14,
							lineHeight: 1.7,
							fontFamily:
								'"Roboto", "Helvetica", "Arial", sans-serif',
						}}
					/>
				) : (
					<Typography
						component="div"
						sx={{
							whiteSpace: "pre-wrap",
							fontSize: 14,
							lineHeight: 1.7,
							color: "#202124",
							fontFamily:
								'"Roboto", "Helvetica", "Arial", sans-serif',
							wordBreak: "break-word",
						}}
					>
						{body}
					</Typography>
				)}

				<Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 1 }}>
					<Button
						variant="outlined"
						startIcon={<SendIcon />}
						onClick={handleSend}
						sx={{
							borderRadius: 999,
							borderColor: "#dadce0",
							color: "#0b57d0",
							"&:hover": {
								backgroundColor: "#f6fafe",
								borderColor: "#dadce0",
							},
						}}
					>
						Send
					</Button>
					<Button
						variant="outlined"
						startIcon={editMode ? <SaveIcon /> : <EditIcon />}
						onClick={clickEditButton}
						sx={{
							borderRadius: 999,
							borderColor: "#dadce0",
							color: mailOwnedByUser ? "#0b57d0" : "#5f6368",
							"&:hover": {
								backgroundColor: "#f6fafe",
								borderColor: "#dadce0",
							},
						}}
					>
						{editMode ? "Save" : "Edit"}
					</Button>
					<Button
						variant="outlined"
						startIcon={<ContentCopyIcon />}
						onClick={handleReuse}
						sx={{
							borderRadius: 999,
							borderColor: "#dadce0",
							color: loggedIn ? "#0b57d0" : "#5f6368",
							"&:hover": {
								backgroundColor: "#f6fafe",
								borderColor: "#dadce0",
							},
						}}
					>
						Reuse
					</Button>

					<Box sx={{ flex: 1 }} />

					<Tooltip title="Copy link">
						<IconButton onClick={handleCopyLink} sx={{ color: "#5f6368" }}>
							<LinkIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title="Share on Twitter">
						<IconButton onClick={handleTweet} sx={{ color: "#5f6368" }}>
							<TwitterIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title="Share on WhatsApp">
						<IconButton onClick={handleWhatsapp} sx={{ color: "#5f6368" }}>
							<WhatsappIcon />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
		</>
	);
};

const Email = ({
	loggedIn,
	emailObject,
	value,
	mailOwnedByUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const metadata: EmailMetadata = {
		value,
		createdAt: emailObject.createdAt ?? undefined,
	};
	return (
		<Layout>
			<MailViewer
				loggedIn={loggedIn}
				mailOwnedByUser={mailOwnedByUser}
				emailData={emailObject.data}
				metadata={metadata}
			/>
		</Layout>
	);
};

export default Email;
