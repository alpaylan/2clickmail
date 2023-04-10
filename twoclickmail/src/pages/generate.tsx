// React Imports
import React, { useState, FormEvent, ChangeEvent } from "react";

// Next Imports
import { useRouter } from 'next/router';

// Material UI Imports
import { Alert, Autocomplete, Chip } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { styled } from "@mui/system";
import Grid from "@mui/material/Grid";
// External Imports
import * as EmailValidator from "email-validator";

// Local Imports
import { generate } from "@/lib/requests/data";

// Local Components
import Layout from "@/components/layout";
import { ButtonGroup } from "@mui/material";
import { EmailData } from "@/lib/types";
import { EmailMetadata } from "./email";
import { useMediaQuery } from "@mui/material";

type MailBoxProps = {
  name: string;
  emails: string[];
  setEmails: (emails: string[]) => void;
  input: string;
  setInput: (input: string) => void;
};


const MailBox = ({ name, emails, setEmails, input, setInput }: MailBoxProps) => {
  return (<Autocomplete
    multiple
    freeSolo
    selectOnFocus
    options={[]}
    value={emails}
    onInputChange={(_, value) => {
      setInput(value);
    }}
    inputValue={input}
    onChange={(_, value) => {
      if (value.length > 0) {
        const newValues = (value.pop() as string).split(/,| |;/).filter((v: string) => v !== "");

        const invalidValues = [];

        for (let i = 0; i < newValues.length; i++) {


          if (EmailValidator.validate(newValues[i])) {
            value.push(newValues[i]);
          } else {
            invalidValues.push(newValues[i]);
          }
        }

        setEmails(value);

        if (invalidValues.length > 0) {
          alert("Invalid email(s) found: " + invalidValues.join(", "));
          setInput(invalidValues.join(", "));
        }


      } else {
        setEmails(value)
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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          {...params}
          label={name}
          placeholder="Type an email and press Enter"
        // style={{ width: "90%" }}
        />
        {/* <Button>
          <FileUploadIcon />
        </Button> */}
      </Box>
    )}
  />)
}

const extractEmails = (emails: string) => {
  const validMails = [];
  const invalidMails = [];

  const newValues = emails.split(/,| |;/).filter((v: string) => v !== "");

  for (let i = 0; i < newValues.length; i++) {
    if (EmailValidator.validate(newValues[i])) {
      validMails.push(newValues[i]);
    } else {
      invalidMails.push(newValues[i]);
    }
  }

  return { validMails, invalidMails };
}


export const MailEditForm = ({ emailData = { to: [], cc: [], bcc: [], subject: '', body: '' }, id = null, mode = 'generate' }: { emailData?: EmailData, id?: string | null, mode: string }) => {
  const [to, setTo] = useState<string[]>(emailData.to);
  const [toInput, setToInput] = useState<string>("");
  const [toErrorMessage, setToErrorMessage] = useState<string>("");

  const [useCc, setUseCc] = useState(emailData.cc.length > 0);
  const [cc, setCc] = useState<string[]>(emailData.cc);
  const [ccInput, setCcInput] = useState<string>("");
  const [ccErrorMessage, setCcErrorMessage] = useState<string>("");

  const [useBcc, setUseBcc] = useState(emailData.bcc.length > 0);
  const [bcc, setBcc] = useState<string[]>(emailData.bcc);
  const [bccInput, setBccInput] = useState<string>("");
  const [bccErrorMessage, setBccErrorMessage] = useState<string>("");

  const [subject, setSubject] = useState(emailData.subject);
  const [subjectErrorMessage, setSubjectErrorMessage] = useState<string>("");

  const [body, setBody] = useState(emailData.body);
  const [bodyErrorMessage, setBodyErrorMessage] = useState<string>("");

  const matches = useMediaQuery('(min-width:600px)');

  const router = useRouter();



  const handleSubmit = async (e: FormEvent) => {


    e.preventDefault();
    console.log("Submitted");
    let valid = true;
    const { validMails: toValidMails, invalidMails: toInvalidMails } = extractEmails(toInput);
    const { validMails: ccValidMails, invalidMails: ccInvalidMails } = extractEmails(ccInput);
    const { validMails: bccValidMails, invalidMails: bccInvalidMails } = extractEmails(bccInput);
    if (toInput.length > 0) {
      setTo([...to, ...toValidMails]);
      setToInput(toInvalidMails.join(", "));

      if (toInvalidMails.length > 0) {
        setToErrorMessage("Invalid email(s) found: " + toInvalidMails.join(", "));
        valid = false;
      } else {
        setToErrorMessage("");
      }
    } else if (to.length === 0) {
      setToErrorMessage("Please enter at least one email in the To field");
      valid = false;
    } else {
      setToErrorMessage("");
    }


    if (subject.length === 0) {
      setSubjectErrorMessage("Please enter a subject");
      valid = false;
    } else {
      setSubjectErrorMessage("");
    }

    if (body.length === 0) {
      setBodyErrorMessage("Please enter a body");
      valid = false;
    } else {
      setBodyErrorMessage("");
    }

    if (useCc && ccInput.length > 0) {

      setCc([...cc, ...ccValidMails]);
      setCcInput(ccInvalidMails.join(", "));

      if (ccInvalidMails.length > 0) {
        setCcErrorMessage("Invalid email(s) found: " + ccInvalidMails.join(", "));
        valid = false;
      } else {
        setCcErrorMessage("");
      }
    } else {
      setCcErrorMessage("");
    }


    if (useBcc && bccInput.length > 0) {

      setBcc([...bcc, ...bccValidMails]);
      setBccInput(bccInvalidMails.join(", "));

      if (bccInvalidMails.length > 0) {
        setBccErrorMessage("Invalid email(s) found: " + bccInvalidMails.join(", "));
        valid = false;
      } else {
        setBccErrorMessage("");
      }
    } else {
      setBccErrorMessage("");
    }


    if (!valid) {
      return;
    }

    const emailData = {
      to: [...to, ...toValidMails],
      cc: [...cc, ...ccValidMails],
      bcc: [...bcc, ...bccValidMails],
      subject: subject,
      body: body,
    };

    console.log(emailData);

    const uniqueId = await generate(emailData, id);


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


  };

  return (

    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>

        <Grid container spacing={2}>
          <Grid item xs={9}>
            {(toErrorMessage &&
              <Box sx={{ mb: 2 }}><Alert severity="error">{toErrorMessage}</Alert></Box>)}
            <MailBox
              name="To"
              emails={to}
              setEmails={setTo}
              input={toInput}
              setInput={setToInput}
            />
          </Grid>
          <Grid item xs={2}>
            <ButtonGroup orientation={matches ? 'horizontal' : 'vertical'}>
              <Button variant={useCc ? "contained" : "outlined"} onClick={() => (setUseCc(!useCc))} >  Cc: </Button>
              <Button variant={useBcc ? "contained" : "outlined"} onClick={() => (setUseBcc(!useBcc))}> Bcc: </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        {((useCc && ccErrorMessage) &&
          <Alert severity="error">{ccErrorMessage}</Alert>)}
        {(useCc &&
          <MailBox name="Cc" emails={cc} setEmails={setCc} input={ccInput} setInput={setCcInput} />
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
      {((useBcc && bccErrorMessage) &&
          <Alert severity="error">{bccErrorMessage}</Alert>)}
        {(useBcc &&
          <MailBox name="Bcc" emails={bcc} setEmails={setBcc} input={bccInput} setInput={setBccInput} />
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
      {((subjectErrorMessage) &&
          <Alert severity="error">{subjectErrorMessage}</Alert>)}
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
      {((bodyErrorMessage) &&
          <Alert severity="error">{bodyErrorMessage}</Alert>)}
        <TextField
          fullWidth
          label="Body"
          multiline
          rows={15}
          value={body}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setBody(e.target.value)
          }
        />
      </Box>
      <Button type="submit" variant="contained" >
        {
          mode === 'generate' ? 'Generate Mail' : 'Save'
        }
      </Button>
    </form>
  );
}


const Generate: React.FC = () => {

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom style={{ color: '#000000' }}>
            Mass Mailing System
          </Typography>
          <MailEditForm mode='generate' />
        </Box>
      </Container>
    </Layout>
  );
};


export default Generate;