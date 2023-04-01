import { Container } from "@mui/system";
import React from "react";
import Box from "@mui/material/Box";
import { Button, Paper, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import { useRouter } from "next/router";
import { fetchEmail } from "../lib/requests/data";

import { useState, useEffect } from 'react';
import { EmailData, EmailObject, EmailRequest } from "@/lib/types";
import { generateMailto } from "@/lib/common";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Layout from "@/components/layout";
import ShareButton from "@/components/ShareButton";

// Assuming the fetchWebsiteData function is in the same file, otherwise import it

function CommaSeparatedMail(to: string[]) {
    // A set of mail addresses put into small bubbles
    const style = {
        display: "flex",
        listStyle: "none",
        padding: 0,
        margin: 0,
        backgroundColor: "white",
        borderRadius: "5px",
        border: "1px solid #ced4da",
        boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    };

    const chipStyle = {
        margin: "5px",
    };

    return (
        <Box sx={{ width: 500, maxWidth: 500, bgcolor: "background.paper" }}>
            <ul style={style}>
                {to.map((data) => {
                    return (
                        <li key={data}>
                            <Chip label={data} style={chipStyle} />
                        </li>
                    );
                })}
            </ul>
        </Box>
    );
}


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { requestType, value } = context.query;
    const emailObject = await fetchEmail({ type: requestType, value: value } as EmailRequest);

    if (!emailObject) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: { emailObject, requestType, value }, // will be passed to the page component as props
    }
}

const Email = ({ emailObject, requestType, value }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const emailData = emailObject.data;
    // console.log(emailData);
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
                                <b>To:</b> {CommaSeparatedMail(emailData.to)}
                            </Typography>
                            {(emailData.cc.length > 0) && (
                                <Typography variant="h5" component="h1" gutterBottom>
                                    <b>CC:</b> {CommaSeparatedMail(emailData.cc)}
                                </Typography>
                            )}
                            {(emailData.bcc.length > 0) && (
                                <Typography variant="h5" component="h1" gutterBottom>
                                    <b>BCC:</b> {CommaSeparatedMail(emailData.bcc)}
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
                                <ShareButton url={`http://localhost:3000/email?requestType=${requestType}&value=${value}`} />
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Layout>
    );

};

export default Email;