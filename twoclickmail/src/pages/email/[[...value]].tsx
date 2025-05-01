// React Imports
import React, { use, useEffect } from "react";

// Next Imports
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

// Material UI Imports
import { Button, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Container, ThemeProvider } from "@mui/system";
import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Grid from "@mui/material/Grid";
import DraftIcon from "@mui/icons-material/Drafts";
import MailIcon from "@mui/icons-material/Mail";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import { createTheme } from "@mui/material/styles";
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
import { ShareButtonGroup } from "@/components/ShareButton";
import { MailChip } from "@/components/MailChip";
import Head from "next/head";

export type EmailMetadata = {
	value: string;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
};

const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#f5f5f5",
		},
	},
});

const OutlinedTextDisplay = ({
	label,
	text,
	setText,
	multiline = false,
	editMode,
}: {
	label: string;
	text: string;
	setText: (e: string) => void;
	multiline?: boolean;
	editMode: boolean;
}) => {
	return (
		<FormControl variant="outlined" sx={{ width: "100%" }}>
			<InputLabel htmlFor="outlined-text-display">{label}</InputLabel>
			<OutlinedInput
				id="outlined-text-display"
				value={text}
				inputProps={{ readOnly: !editMode, tabIndex: -1 }}
				multiline={multiline}
				fullWidth
				label={label}
				onChange={(e) => {
					setText(e.target.value);
				}}
			/>
		</FormControl>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { direct, value: query_value } = context.query as {
		direct?: string;
		value?: string;
	};
	console.log(`context: ${JSON.stringify(context.params)}`);
	const { value: params_value } = context.params ?? { value: undefined };

	const value = (params_value ? params_value[0] : undefined) || query_value;
	console.log(
		`query_value: ${query_value}, params_value: ${params_value}, value: ${value}`,
	);
	const emailObject = await fetchEmail({ value: value } as EmailGetRequest);
	if (!emailObject) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
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
		// biome-ignore lint/style/noNonNullAssertion: Checked in line 119.
		const profile = await fetchProfile(context.req.cookies.token!);
		if (!profile) {
			return {
				redirect: {
					destination: "/",
					permanent: false,
				},
			};
		}
		console.log(`email_id: ${JSON.stringify(value)}`);
		console.log(`profile: ${JSON.stringify(profile)}`);
		const emailIds = profile.emails.map((email) => email.id);
		console.log(`emailIds: ${JSON.stringify(emailIds)}`);
		if (emailIds.includes(value as string)) {
			mailOwnedByUser = true;
		}
	}

	console.log(`mailOwnedByUser: ${mailOwnedByUser}`);
	console.log(`emailObject: ${JSON.stringify(emailObject)}`);
	console.log(`loggedIn: ${loggedIn}`);
	console.log(`value: ${value}`);

	return {
		props: { loggedIn, emailObject, value, mailOwnedByUser },
	};
};

enum EmailGroup {
	to = "to",
	cc = "cc",
	bcc = "bcc",
}

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
	const [selectedEmailGroup, setSelectedEmailGroup] = React.useState(
		EmailGroup.to,
	);
	const [editMode, setEditMode] = React.useState(false);
	const router = useRouter();
	const mailto = generateMailto(emailData);

	const [to, setTo] = React.useState(emailData.to);
	const [cc, setCc] = React.useState(emailData.cc);
	const [bcc, setBcc] = React.useState(emailData.bcc);
	const [subject, setSubject] = React.useState(emailData.subject);
	const [body, setBody] = React.useState(emailData.body);
	const [previewText, setPreviewText] = React.useState(
		emailData.body.length > 100
			? `${emailData.body.substring(0, 100)}...`
			: emailData.body,
	);

	useEffect(() => {
		if (emailData.body.length > 100) {
			setPreviewText(`${emailData.body.substring(0, 100)}...`);
		} else {
			setPreviewText(emailData.body);
		}
	}, [emailData.body]);

	const emailGroups = {
		[EmailGroup.to]: { mails: to ? to : emailData.to, setMails: setTo },
		[EmailGroup.cc]: { mails: cc ? cc : emailData.cc, setMails: setCc },
		[EmailGroup.bcc]: { mails: bcc ? bcc : emailData.bcc, setMails: setBcc },
	};

	const clickEditButton = async () => {
		if (mailOwnedByUser) {
			if (editMode) {
				// Save the changes
				const newEmailData = {
					to: to,
					cc: cc,
					bcc: bcc,
					subject: subject,
					body: body,
				};
				const res = await postMail({
					mode: "update",
					id: metadata.value,
					email: newEmailData,
				});
				if (!res) {
					router.reload();
				}
			}
			setEditMode(!editMode);
		} else {
			if (!loggedIn) {
				alert("Please login to edit the mail");
			} else {
				alert("You can only edit mails that you have created");
			}
		}
	};

	const handleReuseEmail = async () => {
		if (!loggedIn) {
			alert("Please login to reuse the mail");
			return;
		}

		const uniqueId = await postMail({ mode: "generate", email: emailData });

		if (uniqueId) {
			router.push({
				pathname: "/email",
				query: { value: uniqueId },
			});
		} else {
			console.error("Mail could not be generated");
		}
	};
	return (
		<>
			<Head>
				<title>{emailData.subject}</title>
				{/* <meta name="description" content={previewText} /> */}

				<meta property="og:title" content={emailData.subject} />
				<meta property="og:description" content={previewText} />
				<meta
					property="og:image"
					content={`https://2clickmail.com/api/og/email?subject=${encodeURIComponent(
						emailData.subject,
					)}&preview=${encodeURIComponent(previewText)}`}
				/>
				<meta
					property="og:url"
					content={`https://2clickmail.com/email/${metadata.value}`}
				/>
				<meta property="og:type" content="website" />

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={emailData.subject} />
				<meta name="twitter:description" content={previewText} />
				{/* <meta name="twitter:image" content={imageUrl} /> */}
			</Head>

			<Container maxWidth="lg">
				<Box sx={{ my: 4 }}>
					<Paper style={{ padding: "20px" }}>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={2}>
								<List>
									<ListItem disablePadding>
										<ListItemButton
											onClick={() => setSelectedEmailGroup(EmailGroup.to)}
										>
											<ListItemIcon>
												{selectedEmailGroup === EmailGroup.to ? (
													<DraftIcon />
												) : (
													<MailIcon />
												)}
											</ListItemIcon>
											<ListItemText primary="To" />
										</ListItemButton>
									</ListItem>
									<ListItem disablePadding>
										<ListItemButton
											disabled={emailData.cc.length === 0}
											onClick={() => setSelectedEmailGroup(EmailGroup.cc)}
										>
											<ListItemIcon>
												{selectedEmailGroup === EmailGroup.cc ? (
													<DraftIcon />
												) : (
													<MailIcon />
												)}
											</ListItemIcon>
											<ListItemText primary="Cc" />
										</ListItemButton>
									</ListItem>
									<ListItem disablePadding>
										<ListItemButton
											disabled={emailData.bcc.length === 0}
											onClick={() => setSelectedEmailGroup(EmailGroup.bcc)}
										>
											<ListItemIcon>
												{selectedEmailGroup === EmailGroup.bcc ? (
													<DraftIcon />
												) : (
													<MailIcon />
												)}
											</ListItemIcon>
											<ListItemText primary="Bcc" />
										</ListItemButton>
									</ListItem>
								</List>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<MailChip
									mailState={emailGroups[selectedEmailGroup]}
									editMode={editMode}
									key={selectedEmailGroup}
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={5}>
								<Grid container spacing={2} rowSpacing={2}>
									<Grid item xs={12} sm={12}>
										<OutlinedTextDisplay
											label="Subject"
											text={subject}
											setText={setSubject}
											editMode={editMode}
										/>
									</Grid>
									<Grid item xs={12} sm={12}>
										<OutlinedTextDisplay
											label="Body"
											text={body}
											setText={setBody}
											multiline={true}
											editMode={editMode}
										/>
									</Grid>
								</Grid>
							</Grid>
							<Grid item xs={12} sm={6} md={1}>
								<ShareButtonGroup
									subject={subject}
									url={`${process.env.PUBLIC_URL}/email/${metadata.value}`}
								/>
							</Grid>

							<Grid item xs={4} sm={4} md={2}>
								<Link href={mailto} target="_blank" rel="noopener noreferrer">
									<Button
										variant="contained"
										color="primary"
										startIcon={<SendIcon />}
										onClick={() =>
											postMail({
												mode: "increment_sent_count",
												id: metadata.value,
											} as EmailIncrementSentCountRequest)
										}
									>
										Send
									</Button>
								</Link>
							</Grid>
							<Grid item xs={4} sm={4} md={2}>
								<ThemeProvider theme={theme}>
									<Button
										variant="contained"
										color={mailOwnedByUser ? "primary" : "secondary"}
										startIcon={editMode ? <SaveIcon /> : <EditIcon />}
										onClick={clickEditButton}
									>
										{editMode ? "Save" : "Edit"}
									</Button>
								</ThemeProvider>
							</Grid>
							<Grid item xs={4} sm={4} md={2}>
								<ThemeProvider theme={theme}>
									<Button
										variant="contained"
										color={loggedIn ? "primary" : "secondary"}
										startIcon={<ContentCopyIcon />}
										onClick={handleReuseEmail}
									>
										Reuse
									</Button>
								</ThemeProvider>
							</Grid>
						</Grid>
					</Paper>
				</Box>
			</Container>
		</>
	);
};

const Email = ({
	loggedIn,
	emailObject,
	value,
	mailOwnedByUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const metadata: EmailMetadata = { value };
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
