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
      <h1 className="title is-1 has-text-centered">{character.name}</h1>
      <div className="columns is-centered">
        <div className="column is-4">
          <figure className="image is-5by4">
            <img
              src={`${character.thumbnail.path}/landscape_xlarge.${character.thumbnail.extension}`}
              alt={`Picture of ${character.name}`}
            />
          </figure>
        </div>
      </div>
      <div className="container">
        <div className="columns is-multiline is-gapless">
          <div className="column">
            <h2 className="subtitle is-3 mb-0 mt-3">Description</h2>
            <p>{character.description || "Currently unavailable"}</p>

            <h2 className="subtitle is-3 mb-0 mt-3">Stories</h2>
          </div>
          <div className="column">
            <h2 className="subtitle is-3 mb-0 mt-3">Related Characters</h2>
            <p>{character.description || "Currently unavailable"}</p>

            <h2 className="subtitle is-3 mb-0 mt-3">Series</h2>
            <div className="columns is-multiline">
              {character.series.map((series) => (
                <div className="column is-one-quarter-desktop is-half-tablet">
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-1by1">
                        <img
                          src={`${series.thumbnail.path}/standard_fantastic.${series.thumbnail.extension}`}
                        />
                      </figure>
                    </div>
                    <div className="card-content has-background-black has-text-white">
                      <p>{series.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="column is-full">
            <h2 className="subtitle is-3 mb-0 mt-3">Comments</h2>
          </div>
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
  if (!response.ok) {
    return {
      props: { character: null, error: response.statusText },
      revalidate: DAY_IN_SECONDS,
    };
  }

  let character = {};
  let allCharacterData = (await response.json()).data.results[0];
  character.id = allCharacterData.id;
  character.name = allCharacterData.name;
  character.thumbnail = allCharacterData.thumbnail;

  //adding most recent series for character
  if (allCharacterData.series.available > 0) {
    queryParams.set("orderBy", "-modified,-startYear");
    queryParams.set("limit", 4);

    const seriesResponse = await fetch(
      `${allCharacterData.series.collectionURI}?${queryParams.toString()}`
    );

    if (seriesResponse.ok) {
      character.series = (await seriesResponse.json()).data.results.map(
        (series) => ({
          title: series.title,
          thumbnail: series.thumbnail,
        })
      );
    } else {
      character.series = [];
    }
  }

  return {
    props: { character: character, error: null },
    revalidate: DAY_IN_SECONDS,
  };
}
