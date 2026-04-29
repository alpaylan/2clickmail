// React Imports
import type React from "react";
import { useState, type FormEvent, type ChangeEvent } from "react";

// Next Imports
import { useRouter } from "next/router";

// Material UI Imports
import { Alert, Autocomplete, Chip } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";

import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ImageIcon from "@mui/icons-material/Image";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";

// External Imports
import * as EmailValidator from "email-validator";

// Local Imports
import { postMail } from "@/lib/requests/data";
import type {
  EmailData,
  EmailPostRequest,
  EmailGenerateRequest,
  EmailUpdateRequest,
} from "@/lib/types";

// Local Components
import Layout from "@/components/layout";

type MailBoxProps = {
  name: string;
  emails: string[];
  setEmails: (emails: string[]) => void;
  input: string;
  setInput: (input: string) => void;
  rightAdornment?: React.ReactNode;
};

const RecipientRow = ({
  name,
  emails,
  setEmails,
  input,
  setInput,
  rightAdornment,
}: MailBoxProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: "1px solid var(--gmail-border)",
        px: 2,
        minHeight: 40,
      }}
    >
      <Typography
        sx={{ width: 40, color: "#5f6368", fontSize: 14, flexShrink: 0 }}
      >
        {name}
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        selectOnFocus
        sx={{ flex: 1 }}
        options={[]}
        value={emails}
        onInputChange={(_, value) => setInput(value)}
        inputValue={input}
        onChange={(_, value) => {
          if (value.length > 0) {
            const newValues = (value.pop() as string)
              .split(/,| |;/)
              .filter((v: string) => v !== "");

            const invalidValues: string[] = [];
            for (let i = 0; i < newValues.length; i++) {
              if (EmailValidator.validate(newValues[i])) {
                value.push(newValues[i]);
              } else {
                invalidValues.push(newValues[i]);
              }
            }
            setEmails(value);
            if (invalidValues.length > 0) {
              setInput(invalidValues.join(", "));
            }
          } else {
            setEmails(value);
          }
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...rest } = getTagProps({ index });
            return (
              <Chip
                clickable
                size="small"
                key={key}
                label={option}
                sx={{
                  backgroundColor: "#e8f0fe",
                  color: "#1a73e8",
                  borderRadius: 999,
                  fontSize: 13,
                }}
                {...rest}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder="Recipients"
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              sx: { fontSize: 14 },
            }}
          />
        )}
      />
      {rightAdornment}
    </Box>
  );
};

const extractEmails = (emails: string) => {
  const validMails: string[] = [];
  const invalidMails: string[] = [];
  const newValues = emails.split(/,| |;/).filter((v) => v !== "");
  for (const v of newValues) {
    if (EmailValidator.validate(v)) validMails.push(v);
    else invalidMails.push(v);
  }
  return { validMails, invalidMails };
};

export const MailEditForm = ({
  emailData = { to: [], cc: [], bcc: [], subject: "", body: "" },
  id = null,
  mode = "generate",
}: {
  emailData?: EmailData;
  id?: string | null;
  mode: string;
}) => {
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

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let valid = true;
    const { validMails: toValidMails, invalidMails: toInvalidMails } =
      extractEmails(toInput);
    const { validMails: ccValidMails, invalidMails: ccInvalidMails } =
      extractEmails(ccInput);
    const { validMails: bccValidMails, invalidMails: bccInvalidMails } =
      extractEmails(bccInput);

    if (toInput.length > 0) {
      setTo([...to, ...toValidMails]);
      setToInput(toInvalidMails.join(", "));
      if (toInvalidMails.length > 0) {
        setToErrorMessage(`Invalid email(s) found: ${toInvalidMails.join(", ")}`);
        valid = false;
      } else setToErrorMessage("");
    } else if (to.length === 0) {
      setToErrorMessage("Please enter at least one email in the To field");
      valid = false;
    } else setToErrorMessage("");

    if (subject.length === 0) {
      setSubjectErrorMessage("Please enter a subject");
      valid = false;
    } else setSubjectErrorMessage("");

    if (body.length === 0) {
      setBodyErrorMessage("Please enter a body");
      valid = false;
    } else setBodyErrorMessage("");

    if (useCc && ccInput.length > 0) {
      setCc([...cc, ...ccValidMails]);
      setCcInput(ccInvalidMails.join(", "));
      if (ccInvalidMails.length > 0) {
        setCcErrorMessage(`Invalid email(s) found: ${ccInvalidMails.join(", ")}`);
        valid = false;
      } else setCcErrorMessage("");
    } else setCcErrorMessage("");

    if (useBcc && bccInput.length > 0) {
      setBcc([...bcc, ...bccValidMails]);
      setBccInput(bccInvalidMails.join(", "));
      if (bccInvalidMails.length > 0) {
        setBccErrorMessage(`Invalid email(s) found: ${bccInvalidMails.join(", ")}`);
        valid = false;
      } else setBccErrorMessage("");
    } else setBccErrorMessage("");

    if (!valid) return;

    const newEmail = {
      to: [...to, ...toValidMails],
      cc: [...cc, ...ccValidMails],
      bcc: [...bcc, ...bccValidMails],
      subject,
      body,
    };

    const req: EmailPostRequest =
      mode === "generate"
        ? ({ mode: "generate", email: newEmail } as EmailGenerateRequest)
        : ({ mode: "update", email: newEmail, id } as EmailUpdateRequest);

    const uniqueId = await postMail(req);

    if (uniqueId) {
      router.push({ pathname: "/email", query: { value: uniqueId } });
    } else {
      console.error("Mail could not be generated");
    }
  };

  const ccBccToggle = (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {!useCc && (
        <Button
          size="small"
          onClick={() => setUseCc(true)}
          sx={{ color: "#5f6368", minWidth: 0, fontSize: 13 }}
        >
          Cc
        </Button>
      )}
      {!useBcc && (
        <Button
          size="small"
          onClick={() => setUseBcc(true)}
          sx={{ color: "#5f6368", minWidth: 0, fontSize: 13 }}
        >
          Bcc
        </Button>
      )}
    </Box>
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {(toErrorMessage ||
        ccErrorMessage ||
        bccErrorMessage ||
        subjectErrorMessage ||
        bodyErrorMessage) && (
        <Box sx={{ p: 1 }}>
          {toErrorMessage && <Alert severity="error">{toErrorMessage}</Alert>}
          {ccErrorMessage && <Alert severity="error">{ccErrorMessage}</Alert>}
          {bccErrorMessage && <Alert severity="error">{bccErrorMessage}</Alert>}
          {subjectErrorMessage && (
            <Alert severity="error">{subjectErrorMessage}</Alert>
          )}
          {bodyErrorMessage && <Alert severity="error">{bodyErrorMessage}</Alert>}
        </Box>
      )}

      <RecipientRow
        name="To"
        emails={to}
        setEmails={setTo}
        input={toInput}
        setInput={setToInput}
        rightAdornment={ccBccToggle}
      />
      {useCc && (
        <RecipientRow
          name="Cc"
          emails={cc}
          setEmails={setCc}
          input={ccInput}
          setInput={setCcInput}
          rightAdornment={
            <IconButton size="small" onClick={() => setUseCc(false)}>
              <CloseIcon fontSize="small" sx={{ color: "#5f6368" }} />
            </IconButton>
          }
        />
      )}
      {useBcc && (
        <RecipientRow
          name="Bcc"
          emails={bcc}
          setEmails={setBcc}
          input={bccInput}
          setInput={setBccInput}
          rightAdornment={
            <IconButton size="small" onClick={() => setUseBcc(false)}>
              <CloseIcon fontSize="small" sx={{ color: "#5f6368" }} />
            </IconButton>
          }
        />
      )}

      <Box
        sx={{
          borderBottom: "1px solid var(--gmail-border)",
          px: 2,
          minHeight: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <InputBase
          fullWidth
          placeholder="Subject"
          value={subject}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSubject(e.target.value)
          }
          sx={{ fontSize: 14, fontWeight: 500 }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 320, p: 2 }}>
        <InputBase
          fullWidth
          multiline
          minRows={12}
          placeholder="Compose email"
          value={body}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setBody(e.target.value)
          }
          sx={{ fontSize: 14, alignItems: "flex-start" }}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon sx={{ fontSize: 16 }} />}
          sx={{
            backgroundColor: "#0b57d0",
            color: "#fff",
            borderRadius: 999,
            px: 3,
            py: 1,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#0842a0", boxShadow: "none" },
          }}
        >
          {mode === "generate" ? "Send" : "Save"}
        </Button>

        <Box sx={{ display: "flex", gap: 0.5, color: "#5f6368", ml: 1 }}>
          <Tooltip title="Formatting">
            <IconButton size="small" disabled>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" disabled>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" disabled>
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Attach (coming soon)">
            <IconButton size="small" disabled>
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert link (coming soon)">
            <IconButton size="small" disabled>
              <InsertLinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Emoji (coming soon)">
            <IconButton size="small" disabled>
              <InsertEmoticonIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert image (coming soon)">
            <IconButton size="small" disabled>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Discard">
          <IconButton
            size="small"
            onClick={() => router.back()}
            sx={{ color: "#5f6368" }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Generate: React.FC = () => {
  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: "calc(100vh - 96px)",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#404040",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          <Typography sx={{ flex: 1, fontSize: 13 }}>New Message</Typography>
          <IconButton size="small" sx={{ color: "#fff" }} disabled>
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "#fff" }} disabled>
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Box>
        <MailEditForm mode="generate" />
      </Box>
    </Layout>
  );
};

export default Generate;
