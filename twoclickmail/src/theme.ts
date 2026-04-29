import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a73e8", contrastText: "#ffffff" },
    secondary: { main: "#c2e7ff", contrastText: "#001d35" },
    background: {
      default: "#f6f8fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
    divider: "#e8eaed",
    error: { main: "#d93025" },
    success: { main: "#188038" },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      '"Google Sans", "Google Sans Text", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: "none", fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          paddingInline: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#f6f8fc",
          color: "#202124",
          boxShadow: "none",
          borderBottom: "1px solid #e8eaed",
        },
      },
    },
  },
});

export default theme;
