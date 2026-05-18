let films      = [];
let genreActif = "Tous";

const couleursGenre = {
  "Action"   : "#bcdf93",
  "Sci-Fi"   : "#b0bae1",
  "Drame"    : "#d9bde3",
  "Comédie"  : "#ffcb7c",
  "Horreur"  : "#b777a6",
  "Romance"  : "#f49aa2",
  "Animation": "#b4b534",
  "Thriller" : "#ffb876",
  "Documentary": "#90c8d4"
};


/* ── CHARGEMENT JSON (CH5) ── */
 
function chargerFilms() {
  fetch("movies.json")
    .then(function(rep)  { return rep.text(); })
    .then(function(json) {
      films = JSON.parse(json);
      afficherTendances();
      afficherTous();
    });
}
 
 
/* ── CARTE FILM ── */
 
function encoderURL(chemin) {
  /* encode chaque segment du chemin séparément pour gérer les espaces */
  return chemin.split("/").map(function(s) { return encodeURIComponent(s); }).join("/");
}
 
function creerCarteHTML(film) {
  let couleurG = couleursGenre[film.genre] || "#888";
 
  let affiche = "";
  if (film.image) {
    let src = encoderURL(film.image);
    affiche =
      '<div class="affiche" style="' +
        'background-image:linear-gradient(to top,rgba(25,52,0,0.54) 0%,transparent 60%),url(' + src + ');' +
        'background-size:cover;background-position:center top">' +
      '</div>';
  } else {
    let couleur = film.couleur || couleursGenre[film.genre] || "#364023";
    affiche =
      '<div class="affiche" style="background:linear-gradient(135deg,' + couleur + '55,' + couleur + '11);' +
        'align-items:center;justify-content:center">' +
        '<span style="font-size:3rem">' + (film.emoji || "🎬") + '</span>' +
      '</div>';
  }
 
  return (
    '<div class="carte-film" onclick="ouvrirModal(' + film.id + ')">' +
      affiche +
      '<div class="superposition">' +
        '<button class="btn-voir">&#9654; Voir</button>' +
        '<div class="meta-superposition">&#9733; ' + film.note + ' &nbsp;•&nbsp; ' + film.duree + '</div>' +
      '</div>' +
      '<div class="corps-carte">' +
        '<span class="badge-genre" style="background:' + couleurG + '22;color:' + couleurG + '">' + film.genre + '</span>' +
        '<div class="titre-carte">' + film.titre + '</div>' +
        '<div class="sous-carte">' +
          '<span>' + film.annee + '</span>' +
          '<span class="note-carte">&#9733; ' + film.note + '</span>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
 
 
/* ── AFFICHAGE TENDANCES ── */
 
function afficherTendances() {
  let tendances = films.filter(function(f) { return f.tendance === true; });
  let html = "";
  tendances.forEach(function(f) { html += creerCarteHTML(f); });
  let el = document.getElementById("rangee-tendances");
  if (el) { el.innerHTML = html; }
}
 
 
/* ── AFFICHAGE TOUS LES FILMS ── */
 
function afficherTous() {
  let champEl   = document.getElementById("champ-recherche");
  let recherche = champEl ? champEl.value.toLowerCase() : "";
 
  let filtres = films.filter(function(f) {
    let okGenre    = (genreActif === "Tous") || (f.genre === genreActif);
    let okRecherche = (recherche === "")
                   || f.titre.toLowerCase().includes(recherche)
                   || f.genre.toLowerCase().includes(recherche);
    return okGenre && okRecherche;
  });
 
  let html = "";
  for (let i = 0; i < filtres.length; i++) {
    html += creerCarteHTML(filtres[i]);
  }
  document.getElementById("grille-films").innerHTML = html;
 
  let compteur = document.getElementById("compteur-films");
  if (compteur) { compteur.innerHTML = filtres.length + " films"; }
}
 
 
/* ── FILTRE GENRE ── */
 
function filtrerGenre(genre, element) {
  genreActif = genre;
  let pills = document.querySelectorAll(".pill-genre");
  for (let i = 0; i < pills.length; i++) {
    pills[i].classList.remove("actif");
  }
  element.classList.add("actif");
  afficherTous();
}
 
 
/* ── RECHERCHE ── */
 
function rechercherFilm() {
  afficherTous();
}
 
 
/* ── MODAL ── */
 
function ouvrirModal(idFilm) {
  let film = films.find(function(f) { return f.id === idFilm; });
  if (!film) { return; }
 
  let modal = document.querySelector(".cinevibe-modal");
  if (film.image) {
    let src = encoderURL(film.image);
    modal.style.backgroundImage    = "linear-gradient(to top,rgba(10,10,15,1) 40%,rgba(10,10,15,0.5) 100%),url(" + src + ")";
    modal.style.backgroundSize     = "cover";
    modal.style.backgroundPosition = "center";
  } else {
    let couleur = film.couleur || couleursGenre[film.genre] || "#364023";
    modal.style.backgroundImage    = "linear-gradient(135deg," + couleur + "33,#0a0a0f)";
    modal.style.backgroundSize     = "auto";
    modal.style.backgroundPosition = "auto";
  }
 
  let emojiHtml = film.emoji ? '<div style="font-size:3.5rem;margin-bottom:0.5rem">' + film.emoji + '</div>' : "";
 
  document.getElementById("contenu-modal").innerHTML = (
    emojiHtml +
    '<div class="cinevibe-modal-titre">' + film.titre + '</div>' +
    '<div class="cinevibe-modal-meta">' +
      '<span class="cinevibe-modal-genre-badge">' + film.genre + '</span>' +
      '<span>' + film.annee + '</span>' +
      '<span>' + film.duree + '</span>' +
      '<span style="color:var(--accent2)">&#9733; ' + film.note + '</span>' +
    '</div>' +
    '<p class="cinevibe-modal-desc">' + film.description + '</p>' +
    '<div class="cinevibe-modal-actions">' +
      '<button class="btn-principal" onclick="ouvrirVideo(' + film.id + ')">&#9654; Voir maintenant</button>' +
      '<button class="btn-fantome"   onclick="ajouterALaListe(' + film.id + ')">+ Ma liste</button>' +
    '</div>'
  );
 
  document.getElementById("superposition-modal").classList.add("actif");
}
 
function fermerModal(evenement) {
  if (!evenement || evenement.target === document.getElementById("superposition-modal")) {
    document.getElementById("superposition-modal").classList.remove("actif");
    document.querySelector(".cinevibe-modal").style.backgroundImage = "";
  }
}
 
 
/* ── LECTEUR VIDÉO ── */
 
function ouvrirVideo(idFilm) {
  let film = films.find(function(f) { return f.id === idFilm; });
  if (!film) { return; }
 
  if (!film.video) {
    afficherToast("⚠️ Aucun fichier vidéo pour ce film.");
    return;
  }
 
  /* Passer l'id du film à la page watch via l'URL */
  window.location.href = "watch.html?id=" + idFilm;
}
 
function fermerVideo(evenement) {
  /* garde pour compatibilité — plus utilisé */
}
 
 
/* ── CHATBOT — DONNÉES ── */
 
let chatOuvert      = false;
let etape           = 0;
let prefUtilisateur = {};
 
const fluxChat = [
  { bot: "Salut ! Je suis CineBot. Je vais t'aider a trouver le film parfait. Pret ?",
    options: ["Allons-y ! 🍿", "Oui, choisis pour moi !"] },
  { bot: "Comment tu te sens en ce moment ?",
    options: ["😄 Joyeux et energique", "😔 Un peu melancolique", "😱 En quete de sensations", "🤔 Curieux et pensif"] },
  { bot: "Combien de temps tu veux regarder ?",
    options: ["Moins de 2h", "Entre 2h et 3h", "Peu importe !"] },
  { bot: "Tu regardes seul ou avec quelqu'un ?",
    options: ["🙋 Solo", "👫 En couple", "👨‍👩‍👧 En famille"] },
  { bot: "Quel type de fin tu preferes ?",
    options: ["😊 Fin heureuse", "😢 Fin emouvante", "🤯 Twist inattendu"] }
];
 
const tableHumeur = {
  "😄 Joyeux et energique"   : ["fun", "leger", "bizarre"],
  "😔 Un peu melancolique"   : ["romantique", "emotionnel"],
  "😱 En quete de sensations": ["effrayant", "sombre", "intense"],
  "🤔 Curieux et pensif"     : ["epique", "serieux", "epoustouflant"]
};
 
 
/* ── CHATBOT — FONCTIONS ── */
 
function toggleChat() {
  chatOuvert = !chatOuvert;
  document.getElementById("chatbot").classList.toggle("ouvert", chatOuvert);
  if (chatOuvert && etape === 0) { demarrerChat(); }
}
 
function demarrerChat() {
  document.getElementById("chat-messages").innerHTML = "";
  document.getElementById("chat-options").innerHTML  = "";
  etape           = 0;
  prefUtilisateur = {};
  setTimeout(function() { botParle(fluxChat[0].bot, fluxChat[0].options); }, 400);
}
 
function botParle(texte, options) {
  if (!options) { options = []; }
  let msgs     = document.getElementById("chat-messages");
  let idFrappe = "frappe_" + Date.now();
 
  let div = document.createElement("div");
  div.className = "msg bot";
  div.id        = idFrappe;
  div.innerHTML = '<div class="msg-avatar">🎬</div><div class="bulle"><div class="frappe"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
 
  setTimeout(function() {
    let frappe = document.getElementById(idFrappe);
    if (frappe) { frappe.remove(); }
    msgs.innerHTML += '<div class="msg bot"><div class="msg-avatar">🎬</div><div class="bulle">' + texte + '</div></div>';
    msgs.scrollTop  = msgs.scrollHeight;
    afficherOptions(options);
  }, 900);
}
 
function afficherOptions(opts) {
  let html = "";
  for (let i = 0; i < opts.length; i++) {
    let safe = opts[i].replace(/'/g, "&#39;");
    html += '<button class="btn-option" onclick="choisirOption(\'' + safe + '\')">' + opts[i] + '</button>';
  }
  document.getElementById("chat-options").innerHTML = html;
}
 
function recommander() {
  let vibes     = tableHumeur[prefUtilisateur.humeur] || ["fun"];
  let candidats = films.filter(function(f) {
    for (let i = 0; i < vibes.length; i++) {
      if (f.vibe === vibes[i] || f.humeur.indexOf(vibes[i]) !== -1) { return true; }
    }
    return false;
  });
 
  if (prefUtilisateur.duree === "Moins de 2h") {
    candidats = candidats.filter(function(f) { return parseInt(f.duree) < 120; });
  } else if (prefUtilisateur.duree === "Entre 2h et 3h") {
    candidats = candidats.filter(function(f) { return parseInt(f.duree) >= 120; });
  }
 
  if (candidats.length === 0) { candidats = films; }
  candidats.sort(function(a, b) { return b.note - a.note; });
  return candidats.slice(0, 2);
}
 
function choisirOption(opt) {
  document.getElementById("chat-options").innerHTML = "";
  let msgs = document.getElementById("chat-messages");
  msgs.innerHTML += '<div class="msg utilisateur"><div class="bulle">' + opt + '</div></div>';
  msgs.scrollTop  = msgs.scrollHeight;
 
  if (opt === "🔄 Recommencer") {
    etape = 0; prefUtilisateur = {}; msgs.innerHTML = "";
    setTimeout(function() { botParle(fluxChat[0].bot, fluxChat[0].options); }, 300);
    return;
  }
  if (opt === "🎬 Parcourir les films") { toggleChat(); return; }
 
  etape++;
  if (etape === 2) { prefUtilisateur.humeur = opt; }
  if (etape === 3) { prefUtilisateur.duree  = opt; }
  if (etape === 4) { prefUtilisateur.solo   = opt; }
  if (etape === 5) {
    prefUtilisateur.fin = opt;
    let recos    = recommander();
    let htmlRecos = "";
    for (let i = 0; i < recos.length; i++) {
      let r = recos[i];
      htmlRecos +=
      '<div class="carte-reco" onclick="fermerModal();toggleChat();ouvrirModal(' + r.id + ')" ' +
      'style="cursor:pointer;transition:transform .15s" ' +
      'onmouseover="this.style.transform=\'scale(1.02)\'" ' +
      'onmouseout="this.style.transform=\'scale(1)\'">' +
      '<div class="reco-titre">' + (r.emoji || "🎬") + ' ' + r.titre + '</div>' +
      '<div class="reco-meta">' + r.genre + ' • ' + r.annee + ' • &#9733; ' + r.note + '</div>' +
      '<div class="reco-raison">🎬 Clique pour voir le film</div>' +
    '</div>';
    }
    setTimeout(function() {
      botParle("Voici mes recommandations pour toi ! 🍿", []);
      setTimeout(function() {
        msgs.innerHTML += '<div class="msg bot"><div class="msg-avatar">🎬</div><div class="bulle">' + htmlRecos + '</div></div>';
        msgs.scrollTop  = msgs.scrollHeight;
        afficherOptions(["🔄 Recommencer", "🎬 Parcourir les films"]);
      }, 1200);
    }, 300);
    return;
  }
 
  if (fluxChat[etape]) {
    setTimeout(function() { botParle(fluxChat[etape].bot, fluxChat[etape].options); }, 300);
  }
}
 
function envoyerTexte() {
  let champ = document.getElementById("saisie-chat");
  let val   = champ.value.trim();
  if (!val) { return; }
  champ.value = "";
  let msgs = document.getElementById("chat-messages");
  msgs.innerHTML += '<div class="msg utilisateur"><div class="bulle">' + val + '</div></div>';
  msgs.scrollTop  = msgs.scrollHeight;
  setTimeout(function() { botParle("Utilise les boutons pour naviguer dans le quiz 😊", []); }, 600);
}
 
 
/* ── INIT ── */
 
chargerFilms();