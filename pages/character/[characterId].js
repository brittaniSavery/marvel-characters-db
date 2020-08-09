import React from "react";
import { useRouter } from "next/router";
import PageLoader from "../../components/PageLoader";
import { getQueryParamStarter } from "../../lib/helpers";
import { DAY_IN_SECONDS, MARVEL_API } from "../../lib/constants";
import Message from "../../components/Message";

export default function Character({ character, error }) {
  const router = useRouter();
  if (router.isFallback) return <PageLoader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <section className="section">
      <h1 className="is-size-1-desktop is-size-3-mobile has-text-centered">
        {character.name}
      </h1>
      <div className="columns is-gapless has-background-light">
        <div className="column is-half is-short">
          <figure className="image is-2by3">
            <img
              src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
              alt={`Picture of ${character.name}`}
            />
          </figure>
        </div>
        <div className="column is-half">
          <h2 className="is-size-3-desktop is-size-4-mobile">Description</h2>
          <p>{character.description || "Unavailable"}</p>
        </div>
      </div>
    </section>
  );
}

/** Finding and Pre-rendering the characters that the user most likely will look up first: the first 100 on the grid, the last 100 on the grid, and the most recently modified (big release or new character, etc.) */
export async function getStaticPaths() {
  const params = getQueryParamStarter();
  params.set("limit", 100);

  let characterIds = new Set();
  const fetchCharacters = async () => {
    const response = await fetch(
      `${MARVEL_API}/characters?${params.toString()}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.data.results.forEach((element) =>
        characterIds.add(element.id)
      );
    } else {
      console.log(response.status);
      console.log(response.statusText);
    }
  };

  //retrieving the first 100 characters
  params.set("orderBy", "name");
  await fetchCharacters();

  //retrieving the last 100 characters
  params.set("orderBy", "-name");
  await fetchCharacters();

  //retrieving the most recently modified characters
  params.set("orderBy", "-modified");
  await fetchCharacters();

  const paths = [...characterIds].map((id) => ({
    params: { characterId: `${id}` },
  }));

  return { paths: paths, fallback: true };
}

/**
 * Pre-renders the characters from the `getStaticPaths` function and fetches and caches any other characters upon user request
 * @param {object} params - contains the dynamic path parameters
 */
export async function getStaticProps({ params }) {
  const queryParams = getQueryParamStarter();

  const response = await fetch(
    `${MARVEL_API}/characters/${params.characterId}?${queryParams.toString()}`
  );

  //handling if character id was not found or some other error occurred
  let props = {};
  if (response.ok) {
    props.character = (await response.json()).data.results[0];
    props.error = null;
  } else {
    props.character = null;
    props.error = response.statusText;
  }

  return { props: props, revalidate: DAY_IN_SECONDS };
}
