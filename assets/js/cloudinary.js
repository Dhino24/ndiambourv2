/**
 * Configuration et utilitaires Cloudinary
 */
const cloudinaryConfig = {
  cloudName: 'diovja6qr', // À remplacer par votre cloud_name
  uploadPreset: 'ndiambour', // À remplacer par votre upload preset
  apiKey: '265729986184949', // À remplacer par votre API key
  folder: 'ndiambour' // Dossier de destination des images
};

/**
 * Initialise le widget d'upload Cloudinary
 * @param {Function} callback - Fonction exécutée après upload réussi
 * @returns {Object} Instance du widget
 */
function initCloudinaryWidget(callback) {
  return cloudinary.createUploadWidget({
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    folder: cloudinaryConfig.folder,
    multiple: true,
    maxFiles: 5,
    maxFileSize: 2000000, // 2MB
    resourceType: 'image',
    sources: ['local', 'camera'],
    thumbnails: '.preview-container',
    buttonClass: 'btn btn-primary',
    styles: {
      palette: {
        window: '#FFFFFF',
        sourceBg: '#F4F4F5',
        windowBorder: '#90A0B3',
        tabIcon: '#0F3B7F',
        inactiveTabIcon: '#69778A',
        menuIcons: '#0F3B7F',
        link: '#0F3B7F',
        action: '#4682B4',
        inProgress: '#0F3B7F',
        complete: '#4CAF50',
        error: '#FF0000',
        textDark: '#000000',
        textLight: '#FFFFFF'
      }
    }
  }, (error, result) => {
    if (!error && result && result.event === 'success') {
      // Appeler le callback avec les infos de l'image uploadée
      if (typeof callback === 'function') {
        callback(result.info);
      }
    }
  });
}

/**
 * Récupère l'URL d'une image optimisée depuis Cloudinary
 * @param {string} publicId - ID public de l'image sur Cloudinary
 * @param {Object} options - Options de transformation
 * @returns {string} URL de l'image transformée
 */
function getOptimizedImageUrl(publicId, options = {}) {
  // Options par défaut
  const defaults = {
    width: 600,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    fetchFormat: 'auto'
  };
  
  // Fusionner options par défaut avec options fournies
  const opts = { ...defaults, ...options };
  
  // Construire la chaîne de transformation
  const transformations = [
    `w_${opts.width}`,
    `h_${opts.height}`,
    `c_${opts.crop}`,
    'q_auto',
    'f_auto'
  ];
  
  // Ajouter des transformations conditionnelles
  if (opts.effect) transformations.push(`e_${opts.effect}`);
  if (opts.gravity) transformations.push(`g_${opts.gravity}`);
  
  // Construire l'URL complète
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformations.join(',')}/${publicId}`;
}

/**
 * Récupère les images depuis Cloudinary via l'API
 * @param {string} prefix - Préfixe pour filtrer les images (ex: 'vehicles/')
 * @param {Function} callback - Fonction de rappel avec les résultats
 */
function getCloudinaryImages(prefix, callback) {
  const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/resources/image`;
  const params = new URLSearchParams({
    type: 'upload',
    prefix: prefix,
    max_results: 500
  });
  
  fetch(`${url}?${params}`, {
    headers: {
      Authorization: `Basic ${btoa(cloudinaryConfig.apiKey + ':' + cloudinaryConfig.apiSecret)}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (typeof callback === 'function') {
      callback(null, data.resources);
    }
  })
  .catch(error => {
    if (typeof callback === 'function') {
      callback(error, null);
    }
  });
}
