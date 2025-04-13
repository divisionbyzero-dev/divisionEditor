/*
 * Module: colorPalette.js
 * Description: Module de gestion de la palette de couleurs, permettant d'appliquer des couleurs sur le texte sélectionné via une interface de choix.
 * Date de création: 11/02/2024
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

import { EditorUtils } from './editorUtils.js';

export const ColorPalette = {
  paletteContainer: null,
  button: null,
  editor: null,
  // Vous pouvez ajouter autant de couleurs que vous le souhaitez.
  colors: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'],

  init(config) {
	// Récupération des références
	this.editor = config.editor;
	this.button = config.button;
	// Utilisation d'un conteneur fourni ou création d'un nouveau
	if (config.paletteContainer) {
	  this.paletteContainer = config.paletteContainer;
	} else {
	  this.paletteContainer = document.createElement('div');
	  this.paletteContainer.id = 'color-palette';
	  // Styles de base pour la palette
	  this.paletteContainer.style.position = 'absolute';
	  this.paletteContainer.style.background = '#fff';
	  this.paletteContainer.style.border = '1px solid #ccc';
	  this.paletteContainer.style.padding = '5px';
	  this.paletteContainer.style.display = 'none';
	  this.paletteContainer.style.zIndex = '1000';
	  document.body.appendChild(this.paletteContainer);
	}
	// Possibilité de définir une liste de couleurs personnalisée
	if (config.colors) {
	  this.colors = config.colors;
	}
	this.populatePalette();

	// Sauvegarder la sélection lors du clic sur le bouton
	this.button.addEventListener('click', (e) => {
	  e.stopPropagation();
	  EditorUtils.selection.save();
	  this.togglePalette(e);
	});
	// Cacher la palette en cliquant ailleurs
	document.addEventListener('click', () => {
	  this.hidePalette();
	});
	this.paletteContainer.addEventListener('click', (e) => {
	  e.stopPropagation();
	});
  },

  populatePalette() {
	this.paletteContainer.innerHTML = '';
	this.colors.forEach(color => {
	  const colorSwatch = document.createElement('div');
	  colorSwatch.style.width = '20px';
	  colorSwatch.style.height = '20px';
	  colorSwatch.style.backgroundColor = color;
	  colorSwatch.style.display = 'inline-block';
	  colorSwatch.style.margin = '2px';
	  colorSwatch.style.cursor = 'pointer';
	  colorSwatch.title = color;
	  colorSwatch.addEventListener('click', () => {
		this.applyColor(color);
		this.hidePalette();
	  });
	  this.paletteContainer.appendChild(colorSwatch);
	});
  },

  togglePalette(event) {
	// Positionnement de la palette juste en dessous du bouton
	if (this.paletteContainer.style.display === 'none' || this.paletteContainer.style.display === '') {
	  const rect = this.button.getBoundingClientRect();
	  this.paletteContainer.style.top = (rect.bottom + window.scrollY) + 'px';
	  this.paletteContainer.style.left = (rect.left + window.scrollX) + 'px';
	  this.paletteContainer.style.display = 'block';
	} else {
	  this.hidePalette();
	}
  },

  hidePalette() {
	this.paletteContainer.style.display = 'none';
  },

  applyColor(color) {
	// Restaurer la sélection sauvegardée
	EditorUtils.selection.restore();
	// Essayer d'utiliser execCommand ('foreColor')
	const result = document.execCommand('foreColor', false, color);
	// Si execCommand ne fonctionne pas, appliquer le fallback sur le contenu sélectionné
	if (!result || typeof result === 'undefined') {
	  const sel = window.getSelection();
	  if (sel.rangeCount > 0 && !sel.isCollapsed) {
		const range = sel.getRangeAt(0);
		const span = document.createElement('span');
		span.style.color = color;
		// Extraire le contenu sélectionné et l'insérer dans le span
		const extractedContents = range.extractContents();
		span.appendChild(extractedContents);
		range.insertNode(span);
		// Mettre à jour la sélection pour garder le focus
		sel.removeAllRanges();
		const newRange = document.createRange();
		newRange.selectNodeContents(span);
		newRange.collapse(false);
		sel.addRange(newRange);
	  }
	}
	this.editor.focus();
  }
};