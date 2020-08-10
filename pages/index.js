import React from "react";
import CharacterCard from "../components/CharacterCard";
import useSWR from "swr";
import { MARVEL_API, DAY_IN_SECONDS } from "../lib/constants";
import PageLoader from "../components/PageLoader";
import { getQueryParamStarter } from "../lib/helpers";

const limit = 20;

export default function Index({ firstPage }) {
  const [pageIndex, setPageIndex] = React.useState(0);

  const { data, error } = useSWR(
    `${MARVEL_API}/characters?offset=${
      pageIndex * limit
    }&limit=${limit}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`,
    { initialData: pageIndex === 0 ? firstPage : null }
  );

  if (!data) return <PageLoader />;

  const total = data.data.total;
  const characters = data.data.results;
  const lastIndex = Math.trunc(total / limit);

  //pagination list array
  let paginationList = [];

  if (pageIndex > 1) paginationList.push(pageIndex - 2);
  if (pageIndex > 0) paginationList.push(pageIndex - 1);
  paginationList.push(pageIndex);
  if (pageIndex < lastIndex) paginationList.push(pageIndex + 1);
  if (pageIndex < lastIndex - 1) paginationList.push(pageIndex + 2);

  /**
   * Handles the page change on the character grid and jumps to the top of page
   * @param {number} index - new page index
   */
  const handlePageChange = (index) => {
    setPageIndex(index);
    window.scrollTo(0, 0);
  };

  const isHiddenMobile = (page, index) => {
    if (page === pageIndex) return false; //always show the active page
    if (page < 1 || page >= lastIndex - 1) return false; //show if close enough to beginning/end of pages
    return page !== pageIndex - 1 && page !== pageIndex + 1; //otherwise, only show previous and next pages
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title is-1 has-text-centered">All Characters</h1>
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
          className="pagination is-centered"
          role="navigation"
          aria-label="character pagination"
        >
          <button
            className={`pagination-previous ${pageIndex === 0 && "is-hidden"}`}
            onClick={() => handlePageChange(pageIndex - 1)}
          >
            Previous
          </button>
          <button
            className={`pagination-next ${
              pageIndex === lastIndex && "is-hidden"
            }`}
            onClick={() => handlePageChange(pageIndex + 1)}
          >
            Next
          </button>
          <ul className="pagination-list">
            {/* Adds link to first page */}
            {pageIndex > 2 && (
              <>
                <li>
                  <button
                    className="pagination-link"
                    aria-label="Goto page 1"
                    onClick={() => handlePageChange(0)}
                  >
                    1
                  </button>
                </li>
                <li>
                  <span className="pagination-ellipsis">&hellip;</span>
                </li>
              </>
            )}
            {paginationList.map((pagination, index) => (
              <li key={`pagination-${pagination}`}>
                <button
                  className={`pagination-link ${
                    pagination === pageIndex && "is-current"
                  } ${isHiddenMobile(pagination, index) && "is-hidden-mobile"}`}
                  aria-label={`${pagination !== pageIndex && "Goto"} page ${
                    pagination + 1
                  }`}
                  onClick={() => handlePageChange(pagination)}
                >
                  {pagination + 1}
                </button>
              </li>
            ))}
            {/* Adds link to last page */}
            {pageIndex < lastIndex - 2 && (
              <>
                <li>
                  <span className="pagination-ellipsis">&hellip;</span>
                </li>
                <li>
                  <button
                    className="pagination-link"
                    aria-label={`Goto page ${lastIndex + 1}`}
                    onClick={() => handlePageChange(lastIndex)}
                  >
                    {lastIndex + 1}
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/**
 * Pre-renders the first page of characters
 */
export async function getStaticProps() {
  const params = getQueryParamStarter();
  params.set("limit", limit);

  const response = await fetch(`${MARVEL_API}/characters?${params.toString()}`);

  //checking the call was successful, and if not, sending a null prop for the page to call the API on load
  let result;
  if (response.ok) {
    result = await response.json();
  } else {
    console.log(response.status);
    console.log(response.statusText);
    result = null;
  }

  return { props: { firstPage: result }, revalidate: DAY_IN_SECONDS };
}
