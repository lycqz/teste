import translations from "./translations";
import { useState, useEffect } from "react";
import SearchBar from "./Components/SearchBar";

import {
  getRandomMovie,
  getGenres,
  getMovieCast,
  getMovieTrailer,
  getRandomShow,
  getShowGenres,
  getShowCast,
  getShowTrailer
} from "./Utils/tmdb";

import { getRandomSong } from "./spotify";

import "./App.css";
import iptaLogo from "./assets/ipta.png";

function App() {

  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("movies");

  const t = translations?.[language] ?? translations?.en ?? {};

  const [targetMovie, setTargetMovie] = useState(null);
  const [targetShow, setTargetShow] = useState(null);
  const [song, setSong] = useState(null);


  const [guesses, setGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [songGuesses, setSongGuesses] = useState(0);
  const [musicGameOver, setMusicGameOver] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);

  /* ---------------- MOVIE LOADER ---------------- */

  const loadMovie = async () => {

    try {

      setLoading(true);

      const movie = await getRandomMovie();

      setTargetMovie(movie);
      setGuesses(0);
      setGameOver(false);

      const castData = await getMovieCast(movie.id);
      setCast(castData);

      const trailerKey = await getMovieTrailer(movie.id);
      setTrailer(trailerKey);

    } catch (err) {

      console.error("Error loading movie", err);

    } finally {

      setLoading(false);

    }

  };

  /* ---------------- SHOW LOADER ---------------- */

  const loadShow = async () => {

    try {

      setLoading(true);

      const show = await getRandomShow();

      setTargetShow(show);
      setGuesses(0);
      setGameOver(false);

      const castData = await getShowCast(show.id);
      setCast(castData);

      const trailerKey = await getShowTrailer(show.id);
      setTrailer(trailerKey);

    } catch (err) {

      console.error("Error loading show", err);

    } finally {

      setLoading(false);

    }

  };

  /* ---------------- MUSIC LOADER ---------------- */

  const loadSong = async () => {

    try {

      setLoading(true);

      const randomSong = await getRandomSong();

      if (!randomSong) {
        console.error("No song returned");
        return;
      }

      setSong(randomSong);
      setSongGuesses(0);
      setMusicGameOver(false);

    } catch (err) {

      console.error("Error loading song", err);

    } finally {

      setLoading(false);

    }

  };

  /* ---------------- MODE SWITCH ---------------- */

  useEffect(() => {

    setTargetMovie(null);
    setTargetShow(null);
    setSong(null);
    setCast([]);
    setTrailer(null);

    if (mode === "movies") {

      loadMovie();
      getGenres().then(setGenres);

    }

    if (mode === "shows") {

      loadShow();
      getShowGenres().then(setShowGenres);

    }

    if (mode === "music") {

      loadSong();

    }

  }, [mode]);

  /* ---------------- MOVIE / SHOW GUESS ---------------- */

  const handleGuess = (item) => {

    const correctTitle =
      mode === "movies"
        ? targetMovie?.title
        : targetShow?.name;

    const guessTitle = item.title || item.name;

    if (!correctTitle || gameOver) return;

    if (guessTitle === correctTitle) {

      setGuesses(g => g + 1);
      setGameOver(true);

      alert(`${t.win} ${correctTitle}`);
      return;

    }

    const newGuesses = guesses + 1;
    setGuesses(newGuesses);

    if (newGuesses >= 5) {

      setGameOver(true);
      alert(`${t.lose} ${correctTitle}`);

    }

  };

  /* ---------------- MUSIC GUESS ---------------- */

  const handleSongGuess = (guess) => {

    if (!song || musicGameOver) return;

    const correct = song.name.toLowerCase();
    const attempt = guess.toLowerCase();

    if (attempt === correct) {

      alert(`Correct! 🎉 ${song.name}`);
      setMusicGameOver(true);
      return;

    }

    const newGuesses = songGuesses + 1;
    setSongGuesses(newGuesses);

    if (newGuesses >= 5) {

      alert(`You lost! Song was: ${song.name}`);
      setMusicGameOver(true);

    }

  };

  const blurAmount = gameOver ? 0 : Math.max(15 - guesses * 3, 0);

  if (loading) {

    return (
      <div className="app">
        <h2 style={{ textAlign: "center", marginTop: "100px" }}>
          🎬 Loading...
        </h2>
      </div>
    );

  }

  return (

    <div className="app">

      <div className="top-bar">

        <div className="left">
          <img src={iptaLogo} alt="IPTA Logo" className="ipta-logo" />
        </div>

        <div className="center">
          🎮 PAP Guessing Game
        </div>

        <div className="right">
          <button onClick={() => setShowSettings(!showSettings)}>
            ⚙ {t.settings}
          </button>
        </div>

      </div>

      <div className="mode-selector">

        <button
          className={mode === "movies" ? "active" : ""}
          onClick={() => setMode("movies")}
        >
          🎬 Movies
        </button>

        <button
          className={mode === "shows" ? "active" : ""}
          onClick={() => setMode("shows")}
        >
          📺 Shows
        </button>

        <button
          className={mode === "football" ? "active" : ""}
          onClick={() => setMode("football")}
        >
          ⚽ Football
        </button>

        <button
          className={mode === "music" ? "active" : ""}
          onClick={() => setMode("music")}
        >
          🎵 Music
        </button>

      </div>

      {showSettings && (

        <div className="settings">

          <h3>{t.settings}</h3>

          <label>{t.language}</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >

            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>

          </select>

        </div>

      )}

      {mode === "movies" && targetMovie && (

        <GameCard
          title={targetMovie.title}
          year={targetMovie.release_date}
          rating={targetMovie.vote_average}
          poster={targetMovie.poster_path}
          blurAmount={blurAmount}
          guesses={guesses}
          gameOver={gameOver}
          handleGuess={handleGuess}
          cast={cast}
          trailer={trailer}
        />

      )}

      {mode === "shows" && targetShow && (

        <GameCard
          title={targetShow.name}
          year={targetShow.first_air_date}
          rating={targetShow.vote_average}
          poster={targetShow.poster_path}
          blurAmount={blurAmount}
          guesses={guesses}
          gameOver={gameOver}
          handleGuess={handleGuess}
          cast={cast}
          trailer={trailer}
        />

      )}

      {mode === "music" && song && (

        <div className="mode-placeholder">

          <h2>🎵 Guess The Song</h2>

          <audio controls>
            <source src={song.preview_url} type="audio/mpeg" />
          </audio>

          {!musicGameOver && (
            <input
              type="text"
              placeholder="Guess the song title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSongGuess(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{
                marginTop:"20px",
                padding:"10px",
                borderRadius:"6px",
                border:"none"
              }}
            />
          )}

          {musicGameOver && (
            <button
              style={{marginTop:"20px"}}
              onClick={loadSong}
            >
              Next Song
            </button>
          )}

        </div>

      )}

      {mode === "football" && (

        <div className="mode-placeholder">
          <h2>⚽ Football Mode Coming Soon</h2>
        </div>

      )}

      <div className="footer">
        Lucas Almeida — PAP Projeto
      </div>

    </div>

  );

}

function GameCard({ title, year, rating, poster, blurAmount, guesses, gameOver, handleGuess, cast, trailer }) {

  const [showCast, setShowCast] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setShowCast(false);
    setShowTrailer(false);
  }, [title]);

  const posterUrl = poster
    ? `https://image.tmdb.org/t/p/w500${poster}`
    : null;

  return (

    <div className="game-card">

      <h2>🎬 Guess the Movie / Show</h2>

      {posterUrl && (
        <img
          src={posterUrl}
          alt={title}
          style={{
            width:"300px",
            borderRadius:"10px",
            filter:`blur(${blurAmount}px)`,
            transition:"0.3s",
            marginTop:"20px"
          }}
        />
      )}

      <p style={{marginTop:"15px"}}>⭐ Rating: {rating}</p>
      <p>📅 Year: {year?.slice(0,4)}</p>
      <p>🎯 Guesses: {guesses}/5</p>

      {!gameOver && (
        <SearchBar onGuess={handleGuess}/>
      )}

      <button
        disabled={guesses < 2}
        style={{
          marginTop:"10px",
          opacity: guesses < 2 ? 0.5 : 1
        }}
        onClick={() => setShowCast(true)}
      >
        🎭 Reveal Cast
      </button>

      {showCast && cast?.length > 0 && (
        <div style={{marginTop:"10px"}}>
          <h4>Cast:</h4>
          {cast.slice(0,5).map(actor => (
            <p key={actor.id}>{actor.name}</p>
          ))}
        </div>
      )}

      <button
        disabled={guesses < 4}
        style={{
          marginTop:"10px",
          opacity: guesses < 4 ? 0.5 : 1
        }}
        onClick={() => setShowTrailer(true)}
      >
        🎬 Reveal Trailer
      </button>

      {showTrailer && trailer && (
        <div style={{marginTop:"15px"}}>
          <iframe
            width="400"
            height="225"
            src={`https://www.youtube.com/embed/${trailer}`}
            title="Trailer"
            allowFullScreen
          />
        </div>
      )}

      {gameOver && (
        <button
          style={{
            marginTop:"20px",
            padding:"10px 20px"
          }}
          onClick={() => window.location.reload()}
        >
          🔁 Play Again
        </button>
      )}

    </div>

  );

}

export default App;
