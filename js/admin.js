// Admin panel - Ndiambour Location
document.addEventListener('DOMContentLoaded', () => {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  
  // Toggle sidebar
  $('#sidebarToggle')?.addEventListener('click', () => 
    document.body.classList.toggle('sb-sidenav-toggled'));
  
  // Stats counters animation
  const animateCounter = el => {
    const target = +el.getAttribute('data-target');
    const duration = 1500;
    const step = target / (duration / 16); // ~60fps
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current > target) current = target;
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(updateCounter);
    };
    
    updateCounter();
  };
  
  $$('.counter').forEach(animateCounter);
  
  // Charts
  const ctx = $('#statsChart')?.getContext('2d');
  if (ctx) {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const lastSixMonths = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString('fr-FR', {month: 'short'});
    }).reverse();
    
    // Simuler stats mensuelles
    const getRandomStats = () => lastSixMonths.map(() => Math.floor(Math.random() * 100));
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: lastSixMonths,
        datasets: [{
          label: 'Ventes',
          data: getRandomStats(),
          borderColor: '#0F3B7F',
          backgroundColor: 'rgba(15, 59, 127, 0.1)',
          tension: 0.3,
          fill: true
        }, {
          label: 'Locations',
          data: getRandomStats(),
          borderColor: '#FF5722',
          backgroundColor: 'rgba(255, 87, 34, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {position: 'top'},
          tooltip: {mode: 'index'}
        },
        scales: {
          y: {beginAtZero: true, grid: {drawBorder: false}}
        }
      }
    });
  }
  
  // Réservations (pour admin/reservations.html)
  const initReservations = () => {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const table = $('#reservations-table');
    if (!table || !$.DataTable) return;
    
    // Init DataTable
    $(table).DataTable({
      language: {url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'},
      data: reservations.length ? reservations : getDemoReservations(),
      columns: [
        {data: 'id'},
        {data: 'clientName'},
        {data: null, render: d => {
          const v = JSON.parse(localStorage.getItem('vehicles') || '[]')
            .find(v => v.id === d.vehicleId);
          return v ? `${v.brand} ${v.model}` : 'Inconnu';
        }},
        {data: 'startDate'},
        {data: 'endDate'},
        {data: 'status', render: s => {
          const badges = {
            pending: '<span class="badge bg-warning">En attente</span>',
            confirmed: '<span class="badge bg-success">Confirmée</span>',
            canceled: '<span class="badge bg-danger">Annulée</span>',
            completed: '<span class="badge bg-info">Terminée</span>'
          };
          return badges[s] || badges.pending;
        }},
        {data: null, render: d => `
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-primary edit-reservation" data-id="${d.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger delete-reservation" data-id="${d.id}"><i class="fas fa-trash"></i></button>
          </div>`
        }
      ]
    });
    
    // Gestion des événements
    $('#reservations-table').addEventListener('click', e => {
      const btn = e.target.closest('.edit-reservation, .delete-reservation');
      if (!btn) return;
      
      const id = btn.dataset.id;
      if (btn.classList.contains('edit-reservation')) {
        editReservation(id);
      } else if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation?')) {
        deleteReservation(id);
        $(table).DataTable().ajax.reload();
      }
    });
  };
  
  // Générer réservations démo
  const getDemoReservations = () => [
    {
      id: 'r001',
      clientName: 'Amadou Diop',
      clientEmail: 'amadou@example.com',
      clientPhone: '+221 77 123 45 67',
      vehicleId: 'v001',
      startDate: '2025-03-20',
      endDate: '2025-03-25',
      status: 'confirmed',
      withDriver: true,
      notes: 'Client fidèle, 3ème location',
      createdAt: new Date().toISOString()
    },
    {
      id: 'r002',
      clientName: 'Fatou Ndiaye',
      clientEmail: 'fatou@example.com',
      clientPhone: '+221 76 987 65 43',
      vehicleId: 'v002',
      startDate: '2025-03-18',
      endDate: '2025-03-22',
      status: 'pending',
      withDriver: false,
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'r003',
      clientName: 'Ibrahima Sall',
      clientEmail: 'ibra@example.com',
      clientPhone: '+221 70 456 78 90',
      vehicleId: 'v003',
      startDate: '2025-03-15',
      endDate: '2025-03-16',
      status: 'completed',
      withDriver: false,
      notes: 'Location du weekend',
      createdAt: new Date().toISOString()
    }
  ];
  
  // CRUD réservations
  const saveReservation = () => {
    const form = $('#reservation-form');
    const id = form.dataset.id || 'r' + Math.random().toString(36).substr(2, 9);
    
    const reservation = {
      id,
      clientName: $('#client-name').value,
      clientEmail: $('#client-email').value,
      clientPhone: $('#client-phone').value,
      vehicleId: $('#vehicle-id').value,
      startDate: $('#start-date').value,
      endDate: $('#end-date').value,
      status: $('#status').value,
      withDriver: $('#with-driver').checked,
      notes: $('#notes').value,
      createdAt: new Date().toISOString()
    };
    
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const idx = reservations.findIndex(r => r.id === id);
    
    if (idx > -1) {
      reservations[idx] = {...reservations[idx], ...reservation};
    } else {
      reservations.push(reservation);
    }
    
    localStorage.setItem('reservations', JSON.stringify(reservations));
    form.reset();
    delete form.dataset.id;
    
    return true;
  };
  
  const deleteReservation = id => {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const idx = reservations.findIndex(r => r.id === id);
    
    if (idx > -1) {
      reservations.splice(idx, 1);
      localStorage.setItem('reservations', JSON.stringify(reservations));
      return true;
    }
    return false;
  };
  
  const editReservation = id => {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const r = reservations.find(r => r.id === id);
    if (!r) return;
    
    const form = $('#reservation-form');
    form.dataset.id = id;
    
    // Remplir champs
    ['client-name', 'client-email', 'client-phone', 'vehicle-id', 
     'start-date', 'end-date', 'status', 'notes'].forEach(field => {
      const el = $(`#${field}`);
      const prop = field.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (el) el.value = r[prop] || '';
    });
    
    $('#with-driver').checked = r.withDriver;
    
    // Afficher modal
    new bootstrap.Modal($('#editReservationModal')).show();
  };
  
  // Initialiser dashboard ou réservations selon la page
  $('#statsChart') ? initDashboard() : initReservations();
  
  // Fonction init dashboard
  function initDashboard() {
    // Simuler stats rapides
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const reservations = JSON.parse(localStorage.getItem('reservations') || 
                                  getDemoReservations());
    
    // Calculer stats
    const totalVehicles = vehicles.length;
    const activeReservations = reservations
      .filter(r => r.status === 'confirmed' || r.status === 'pending').length;
    const monthlyRevenue = Math.floor(Math.random() * 5000000) + 2000000;
    
    // Mettre à jour compteurs
    $('#total-vehicles-count').textContent = totalVehicles;
    $('#active-reservations-count').textContent = activeReservations;
    $('#monthly-revenue').textContent = new Intl.NumberFormat('fr-FR')
      .format(monthlyRevenue) + ' FCFA';
    
    // Dernières réservations dans tableau
    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const tbody = $('#recent-reservations tbody');
    if (tbody) {
      tbody.innerHTML = recentReservations.map(r => {
        const v = vehicles.find(v => v.id === r.vehicleId) || {};
        const statusBadges = {
          pending: '<span class="badge bg-warning">En attente</span>',
          confirmed: '<span class="badge bg-success">Confirmée</span>',
          canceled: '<span class="badge bg-danger">Annulée</span>',
          completed: '<span class="badge bg-info">Terminée</span>'
        };
        
        return `<tr>
          <td>${r.id}</td>
          <td>${r.clientName}</td>
          <td>${v.brand || ''} ${v.model || ''}</td>
          <td>${r.startDate}</td>
          <td>${statusBadges[r.status] || statusBadges.pending}</td>
        </tr>`;
      }).join('');
    }
  }
});
