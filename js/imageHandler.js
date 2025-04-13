/*
 * Module: imageHandler.js
 * Description: Module de gestion des images dans l'éditeur, incluant l'upload, l'insertion d'image via URL et la gestion d'une bibliothèque d'images.
 * Date de création: 20/08/2024
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */
 
 export const ImageHandler = {
  editor: null,
  uploadQueue: [],
  uploadProgressContainer: null,
  imageLibraryModal: null,
  imageLibraryContent: null,
  UPLOAD_URL: 'upload_handler.php',
  IMAGE_LIST_URL: 'list_images.php',

  // Éléments pour le modal d'upload
  uploadModal: null,
  uploadModalDropZone: null,
  uploadModalPreviewContainer: null,
  uploadModalFileButton: null,
  uploadModalCloseButton: null,
  uploadModalUploadButton: null,

  // Tableau pour stocker les fichiers ajoutés dans le modal
  modalDroppedFiles: [],

  init(config) {
	// Affectation des références existantes
	this.editor = config.editor;
	this.uploadProgressContainer = config.uploadProgressContainer;
	this.imageLibraryModal = config.imageLibraryModal;
	this.imageLibraryContent = config.imageLibraryContent;

	// Création dynamique du modal d'upload s'il n'est pas fourni via config
	if (!config.uploadModal) {
	  // Conteneur global du modal
	  const modal = document.createElement('div');
	  modal.id = 'uploadModal';
	  modal.className = 'modal';
	  modal.style.display = 'none';
	  modal.style.position = 'fixed';
	  modal.style.top = '0';
	  modal.style.left = '0';
	  modal.style.width = '100%';
	  modal.style.height = '100%';
	  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	  modal.style.zIndex = '1000';

	  // Contenu du modal
	  const modalContent = document.createElement('div');
	  modalContent.className = 'modal-content';
	  modalContent.style.position = 'relative';
	  modalContent.style.margin = '10% auto';
	  modalContent.style.padding = '20px';
	  modalContent.style.backgroundColor = '#fff';
	  modalContent.style.width = '80%';
	  modalContent.style.maxWidth = '500px';

	  // Bouton de fermeture sous forme de <span> (comme dans la bibliothèque)
	  const closeBtn = document.createElement('span');
	  closeBtn.id = 'closeUploadModal';
	  closeBtn.className = 'close-button';
	  closeBtn.textContent = '×';
	  closeBtn.style.position = 'absolute';
	  closeBtn.style.top = '10px';
	  closeBtn.style.right = '10px';
	  closeBtn.style.cursor = 'pointer';

	  // Titre du modal
	  const heading = document.createElement('h2');
	  heading.textContent = 'Déposez vos images ici';

	  // Zone de dépôt (drop zone)
	  const dropZone = document.createElement('div');
	  dropZone.id = 'uploadModalDropZone';
	  dropZone.className = 'drop-zone';
	  dropZone.style.border = '2px dashed #ccc';
	  dropZone.style.padding = '20px';
	  dropZone.style.textAlign = 'center';
	  dropZone.style.marginBottom = '10px';
	  dropZone.textContent = 'Glissez-déposez vos fichiers ici';

	  // Zone de prévisualisation des fichiers déposés
	  const previewContainer = document.createElement('div');
	  previewContainer.id = 'uploadModalPreviewContainer';
	  previewContainer.style.margin = '10px 0';
	  previewContainer.style.display = 'flex';
	  previewContainer.style.flexWrap = 'wrap';
	  previewContainer.style.justifyContent = 'center';
	  previewContainer.innerHTML = '<p>Aucune image déposée</p>';

	  // Bouton pour ouvrir la boîte de dialogue standard
	  const fileButton = document.createElement('button');
	  fileButton.id = 'uploadModalFileButton';
	  fileButton.textContent = 'Ou cliquez ici pour sélectionner des fichiers';
	  fileButton.style.display = 'block';
	  fileButton.style.margin = '0 auto';

	  // Bouton "Upload" qui déclenche l'envoi (caché par défaut)
	  const uploadBtn = document.createElement('button');
	  uploadBtn.id = 'uploadModalUploadButton';
	  uploadBtn.textContent = 'Upload';
	  uploadBtn.style.display = 'none';
	  uploadBtn.style.margin = '10px auto';

	  // Assemblage du modal
	  modalContent.appendChild(closeBtn);
	  modalContent.appendChild(heading);
	  modalContent.appendChild(dropZone);
	  modalContent.appendChild(previewContainer);
	  modalContent.appendChild(fileButton);
	  modalContent.appendChild(uploadBtn);
	  modal.appendChild(modalContent);
	  document.body.appendChild(modal);

	  // Affectation des références créées dynamiquement
	  this.uploadModal = modal;
	  this.uploadModalDropZone = dropZone;
	  this.uploadModalPreviewContainer = previewContainer;
	  this.uploadModalFileButton = fileButton;
	  this.uploadModalCloseButton = closeBtn;
	  this.uploadModalUploadButton = uploadBtn;
	} else {
	  // Sinon, utiliser les éléments passés en configuration
	  this.uploadModal = config.uploadModal;
	  this.uploadModalDropZone = config.uploadModalDropZone;
	  this.uploadModalPreviewContainer = config.uploadModalPreviewContainer;
	  this.uploadModalFileButton = config.uploadModalFileButton;
	  this.uploadModalCloseButton = config.uploadModalCloseButton;
	  this.uploadModalUploadButton = config.uploadModalUploadButton;
	}

	// Événement sur le file input standard : ajout cumulatif dans le contexte du modal
	config.imageUploadInput.addEventListener('change', (event) => {
	  this.handleModalFiles(event.target.files);
	  event.target.value = null;
	});

	// Bouton "Insérer Image depuis URL"
	config.insertImageUrlButton.addEventListener('click', () => this.insertImageFromUrl());

	// Bouton d'upload principal qui ouvre le modal d'upload
	config.uploadImageButton.addEventListener('click', () => this.openUploadModal());

	// Bouton pour ouvrir la bibliothèque d’images
	config.browseImageLibraryButton.addEventListener('click', () => this.openImageLibrary());
	config.closeImageLibraryModal.addEventListener('click', () => this.closeImageLibrary());

	// Événement pour le collage
	this.editor.addEventListener('paste', (event) => this.handlePaste(event));

	// Bibliothèque d’images : clic sur une image
	config.imageLibraryContent.addEventListener('click', (event) => {
	  const item = event.target.closest('.image-library-item');
	  if (item && item.dataset.imageUrl) {
		this.insertImage(item.dataset.imageUrl);
		this.closeImageLibrary();
	  }
	});

	// Sélection d'image dans l'éditeur
	this.editor.addEventListener('click', (event) => this.handleImageSelection(event));

	// Gestion du drag & drop pour la zone du modal d'upload
	if (this.uploadModalDropZone) {
	  this.uploadModalDropZone.addEventListener('dragover', this.handleModalDragOver.bind(this));
	  this.uploadModalDropZone.addEventListener('dragleave', this.handleModalDragLeave.bind(this));
	  this.uploadModalDropZone.addEventListener('drop', this.handleModalDrop.bind(this));
	}

	// Bouton de fermeture du modal (élément <span>)
	if (this.uploadModalCloseButton) {
	  this.uploadModalCloseButton.addEventListener('click', () => this.closeUploadModal());
	}

	// Bouton du modal pour ouvrir la boîte de dialogue standard
	if (this.uploadModalFileButton) {
	  this.uploadModalFileButton.addEventListener('click', () => config.imageUploadInput.click());
	}

	// Bouton "Upload" dans le modal qui lance l'envoi des fichiers
	if (this.uploadModalUploadButton) {
	  this.uploadModalUploadButton.addEventListener('click', this.handleModalUploadClick.bind(this));
	}

	// Initialisation du tableau des fichiers ajoutés
	this.modalDroppedFiles = [];
  },

  handleImageSelection(event) {
	this.editor.querySelectorAll('img.selected-image').forEach(img => img.classList.remove('selected-image'));
	if (event.target.tagName === 'IMG') {
	  event.target.classList.add('selected-image');
	}
  },

  insertImageFromUrl() {
	if (!this.editor) return;
	const url = prompt("Entrez l'URL de l'image :", "https://");
	if (url) this.insertImage(url);
  },

  insertImage(url) {
	if (!url) return;
	document.execCommand('insertImage', false, url);
	this.editor.focus();
  },

  // Ajoute de manière cumulative les fichiers (depuis drop ou file input) dans modalDroppedFiles
  handleModalFiles(files) {
	if (!files || files.length === 0) return;
	const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
	if (imageFiles.length > 0) {
	  this.modalDroppedFiles = this.modalDroppedFiles.concat(imageFiles);
	  this.updateUploadModalPreview();
	} else {
	  console.log("Aucun fichier image à traiter.");
	}
  },

  handlePaste(event) {
	const items = (event.clipboardData || window.clipboardData).items;
	const imageFiles = [];
	if (items) {
	  for (let i = 0; i < items.length; i++) {
		if (items[i].type.startsWith('image/')) {
		  const blob = items[i].getAsFile();
		  if (blob) {
			const fileName = `pasted_image_${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
			imageFiles.push(new File([blob], fileName, { type: blob.type }));
		  }
		}
	  }
	}
	if (imageFiles.length > 0) {
	  event.preventDefault();
	  this.handleModalFiles(imageFiles);
	}
  },

  // Méthode existante pour envoyer des fichiers au serveur
  uploadFiles(files) {
	files.forEach((file, index) => {
	  const uploadId = `upload-${Date.now()}-${index}`;
	  this.uploadQueue.push(uploadId);
	  const progressElement = this.createProgressElement(uploadId, file.name);
	  const formData = new FormData();
	  formData.append('imageFile', file);
	  const xhr = new XMLHttpRequest();
	  xhr.upload.onprogress = (e) => {
		if (e.lengthComputable) {
		  this.updateProgress(uploadId, Math.round((e.loaded / e.total) * 100));
		}
	  };
	  xhr.onload = () => {
		this.removeProgressElement(uploadId);
		this.uploadQueue = this.uploadQueue.filter(id => id !== uploadId);
		if (xhr.status >= 200 && xhr.status < 300) {
		  try {
			const response = JSON.parse(xhr.responseText);
			if (response && response.success && response.url) {
			  this.insertImage(response.url);
			} else {
			  alert(`Erreur upload ${file.name}: ${response.message || 'Réponse serveur invalide.'}`);
			  console.error("Réponse serveur invalide:", response);
			}
		  } catch (e) {}
		}
	  };
	  xhr.onerror = () => {
		this.removeProgressElement(uploadId);
		this.uploadQueue = this.uploadQueue.filter(id => id !== uploadId);
		alert(`Erreur réseau upload ${file.name}.`);
		console.error("Erreur réseau XHR");
	  };
	  xhr.open('POST', this.UPLOAD_URL, true);
	  xhr.send(formData);
	});
  },

  createProgressElement(id, fileName) {
	const item = document.createElement('div');
	item.className = 'upload-progress-item';
	item.id = id;
	item.innerHTML = `<span>${fileName}</span> <progress value="0" max="100"></progress> <span class="status">0%</span>`;
	this.uploadProgressContainer.appendChild(item);
	return item;
  },

  updateProgress(id, percent) {
	const item = document.getElementById(id);
	if (item) {
	  item.querySelector('progress').value = percent;
	  item.querySelector('.status').textContent = `${percent}%`;
	}
  },

  removeProgressElement(id) {
	const item = document.getElementById(id);
	if (item) item.remove();
  },

  openImageLibrary() {
	if (!this.editor) return;
	this.imageLibraryModal.style.display = 'block';
	this.loadImageLibrary();
  },

  closeImageLibrary() {
	this.imageLibraryModal.style.display = 'none';
	this.imageLibraryContent.innerHTML = '<p>Chargement...</p>';
  },

  loadImageLibrary() {
	this.imageLibraryContent.innerHTML = '<p>Chargement...</p>';
	fetch(this.IMAGE_LIST_URL)
	  .then(response => response.json())
	  .then(images => {
		if (!Array.isArray(images)) {
		  throw new Error("Format de données invalide");
		}
		let htmlContent = '';
		images.forEach(image => {
		  htmlContent += `
			<div class="image-library-item" data-image-url="${image.fullUrl}">
			  <img src="${image.thumbnailUrl}" alt="${image.alt || 'Image'}">
			</div>`;
		});
		this.imageLibraryContent.innerHTML = htmlContent;
	  })
	  .catch(error => {
		this.imageLibraryContent.innerHTML = '<p>Erreur lors du chargement des images.</p>';
		console.error("Erreur lors du fetch de la bibliothèque d’images :", error);
	  });
  },

  // Fonctions du modal d'upload par Drag & Drop
  openUploadModal() {
	if (this.uploadModal) {
	  // Mettre à jour la prévisualisation sans réinitialiser les fichiers déjà ajoutés
	  this.updateUploadModalPreview();
	  this.uploadModal.style.display = 'block';
	}
  },

  closeUploadModal() {
	if (this.uploadModal) {
	  this.uploadModal.style.display = 'none';
	}
  },

  handleModalDragOver(event) {
	event.preventDefault();
	event.stopPropagation();
	if (this.uploadModalDropZone) {
	  this.uploadModalDropZone.classList.add('drag-over');
	}
  },

  handleModalDragLeave(event) {
	event.preventDefault();
	event.stopPropagation();
	if (this.uploadModalDropZone) {
	  this.uploadModalDropZone.classList.remove('drag-over');
	}
  },

  // Lors du drop, ajouter les fichiers au tableau et mettre à jour la prévisualisation
  handleModalDrop(event) {
	event.preventDefault();
	event.stopPropagation();
	if (this.uploadModalDropZone) {
	  this.uploadModalDropZone.classList.remove('drag-over');
	}
	if (event.dataTransfer && event.dataTransfer.files) {
	  const droppedFiles = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
	  if (droppedFiles.length > 0) {
		this.modalDroppedFiles = this.modalDroppedFiles.concat(droppedFiles);
		this.updateUploadModalPreview();
	  }
	}
	// Le modal reste ouvert pour permettre l'ajout ultérieur
  },

  // Met à jour la zone de prévisualisation et affiche/cacher le bouton Upload
  updateUploadModalPreview() {
	if (!this.uploadModalPreviewContainer) return;
	// Effacer la prévisualisation
	this.uploadModalPreviewContainer.innerHTML = '';
	if (this.modalDroppedFiles.length === 0) {
	  this.uploadModalPreviewContainer.innerHTML = '<p>Aucune image déposée</p>';
	  this.uploadModalUploadButton.style.display = 'none';
	} else {
	  this.modalDroppedFiles.forEach(file => {
		const reader = new FileReader();
		reader.onload = (e) => {
		  const img = document.createElement('img');
		  img.src = e.target.result;
		  img.alt = file.name;
		  img.style.width = '80px';
		  img.style.height = '80px';
		  img.style.objectFit = 'cover';
		  img.style.margin = '5px';
		  this.uploadModalPreviewContainer.appendChild(img);
		};
		reader.readAsDataURL(file);
	  });
	  // Afficher le bouton Upload uniquement s'il y a au moins un fichier
	  this.uploadModalUploadButton.style.display = 'block';
	}
  },

  // Lorsque l'utilisateur clique sur le bouton "Upload" dans le modal
  handleModalUploadClick() {
	if (this.modalDroppedFiles.length > 0) {
	  // Envoyer tous les fichiers accumulés
	  this.uploadFiles(this.modalDroppedFiles);
	  // Réinitialiser le tableau et la prévisualisation
	  this.modalDroppedFiles = [];
	  this.updateUploadModalPreview();
	  // Fermer le modal
	  this.closeUploadModal();
	} else {
	  alert("Aucun fichier n'est prêt à être uploadé.");
	}
  }
};