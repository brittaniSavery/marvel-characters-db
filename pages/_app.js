import { SWRConfig } from "swr";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{ fetcher: (...args) => fetch(...args).then((res) => res.json()) }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
