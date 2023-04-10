// React Imports
import React from "react";

// Next Imports
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

// Material UI Imports
import { Button, Fab, IconButton, Modal, Paper, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Container } from "@mui/system";

// Local Imports
import { fetchEmail } from "@/lib/requests/data";
import { EmailData, EmailRequest } from "@/lib/types";
import { generateMailto } from "@/lib/common";
import { MailEditForm } from "./generate";
// Local Components
import Layout from "@/components/layout";
import { ShareButtonGroup } from "@/components/ShareButton";
import { MailChip } from "@/components/MailChip";

import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Grid from '@mui/material/Grid';
import DraftIcon from '@mui/icons-material/Drafts';
import MailIcon from '@mui/icons-material/Mail';

import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsappIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { generate } from "@/lib/requests/data";

export type EmailMetadata = {
    value: string,
    createdAt?: string,
    updatedAt?: string,
    createdBy?: string,
}


const OutlinedTextDisplay = ({ label, text, multiline = false }: { label: string, text: string, multiline?: boolean }) => {
    return (
        <FormControl variant="outlined" sx={{ width: '100%' }}>
            <InputLabel htmlFor="outlined-text-display">{label}</InputLabel>
            <OutlinedInput
                id="outlined-text-display"
                value={text}
                inputProps={{ readOnly: true, tabIndex: -1 }}
                multiline={multiline}
                fullWidth
                label={label}
            />
        </FormControl>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { value } = context.query;
    const emailObject = await fetchEmail({ value } as EmailRequest);
    if (!emailObject) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
    const loggedIn = !!context.req.cookies.token;
    return {
        props: { loggedIn, emailObject, value },
    }
}



const EmailList = ({ emails }: { emails: string[] }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, margin: '10px' }}>
            {emails.map((email: string) => {
                return (
                    <Button variant="outlined" size="small" key={email}>
                        {email}
                    </Button>
                );
            })}
        </Box>
    );
};

enum EmailGroup {
    to = 'to',
    cc = 'cc',
    bcc = 'bcc'
}



const MailViewer = ({ emailData, metadata }: { emailData: EmailData, metadata: EmailMetadata }) => {
    const [selectedEmailGroup, setSelectedEmailGroup] = React.useState(EmailGroup.to);
    const [editWindowOpen, setEditWindowOpen] = React.useState(false);
    const router = useRouter();
    const mailto = generateMailto(emailData);

    const handleReuseEmail = async (emailData: EmailData) => {
        const uniqueId = await generate(emailData, null);

        if (uniqueId) {
            router.push(
                {
                    pathname: "/email",
                    query: { "value": uniqueId },
                }
            );
        } else {
            console.error("Mail could not be generated");
        }
    }
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Paper style={{ padding: '20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => setSelectedEmailGroup(EmailGroup.to)}>
                                        <ListItemIcon>
                                            {(selectedEmailGroup == EmailGroup.to ?
                                                <DraftIcon /> :
                                                <MailIcon />)}
                                        </ListItemIcon>
                                        <ListItemText primary="To" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton disabled={emailData.cc.length == 0} onClick={() => setSelectedEmailGroup(EmailGroup.cc)}>
                                        <ListItemIcon>
                                            {(selectedEmailGroup == EmailGroup.cc ?
                                                <DraftIcon /> :
                                                <MailIcon />)}
                                        </ListItemIcon>
                                        <ListItemText primary="Cc" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton disabled={emailData.bcc.length == 0} onClick={() => setSelectedEmailGroup(EmailGroup.bcc)}>
                                        <ListItemIcon>
                                            {(selectedEmailGroup == EmailGroup.bcc ?
                                                <DraftIcon /> :
                                                <MailIcon />)}
                                        </ListItemIcon>
                                        <ListItemText primary="Bcc" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <MailChip mails={emailData[selectedEmailGroup]} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={5}>
                            <Grid container spacing={2} rowSpacing={2}>
                                <Grid item xs={12} sm={12}>
                                    <OutlinedTextDisplay
                                        label="Subject"
                                        text={emailData.subject}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <OutlinedTextDisplay
                                        label="Body"
                                        text={emailData.body}
                                        multiline={true}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                            <ShareButtonGroup url={`${process.env.PUBLIC_URL}/email?value=${metadata.value}`} />
                        </Grid>

                        <Grid item xs={4} sm={6} md={2}>
                            <Link href={mailto} target="_blank" rel="noopener noreferrer">
                                <Button variant="contained" color="primary" startIcon={<SendIcon />}>
                                    Send
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item xs={4} sm={6} md={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => setEditWindowOpen(true)}>
                                Edit
                            </Button>
                            <Modal
                                open={editWindowOpen}
                                onClose={() => setEditWindowOpen(false)}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box sx={{
                                    position: 'absolute' as 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80%',
                                    bgcolor: 'background.paper',
                                    border: '2px solid #000',
                                    boxShadow: 24,
                                    p: 4,
                                }}>
                                    <Grid container spacing={2} rowSpacing={4}>
                                        <Grid item xs={12} sm={12} md={12}>
                                            <IconButton
                                                edge="end"
                                                onClick={() => setEditWindowOpen(false)}
                                                aria-label="close"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    zIndex: 1,
                                                    margin: '10px',
                                                }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12}>
                                            <MailEditForm
                                                emailData={emailData}
                                                id={metadata.value}
                                                mode='edit'
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Modal>

                        </Grid>
                        <Grid item xs={4} sm={6} md={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<ContentCopyIcon />}
                                onClick={
                                    () => handleReuseEmail(emailData)
                                }>
                                Reuse
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

        </Container>
    );
}



const Email = ({ loggedIn, emailObject, value }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const metadata: EmailMetadata = { value };
    return (
        <Layout>
            <MailViewer emailData={emailObject.data} metadata={metadata} />
        </Layout>
    )
}


// const Email = ({ loggedIn, emailObject, type, value }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

//     const emailData = emailObject.data;
//     const mailto = generateMailto(emailData);

//     const router = useRouter();

//     const editEmail = () => {
//         router.push(
//             {
//                 pathname: '/generate',
//                 query: { type, value },
//             }
//         );
//     }



//     return (
//         <Layout>
//             <Container maxWidth="lg">
//                 <Box sx={{ my: 4 }}>
//                     <Typography variant="h4" component="h1" style={{ color: '#000000' }} gutterBottom>
//                         Email Preview
//                     </Typography>
//                 </Box>
//                 <Box sx={{ my: 4, }}>
//                     <Paper>
//                         <Grid container spacing={2}>
//                             <Grid item xs={2} sm={3}>
//                                 {MailChip(emailData.to, "To")}
//                             </Grid>
//                             <Grid item xs={2} sm={3}>
//                                 {MailChip(emailData.cc, "CC")}
//                             </Grid>
//                             <Grid item xs={2} sm={3}>
//                                 {MailChip(emailData.bcc, "BCC")}
//                             </Grid>
//                             {(loggedIn &&
//                             <Grid item xs={2} sm={3}>
//                                 <Box sx={{ display: 'flex', alignItems: 'right', gap: 2, margin: '10px' }}>
//                                     <Fab size="small" onClick={editEmail}>
//                                         <EditIcon />
//                                     </Fab>
//                                 </Box>
//                             </Grid>)}
//                         </Grid>
//                         <Box>
//                             <Typography variant="h6" >
//                                 <b>Subject:</b> {emailData.subject}
//                             </Typography>
//                         </Box>
//                         <Typography variant="h6" component="p" gutterBottom>
//                             {emailData.body.split("\n").map((item: string, key: number) => {
//                                 return (
//                                     <span key={key}>
//                                         {item}
//                                         <br />
//                                     </span>
//                                 );
//                             })

//                             }
//                         </Typography>

//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', padding: '5px' }}>
//                             <Link href={mailto} target="_blank" rel="noopener noreferrer">
//                                 <Fab variant="extended" size="small">
//                                     <SendIcon sx={{ mr: 1 }} />
//                                     Send
//                                 </Fab>
//                             </Link>
//                             <ShareButton url={`${process.env.PUBLIC_URL}/email?type=${type}&value=${value}`} />
//                         </Box>
//                     </Paper>
//                 </Box >
//             </Container >
//         </Layout >
//     );

// };

export default Email;