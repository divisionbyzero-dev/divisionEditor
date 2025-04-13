/*
 * Module: main.js
 * Description: Fichier principal de l'éditeur de texte, orchestrant l'initialisation et l'interaction entre les divers modules.
 * Date de création: 05/01/2023
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

import { EditorUtils } from './editorUtils.js';
import { CodeManager } from './codeManager.js';
import { ImageHandler } from './imageHandler.js';
import { SourcePrintManager } from './sourcePrintManager.js';
import { ColorPalette } from './colorPalette.js';
import { LinkManager } from './linkManager.js';
import { ElementStyleEditor } from './elementStyleEditor.js';
import { HtmlContentExtractor } from './htmlContentExtractor.js';

document.addEventListener('DOMContentLoaded', () => {
  // Références DOM de base
  const editor = document.getElementById('editor');
  const sourceEditorContainer = document.getElementById('sourceEditorContainer');
  const sourceEditor = document.getElementById('sourceEditor');
  const toolbar = document.querySelector('.toolbar');
  const languageSelector = document.getElementById('languageSelector');
  const addCodeBlockButton = document.getElementById('addCodeBlock');
  const toggleSourceButton = document.getElementById('toggleSource');
  const printButton = document.getElementById('printButton');

  // Références pour la gestion des images
  const insertImageUrlButton = document.getElementById('insertImageUrlButton');
  const uploadImageButton = document.getElementById('uploadImageButton');
  const imageUploadInput = document.getElementById('imageUploadInput');
  const browseImageLibraryButton = document.getElementById('browseImageLibraryButton');
  const uploadProgressContainer = document.getElementById('uploadProgressContainer');
  const imageLibraryModal = document.getElementById('imageLibraryModal');
  const closeImageLibraryModal = document.getElementById('closeImageLibraryModal');
  const imageLibraryContent = document.getElementById('imageLibraryContent');

  // Références pour les liens et la palette de couleurs
  const createLinkButton = document.getElementById('createLinkButton');
  const unlinkButton = document.querySelector('button[data-command="unlink"]');
  const colorPaletteButton = document.getElementById('colorPaletteButton');

  // **NOUVEAU** : bouton pour ouvrir l'éditeur de style d'élément
  const openStyleEditorButton = document.getElementById('editElementStyleButton');
  if (!openStyleEditorButton) {
	console.error("Bouton 'editStyleButton' introuvable pour ElementStyleEditor.");
  }

  let sourceMode = false;

  // Initialisation du gestionnaire de blocs de code
  CodeManager.init(editor, languageSelector, sourceEditorContainer, sourceEditor);
  if (addCodeBlockButton) {
	addCodeBlockButton.addEventListener('click', () => {
	  CodeManager.addCodeBlock();
	});
  } else {
	console.error("Bouton 'addCodeBlock' introuvable.");
  }

  // Exposer getCleanHTML sur l'éditeur
  editor.getContent = CodeManager.getCleanHTML.bind(CodeManager);

  // Écouteur générique pour la toolbar (execCommand)
  toolbar.addEventListener('click', (event) => {
	const target = event.target.closest('button');
	const handledIds = [
	  'createLinkButton','addCodeBlock','toggleSource','printButton',
	  'insertImageUrlButton','uploadImageButton','browseImageLibraryButton'
	];
	if (target && target.dataset.command && !handledIds.includes(target.id)) {
	  if (sourceMode) {
		alert("Passez en mode éditeur visuel.");
		return;
	  }
	  document.execCommand(target.dataset.command, false, target.dataset.value || null);
	  editor.focus();
	}
  });

  // Gestion de la touche Tab pour insérer une tabulation
  document.addEventListener('keydown', (event) => {
	if (event.key === 'Tab') {
	  const active = document.activeElement;
	  if (editor.contains(active) || active === sourceEditor) {
		event.preventDefault();
		document.execCommand('insertText', false, '\t');
	  }
	}
  });

  // Initialisation du gestionnaire d'images
  ImageHandler.init({
	editor,
	uploadProgressContainer,
	imageLibraryModal,
	imageLibraryContent,
	insertImageUrlButton,
	uploadImageButton,
	imageUploadInput,
	browseImageLibraryButton,
	closeImageLibraryModal
  });

  // Initialisation du mode source et de l'impression
  SourcePrintManager.init({
	editor,
	sourceEditorContainer,
	sourceEditor,
	toggleSourceButton,
	printButton,
	codeManager: CodeManager
  });

  // Initialisation de la palette de couleur
  if (colorPaletteButton) {
	ColorPalette.init({
	  editor,
	  button: colorPaletteButton
	});
  } else {
	console.error("Bouton 'colorPaletteButton' introuvable.");
  }

  // Initialisation du gestionnaire de liens
  LinkManager.init({
	editor,
	createLinkButton,
	unlinkButton
  });

  // Initialisation de l'éditeur de style d'éléments
  ElementStyleEditor.init({
	editor,
	openStyleEditorButton
  });

  // Fonction globale pour récupérer le HTML propre
  window.getCleanHTMLContent = () => {
	const cleanHTML = CodeManager.getCleanHTML();
	console.log("Contenu HTML propre :", cleanHTML);
	return cleanHTML;
  };

  // Autres initialisations complémentaires…
  function initializeEditor() {
	// par exemple, plugins additionnels
  }
  initializeEditor();
});