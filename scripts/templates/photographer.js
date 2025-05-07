// template des photographes (dispositions sur la homepage)

export function photographerTemplate(data) {
  // Déstructuration de l'objet data pour extraire les propriétés nécessaires
  const { name, city, country, tagline, price, portrait, id } = data;

  // Construction du chemin de l’image du photographe
  const picture = `assets/photographers/${portrait}`;

  // Génération dynamique de l’URL vers la page du photographe
  const photographerPageURL = `photographer.html?id=${id}`;

  // Fonction qui retourne la carte DOM du photographe
  function getUserCardDOM() {
    // Création d’un lien cliquable qui entoure l’image et le nom
    const link = document.createElement("a");
    link.setAttribute("href", photographerPageURL);
    link.classList.add("photographer-link");

    // Création de l’image avec description alternative pour l’accessibilité
    const img = document.createElement("img");
    img.setAttribute("src", picture);
    img.setAttribute("alt", `Portrait de ${name}`);

    // Création du nom du photographe (h2)
    const h2 = document.createElement("h2");
    h2.textContent = name;
    h2.setAttribute("tabindex", "0");

    // Ajout de l’image et du nom dans le lien
    link.appendChild(img);
    link.appendChild(h2);

    // Création et insertion de la ville/pays, tagline et prix
    const h3 = document.createElement("h3");
    h3.textContent = city + ", " + country;
    h3.setAttribute("tabindex", "0");

    const p = document.createElement("p");
    p.textContent = tagline;
    p.setAttribute("tabindex", "0");

    const span = document.createElement("span");
    span.textContent = `${price}€/jour`;
    span.setAttribute("tabindex", "0");

    const article = document.createElement("article");
    // Ajouter tous les éléments dans l'article
    article.appendChild(link); // image + nom
    article.appendChild(h3); // localisation
    article.appendChild(p); // slogan
    article.appendChild(span); // tarif

    return article;
  }

  // Retourne les infos utiles + la fonction qui génère la carte DOM
  return { name, city, country, tagline, price, picture, id, getUserCardDOM };
}
