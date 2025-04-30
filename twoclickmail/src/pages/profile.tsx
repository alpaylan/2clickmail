import type React from "react";

import { fetchProfile } from "@/lib/requests/data";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@material-ui/core";
import { EmailObject, type ProfileData } from "@/lib/types";

import Link from "next/link";
import { Container } from "@mui/system";
import Layout from "@/components/layout";
import { Box } from "@mui/material";

import LaunchIcon from "@mui/icons-material/Launch";

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = (async (context) => {
	const { token } = context.req.cookies;

	if (!token) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	const profile = await fetchProfile(token);

	if (!profile) {
		context.res.setHeader('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: { profile },
	};
}) satisfies GetServerSideProps<{ profile: ProfileData }>;

const Profile: React.FC = (
	props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
	const { profile } = props as { profile: ProfileData };

	return (
		<Layout>
			<Container>
				<Box
					sx={{
						backgroundColor: "background.paper",
						borderRadius: "4px",
						boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.3)",
						padding: "2rem",
						marginTop: "2rem",
						marginBottom: "2rem",
					}}
				>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>
										<b>To</b>
									</TableCell>
									<TableCell>
										<b>Subject</b>
									</TableCell>
									<TableCell>
										<b>Count</b>
									</TableCell>
									<TableCell>
										<b>Link</b>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{profile.emails.map((mail) => (
									<TableRow key={mail.id}>
										<TableCell>{mail.data.to}</TableCell>
										<TableCell>{mail.data.subject}</TableCell>
										<TableCell>{mail.count}</TableCell>
										<TableCell>
											<Link href={`/email/${mail.id}`}>
												<LaunchIcon />
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			</Container>
		</Layout>
	);
};

export default Profile;
