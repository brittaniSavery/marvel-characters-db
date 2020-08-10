import React from "react";
import Link from "next/link";

export default function CharacterCard({ character, mini }) {
  return (
    <div className="card">
      <div className="card-image">
        <figure className={`image ${mini ? "is1by1" : "is-4by5"}`}>
          <img
            src={`${character.thumbnail.path}/${
              mini ? "standard_fantastic" : "portrait_xlarge"
            }.${character.thumbnail.extension}`}
            alt={`Picture of ${character.name}`}
          />
        </figure>
      </div>
      <div
        className="card-content has-background-black has-text-centered py-1 px-1 is-vcentered"
        style={{ height: "2.8em", lineHeight: 1.1 }}
      >
        <Link href="/character/[characterId]" as={`/character/${character.id}`}>
          <a className="has-text-white">{character.name}</a>
        </Link>
      </div>
    </div>
  );
}
