/*
 * Module: elementStyleEditor.js
 * Description: Module de l'éditeur de style d'éléments, permettant de modifier dynamiquement les attributs et le style inline des éléments sélectionnés dans l'éditeur.
 * Date de création: 28/09/2024
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

export const ElementStyleEditor = {
  editor: null,
  modal: null,
  currentElement: null,

  init(config) {
	// Référence à l'éditeur dans lequel on va modifier les éléments
	this.editor = config.editor;

	// Création dynamique du modal
	this.modal = document.createElement('div');
	this.modal.id = 'elementStyleEditorModal';
	this.modal.className = 'modal';
	this.modal.style.display = 'none';
	this.modal.style.position = 'fixed';
	this.modal.style.top = '0';
	this.modal.style.left = '0';
	this.modal.style.width = '100%';
	this.modal.style.height = '100%';
	this.modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	this.modal.style.zIndex = '1000';

	// Contenu du modal
	const modalContent = document.createElement('div');
	modalContent.className = 'modal-content';
	modalContent.style.position = 'relative';
	modalContent.style.margin = '10% auto';
	modalContent.style.padding = '20px';
	modalContent.style.backgroundColor = '#fff';
	modalContent.style.width = '80%';
	modalContent.style.maxWidth = '500px';

	// Bouton de fermeture sous forme de <span>
	const closeBtn = document.createElement('span');
	closeBtn.className = 'close-button';
	closeBtn.textContent = '×';
	closeBtn.style.position = 'absolute';
	closeBtn.style.top = '10px';
	closeBtn.style.right = '10px';
	closeBtn.style.cursor = 'pointer';
	closeBtn.addEventListener('click', () => this.closeModal());

	// Création du formulaire qui contiendra les champs d'édition
	const form = document.createElement('form');
	form.id = 'elementStyleEditorForm';

	// Champ générique pour modifier le style inline
	const styleLabel = document.createElement('label');
	styleLabel.textContent = 'Style CSS (inline) :';
	styleLabel.style.display = 'block';
	styleLabel.style.marginTop = '10px';
	const styleInput = document.createElement('textarea');
	styleInput.id = 'genericStyleInput';
	styleInput.style.width = '100%';
	styleInput.style.height = '60px';
	styleInput.style.marginTop = '5px';

	// Conteneur pour les champs contextuels spécifiques à la balise
	const contextualContainer = document.createElement('div');
	contextualContainer.id = 'contextualFieldsContainer';
	contextualContainer.style.marginTop = '15px';

	// Bouton "Appliquer" pour valider les changements
	const applyBtn = document.createElement('button');
	applyBtn.type = 'button';
	applyBtn.textContent = 'Appliquer';
	applyBtn.style.display = 'block';
	applyBtn.style.margin = '20px auto 0 auto';
	applyBtn.addEventListener('click', () => this.applyChanges());

	// Assemblage du formulaire
	form.appendChild(styleLabel);
	form.appendChild(styleInput);
	form.appendChild(contextualContainer);
	form.appendChild(applyBtn);

	// Assemblage du contenu du modal
	modalContent.appendChild(closeBtn);
	modalContent.appendChild(form);
	this.modal.appendChild(modalContent);
	document.body.appendChild(this.modal);
  },

  // Ouvre le modal et prépare les champs en fonction de l'élément ciblé
  openModal() {
	// Récupère l'élément sur lequel se trouve le curseur dans l'éditeur
	this.currentElement = this.getSelectedElement();
	if (!this.currentElement) {
	  alert("Aucune balise sélectionnée.");
	  return;
	}
	// Récupère et pré-remplit le champ générique "style" avec l'attribut inline de l'élément
	const styleInput = this.modal.querySelector('#genericStyleInput');
	styleInput.value = this.currentElement.getAttribute('style') || '';

	// Prépare le conteneur de champs contextuels
	const contextualContainer = this.modal.querySelector('#contextualFieldsContainer');
	contextualContainer.innerHTML = ''; // Efface d'éventuels anciens champs
	const tagName = this.currentElement.tagName.toUpperCase();

	if (tagName === 'A') {
	  // Pour les <a> : select pour target et champ pour href
	  const targetLabel = document.createElement('label');
	  targetLabel.textContent = 'Target : ';
	  const targetSelect = document.createElement('select');
	  targetSelect.id = 'contextualTargetSelect';
	  const targets = ['_self', '_blank', '_parent', '_top'];
	  targets.forEach(t => {
		const opt = document.createElement('option');
		opt.value = t;
		opt.textContent = t;
		targetSelect.appendChild(opt);
	  });
	  const currentTarget = this.currentElement.getAttribute('target') || '_self';
	  targetSelect.value = currentTarget;
	  contextualContainer.appendChild(targetLabel);
	  contextualContainer.appendChild(targetSelect);
	  contextualContainer.appendChild(document.createElement('br'));

	  const hrefLabel = document.createElement('label');
	  hrefLabel.textContent = 'Href : ';
	  hrefLabel.style.display = 'block';
	  const hrefInput = document.createElement('input');
	  hrefInput.type = 'text';
	  hrefInput.id = 'contextualHrefInput';
	  hrefInput.style.width = '100%';
	  hrefInput.value = this.currentElement.getAttribute('href') || '';
	  contextualContainer.appendChild(hrefLabel);
	  contextualContainer.appendChild(hrefInput);
	  contextualContainer.appendChild(document.createElement('br'));
	} else if (tagName === 'P') {
	  // Pour les <p> : select pour whiteSpace
	  const wsLabel = document.createElement('label');
	  wsLabel.textContent = 'WhiteSpace : ';
	  const wsSelect = document.createElement('select');
	  wsSelect.id = 'contextualWhitespaceSelect';
	  const wsOptions = ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'];
	  wsOptions.forEach(val => {
		const opt = document.createElement('option');
		opt.value = val;
		opt.textContent = val;
		wsSelect.appendChild(opt);
	  });
	  // Récupère la valeur actuelle depuis le style (ou définit 'normal' par défaut)
	  const currentWS = this.currentElement.style.whiteSpace || 'normal';
	  wsSelect.value = currentWS;
	  contextualContainer.appendChild(wsLabel);
	  contextualContainer.appendChild(wsSelect);
	  contextualContainer.appendChild(document.createElement('br'));
	} else {
	  // Pour tous les autres types de balises, pas de champs contextuels spécifiques,
	  // mais on affiche une note pour information.
	  const note = document.createElement('p');
	  note.textContent = 'Aucun champ contextuel spécifique pour cette balise.';
	  contextualContainer.appendChild(note);
	}
	// Affiche le modal
	this.modal.style.display = 'block';
  },

  // Ferme le modal
  closeModal() {
	this.modal.style.display = 'none';
  },

  // Récupère l'élément concerné selon la position du curseur dans l'éditeur
  getSelectedElement() {
	const sel = window.getSelection();
	if (sel.rangeCount > 0) {
	  let node = sel.getRangeAt(0).startContainer;
	  if (node.nodeType === Node.TEXT_NODE) {
		node = node.parentElement;
	  }
	  return node;
	}
	return null;
  },

  // Applique les changements choisis par l'utilisateur à l'élément ciblé
  applyChanges() {
	if (!this.currentElement) return;
	// Appliquer le style générique (inline) renseigné par l'utilisateur
	const styleInput = this.modal.querySelector('#genericStyleInput');
	const newStyle = styleInput.value.trim();
	if (newStyle) {
	  this.currentElement.setAttribute('style', newStyle);
	} else {
	  this.currentElement.removeAttribute('style');
	}

	// Appliquer les modifications contextuelles selon le type de balise
	const tagName = this.currentElement.tagName.toUpperCase();
	if (tagName === 'A') {
	  const targetSelect = this.modal.querySelector('#contextualTargetSelect');
	  if (targetSelect) {
		this.currentElement.setAttribute('target', targetSelect.value);
	  }
	  const hrefInput = this.modal.querySelector('#contextualHrefInput');
	  if (hrefInput) {
		this.currentElement.setAttribute('href', hrefInput.value.trim());
	  }
	} else if (tagName === 'P') {
	  const wsSelect = this.modal.querySelector('#contextualWhitespaceSelect');
	  if (wsSelect) {
		this.currentElement.style.whiteSpace = wsSelect.value;
	  }
	}
	// Ferme le modal après application
	this.closeModal();
  }
};