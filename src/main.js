import './index.css';

const API_URL = 'https://listeamed.net/v1/video/list?key=m0K9VXgwv1pb4ZJx21nz52P3R8zaolB6WnA&folder=0&offset=0&limit=1000000';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');
const playerContainer = document.getElementById('playerContainer');
const player = document.getElementById('player');
const status = document.getElementById('status');
const movieSuggestions = document.getElementById('movie-suggestions');
const carousel = document.getElementById('carousel');
const carouselContainer = document.getElementById('carouselContainer');

let movies = [];
let currentSlide = 0;
let slideInterval;

function showStatus(message, isError = false) {
  status.textContent = message;
  status.style.display = 'block';
  status.style.backgroundColor = isError ? '#ffdddd' : '#ddffdd';
}

async function loadMovies() {
  try {
    showStatus('Cargando películas y series...');
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.result && Array.isArray(data.result)) {
      movies = data.result;
      showStatus(`${movies.length} Total de películas y series.`);
      updateMovieSuggestions(movies);
      loadMoviesInCarousel();
    } else {
      throw new Error('Formato de datos inesperado');
    }
  } catch (error) {
    console.error('Error al cargar películas y series:', error);
    showStatus('Error al cargar las películas y series. Por favor, intente más tarde. Soporte: https://t.me/ssomoscomunidad', true);
  }
}

function updateMovieSuggestions(movies) {
  movieSuggestions.innerHTML = '';
  movies.forEach(movie => {
    const option = document.createElement('option');
    option.value = getMovieName(movie);
    movieSuggestions.appendChild(option);
  });
}

function searchMovies(query) {
  return movies.filter(movie => {
    const movieName = getMovieName(movie);
    return movieName.toLowerCase().includes(query.toLowerCase());
  });
}

function getMovieName(movie) {
  return movie.Name || 'Películas y series sin título';
}

function loadMoviesInCarousel() {
  const moviesToShow = movies.slice(0, 10);
  carousel.innerHTML = '';
  
  moviesToShow.forEach((movie, index) => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('carousel-item');
    if (index === 0) {
      movieElement.classList.add('active');
    }
    movieElement.textContent = getMovieName(movie);
    movieElement.addEventListener('click', () => playMovie(movie));
    carousel.appendChild(movieElement);
  });

  if (moviesToShow.length > 0) {
    carouselContainer.style.display = 'block';
    startCarousel();
  } else {
    carouselContainer.style.display = 'none';
  }
}

function startCarousel() {
  const carouselItems = document.querySelectorAll('.carousel-item');
  const totalSlides = carouselItems.length;
  
  if (totalSlides > 0) {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
    slideInterval = setInterval(() => {
      carouselItems[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % totalSlides;
      carouselItems[currentSlide].classList.add('active');
    }, 5000);
  }
}

window.navigateCarousel = function(direction) {
  const carouselItems = document.querySelectorAll('.carousel-item');
  const totalSlides = carouselItems.length;

  if (totalSlides > 0) {
    carouselItems[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    carouselItems[currentSlide].classList.add('active');
    updateCarouselPosition();
  }
}

function updateCarouselPosition() {
  if (carousel.children.length === 0) return;

  const itemWidth = carousel.children[0].offsetWidth;
  const marginRight = parseInt(window.getComputedStyle(carousel.children[0]).marginRight);
  const offset = currentSlide * (itemWidth + marginRight);
  
  carousel.style.transition = 'transform 0.5s ease';
  carousel.style.transform = `translateX(-${offset}px)`;
}

function playMovie(movie) {
  const link = movie.HashID;
  if (link) {
    const playerUrl = `https://listeamed.net/e/${link}`;
    player.src = playerUrl;
    playerContainer.style.display = 'block';
    showStatus(`Estás viendo: ${getMovieName(movie)}`);
    markAsWatched(movie);
  } else {
    showStatus('Error: No se pudo encontrar el enlace de la película o serie. Soporte: https://t.me/ssomoscomunidad', true);
  }
}

function markAsWatched(movie) {
  let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  if (!watchedMovies.includes(movie.HashID)) {
    watchedMovies.push(movie.HashID);
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  }
  highlightWatchedMovies();
}

function highlightWatchedMovies() {
  const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];

  const movieElements = document.querySelectorAll('.movie');
  movieElements.forEach(element => {
    const movieName = element.textContent;
    const movie = movies.find(m => getMovieName(m) === movieName);
    if (movie && watchedMovies.includes(movie.HashID)) {
      element.style.backgroundColor = '#d0e7ff';
    }
  });
}

function displayResults(movieResults) {
  results.innerHTML = '';
  if (movieResults.length === 0) {
    results.innerHTML = '<p>No se encontraron resultados. Soporte: https://t.me/ssomoscomunidad</p>';
    return;
  }

  movieResults.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.textContent = getMovieName(movie);
    movieElement.addEventListener('click', () => playMovie(movie));

    results.appendChild(movieElement);
  });
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    const searchResults = searchMovies(query);
    displayResults(searchResults);
  } else {
    showStatus('Por favor, ingrese un término de búsqueda.', true);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  highlightWatchedMovies();
});