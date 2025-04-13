// elementStyleEditor.js
/*
 * Module: elementStyleEditor.js
 * Description: Module de l'éditeur de style d'éléments, permettant de modifier dynamiquement
 *              les attributs et le style inline des éléments sélectionnés dans l'éditeur.
 * Date de création: 28/09/2024
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

export const ElementStyleEditor = {
  editor: null,
  modal: null,
  currentElement: null,

  init(config) {
	this.editor = config.editor;
	const openBtn = config.openStyleEditorButton;
	if (!openBtn) {
	  console.error("ElementStyleEditor.init: il faut passer openStyleEditorButton");
	  return;
	}

	// Création du modal
	this.modal = document.createElement('div');
	this.modal.id = 'elementStyleEditorModal';
	this.modal.className = 'modal';
	this.modal.style.display = 'none';
	// Les styles de base sont dans elementStyleEditor.css

	// Contenu du modal
	const modalContent = document.createElement('div');
	modalContent.className = 'modal-content';

	// Bouton de fermeture
	const closeBtn = document.createElement('span');
	closeBtn.className = 'close-button';
	closeBtn.textContent = '×';
	closeBtn.addEventListener('click', () => this.closeModal());
	modalContent.appendChild(closeBtn);

	// Formulaire
	const form = document.createElement('form');
	form.id = 'elementStyleEditorForm';

	// Style inline
	const styleLabel = document.createElement('label');
	styleLabel.textContent = 'Style CSS (inline) :';
	form.appendChild(styleLabel);

	const styleInput = document.createElement('textarea');
	styleInput.id = 'genericStyleInput';
	styleInput.style.width = '100%';
	styleInput.style.height = '60px';
	form.appendChild(styleInput);

	// Container pour champs contextuels
	const contextualContainer = document.createElement('div');
	contextualContainer.id = 'contextualFieldsContainer';
	contextualContainer.style.marginTop = '15px';
	form.appendChild(contextualContainer);

	// Bouton Appliquer
	const applyBtn = document.createElement('button');
	applyBtn.type = 'button';
	applyBtn.textContent = 'Appliquer';
	applyBtn.addEventListener('click', () => this.applyChanges());
	form.appendChild(applyBtn);

	modalContent.appendChild(form);
	this.modal.appendChild(modalContent);
	document.body.appendChild(this.modal);

	// Ouvrir le modal
	openBtn.addEventListener('click', e => {
	  e.preventDefault();
	  e.stopPropagation();
	  this.openModal();
	});

	// Clic sur image dans l'éditeur la sélectionne
	this.editor.addEventListener('click', e => {
	  if (e.target.tagName === 'IMG') {
		this.currentElement = e.target;
	  }
	});
  },

  openModal() {
	if (!this.currentElement) {
	  this.currentElement = this.getSelectedElement();
	}
	if (!this.currentElement) {
	  alert("Aucune balise sélectionnée.");
	  return;
	}

	// Pré-remplir style inline
	const styleInput = this.modal.querySelector('#genericStyleInput');
	styleInput.value = this.currentElement.getAttribute('style') || '';

	// Construire champs contextuels
	const container = this.modal.querySelector('#contextualFieldsContainer');
	container.innerHTML = '';
	const tag = this.currentElement.tagName.toUpperCase();

	if (tag === 'A') {
	  // target
	  const lblT = document.createElement('label'); lblT.textContent = 'Target :'; container.appendChild(lblT);
	  const selT = document.createElement('select'); selT.id = 'contextualTargetSelect';
	  ['_self','_blank','_parent','_top'].forEach(v => {
		const o = document.createElement('option'); o.value = v; o.textContent = v; selT.appendChild(o);
	  });
	  selT.value = this.currentElement.getAttribute('target')||'_self';
	  container.appendChild(selT);
	  // href
	  const lblH = document.createElement('label'); lblH.textContent = 'Href :'; container.appendChild(lblH);
	  const inpH = document.createElement('input'); inpH.id = 'contextualHrefInput'; inpH.type='text';
	  inpH.value = this.currentElement.getAttribute('href')||'';
	  container.appendChild(inpH);

	} else if (tag === 'P') {
	  const lbl = document.createElement('label'); lbl.textContent = 'WhiteSpace :'; container.appendChild(lbl);
	  const sel = document.createElement('select'); sel.id = 'contextualWhitespaceSelect';
	  ['normal','nowrap','pre','pre-line','pre-wrap'].forEach(v => {
		const o = document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o);
	  });
	  sel.value = this.currentElement.style.whiteSpace || 'normal';
	  container.appendChild(sel);

	} else {
	  const note = document.createElement('p');
	  note.textContent = 'Aucun champ contextuel spécifique pour cette balise.';
	  container.appendChild(note);
	}

	this.modal.style.display = 'block';
  },

  closeModal() {
	this.modal.style.display = 'none';
	this.currentElement = null;
  },

  getSelectedElement() {
	const sel = window.getSelection();
	if (sel.rangeCount === 0) return null;
	let node = sel.getRangeAt(0).startContainer;
	if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
	return node;
  },

  applyChanges() {
	if (!this.currentElement) return;
	// style inline
	const styleVal = this.modal.querySelector('#genericStyleInput').value.trim();
	if (styleVal) this.currentElement.setAttribute('style', styleVal);
	else this.currentElement.removeAttribute('style');

	// contextuels
	const tag = this.currentElement.tagName.toUpperCase();
	if (tag === 'A') {
	  const tgt = this.modal.querySelector('#contextualTargetSelect').value;
	  this.currentElement.setAttribute('target', tgt);
	  const href = this.modal.querySelector('#contextualHrefInput').value.trim();
	  this.currentElement.setAttribute('href', href);
	}
	if (tag === 'P') {
	  const ws = this.modal.querySelector('#contextualWhitespaceSelect').value;
	  this.currentElement.style.whiteSpace = ws;
	}

	this.closeModal();
  }
};