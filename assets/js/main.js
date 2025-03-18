// Script principal du site Ndiambour Location
document.addEventListener('DOMContentLoaded', () => {
  // Activer les tooltips Bootstrap
  const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltips.map(t => new bootstrap.Tooltip(t));

  // Comportement du menu mobile
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    // Changer la couleur du navbar au scroll
    window.onscroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled', 'shadow');
      } else {
        navbar.classList.remove('navbar-scrolled', 'shadow');
      }
    };
  }

  // Animation des éléments au scroll
  const fadeElems = document.querySelectorAll('.fade-in');
  const slideElems = document.querySelectorAll('.slide-up');

  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeElems.forEach(el => scrollObserver.observe(el));
  slideElems.forEach(el => scrollObserver.observe(el));

  // Gestion des paramètres d'URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Si on est sur la page de contact et qu'un véhicule est spécifié
  if (window.location.pathname.includes('contact.html') && urlParams.has('vehicle')) {
    const vehicleId = urlParams.get('vehicle');
    prefillContactForm(vehicleId);
  }

  // Préremplit le formulaire de contact avec les infos du véhicule sélectionné
  function prefillContactForm(vehicleId) {
    const vehicleData = getVehicleById(vehicleId);
    if (!vehicleData) return;

    // Si le formulaire existe
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Préremplit le sujet
    const subjectField = document.getElementById('subject');
    if (subjectField) {
      subjectField.value = `Demande d'information pour ${vehicleData.brand} ${vehicleData.model}`;
    }

    // Préremplit le message
    const messageField = document.getElementById('message');
    if (messageField) {
      messageField.value = `Bonjour,\n\nJe suis intéressé(e) par votre ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year}).\nMerci de me contacter pour plus d'informations.\n\nCordialement,`;
    }

    // Affiche les infos du véhicule
    const vehicleInfo = document.getElementById('vehicle-info');
    if (vehicleInfo) {
      const isRental = vehicleData.availability === 'rent' || vehicleData.availability === 'both';
      const isSale = vehicleData.availability === 'sale' || vehicleData.availability === 'both';

      vehicleInfo.innerHTML = `
        <div class="card border-0 shadow-sm mb-4">
          <div class="row g-0">
            <div class="col-md-5">
              <img src="${vehicleData.images[0]}" class="img-fluid rounded-start h-100" style="object-fit: cover;" alt="${vehicleData.brand} ${vehicleData.model}">
            </div>
            <div class="col-md-7">
              <div class="card-body">
                <h5 class="card-title">${vehicleData.brand} ${vehicleData.model} ${vehicleData.year}</h5>
                <div class="d-flex gap-2 mb-3">
                  ${isSale ? `<span class="badge bg-success">Vente: ${formatPrice(vehicleData.salePrice)} FCFA</span>` : ''}
                  ${isRental ? `<span class="badge bg-info">Location: ${formatPrice(vehicleData.rentPrice)} FCFA/jour</span>` : ''}
                </div>
                <div class="card-text small">
                  <div class="row">
                    <div class="col-6 mb-2"><i class="fas fa-gas-pump me-2 text-muted"></i> ${vehicleData.fuel}</div>
                    <div class="col-6 mb-2"><i class="fas fa-cog me-2 text-muted"></i> ${vehicleData.transmission}</div>
                    <div class="col-6 mb-2"><i class="fas fa-users me-2 text-muted"></i> ${vehicleData.seats} places</div>
                    <div class="col-6 mb-2"><i class="fas fa-tachometer-alt me-2 text-muted"></i> ${formatNumber(vehicleData.mileage)} km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Récupère un véhicule par son ID depuis le stockage
  function getVehicleById(id) {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    return vehicles.find(v => v.id === id);
  }

  // Formatage des nombres pour l'affichage
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
});
