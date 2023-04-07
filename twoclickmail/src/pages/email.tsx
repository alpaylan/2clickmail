// React Imports
import React from "react";

// Next Imports
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

// Material UI Imports
import { Button, Paper, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Container } from "@mui/system";

// Local Imports
import { fetchEmail } from "@/lib/requests/data";
import { EmailRequest } from "@/lib/types";
import { generateMailto } from "@/lib/common";

// Local Components
import Layout from "@/components/layout";
import ShareButton from "@/components/ShareButton";
import { MailChip } from "@/components/MailChip";


export const getServerSideProps: GetServerSideProps = async (context) => {

    console.log(context);
    const { type, value } = context.query;

    console.log(type, value);

    const emailObject = await fetchEmail({ type, value } as EmailRequest);

    // if (!emailObject) {
    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: false,
    //         },
    //     }
    // }

    return {
        props: { emailObject, type, value },
    }
}

const Email = ({ emailObject, requestType, value }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const emailData = emailObject.data;

    const mailto = generateMailto(emailData);

    return (
        <Layout>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom>
                    Email Preview
                </Typography>
                <Box sx={{ my: 4 }}>
                    <Paper>
                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h1" gutterBottom>
                                <b>Subject:</b> {emailData.subject}
                            </Typography>
                            <Typography variant="h5" component="h1" gutterBottom>
                                <b>To:</b> {MailChip(emailData.to)}
                            </Typography>
                            {(emailData.cc.length > 0) && (
                                <Typography variant="h5" component="h1" gutterBottom>
                                    <b>CC:</b> {MailChip(emailData.cc)}
                                </Typography>
                            )}
                            {(emailData.bcc.length > 0) && (
                                <Typography variant="h5" component="h1" gutterBottom>
                                    <b>BCC:</b> {MailChip(emailData.bcc)}
                                </Typography>
                            )}
                            <Typography variant="h6" component="p" gutterBottom>
                                {emailData.body.split("\n").map((item: string, key: number) => {
                                    return (
                                        <span key={key}>
                                            {item}
                                            <br />
                                        </span>
                                    );
                                })

                                }
                            </Typography>

                            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Link href={mailto} target="_blank" rel="noopener noreferrer">
                                    <Button variant="contained" color="primary">
                                        Send
                                    </Button>
                                </Link>
                                <ShareButton url={`${process.env.PUBLIC_URL}/email?requestType=${requestType}&value=${value}`} />
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Layout>
    );

};

export default Email;