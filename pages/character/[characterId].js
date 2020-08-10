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
  character.description = allCharacterData.description;
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
          id: series.id,
          title: series.title,
          thumbnail: series.thumbnail,
        })
      );
    } else {
      character.series = [];
    }
  }

  //adding most recent stories
  if (allCharacterData.stories.available > 0) {
    queryParams.set("orderBy", "-modified");
    queryParams.set("limit", 5);
    console.log(allCharacterData.stories.collectionURI);

    const storiesResponse = await fetch(
      `${allCharacterData.stories.collectionURI}?${queryParams.toString()}`
    );

    if (storiesResponse.ok) {
      //only returning stories that have descriptions
      const json = await storiesResponse.json();
      console.log("Stories Orig", json.data.results);
      console.log(
        "Stories Filtered",
        json.data.results.filter((story) => story.description !== "")
      );
      character.stories = json.data.results
        .filter((story) => story.description !== "")
        .map((story) => ({
          id: story.id,
          title: story.title,
          description: story.description,
          originalIssue: story.originalIssue.name,
        }));
    } else {
      character.stories = [];
    }
  }

  console.log(character.stories);
  console.log(character.series);

  //adding related characters based on most recent series and stories
  if (character.series.length > 0 || character.stories.length > 0) {
    queryParams.set("limit", 9);
    queryParams.set("orderBy", "-modified");
    queryParams.set(
      "series",
      character.series.length
        ? character.series.map((series) => series.id)
        : null
    );
    queryParams.set(
      "stories",
      character.stories.length
        ? character.stories.map((story) => story.id)
        : null
    );
    console.log(queryParams.toString());
    const charactersResponse = await fetch(
      `${MARVEL_API}/characters?${queryParams.toString()}`
    );

    if (charactersResponse.ok) {
      character.related = (await charactersResponse.json()).data.results
        .filter((character) => `${character.id}` !== params.characterId)
        .sort((c1, c2) => {
          const compare1 = c1.name.toUpperCase();
          const compare2 = c2.name.toUpperCase();
          if (compare1 < compare2) return -1;
          if (compare1 > compare2) return 1;
          return 0;
        });
    } else {
      character.related = [];
    }
  }

  return {
    props: { character: character, error: null },
    revalidate: DAY_IN_SECONDS,
  };
}
