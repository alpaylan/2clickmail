import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import type { AppProps } from "next/app";
import "../styles/globals.css";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
