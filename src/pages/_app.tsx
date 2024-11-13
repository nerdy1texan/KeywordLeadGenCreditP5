import type { AppProps } from "next/app";
import { withRouter } from "next/router";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withRouter(App);
