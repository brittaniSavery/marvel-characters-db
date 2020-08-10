import Head from "next/head";
import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Marvel Characters Database</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <main>{children}</main>
      <footer className="footer">
        <a href="https://marvel.com/" target="_blank" rel="noopener noreferrer">
          <p className="has-text-centered">
            Data provided by Marvel. &copy; 2020 MARVEL
          </p>
        </a>
      </footer>
    </>
  );
}
