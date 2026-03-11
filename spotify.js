const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

let accessToken = null;

async function getAccessToken() {

  if (accessToken) return accessToken;

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
      },
      body: "grant_type=client_credentials"
    }
  );

  const data = await response.json();
  accessToken = data.access_token;

  return accessToken;
}

export async function getRandomSong() {

  const token = await getAccessToken();

  // Popular Spotify playlist (Top Hits)
  const playlistId = "37i9dQZF1DXcBWIGoYBM5M";

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();

  if (!data?.items) {
    throw new Error("Spotify playlist failed");
  }

  // Filter songs that have previews
  const tracks = data.items
    .map(item => item.track)
    .filter(track => track && track.preview_url);

  if (tracks.length === 0) {
    throw new Error("No playable tracks found");
  }

  const randomTrack =
    tracks[Math.floor(Math.random() * tracks.length)];

  return randomTrack;
}
