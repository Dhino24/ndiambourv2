# Ndiambour Location - Site Web

Site responsive de vente et location de véhicules pour Ndiambour Location (Sénégal).

## Fonctionnalités 

### Frontend
- Catalogue véhicules avec filtres (type, marque, prix)
- Système réservation intégré 
- Galerie images via Cloudinary
- Design moderne avec touches africaines
- 100% responsive (mobile, tablette, desktop)

### Backend Admin
- Dashboard avec KPIs et graphiques
- CRUD véhicules (ajout/modif/suppr)
- Gestion réservations et demandes clients
- Upload images vers Cloudinary
- Interface intuitive avec DataTables

## Structure Projet

```
ndiambour-location/
├── assets/
│   ├── css/
│   │   ├── style.css       # Styles frontend
│   │   ├── admin.css       # Styles admin
│   │   └── responsive.css  # Media queries
│   ├── js/
│   │   ├── main.js         # JS principal
│   │   ├── admin.js        # Admin dashboard
│   │   ├── cloudinary.js   # Config Cloudinary
│   │   ├── vehicles.js     # Gestion véhicules
│   │   └── reservations.js # Gestion réservations
│   └── img/
├── index.html              # Accueil
├── vehicles.html           # Liste véhicules
├── contact.html            # Formulaire contact
├── about.html              # Présentation
├── login.html              # Connexion admin
└── admin/
    ├── index.html          # Dashboard
    ├── vehicles.html       # Gestion véhicules
    ├── reservations.html   # Gestion réservations
    └── contacts.html       # Messages clients
```

## Technologies

- HTML5/CSS3/JavaScript (vanilla)
- Bootstrap 5
- jQuery + DataTables (admin)
- Chart.js (graphiques)
- Cloudinary (stockage images)
- LocalStorage (demo)

## Installation

1. Clonez le repo
2. Configurez Cloudinary:
   - Ouvrez `assets/js/cloudinary.js`
   - Entrez vos identifiants (`cloudName`, `uploadPreset`, `apiKey`)
3. Lancez avec un serveur local (Live Server, etc.)

## Accès Admin

- URL: `/login.html`
- Identifiants démo: 
  - Utilisateur: `admin`
  - Mot de passe: `admin123`

## À Savoir

- Données stockées en LocalStorage (pour démo)
- Pour prod: intégrer backend API/BDD
- Inclut véhicules démo pour tests

## Customisation

- Couleurs: modifiez variables CSS (`:root` dans style.css)
- Images: remplacez URLs Cloudinary
- Contenus: modifiez textes HTML selon besoins

## Auteur

Développé pour Ndiambour Location © 2025
