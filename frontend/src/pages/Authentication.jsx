import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const [name, setName] = React.useState();
  const [error, setError] = React.useState();
  const [message, setMessage] = React.useState();

  const [formState, setFormState] = React.useState(0);

  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (error) {
      console.log(error);
      let message = error.response.data.message;
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{ height: "100vh", background: theme.palette.background.default }}
      >
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1)), url(https://picsum.photos/1344/756)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            "&:before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)",
            },
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "0px",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "secondary.main",
                width: 56,
                height: 56,
                background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 4,
                "& .MuiButton-root": {
                  px: 4,
                  py: 1,
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                },
              }}
            >
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => {
                  setFormState(0);
                  setError("");
                  setMessage("");
                }}
                sx={{
                  ...(formState === 0 && {
                    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(37,99,235,0.3)",
                    },
                  }),
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => {
                  setFormState(1);
                  setError("");
                  setMessage("");
                }}
                sx={{
                  ...(formState === 1 && {
                    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(37,99,235,0.3)",
                    },
                  }),
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Box
              component="form"
              noValidate
              sx={{
                mt: 1,
                width: "100%",
                "& .MuiTextField-root": {
                  margin: "1rem 0",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                  },
                },
              }}
            >
              {formState === 1 && (
                <TextField
                  fullWidth
                  required
                  id="fullname"
                  label="Full Name"
                  variant="outlined"
                  name="username"
                  value={name}
                  InputLabelProps={{ style: { color: "#64748b" } }}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                fullWidth
                required
                id="username"
                label="Username"
                name="username"
                value={username}
                variant="outlined"
                InputLabelProps={{ style: { color: "#64748b" } }}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                required
                type="password"
                name="password"
                value={password}
                label="Password"
                variant="outlined"
                InputLabelProps={{ style: { color: "#64748b" } }}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "red" }}>{error}</p>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: "12px",
                  background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 15px rgba(37,99,235,0.2)",
                  },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Create Account"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

<Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message || "Action completed successfully"}
      />
      
    </ThemeProvider>
  );
}
