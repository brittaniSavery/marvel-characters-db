import React from "react";
import CharacterCard from "../components/CharacterCard";
import useSWR from "swr";
import { MARVEL_API } from "../lib/constants";

export default function Index() {
  const [offset, setOffset] = React.useState(0);
  const limit = 20;

  const { data, error } = useSWR(
    `${MARVEL_API}/characters?offset=${offset}&limit=${limit}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`
  );
  const total = data ? data.data.total : 0;
  const characters = data ? data.data.results : [];

  return (
    <section className="section">
      <h1 className="is-size-1-desktop is-size-3-mobile has-text-centered">
        All Characters
      </h1>
      <div className="columns is-multiline is-mobile">
        {characters.map((character) => (
          <div
            key={`Character-${character.id}`}
            className="column is-one-fifth-desktop is-one-third-tablet is-half-mobile"
          >
            <CharacterCard character={character} />
          </div>
        ))}
      </div>
      <nav
        className="pagination"
        role="navigation"
        aria-label="character pagination"
      >
        <button className="pagination-previous">Previous</button>
        <button className="pagination-next">Next</button>
        <ul className="pagination-list">
          <li>
            <button className="pagination-link" aria-label={`Goto to page 1`}>
              1
            </button>
          </li>
        </ul>
      </nav>
    </section>
  );
}
