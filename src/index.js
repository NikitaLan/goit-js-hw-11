import { PixabayApi } from './js/pixabay-api';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const btnloadMoreEl = document.querySelector('.load-more');

searchFormEl.addEventListener('submit', onSearch);
btnloadMoreEl.addEventListener('click', onloadMore);

const pixabayApi = new PixabayApi();
const simpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function onSearch(evt) {
  evt.preventDefault();
  pixabayApi.page = 1;
  pixabayApi.request = evt.currentTarget.searchQuery.value.trim();

  if (pixabayApi.request === '') {
    Notify.failure(`Add search data!`);
    return;
  }

  evt.currentTarget.reset();
  galleryEl.innerHTML = '';

  try {
    const data = await pixabayApi.getPhotos();
    console.log('Search:', data);

    pixabayApi.totalImages = data.hits.length;

    if (!data.totalHits) {
      Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    } else {
      btnloadMoreEl.classList.remove('is-hidden');
      removeBtnLoadMore(data);
    }
    makeMarkup(data);
    addSimpleLightbox();
  } catch (error) {
    console.warn(error);
    getCatch();
  }
}

async function onloadMore() {
  pixabayApi.page += 1;

  try {
    const data = await pixabayApi.getPhotos();
    console.log('Load:', data);

    pixabayApi.totalImages += data.hits.length;

    makeMarkup(data);
    addSimpleLightbox();
    addSmoothScroling();
    removeBtnLoadMore(data);

    Notify.info(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    console.warn(error);
    getCatch();
  }
}

function removeBtnLoadMore(data) {
  if (pixabayApi.totalImages === data.total) {
    Notify.success(
      `We're sorry, but you've reached the end of search results.`
    );

    btnloadMoreEl.classList.add('is-hidden');

    return;
  }
}

// функция создает разметку одной карточкм из массива объектов
function createPhotoCard(data) {
  return data.hits
    .map(el => {
      return `
    <div class="photo-card">
      <div class="image-wrap">
        <a href="${el.largeImageURL}"><img class="image" src="${el.largeImageURL}" alt="${el.type}: ${el.tags}" loading="lazy" /></a>
      </div>
      
      <div class="info">
        <p class="info-item">
          <b>Likes</b><br><span>${el.likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b><br><span>${el.views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b><br><span>${el.comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b><br><span>${el.downloads}</span>
        </p>
      </div>
    </div>
    `;
    })
    .join('');
}

// функция рисует разметку в интерфейсе
function makeMarkup(data) {
  galleryEl.insertAdjacentHTML('beforeend', createPhotoCard(data));
}

// функция добавляет библиотеку simpleLightbox
function addSimpleLightbox() {
  return simpleLightbox.refresh();
}

// функция делает плавный скролл
function addSmoothScroling() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function getCatch() {
  return Notify.success(`Data not loaded, please try again.`);
}
