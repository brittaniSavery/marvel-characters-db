import Head from "next/head";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <Head>
        <title>Marvel Characters Database</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <NavBar />
        <footer className="footer">
          <a
            href="https://marvel.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="has-text-centered">
              Data provided by Marvel. &copy; 2014
            </p>
          </a>
        </footer>
      </main>
    </>
  );
}
