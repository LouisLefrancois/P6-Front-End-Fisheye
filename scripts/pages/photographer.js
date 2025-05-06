// objet pour stocker l'état des likes
const mediaLikesState = {};

// Récupération des éléments principaux de la lightbox et de la galerie
const lightbox = document.getElementById("lightbox");
const lightboxMedia = document.querySelector(".lightbox-media");
const mediaGallery = document.querySelector(".media-gallery");
const btnPrev = document.querySelector(".lightbox-prev");
const btnNext = document.querySelector(".lightbox-next");

let lastFocusedElement = null; // Pour restaurer le focus après fermeture
let mediaItems = []; // Tableau contenant tous les éléments médias (img/vidéo)
let currentIndex = 0; // Index du média actuellement affiché dans la lightbox

// Ouvre la lightbox avec l'élément média correspondant à l'index donné
function openLightbox(index) {
  const media = mediaItems[index];
  currentIndex = index;

  lastFocusedElement = media;

  lightboxMedia.innerHTML = ""; // Nettoie le contenu précédent de la lightbox

  let src = "";
  const title = media.getAttribute("data-title") || media.getAttribute("alt");

  if (media.tagName.toLowerCase() === "img") {
    src = media.getAttribute("src");

    const img = document.createElement("img");
    img.src = src;
    img.alt = title;
    img.setAttribute("tabindex", "0"); // rendre focusable l'image
    img.setAttribute("role", "img"); // rôle explicite pour screen reader
    lightboxMedia.appendChild(img);
  } else if (media.tagName.toLowerCase() === "video") {
    const source = media.querySelector("source");
    if (source) {
      src = source.getAttribute("src");

      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.setAttribute("tabindex", "0"); // rendre focusable la vidéo (même si elle est déjà focusable par défaut)
      video.setAttribute("aria-label", title);
      lightboxMedia.appendChild(video);
    } else {
      console.error("Source de vidéo introuvable");
    }
  }

  // Affiche le titre du média
  const titleDiv = document.querySelector(".lightbox-title");
  titleDiv.textContent = title;

  // Affiche la lightbox et empêche le scroll du body
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Accessibilité : définition des rôles ARIA
  lightbox.setAttribute("aria-label", "image closeup view");
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");

  // Focus sur la lightbox
  lightbox.setAttribute("tabindex", "-1");
  lightbox.focus();
}

// Ferme la lightbox et restaure l'état initial
function closeLightbox() {
  lightbox.classList.add("hidden");
  lightboxMedia.innerHTML = "";
  document.body.style.overflow = "";

  // Restaure le focus sur le dernier élément
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Ferme la lightbox avec la touche "Enter" sur l'icône de fermeture
const closeIcon = document.querySelector(".lightbox-close img");
closeIcon.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    closeLightbox();
  }
});

// Navigation vers l'image suivante
function showNext() {
  currentIndex = (currentIndex + 1) % mediaItems.length;
  openLightbox(currentIndex);
}

// Navigation vers l'image précédente
function showPrev() {
  currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
  openLightbox(currentIndex);
}

// Navigation au clavier dans la lightbox
document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "Escape") closeLightbox();
});

// Prépare la lightbox avec tous les médias présents dans la galerie
function setupLightbox() {
  mediaItems = Array.from(mediaGallery.querySelectorAll("img, video"));

  mediaItems.forEach((media, index) => {
    media.setAttribute("tabindex", "0");

    // Ouvre la lightbox au clic ou à la touche Enter
    media.addEventListener("click", () => openLightbox(index));
    media.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        openLightbox(index);
      }
    });
  });
}

// Événements clic sur les boutons de navigation
btnNext.addEventListener("click", showNext);
btnPrev.addEventListener("click", showPrev);

// Initialise la galerie et applique les filtres au chargement
window.addEventListener("load", () => {
  setupLightbox();
  filterMedia();
});

// Trie et affiche les médias en fonction du filtre sélectionné
function filterMedia() {
  const filterSelect = document.getElementById("filter-select");
  const filterValue = filterSelect.value;

  const urlParams = new URLSearchParams(window.location.search);
  const photographerId = urlParams.get("id");

  fetch("./data/photographers.json")
    .then((response) => response.json())
    .then((data) => {
      const photographerData = data.photographers.find(
        (photographer) => photographer.id == photographerId
      );
      let photographerMedia = data.media.filter(
        (media) => media.photographerId == photographerId
      );

      // Trie les médias
      if (filterValue === "popularity") {
        photographerMedia.sort((a, b) => b.likes - a.likes);
      } else if (filterValue === "title") {
        photographerMedia.sort((a, b) => a.title.localeCompare(b.title));
      }

      const mediaSection = document.querySelector(".media-gallery");
      mediaSection.innerHTML = ""; // Vider la galerie

      // Génère chaque média
      photographerMedia.forEach((media) => {
        const mediaElement = document.createElement("div");
        mediaElement.classList.add("media-item");

        let mediaContent = "";

        if (media.video) {
          const videoPath = `assets/images/SamplePhotos/${
            photographerData.name.split(" ")[0]
          }/${media.video}`;
          mediaContent = `<video><source src="${videoPath}" type="video/mp4"></video>`;
        } else if (media.image) {
          const imagePath = `assets/images/SamplePhotos/${
            photographerData.name.split(" ")[0]
          }/${media.image}`;
          mediaContent = `<img src="${imagePath}" alt="${media.title}" />`;
        }

        const liked = mediaLikesState[media.id] || false;
        const currentLikes = liked ? media.likes + 1 : media.likes;

        mediaElement.innerHTML = `
        ${mediaContent}
        <div class="groupTitleLikes">
          <p tabindex="0">${media.title}</p>
          <span tabindex="0" aria-label="${currentLikes} likes">
            ${currentLikes} <i class="fa-solid fa-heart ${
          liked ? "liked added" : ""
        }" tabindex="0"></i>
          </span>
        </div>
      `;

        const heartIcon = mediaElement.querySelector("i");
        const likeCountElement = mediaElement.querySelector("span");

        heartIcon.addEventListener("click", () => {
          mediaLikesState[media.id] = !mediaLikesState[media.id];
          const updatedLikes = mediaLikesState[media.id]
            ? media.likes + 1
            : media.likes;

          // Met à jour juste le texte du compteur
          likeCountElement.childNodes[0].textContent = `${updatedLikes} `;

          // Met à jour les classes de l’icône
          heartIcon.classList.toggle("liked", mediaLikesState[media.id]);
          heartIcon.classList.toggle("added", mediaLikesState[media.id]);

          // Met à jour le total des likes
          updateTotalLikes(photographerMedia);
        });

        mediaElement.setAttribute("tabindex", "0");
        heartIcon.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            heartIcon.click(); // Clique sur l'icône du cœur pour liker
          }
        });

        mediaSection.appendChild(mediaElement);
      });

      // Met à jour les données globales
      mediaItems = photographerMedia; // Réinitialiser mediaItems avec les éléments filtrés
      setupLightbox(); // Réinitialiser la lightbox avec les nouveaux éléments
      updateTotalLikes(photographerMedia);
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des données JSON:", error)
    );
}

// Fonction asynchrone pour récupérer les données
async function fetchData() {
  try {
    // Récupère les données JSON depuis le fichier local
    const response = await fetch("./data/photographers.json");

    // Convertit la réponse en objet JavaScript
    const data = await response.json();

    // Récupère les paramètres de l'URL (ex: ?id=243)
    const urlParams = new URLSearchParams(window.location.search);

    // Extrait la valeur de "id" depuis l'URL
    const photographerId = urlParams.get("id");

    // Recherche le photographe correspondant à l'id
    const photographerData = data.photographers.find(
      (photographer) => photographer.id == photographerId
    );

    // Filtre les médias qui appartiennent à ce photographe
    const photographerMedia = data.media.filter(
      (media) => media.photographerId == photographerId
    );

    // Si le photographe existe, on affiche ses infos et ses médias
    if (photographerData) {
      displayPhotographer(photographerData, photographerMedia);
      // Sinon, on affiche une erreur dans la console
    } else {
      console.error("Photographe introuvable !");
    }
  } catch (error) {
    // Si une erreur survient pendant le fetch ou le traitement, on l'affiche
    console.error("Erreur lors de la récupération des données JSON:", error);
  }
}

// Aaffiche dynamiquement le profil d’un photographe et ses médias (page photographe)
function displayPhotographer(photographerData, photographerMedia) {
  // Sélectionne la section de l'en-tête du photographe dans le DOM
  const photographerSection = document.querySelector(".photograph-header");

  // Crée une carte du photographe à partir de son modèle
  const photographerCard = photographerTemplate(photographerData);

  // Ajoute la carte du photographe dans la section prévue
  photographerSection.appendChild(photographerCard.getUserCardDOM());

  // Sélectionne la galerie des médias du photographe
  const mediaSection = document.querySelector(".media-gallery");

  // Parcourt tous les médias associés à ce photographe
  photographerMedia.forEach((media) => {
    // Crée un conteneur pour chaque média
    const mediaElement = document.createElement("div");
    mediaElement.classList.add("media-item");

    let mediaContent = "";

    // Si le média est une vidéo, on construit une balise <video>
    if (media.video) {
      const videoPath = `assets/images/SamplePhotos/${
        photographerData.name.split(" ")[0]
      }/${media.video}`;
      mediaContent = `<video><source src="${videoPath}" type="video/mp4"></video>`;
    }
    // Sinon si c'est une image, on construit une balise <img>
    else if (media.image) {
      const imagePath = `assets/images/SamplePhotos/${
        photographerData.name.split(" ")[0]
      }/${media.image}`;
      mediaContent = `<img src="${imagePath}" alt="${media.title}" />`;
    }

    // Vérifie si le média est déjà liké dans l'état local (mediaLikesState)
    const liked = mediaLikesState[media.id] || false;
    // Si liké, on ajoute 1 au nombre de likes affiché
    const currentLikes = liked ? media.likes + 1 : media.likes;

    // Remplit le HTML du média avec le contenu + titre + compteur de likes
    mediaElement.innerHTML = `
      ${mediaContent}
      <div class="groupTitleLikes">
        <p>${media.title}</p>
        <span>${currentLikes} <i class="fa-solid fa-heart ${
      liked ? "liked added" : ""
    }" tabindex="0"></i></span>
      </div>
    `;

    // Récupère l'icône du cœur et le compteur de likes dans l'élément
    const heartIcon = mediaElement.querySelector("i");
    const likeCountElement = mediaElement.querySelector("span");

    // Ajoute un événement au clic sur l'icône de like
    heartIcon.addEventListener("click", () => {
      // Inverse l'état du like
      mediaLikesState[media.id] = !mediaLikesState[media.id];
      const updatedLikes = mediaLikesState[media.id]
        ? media.likes + 1
        : media.likes;

      // Met à jour le nombre de likes affiché
      likeCountElement.childNodes[0].textContent = `${updatedLikes} `;

      // Ajoute ou enlève les classes CSS pour le cœur
      heartIcon.classList.toggle("liked", mediaLikesState[media.id]);
      heartIcon.classList.toggle("added", mediaLikesState[media.id]);

      // Met à jour le total des likes affichés dans la page
      updateTotalLikes(photographerMedia);
    });

    // Permet le focus clavier sur chaque élément média
    mediaElement.setAttribute("tabindex", "0");

    // Permet de liker au clavier avec "Entrée" ou "Espace"
    heartIcon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        heartIcon.click(); // Simule un clic sur l'icône
      }
    });

    // Ajoute le média dans la galerie
    mediaSection.appendChild(mediaElement);
  });

  // Met à jour le total des likes en bas de page ou ailleurs
  updateTotalLikes(photographerMedia);
}

// Fonction qui prend un objet photographe (data) et retourne des infos + un DOM personnalisé
function photographerTemplate(data) {
  // Déstructuration des propriétés depuis l'objet data
  const { name, city, country, tagline, price, portrait, id } = data;
  // Chemin vers la photo du photographe
  const picture = `assets/photographers/${portrait}`;
  // URL vers la page du photographe avec son ID
  const photographerPageURL = `photographer.html?id=${id}`;

  // Fonction utilitaire pour créer un élément HTML avec attributs et contenu texte
  const createElementWithAttributes = (
    tag,
    attributes = {},
    textContent = ""
  ) => {
    const element = document.createElement(tag); // Crée un élément du type demandé (ex: 'div', 'img'...)
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value); // Applique chaque attribut à l’élément
    }
    if (textContent) element.textContent = textContent; // Ajoute le texte s’il y en a
    return element; // Retourne l’élément HTML
  };

  // Fonction qui génère le DOM complet du photographe (carte avec infos + image + bouton contact)
  function getUserCardDOM() {
    const article = document.createElement("article"); // crée un élément <article>
    article.classList.add("photograph-header-article"); // ajoute classe CSS "photograph-header-article"

    // Lien vers la page du photographe
    const link = createElementWithAttributes("a", {
      href: photographerPageURL, // définit le lien vers la page du photographe (ex: photographer.html?id=243)
    });

    // Image du photographe
    const img = createElementWithAttributes("img", {
      src: picture,
      alt: `Portrait de ${name}`,
    });
    link.appendChild(img); // Ajoute l’image dans le lien

    // Conteneur pour les infos texte (nom, ville, etc.)
    const textContainer = document.createElement("div");
    textContainer.classList.add("text-container");

    // Ajout du nom, ville/pays, tagline et prix/jour
    textContainer.appendChild(
      createElementWithAttributes("h2", { tabindex: "0" }, name)
    );
    textContainer.appendChild(
      createElementWithAttributes(
        "h3",
        { tabindex: "0" },
        `${city}, ${country}`
      )
    );
    textContainer.appendChild(
      createElementWithAttributes("p", { tabindex: "0" }, tagline)
    );
    textContainer.appendChild(
      createElementWithAttributes("span", { tabindex: "0" }, `${price}€/jour`)
    );

    // Conteneur pour le bouton de contact
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("photograph-header");

    // Bouton "Contactez-moi"
    const button = createElementWithAttributes(
      "button",
      {
        class: "contact_button",
        id: "contact_button",
        onclick: "displayModal()", // Ouvre une modale de contact
      },
      "Contactez-moi"
    );
    buttonContainer.appendChild(button); // Ajoute le bouton dans le conteneur

    // Ajout des sections dans l’article final
    article.appendChild(textContainer); // Infos texte
    article.appendChild(buttonContainer); // Bouton
    article.appendChild(link); // Image + lien

    return article; // Retourne l'élément DOM complet
  }

  // La fonction retourne les données du photographe + une fonction pour générer le DOM
  return { name, city, country, tagline, price, picture, id, getUserCardDOM };
}

function updateTotalLikes(mediaArray) {
  // Calcul du total des likes à partir d'un tableau de médias
  const totalLikes = mediaArray.reduce((acc, media) => {
    // Vérifie si l'utilisateur a liké ce média (stocké dans mediaLikesState)
    const liked = mediaLikesState[media.id] || false;
    // Ajoute les likes du média + 1 si l'utilisateur a liké
    return acc + media.likes + (liked ? 1 : 0);
  }, 0);

  // Récupération de l'ID du photographe depuis l'URL (ex: ?id=123)
  const urlParams = new URLSearchParams(window.location.search);
  const photographerId = urlParams.get("id");

  // Requête pour récupérer les infos des photographes dans le fichier JSON
  fetch("./data/photographers.json")
    .then((response) => response.json()) // Conversion en objet JS
    .then((data) => {
      // Recherche du photographe correspondant à l'ID
      const photographerData = data.photographers.find(
        (photographer) => photographer.id == photographerId
      );

      // Récupération du prix ou message par défaut si non trouvé
      const price = photographerData
        ? photographerData.price
        : "Prix non disponible";

      // Sélection du conteneur qui affiche les infos fixes en bas
      const detailsFixed = document.querySelector(".detailsfixed");

      // Mise à jour du HTML avec le total des likes et le tarif journalier
      detailsFixed.innerHTML = `
        <p> 
          <span tabindex="0" aria-label="${totalLikes} likes au total">
            ${totalLikes} <i class="fa-solid fa-heart"></i> 
          </span> 
          <span tabindex="0">${price}€ / jour</span>
        </p>
      `;
    })
    // En cas d'erreur lors de la récupération du fichier JSON
    .catch((error) =>
      console.error("Erreur lors de la récupération des données JSON:", error)
    );
}

fetchData();
