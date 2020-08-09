import React from "react";
import Link from "next/link";

export default function CharacterCard({ character }) {
  return (
    <div className="card">
      <div className="card-image">
        <figure className="image is-4by5">
          <img
            src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
            alt={`Picture of ${character.name}`}
          />
        </figure>
      </div>
      <div
        className="card-content has-background-link has-text-centered py-1 px-1 is-vcentered"
        style={{ height: "2.8em", lineHeight: 1.1 }}
      >
        <Link href={`/character/${character.id}`}>
          <a className="has-text-light">{character.name}</a>
        </Link>
      </div>
    </div>
  );
}
