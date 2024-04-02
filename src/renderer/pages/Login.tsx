import {
  Tooltip,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { FormEvent, useCallback, useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { useNavigate } from "react-router-dom";
import HelpIcon from "@mui/icons-material/Help";
import MailIcon from "@mui/icons-material/Mail";
import { useStorage } from "../hooks/useStorage";

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
const urlRegex = new RegExp(
  /((?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
);

export default function Login(): JSX.Element {
  const { lastLogin, updateLastLogin } = useStorage();
  const [email, setEmail] = useState(lastLogin.email);
  const [host, setHost] = useState(lastLogin.host);
  const [port, setPort] = useState(lastLogin.port);
  const [emailError, setEmailError] = useState(false);
  const [hostError, setHostError] = useState(false);
  const [portError, setPortError] = useState(false);
  const navigate = useNavigate();
  const onAuthenticated = useCallback(() => {
    navigate("/backup");
  }, [navigate]);
  const [running, result, startAuth, cancelAuth] =
    useAuthentication(onAuthenticated);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setEmailError(false);
    setHostError(false);

    let success = true;
    if (!email.match(emailRegex)) {
      setEmailError(true);
      success = false;
    }
    if (!host.match(urlRegex)) {
      setHostError(true);
      success = false;
    }

    if (success) {
      updateLastLogin({
        host,
        port,
        email
      })
      startAuth({ email, host, port });
    }
  };

  const handleMail = useCallback(() => {
    window.electronAPI.openInBrowser("mailto:hubs-feedback@mozilla.com");
  }, []);


  return (
    <form noValidate autoComplete="on" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TextField
            variant="outlined"
            placeholder="hubs.mozilla.com"
            required={true}
            label="Host"
            fullWidth
            name="host"
            onChange={(e) => setHost(e.target.value)}
            value={host}
            error={hostError}
            disabled={running}
          />
        </Grid>
        <Grid item xs={1} alignSelf={"center"}>
          <Tooltip title="The host name of the Hubs instance with your data (ex. hubs.mozilla.com or 12345.us1.myhubs.net). Do not include https or url paths.">
            <HelpIcon sx={{ verticalAlign: "middle", color: "grey" }} />
          </Tooltip>
        </Grid>
        <Grid item xs={2}>
          <TextField
            variant="outlined"
            placeholder=""
            required={false}
            label="Port"
            fullWidth
            name="port"
            onChange={(e) => setPort(e.target.value)}
            value={port}
            error={portError}
            disabled={running}
          />
        </Grid>
        <Grid item xs={1} alignSelf={"center"}>
          <Tooltip title="(Optional) Your instance's reticulum port. Only specify your port if you have customized reticulum.">
            <HelpIcon sx={{ verticalAlign: "middle", color: "grey" }} />
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            placeholder="email@yourdomain.com"
            required={true}
            label="Email"
            fullWidth
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            error={emailError}
            disabled={running}
          />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={running}
            color="success"
          >
            Login
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={cancelAuth}
            disabled={!running}
            color="error"
          >
            Cancel
          </Button>
        </Grid>
        <Grid item xs={12} marginTop={2}>
          {running && (
            <Grid
              container
              alignItems={"center"}
              direction={"row"}
              sx={{
                borderRadius: 1,
                bgcolor: "primary.main",
              }}
              padding={2}
            >
              <Grid item xs={11}>
                <Typography
                  fontWeight={"bold"}
                  fontSize={"small"}
                  color={"white"}
                  marginBottom={1}
                >
                  {`Email sent to ${email}.`}
                </Typography>
                <Typography
                  fontWeight={"bold"}
                  fontSize={"small"}
                  color={"white"}
                  marginBottom={1}
                >
                  {`To continue, click on the link in the email using your phone, tablet, or PC.`}
                </Typography>
                <Typography
                  fontWeight={"bold"}
                  fontSize={"small"}
                  color={"white"}
                >
                  {`If you are having trouble finding this email, please check your spam or junk folders. If you still cannot locate the log-in email, please contact us:`}
                </Typography>
              </Grid>
              <Grid item xs={1} textAlign={"end"}>
                <IconButton onClick={handleMail} size="small">
                  <MailIcon fontSize="small" sx={{ color: "white" }} />
                </IconButton>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </form>
  );
}