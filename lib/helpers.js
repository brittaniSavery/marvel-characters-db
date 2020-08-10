import md5 from "md5";

/**
 * Creates the query parameters needed for each API call from node, namely a timestamp, the public API key, and a special unique hash
 */
export function getQueryParamStarter() {
  //setting up the unique timestamp and hash for the call
  const timestamp = new Date().toISOString();
  const hash = md5(
    `${timestamp}${process.env.PRIVATE_API_KEY}${process.env.NEXT_PUBLIC_API_KEY}`
  );

  //creating the query string
  const params = new URLSearchParams();
  params.set("ts", timestamp);
  params.set("apikey", process.env.NEXT_PUBLIC_API_KEY);
  params.set("hash", hash);

  return params;
}
