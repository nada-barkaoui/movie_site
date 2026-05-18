const CLE_LISTE = "cinevibe_ma_liste";

function lireListe() {
  let donnees = localStorage.getItem(CLE_LISTE);
  if (donnees === null) { return []; }
  return JSON.parse(donnees);
}

function sauvegarderListe(liste) {
  localStorage.setItem(CLE_LISTE, JSON.stringify(liste));
}

function ajouterALaListe(idFilm) {
  let liste = lireListe();
  let indexExistant = liste.findIndex(function(item) { return item.id === idFilm; });

  if (indexExistant !== -1) {
    afficherToast("✋ Déjà dans ta liste !");
    return;
  }

  let filmTrouve = films.find(function(f) { return f.id === idFilm; });
  if (filmTrouve === undefined) { return; }

  let entree = {
    id         : filmTrouve.id,
    titre      : filmTrouve.titre,
    annee      : filmTrouve.annee,
    genre      : filmTrouve.genre,
    note       : filmTrouve.note,
    duree      : filmTrouve.duree,
    emoji      : filmTrouve.emoji,
    couleur    : filmTrouve.couleur,
    image      : filmTrouve.image,        /* ✅ FIX — champ manquant ajouté */
    description: filmTrouve.description,
    dateAjout  : Date.now()
  };

  liste.push(entree);
  sauvegarderListe(liste);
  afficherToast("✅ " + filmTrouve.titre + " ajouté à ta liste !");
  mettreAJourBoutonModal(idFilm, true);
}

function supprimerDeLaListe(idFilm) {
  let liste = lireListe();
  let nouvelleListe = liste.filter(function(item) { return item.id !== idFilm; });
  sauvegarderListe(nouvelleListe);

  let contenu = document.getElementById("contenu-liste");
  if (contenu !== null) { afficherContenuListe(); }

  afficherToast("🗑 Film retiré de ta liste");
  mettreAJourBoutonModal(idFilm, false);
}

function estDansLaListe(idFilm) {
  let liste = lireListe();
  return liste.findIndex(function(item) { return item.id === idFilm; }) !== -1;
}

function trierListe() { afficherContenuListe(); }

function obtenirListeTriee() {
  let liste = lireListe();
  let selectTri = document.getElementById("select-tri");
  let critere = selectTri ? selectTri.value : "date";

  if (critere === "note") {
    liste.sort(function(a, b) { return b.note - a.note; });
  } else if (critere === "titre") {
    liste.sort(function(a, b) { return a.titre.localeCompare(b.titre); });
  } else if (critere === "annee") {
    liste.sort(function(a, b) { return b.annee - a.annee; });
  } else {
    liste.sort(function(a, b) { return b.dateAjout - a.dateAjout; });
  }
  return liste;
}

function afficherContenuListe() {
  let contenu = document.getElementById("contenu-liste");
  if (contenu === null) { return; }

  let liste = obtenirListeTriee();

  let compteur = document.getElementById("compteur-liste");
  if (compteur !== null) {
    compteur.innerHTML = "<strong>" + liste.length + "</strong> film(s) dans ta liste";
  }

  if (liste.length === 0) {
    contenu.innerHTML =
      '<div class="etat-vide col-12 text-center py-5">' +
        '<div class="icone-vide" style="font-size:5rem">🎬</div>' +
        '<h2 class="mt-3">Ta liste est vide</h2>' +
        '<p class="text-secondary mb-4">Ajoute des films depuis la page d\'accueil en cliquant sur "+ Ma liste"</p>' +
        '<a href="index.html" class="btn-principal text-decoration-none px-4 py-2">← Découvrir des films</a>' +
      '</div>';
    return;
  }

  let html = "";
  for (let i = 0; i < liste.length; i++) {
    let film = liste[i];
    let date = new Date(film.dateAjout);
    let dateFormatee = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    let couleurG = couleursGenre[film.genre] || "#888";

    /* ✅ FIX — utilise film.image si disponible, encode les espaces, sinon fallback */
    let afficheStyle = film.image
      ? 'background-image:linear-gradient(to top,rgba(10,10,15,0.7) 0%,transparent 60%),url(' + film.image.split("/").map(function(s){return encodeURIComponent(s);}).join("/") + ');background-size:cover;background-position:center;'
      : 'background:linear-gradient(135deg,' + (couleursGenre[film.genre] || "#364023") + '33,' + (couleursGenre[film.genre] || "#364023") + '11);';

    html += '<div class="col">';
    html += '<div class="carte-liste h-100" id="carte-liste-' + film.id + '">';
    html += '<button class="btn-supprimer" onclick="supprimerDeLaListe(' + film.id + ')" title="Retirer">✕</button>';
    html += '<div class="affiche" style="' + afficheStyle + '">';
    if (!film.image) { html += '<span style="font-size:3rem">' + (film.emoji || "🎬") + '</span>'; }    html += '</div>';
    html += '<div class="corps-carte">';
    html += '<span class="badge-genre" style="background:' + couleurG + '22;color:' + couleurG + '">' + film.genre + '</span>';
    html += '<div class="titre-carte">' + film.titre + '</div>';
    html += '<div class="sous-carte"><span>' + film.annee + '</span><span class="note-carte">★ ' + film.note + '</span></div>';
    html += '<div class="date-ajout">Ajouté le ' + dateFormatee + '</div>';
    html += '</div>';
    html += '<div class="p-2 d-flex gap-2">';
    html += '<button class="btn-principal flex-grow-1" style="padding:8px;font-size:12px" onclick="ouvrirModal(' + film.id + ')">▶ Détails</button>';
    html += '<button class="btn-fantome" style="padding:8px 12px;font-size:12px" onclick="supprimerDeLaListe(' + film.id + ')">🗑</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }
  contenu.innerHTML = html;
}

function viderListe() {
  if (!confirm("Vider toute ta liste ?")) { return; }
  sauvegarderListe([]);
  afficherContenuListe();
  afficherToast("🗑 Liste vidée !");
}

function mettreAJourBoutonModal(idFilm, estAjoute) {
  let btnModal = document.querySelector(".cinevibe-modal-actions .btn-fantome");
  if (btnModal === null) { return; }
  btnModal.innerHTML = estAjoute ? "✅ Dans ma liste" : "+ Ma liste";
  btnModal.onclick = estAjoute
    ? function() { supprimerDeLaListe(idFilm); }
    : function() { ajouterALaListe(idFilm); };
}

function afficherToast(message) {
  let toast = document.getElementById("toast");
  if (toast === null) { return; }
  toast.innerHTML = message;
  toast.classList.add("visible");
  setTimeout(function() { toast.classList.remove("visible"); }, 2500);
}

let ouvrirModalOriginal = ouvrirModal;
ouvrirModal = function(idFilm) {
  ouvrirModalOriginal(idFilm);
  setTimeout(function() {
    let btnFantome = document.querySelector(".cinevibe-modal-actions .btn-fantome");
    if (btnFantome === null) { return; }
    let dansListe = estDansLaListe(idFilm);
    if (dansListe) {
      btnFantome.innerHTML = "✅ Dans ma liste";
      btnFantome.onclick = function() { supprimerDeLaListe(idFilm); };
    } else {
      btnFantome.innerHTML = "+ Ma liste";
      btnFantome.onclick = function() { ajouterALaListe(idFilm); };
    }
  }, 50);
};

window.addEventListener("load", function() {
  let contenu = document.getElementById("contenu-liste");
  if (contenu !== null) {
    setTimeout(function() { afficherContenuListe(); }, 300);
  }
});
