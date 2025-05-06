// Sélectionne l'élément "overlay" (le fond semi-transparent du modal)
const overlay = document.getElementById("modal-overlay");
// Sélectionne le contenu principal de la page
const main = document.querySelector("main");

// Fonction pour afficher le modal
function displayModal() {
  // Affiche le fond du modal en changeant son display à "block"
  overlay.style.display = "block";
  // Focalise l'overlay pour le rendre accessible à l'utilisateur
  overlay.focus();
  // Cache le contenu principal pour l'accessibilité (screen readers)
  main.setAttribute("aria-hidden", "true");
  // Ajoute un écouteur d'événements pour fermer le modal (via 'keydown')
  document.addEventListener("keydown", closeModal);
}

// Fonction pour fermer le modal en fonction de l'événement
function closeModal(e) {
  // Vérifie si le modal est ouvert
  const isModalOpen = overlay.style.display === "block";

  if (!isModalOpen) return; // Si le modal n'est pas ouvert, rien ne se passe

  // Ferme le modal si l'utilisateur clique sur le fond, appuie sur "Escape", ou appuie sur "Enter" sur l'icône de fermeture
  if (
    e &&
    (e.type === "click" ||
      (e.key === "Escape" && isModalOpen) ||
      (e.key === "Enter" && e.target === closeFormIcon))
  ) {
    // Cache l'overlay (le fond) et réaffiche le contenu principal
    overlay.style.display = "none";
    main.setAttribute("aria-hidden", "false");

    // Remet le focus sur le bouton qui a ouvert le modal après un petit délai
    setTimeout(() => {
      const openModalButton = document.getElementById("contact_button");
      openModalButton.addEventListener("click", displayModal);
      if (openModalButton) openModalButton.focus();
    }, 100);
  }
}

// Sélectionne l'élément qui sert à fermer le modal (généralement une icône)
const closeFormIcon = document.getElementById("closeModalIcon");

// Ajoute un écouteur pour fermer le modal via la touche "Enter" sur l'icône de fermeture
closeFormIcon.addEventListener("keydown", closeModal);

// Ajoute un écouteur pour fermer le modal via un clic sur l'icône de fermeture
closeFormIcon.addEventListener("click", closeModal);

// Récupère l'ID du photographe depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const photographerId = urlParams.get("id");

// Charge les données des photographes depuis un fichier JSON
fetch("./data/photographers.json")
  .then((response) => response.json())
  .then((data) => {
    // Trouve le photographe correspondant à l'ID récupéré
    const photographerData = data.photographers.find(
      (photographer) => photographer.id == photographerId
    );

    // Si le photographe existe, met à jour le nom dans la page
    if (photographerData) {
      const nameduprod = document.querySelector(".nameduprod");
      nameduprod.textContent = photographerData.name;
    }
  })
  .catch((error) => {
    // Gère les erreurs en cas de problème lors du chargement des données
    console.error("Erreur lors du chargement des données :", error);
  });

// Gère l'envoi du formulaire de contact
document
  .getElementById("contact_modal")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page lors du submit

    // Récupère les valeurs des champs du formulaire
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("your_message").value;

    // Affiche les valeurs dans la console
    console.log("Prénom:", firstName);
    console.log("Nom:", lastName);
    console.log("Email:", email);
    console.log("Message:", message);
  });
