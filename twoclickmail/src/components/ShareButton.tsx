// components/ShareButton.tsx

import React from 'react';
import copy from 'copy-to-clipboard';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTwitter,
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

import {
    faCopy
} from "@fortawesome/free-solid-svg-icons";



interface ShareButtonProps {
    url: string;
}


const ShareButton: React.FC<ShareButtonProps> = ({ url }) => {

    const handleTwitterShare = () => {
        const text = encodeURIComponent('Check out this amazing website:');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent('Check out this amazing website:');
        const whatsappUrl = `https://wa.me/?text=${text} ${encodeURIComponent(url)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleCopyLink = () => {
        copy(url);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleTwitterShare} variant="contained" color="primary">
                <FontAwesomeIcon icon={faTwitter} size='2xl' />
            </Button>
            <Button onClick={handleWhatsAppShare} variant="contained" color="primary">
                <FontAwesomeIcon icon={faWhatsapp} size='2xl'/>
            </Button>
            <Button onClick={handleCopyLink} variant="contained" color="primary">
                <FontAwesomeIcon icon={faCopy} size='2xl'/>
            </Button>
        </Box>
    );
};

export default ShareButton;

