import axios from "axios";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
let lightbox = new SimpleLightbox(".gallery a", {
  spinner: true,
  captionsData: "alt",
  captionsDelay: 250,
});

const searchFormEl = document.querySelector("#search-form");
const galleryEl = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");

searchFormEl.addEventListener("submit", handleSearchImage);
loadMoreBtn.addEventListener("click", handleLoadMoreClickBtn);
loadMoreBtn.classList.add("is-hidden");

const per_page = 40;
let searchQuery = "";
let startpage = 1;
let images = '';
let page;

const API_KEY = "35107716-da32e5ff358c128d5e6c68865";
const URL = "https://pixabay.com/api/";

async function request(searchQuery) {
  page = startpage;
  const urlOptions = "image_type=photo&orientation=horizontal&safesearch=true";
  const url = `${URL}?key=${API_KEY}&q=${searchQuery}&${urlOptions}&page=${page}&per_page=${per_page}`;
  const answer = await axios.get(url);
  return answer;
}

async function handleSearchImage(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();
  search();
}

function search() {
  startpage = 1;
  if (!searchQuery) {
    galleryEl.innerHTML = "";
  }

  if (searchQuery) {
    return request(searchQuery).then(({ data }) => {
    if (data.totalHits === 0) {
      Notify.failure(
        "Sorry, there are no images matching your search query. Please try again."
      );
    return;
  }

  if (data.totalHits !== 0) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    createGallery(data);
    galleryEl.innerHTML = images;
    lightbox.refresh();
    loadMoreBtn.classList.remove("is-hidden");
  }

  if(data.totalHits < per_page) {
    loadMoreBtn.classList.add("is-hidden");
  }
});
}
}

  async function handleLoadMoreClickBtn() {
  startpage += 1;
    return await request(searchQuery).then(({ data }) => {
    createrGallery(data);
    galleryEl.insertAdjacentHTML('beforeend', images);
    lightbox.refresh();
    smoothScroll();
      if(data.totalHits < per_page * page) {
        loadMoreBtn.classList.add("is-hidden");
        Notify.failure(
          "Sorry, there are no images matching your search query. Please try again."
        );
      }
    });
}

function createGallery(data) {
  return (images = data.hits
    .map((image) => {
      return `<div class="photo-card">
            <a class="gallery__item" href="${image.largeImageURL}">
            <img class="gallery__image" src="${image.largeImageURL}" alt="${image.tags}" loading="lazy" width=300/>
          </a>
            <div class="info">
            <p class="info-item">
              <b>Likes</b>${image.likes}
            </p>
            <p class="info-item">
              <b>Views</b>${image.views}
            </p>
            <p class="info-item">
              <b>Comments</b>${image.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${image.downloads}
            </p>
          </div>
        </div>
          `;
    })
    .join(""));
}