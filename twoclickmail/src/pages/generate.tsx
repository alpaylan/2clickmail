import React, { useState, FormEvent, ChangeEvent } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import { Autocomplete, Chip } from "@mui/material";

import { useRouter } from 'next/router';

import { generate } from "../lib/requests/data";
import Layout from "@/components/layout";

import * as EmailValidator from "email-validator";



const Generate: React.FC = () => {
  const [to, setTo] = useState<string[]>([]);
  const [toInput, setToInput] = useState<string>("");
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();

  const CustomTypography = styled(Typography)`
  color: #000000; /* Change this to any color you want for the text */
  `;


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailData = {
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject,
      body: body,
    };

    const uniqueId = await generate(emailData);

    if (uniqueId) {
      router.push(
        {
          pathname: "/email",
          query: { requestType: 'id', value: uniqueId },
        }
      );
    } else {
      console.error("No unique id");
    }



  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <CustomTypography variant="h4" gutterBottom>
            Mass Mailing System
          </CustomTypography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSubject(e.target.value)
                }
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                multiple
                freeSolo
                selectOnFocus
                options={[]}
                value={to}
                onInputChange={(_, value) => {
                  setToInput(value);
                }}
                inputValue={toInput}
                onChange={(_, value) => { 
                  if (value.length > 0) {
                    const newValue = value[value.length - 1];
                    if (EmailValidator.validate(newValue)) {
                      setTo(value);
                    } else {
                      alert("Invalid email");
                      setToInput(toInput);
                    }
                  } else {
                    setTo(value) 
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    // eslint-disable-next-line react/jsx-key
                    <Chip 
                    clickable
                    variant="outlined" 
                    label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To"
                    placeholder="Type an email and press Enter"
                  />
                )}
              />

            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={15}
                value={body}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setBody(e.target.value)
                }
              />
            </Box>
            <Button type="submit" variant="contained" >
              Generate Two Click Mail
            </Button>
          </form>
        </Box>
      </Container>
    </Layout>
  );
};

export default Generate;
