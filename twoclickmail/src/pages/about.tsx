
import * as React from 'react';
import Layout from '@/components/layout';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Container, Paper } from '@mui/material';
import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';

const About = () => {

    return (
        <Layout>
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
                                <Typography variant="h5" component="h1" gutterBottom>
                                    About
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    This is a simple website that allows you to create, view and share email templates.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    This project is open source and you can find the source code on <Link href="https://github.com/alpaylan/2clickmail"><GitHubIcon fontSize='medium'/> </Link>.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Layout>
    );
};

export default About;
