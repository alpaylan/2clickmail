
import React, { useState, useEffect } from "react";

import { fetchProfile } from "@/lib/requests/data";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { EmailObject } from "@/lib/types";

import Link from 'next/link';
import { Container } from "@mui/system";
import Layout from "@/components/layout";
import { Box } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
} from "@fortawesome/free-solid-svg-icons";


const Profile: React.FC = () => {
  const [mails, setMails] = useState<EmailObject[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const profile = await fetchProfile();
      if (profile) {
        console.log(profile.emails);
        setMails(profile.emails);
      }
    };
    fetch();
  }, []);

  return (
    <Layout>
      <Container>
        <Box sx={{
        backgroundColor: 'background.paper',
        borderRadius: '4px',
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.3)',
        padding: '2rem',
        marginTop: '2rem',
        marginBottom: '2rem',
      }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>To</b></TableCell>
                  <TableCell><b>Subject</b></TableCell>
                  <TableCell><b>Link</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mails.map(mail => (
                  <TableRow key={mail._id}>
                    <TableCell>{mail.data.to}</TableCell>
                    <TableCell>{mail.data.subject}</TableCell>
                    <TableCell><Link href={`/email?requestType=id&value=${mail._id}`}>
                      <FontAwesomeIcon icon={faLink} />
                  </Link></TableCell>
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