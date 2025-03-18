// Gestion véhicules: affichage, filtrage, CRUD admin
let vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
const ITEMS_PER_PAGE = 9;
let currentPage = 1, filteredVehicles = [];

document.addEventListener('DOMContentLoaded', () => {
  // Init selon page courante
  const el = id => document.getElementById(id);
  const featuredEl = el('featured-vehicles');
  const gridEl = el('vehicles-grid');
  const tableEl = el('vehicles-table');
  
  featuredEl && loadFeaturedVehicles();
  gridEl && initVehiclesPage();
  tableEl && initAdminVehicles();
  !vehicles.length && addDemoVehicles();

  // Fonctions principales
  function loadFeaturedVehicles() {
    const featured = vehicles
      .filter(v => v.featured && v.availability !== 'unavailable')
      .slice(0, 6);
    
    featuredEl.innerHTML = featured.length ? 
      featured.map(renderVehicleCard).join('') : 
      '<div class="col-12 text-center"><p>Aucun véhicule en vedette</p></div>';
  }

  function initVehiclesPage() {
    // Init filtres & marques
    const brandSel = el('brand');
    const brands = [...new Set(vehicles.map(v => v.brand))].sort();
    
    brandSel.innerHTML += brands.map(b => `<option value="${b}">${b}</option>`).join('');
    
    // Events: tri et filtres
    el('sort-by').addEventListener('change', applyFilters);
    el('filter-form').addEventListener('submit', e => {
      e.preventDefault();
      applyFilters();
    });
    
    filteredVehicles = [...vehicles];
    renderVehiclesGrid();
  }

  function applyFilters() {
    // Récup valeurs filtres
    const val = id => el(id).value;
    const type = val('type');
    const brand = val('brand');
    const minPrice = +val('price-min') || 0;
    const maxPrice = +val('price-max') || Infinity;
    const availability = val('availability');
    const sortBy = val('sort-by');
    
    // Filtrage
    filteredVehicles = vehicles.filter(v => {
      if (v.availability === 'unavailable') return false;
      if (type && v.type !== type) return false;
      if (brand && v.brand !== brand) return false;
      
      const price = v.availability === 'rent' ? v.rentPrice : v.salePrice;
      if (price < minPrice || price > maxPrice) return false;
      
      return !availability || v.availability === 'both' || v.availability === availability;
    });
    
    // Tri
    const getPrimaryPrice = v => v.availability === 'rent' ? v.rentPrice : v.salePrice;
    const getFullName = v => `${v.brand} ${v.model}`;
    
    switch(sortBy) {
      case 'price-asc': filteredVehicles.sort((a, b) => getPrimaryPrice(a) - getPrimaryPrice(b)); break;
      case 'price-desc': filteredVehicles.sort((a, b) => getPrimaryPrice(b) - getPrimaryPrice(a)); break;
      case 'name-asc': filteredVehicles.sort((a, b) => getFullName(a).localeCompare(getFullName(b))); break;
      case 'name-desc': filteredVehicles.sort((a, b) => getFullName(b).localeCompare(getFullName(a))); break;
    }
    
    currentPage = 1;
    renderVehiclesGrid();
  }

  function renderVehiclesGrid() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageVehicles = filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
    
    el('results-count').querySelector('span').textContent = filteredVehicles.length;
    
    el('vehicles-grid').innerHTML = pageVehicles.length ? 
      pageVehicles.map(renderVehicleCard).join('') : 
      '<div class="col-12 text-center"><p>Aucun véhicule correspondant</p></div>';
    
    document.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => showVehicleDetails(card.dataset.id));
    });
    
    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
    const pagEl = el('pagination');
    let html = '';
    
    if (totalPages > 1) {
      // Prev button
      html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Précédent</a>
              </li>`;
      
      // Pages
      for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
          html += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
          html += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
          html += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
        }
      }
      
      // Next button
      html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Suivant</a>
              </li>`;
    }
    
    pagEl.innerHTML = html;
    
    pagEl.querySelectorAll('a[data-page]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        currentPage = +link.dataset.page;
        renderVehiclesGrid();
        el('vehicles-grid').scrollIntoView({behavior: 'smooth'});
      });
    });
  }

  function renderVehicleCard(vehicle) {
    const {id, brand, model, year, images, availability, salePrice, rentPrice, fuel, transmission, seats} = vehicle;
    const isRent = availability === 'rent' || availability === 'both';
    const isSale = availability === 'sale' || availability === 'both';
    const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="vehicle-card h-100" data-id="${id}">
          <img src="${images[0]}" class="vehicle-image w-100" alt="${brand} ${model}">
          <div class="vehicle-details">
            <h3 class="vehicle-title">${brand} ${model} <span class="text-muted">${year}</span></h3>
            <div class="d-flex justify-content-between align-items-center mb-2">
              ${isSale ? `<div class="vehicle-price">
                <span class="badge bg-success">Vente</span> ${fmt(salePrice)} FCFA
              </div>` : ''}
              ${isRent ? `<div class="vehicle-price">
                <span class="badge bg-info">Location</span> ${fmt(rentPrice)} FCFA/j
              </div>` : ''}
            </div>
            <div class="vehicle-features">
              <div class="vehicle-feature"><i class="fas fa-gas-pump"></i> ${fuel}</div>
              <div class="vehicle-feature"><i class="fas fa-cog"></i> ${transmission}</div>
              <div class="vehicle-feature"><i class="fas fa-users"></i> ${seats} places</div>
            </div>
            <button class="btn btn-outline-primary w-100">Voir détails</button>
          </div>
        </div>
      </div>
    `;
  }

  function showVehicleDetails(id) {
    const v = vehicles.find(v => v.id === id);
    if (!v) return;
    
    const modal = new bootstrap.Modal(el('vehicle-modal'));
    el('modal-vehicle-title').textContent = `${v.brand} ${v.model} ${v.year}`;
    
    const isRent = v.availability === 'rent' || v.availability === 'both';
    const isSale = v.availability === 'sale' || v.availability === 'both';
    const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Features
    let features = '';
    if (v.features) {
      features = '<div class="row mt-3">';
      for (const [key, val] of Object.entries(v.features)) {
        if (val) {
          const names = {
            ac: 'Climatisation', bluetooth: 'Bluetooth', gps: 'GPS',
            usb: 'Ports USB', camera: 'Caméra de recul', airbags: 'Airbags'
          };
          features += `<div class="col-6 mb-2"><i class="fas fa-check text-success me-2"></i> ${names[key] || key}</div>`;
        }
      }
      features += '</div>';
    }
    
    // Images carousel
    let imagesHtml = '<div id="vehicleCarousel" class="carousel slide mb-4" data-bs-ride="carousel"><div class="carousel-inner">';
    v.images.forEach((img, i) => {
      imagesHtml += `<div class="carousel-item ${i === 0 ? 'active' : ''}">
                      <img src="${img}" class="d-block w-100" style="height: 300px; object-fit: cover;" alt="${v.brand} ${v.model}">
                    </div>`;
    });
    imagesHtml += '</div>';
    
    if (v.images.length > 1) {
      imagesHtml += `<button class="carousel-control-prev" type="button" data-bs-target="#vehicleCarousel" data-bs-slide="prev">
                      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Précédent</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#vehicleCarousel" data-bs-slide="next">
                      <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Suivant</span>
                    </button>`;
    }
    imagesHtml += '</div>';
    
    // Content
    el('modal-vehicle-details').innerHTML = `
      ${imagesHtml}
      <div class="row">
        <div class="col-md-7">
          <h5 class="mb-3">Caractéristiques</h5>
          <div class="row mb-3">
            <div class="col-6 mb-2"><strong>Marque:</strong> ${v.brand}</div>
            <div class="col-6 mb-2"><strong>Modèle:</strong> ${v.model}</div>
            <div class="col-6 mb-2"><strong>Année:</strong> ${v.year}</div>
            <div class="col-6 mb-2"><strong>Couleur:</strong> ${v.color}</div>
            <div class="col-6 mb-2"><strong>Carburant:</strong> ${v.fuel}</div>
            <div class="col-6 mb-2"><strong>Transmission:</strong> ${v.transmission}</div>
            <div class="col-6 mb-2"><strong>Places:</strong> ${v.seats}</div>
            <div class="col-6 mb-2"><strong>Kilométrage:</strong> ${fmt(v.mileage)} km</div>
          </div>
          ${features}
          <p>${v.description || 'Aucune description disponible.'}</p>
        </div>
        <div class="col-md-5">
          <div class="card border-0 bg-light mb-3">
            <div class="card-body">
              <h5 class="mb-3">Prix</h5>
              ${isSale ? `<div class="d-flex justify-content-between align-items-center mb-2">
                <span>Prix de vente:</span>
                <span class="h5 mb-0">${fmt(v.salePrice)} FCFA</span>
              </div>` : ''}
              ${isRent ? `<div class="d-flex justify-content-between align-items-center mb-2">
                <span>Prix de location:</span>
                <span class="h5 mb-0">${fmt(v.rentPrice)} FCFA/jour</span>
              </div>` : ''}
              <hr>
              <div class="d-grid gap-2">
                <a href="contact.html?vehicle=${v.id}" class="btn btn-primary">Réserver</a>
                <a href="tel:+221773257197" class="btn btn-outline-primary">
                  <i class="fas fa-phone me-2"></i> Appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.show();
  }

  // Admin
  function initAdminVehicles() {
    // DataTable init
    const table = $('#vehicles-table').DataTable({
      language: {url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'},
      responsive: true,
      data: vehicles,
      columns: [
        {data: 'id'},
        {data: 'images', render: d => d?.length ? 
          `<img src="${d[0]}" width="50" height="40" style="object-fit:cover;border-radius:4px;">` : 
          '<span class="badge bg-secondary">Pas d\'image</span>'
        },
        {data: null, render: d => `<strong>${d.brand}</strong><br>${d.model}`},
        {data: 'type', render: t => ({sedan:'Berline',suv:'SUV',luxury:'Luxe',van:'Minivan'})[t] || t},
        {data: 'year'},
        {data: 'salePrice', render: d => d ? fmt(d) + ' FCFA' : '-'},
        {data: 'rentPrice', render: d => d ? fmt(d) + ' FCFA/j' : '-'},
        {data: 'availability', render: d => {
          const badges = {
            'both': '<span class="badge bg-success">Vente & Location</span>',
            'sale': '<span class="badge bg-primary">Vente</span>',
            'rent': '<span class="badge bg-info">Location</span>',
            'unavailable': '<span class="badge bg-secondary">Indisponible</span>'
          };
          return badges[d] || badges.unavailable;
        }},
        {data: null, render: d => `
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-primary edit-vehicle" data-id="${d.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger delete-vehicle" data-id="${d.id}"><i class="fas fa-trash"></i></button>
          </div>`
        }
      ]
    });
    
    updateVehicleCounters();
    
    // Events
    $('#vehicles-table').on('click', '.edit-vehicle', function() {
      editVehicle($(this).data('id'));
    });
    
    $('#vehicles-table').on('click', '.delete-vehicle', function() {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) {
        deleteVehicle($(this).data('id'));
        table.ajax.reload();
        updateVehicleCounters();
      }
    });
    
    el('save-vehicle').addEventListener('click', () => {
      saveVehicle();
      table.ajax.reload();
      updateVehicleCounters();
      bootstrap.Modal.getInstance(el('addVehicleModal')).hide();
    });
    
    initCloudinaryUpload();
  }

  // Fonctions CRUD
  function saveVehicle() {
    const form = el('vehicle-form');
    const id = form.dataset.id || 'v' + Math.random().toString(36).substr(2, 9);
    const images = el('vehicle-images').value ? JSON.parse(el('vehicle-images').value) : [];
    const chk = id => el(id).checked;
    
    const vehicle = {
      id,
      brand: el('brand').value,
      model: el('model').value,
      type: el('type').value,
      year: +el('year').value,
      color: el('color').value,
      salePrice: +el('sale-price').value || null,
      rentPrice: +el('rent-price').value || null,
      mileage: +el('mileage').value || 0,
      fuel: el('fuel').value,
      transmission: el('transmission').value,
      seats: +el('seats').value || 5,
      availability: el('availability').value,
      features: {
        ac: chk('feature-ac'),
        bluetooth: chk('feature-bluetooth'),
        gps: chk('feature-gps'),
        usb: chk('feature-usb'),
        camera: chk('feature-camera'),
        airbags: chk('feature-airbags')
      },
      description: el('description').value,
      images,
      featured: false,
      createdAt: new Date().toISOString()
    };
    
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx > -1) {
      vehicles[idx] = {...vehicles[idx], ...vehicle};
    } else {
      vehicles.push(vehicle);
    }
    
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    
    form.reset();
    el('vehicle-images').value = '';
    el('preview-container').innerHTML = '';
    delete form.dataset.id;
    
    return true;
  }

  function deleteVehicle(id) {
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx > -1) {
      vehicles.splice(idx, 1);
      localStorage.setItem('vehicles', JSON.stringify(vehicles));
      return true;
    }
    return false;
  }

  function editVehicle(id) {
    const v = vehicles.find(v => v.id === id);
    if (!v) return;
    
    const form = el('vehicle-form');
    form.dataset.id = id;
    
    // Fill fields
    for (const field of ['brand', 'model', 'type', 'year', 'color', 'fuel', 
                        'transmission', 'seats', 'availability', 'description']) {
      el(field).value = v[field] || '';
    }
    
    // Optional fields
    el('sale-price').value = v.salePrice || '';
    el('rent-price').value = v.rentPrice || '';
    el('mileage').value = v.mileage || '';
    
    // Features
    if (v.features) {
      for (const feat of ['ac', 'bluetooth', 'gps', 'usb', 'camera', 'airbags']) {
        el(`feature-${feat}`).checked = v.features[feat];
      }
    }
    
    // Images
    el('vehicle-images').value = JSON.stringify(v.images || []);
    const previewEl = el('preview-container');
    previewEl.innerHTML = '';
    
    if (v.images?.length) {
      v.images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'position-relative';
        div.innerHTML = `
          <img src="${img}" class="img-thumbnail" style="width:80px;height:60px;object-fit:cover;">
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 remove-img" data-url="${img}">
            <i class="fas fa-times"></i>
          </button>
        `;
        previewEl.appendChild(div);
      });
      
      // Remove image events
      document.querySelectorAll('.remove-img').forEach(btn => {
        btn.addEventListener('click', function() {
          const url = this.dataset.url;
          const imgs = JSON.parse(el('vehicle-images').value);
          el('vehicle-images').value = JSON.stringify(imgs.filter(img => img !== url));
          this.parentElement.remove();
        });
      });
    }
    
    new bootstrap.Modal(el('addVehicleModal')).show();
  }

  function updateVehicleCounters() {
    const stats = {
      total: vehicles.length,
      sale: vehicles.filter(v => v.availability === 'sale' || v.availability === 'both').length,
      rent: vehicles.filter(v => v.availability === 'rent' || v.availability === 'both').length,
      unavailable: vehicles.filter(v => v.availability === 'unavailable').length
    };
    
    Object.entries(stats).forEach(([key, val]) => {
      const counter = el(`${key}-vehicles`);
      if (counter) counter.textContent = val;
    });
  }

  function initCloudinaryUpload() {
    const widget = initCloudinaryWidget(result => {
      // Add uploaded image
      const imgs = el('vehicle-images').value ? JSON.parse(el('vehicle-images').value) : [];
      
      if (imgs.length >= 5) {
        alert('Maximum 5 images par véhicule.');
        return;
      }
      
      imgs.push(result.secure_url);
      el('vehicle-images').value = JSON.stringify(imgs);
      
      // Add preview
      const preview = el('preview-container');
      const div = document.createElement('div');
      div.className = 'position-relative';
      div.innerHTML = `
        <img src="${result.secure_url}" class="img-thumbnail" style="width:80px;height:60px;object-fit:cover;">
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 remove-img" data-url="${result.secure_url}">
          <i class="fas fa-times"></i>
        </button>
      `;
      preview.appendChild(div);
      
      div.querySelector('.remove-img').addEventListener('click', function() {
        const url = this.dataset.url;
        const imgs = JSON.parse(el('vehicle-images').value);
        el('vehicle-images').value = JSON.stringify(imgs.filter(img => img !== url));
        this.parentElement.remove();
      });
    });
    
    // Upload button
    el('upload-btn').addEventListener('click', () => widget.open());
    
    // Dropzone
    const dropzone = el('dropzone');
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('border-primary');
    });
    
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-primary'));
    
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('border-primary');
      widget.open();
    });
  }

  // Demo data
  function addDemoVehicles() {
    vehicles = [
      {
        id: 'v001', brand: 'Toyota', model: 'Land Cruiser', type: 'suv', year: 2023,
        color: 'Noir', salePrice: 45000000, rentPrice: 120000, mileage: 15000,
        fuel: 'Diesel', transmission: 'Automatique', seats: 7, availability: 'both',
        features: {ac: true, bluetooth: true, gps: true, usb: true, camera: true, airbags: true},
        description: 'SUV spacieux et puissant, idéal pour les longs voyages et terrains difficiles.',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1/toyota-land-cruiser-1',
          'https://res.cloudinary.com/demo/image/upload/v1/toyota-land-cruiser-2'
        ],
        featured: true, createdAt: new Date().toISOString()
      },
      {
        id: 'v002', brand: 'Mercedes', model: 'Classe C', type: 'sedan', year: 2022,
        color: 'Blanc', salePrice: 38000000, rentPrice: 90000, mileage: 8000,
        fuel: 'Essence', transmission: 'Automatique', seats: 5, availability: 'both',
        features: {ac: true, bluetooth: true, gps: true, usb: true, camera: true, airbags: true},
        description: 'Berline élégante et confortable avec intérieur luxueux et technologies avancées.',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1/mercedes-c-class-1',
          'https://res.cloudinary.com/demo/image/upload/v1/mercedes-c-class-2'
        ],
        featured: true, createdAt: new Date().toISOString()
      },
      {
        id: 'v003', brand: 'Renault', model: 'Duster', type: 'suv', year: 2021,
        color: 'Gris', salePrice: 18000000, rentPrice: 45000, mileage: 25000,
        fuel: 'Diesel', transmission: 'Manuelle', seats: 5, availability: 'rent',
        features: {ac: true, bluetooth: true, gps: false, usb: true, camera: false, airbags: true},
        description: 'SUV compact, économique et polyvalent.',
        images: ['https://res.cloudinary.com/demo/image/upload/v1/renault-duster-1'],
        featured: false, createdAt: new Date().toISOString()
      },
      {
        id: 'v004', brand: 'BMW', model: 'X5', type: 'luxury', year: 2023,
        color: 'Noir', salePrice: 55000000, rentPrice: 150000, mileage: 5000,
        fuel: 'Essence', transmission: 'Automatique', seats: 5, availability: 'sale',
        features: {ac: true, bluetooth: true, gps: true, usb: true, camera: true, airbags: true},
        description: 'SUV de luxe avec performances exceptionnelles et équipements haut de gamme.',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1/bmw-x5-1',
          'https://res.cloudinary.com/demo/image/upload/v1/bmw-x5-2'
        ],
        featured: true, createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }

  // Utilitaires
  const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
});
