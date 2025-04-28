// components/ShareButton.tsx

import React from 'react';
import copy from 'copy-to-clipboard';

import { Fab } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsappIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Grid from '@mui/material/Grid';


export const ShareButtonGroup = ({ subject, url }: { subject: string, url: string }) => {
    const handleTwitterShare = () => {
        const text = encodeURIComponent(`Check out this email campaign for ${subject}:`);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(`Check out this email campaign for ${subject}:`);
        const whatsappUrl = `https://wa.me/?text=${text} ${encodeURIComponent(url)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleLinkShare = () => {
        copy(url);
    };

    return (
        <Grid container spacing={2} rowSpacing={2}>
            <Grid item xs={4} sm={4} md={12}>
                <Fab color="primary" onClick={handleTwitterShare}>
                    <TwitterIcon />
                </Fab>
            </Grid>
            <Grid item xs={4} sm={4} md={12}>
                <Fab color="primary" onClick={handleWhatsAppShare}>
                    <WhatsappIcon />
                </Fab>
            </Grid>
            <Grid item xs={4} sm={4} md={12}>
                <Fab color="primary" onClick={handleLinkShare}>
                    <ContentCopyIcon />
                </Fab>
            </Grid>
        </Grid>
    );
}

