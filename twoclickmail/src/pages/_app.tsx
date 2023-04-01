import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import 'font-awesome/css/font-awesome.min.css';
import App, { AppInitialProps } from 'next/app';
import { isLoggedIn } from '../lib/utils/auth';
import { parseCookies } from 'nookies';



function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  const cookies = parseCookies(appContext.ctx);
  const isUserLoggedIn = isLoggedIn(cookies);

  return { ...appProps, isUserLoggedIn };
};


export default MyApp;
