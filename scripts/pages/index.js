// Récupération des données des photographes
async function getPhotographers() {
  try {
    // Récupération du fichier JSON contenant les données des photographes
    const response = await fetch("./data/photographers.json");
    if (!response.ok) {
      // Gestion d'erreur si le fichier ne se charge pas correctement
      throw new Error("Erreur lors du chargement des données");
    }
    const data = await response.json(); // Conversion de la réponse en objet JavaScript
    return data.photographers; // Retourne uniquement le tableau de photographes
  } catch (error) {
    console.error(error); // Affiche l'erreur dans la console
    return []; // Retourne un tableau vide en cas d'erreur
  }
}

// Affichage des données dans le DOM
async function displayData(photographers) {
  // Récupération de l'élément HTML qui contiendra les cartes
  const photographersSection = document.querySelector(".photographer_section");

  // Création et insertion d'une carte HTML pour chaque photographe
  photographers.forEach((photographer) => {
    // Appel du modèle de template pour générer la structure HTML
    // eslint-disable-next-line no-undef
    const photographerModel = photographerTemplate(photographer);
    const userCardDOM = photographerModel.getUserCardDOM();
    photographersSection.appendChild(userCardDOM); // Insertion dans le DOM
  });
}

// Fonction d'initialisation du script
async function init() {
  // Récupération des données
  const photographers = await getPhotographers();
  // Affichage dans le DOM
  displayData(photographers);
}

// Lancement du script principal
init();
