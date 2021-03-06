import React from "react";
import { useRouter } from "next/router";
import PageLoader from "../../components/PageLoader";
import { getQueryParamStarter } from "../../lib/helpers";
import { DAY_IN_SECONDS, MARVEL_API } from "../../lib/constants";
import Message from "../../components/Message";
import CharacterCard from "../../components/CharacterCard";
import SeriesCard from "../../components/SeriesCard";
import Comments from "../../components/Comments";

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
        <div className="columns is-multiline">
          <div className="column">
            <h2 className="subtitle is-3 mb-0 mt-3">Description</h2>
            <p>{character.description || "Currently unavailable"}</p>

            <h2 className="subtitle is-3 mb-0 mt-3">Stories</h2>
            {character.stories.length > 0 ? (
              character.stories.map((story) => (
                <React.Fragment key={`story-${story.title}`}>
                  <h3 className="pt-2 is-uppercase has-text-weight-medium">
                    {story.title}
                  </h3>
                  <p>{story.description}</p>
                  <p className="pb-2 is-italic">—{story.originalIssue}</p>
                </React.Fragment>
              ))
            ) : (
              <p>Currently unavailable</p>
            )}
          </div>
          <div className="column">
            <h2 className="subtitle is-3 mb-0 mt-3">Related Characters</h2>
            <div className="columns is-multiline">
              {character.related.length > 0 ? (
                character.related.map((character) => (
                  <div
                    key={character.name}
                    className="column is-one-quarter-desktop is-half-tablet"
                  >
                    <CharacterCard character={character} mini />
                  </div>
                ))
              ) : (
                <div className="column is-full">
                  <p>Currently unavailable</p>
                </div>
              )}
            </div>

            <h2 className="subtitle is-3 mb-0 mt-3">Series</h2>
            <div className="columns is-multiline">
              {character.series.length > 0 ? (
                character.series.map((series) => (
                  <div
                    key={series.title}
                    className="column is-one-quarter-desktop is-half-tablet"
                  >
                    <SeriesCard
                      title={series.title}
                      thumbnail={series.thumbnail}
                    />
                  </div>
                ))
              ) : (
                <div className="column is-full">
                  <p>Currently unavailable</p>
                </div>
              )}
            </div>
          </div>
          <div className="column is-full">
            <h2 className="subtitle is-3 mt-3">Comments</h2>
            <Comments characterId={character.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Finding and Pre-rendering the most recently modified (big release or new character, etc.) */
/** Finding and Pre-rendering the characters that the user most likely will look up first: the first `limit` on the grid, the last `limit` on the grid, and the most recently modified (big release or new character, etc.) */
export async function getStaticPaths() {
  const params = getQueryParamStarter();
  params.set("limit", 20);

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

  //retrieving the first `limit` characters
  params.set("orderBy", "name");
  await fetchCharacters();

  //retrieving the last `limit` characters
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

  const allCharacterData = (await response.json()).data.results[0];
  let seriesIds = [];

  let character = {};
  character.id = allCharacterData.id;
  character.description = allCharacterData.description;
  character.name = allCharacterData.name;
  character.thumbnail = allCharacterData.thumbnail;
  character.series = [];
  character.stories = [];
  character.related = [];

  //adding most recent series for character
  if (allCharacterData.series.available > 0) {
    queryParams.set("orderBy", "-modified,-startYear");
    queryParams.set("limit", 20);

    const seriesResponse = await fetch(
      `${allCharacterData.series.collectionURI}?${queryParams.toString()}`
    );

    if (seriesResponse.ok) {
      const results = (await seriesResponse.json()).data.results;
      character.series = results.slice(0, 4).map((series) => ({
        id: series.id,
        title: series.title,
        thumbnail: series.thumbnail,
      }));
      seriesIds = results.slice(0, 10).map((series) => series.id);
    }
  }

  //adding most recent stories
  if (allCharacterData.stories.available > 0) {
    queryParams.set("orderBy", "-modified");
    queryParams.set("limit", 20);

    const storiesResponse = await fetch(
      `${allCharacterData.stories.collectionURI}?${queryParams.toString()}`
    );

    if (storiesResponse.ok) {
      //only returning stories with descriptions (if possible)
      const results = (await storiesResponse.json()).data.results;
      let stories = results.filter((story) => story.description !== "");

      //adding stories with no descriptions
      if (stories.length < 5) {
        stories = stories.concat(
          results
            .filter((r) => r.description === "")
            .slice(0, 5 - stories.length)
        );
      }

      character.stories = stories.map((story) => ({
        id: story.id,
        title: story.title,
        description: story.description,
        originalIssue: story.originalIssue && story.originalIssue.name,
      }));
    }
  }

  //adding related characters based on most recent series
  if (seriesIds.length > 0) {
    queryParams.set("limit", 9);
    queryParams.set("orderBy", "-modified,name");
    queryParams.set("series", seriesIds);

    const charactersResponse = await fetch(
      `${MARVEL_API}/characters?${queryParams.toString()}`
    );

    if (charactersResponse.ok) {
      const json = await charactersResponse.json();
      character.related = json.data.results
        .filter((character) => `${character.id}` !== params.characterId)
        .slice(0, 8)
        .sort((c1, c2) => {
          const compare1 = c1.name.toUpperCase();
          const compare2 = c2.name.toUpperCase();
          if (compare1 < compare2) return -1;
          if (compare1 > compare2) return 1;
          return 0;
        });
    } else {
      console.log(charactersResponse.status);
      console.log(charactersResponse.statusText);
    }
  }

  return {
    props: { character: character, error: null },
    revalidate: DAY_IN_SECONDS,
  };
}
