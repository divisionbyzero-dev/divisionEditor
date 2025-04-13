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
  const createLinkButton = document.getElementById('createLinkButton');
  const uploadProgressContainer = document.getElementById('uploadProgressContainer');
  const imageLibraryModal = document.getElementById('imageLibraryModal');
  const closeImageLibraryModal = document.getElementById('closeImageLibraryModal');
  const imageLibraryContent = document.getElementById('imageLibraryContent');

  // Référence pour le bouton de couleur (à ajouter dans votre toolbar)
  const colorPaletteButton = document.getElementById('colorPaletteButton');

  // Pour le bouton de suppression de lien (id ou data-command)
  const unlinkButton = document.querySelector('button[data-command="unlink"]');

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

  // Exemple d'attachement d'une méthode getContent sur l'instance de l'éditeur
  // Ici, on "injecte" la méthode getCleanHTML de CodeManager directement sur l'élément editor.
  editor.getContent = CodeManager.getCleanHTML.bind(CodeManager);

  // Écouteur générique pour la toolbar
  toolbar.addEventListener('click', (event) => {
	const target = event.target.closest('button');
	const specificallyHandledIds = [
	  'createLinkButton', 'addCodeBlock', 'toggleSource', 'printButton',
	  'insertImageUrlButton', 'uploadImageButton', 'browseImageLibraryButton'
	];
	if (target && target.dataset.command && !specificallyHandledIds.includes(target.id)) {
	  if (sourceMode) {
		alert("Passez en mode éditeur visuel.");
		return;
	  }
	  const command = target.dataset.command;
	  const value = target.dataset.value || null;
	  document.execCommand(command, false, value);
	  editor.focus();
	}
  });

  // Gérer la touche Tab
  document.addEventListener('keydown', (event) => {
	if (event.key !== 'Tab') return;
	const activeElement = document.activeElement;
	if (editor.contains(activeElement) || activeElement === sourceEditor) {
	  event.preventDefault();
	  document.execCommand('insertText', false, '\t');
	}
  });

  // Initialisation du gestionnaire d'images
  ImageHandler.init({
	editor: editor,
	uploadProgressContainer: uploadProgressContainer,
	imageLibraryModal: imageLibraryModal,
	imageLibraryContent: imageLibraryContent,
	insertImageUrlButton: insertImageUrlButton,
	uploadImageButton: uploadImageButton,
	imageUploadInput: imageUploadInput,
	browseImageLibraryButton: browseImageLibraryButton,
	closeImageLibraryModal: closeImageLibraryModal
  });

  // Initialisation du mode source et de l'impression
  SourcePrintManager.init({
	editor: editor,
	sourceEditorContainer: sourceEditorContainer,
	sourceEditor: sourceEditor,
	toggleSourceButton: toggleSourceButton,
	printButton: printButton,
	codeManager: CodeManager
  });

  // Initialisation de la palette de couleur
  if (colorPaletteButton) {
	ColorPalette.init({
	  editor: editor,
	  button: colorPaletteButton
	});
  } else {
	console.error("Bouton 'colorPaletteButton' introuvable.");
  }

  // Initialiser le LinkManager
  LinkManager.init({
	editor: editor,
	createLinkButton: createLinkButton,
	unlinkButton: unlinkButton
  });
  
  ElementStyleEditor.init({ editor: editor });

  // Fonction globale si besoin
  window.getCleanHTMLContent = () => {
	const cleanHTML = CodeManager.getCleanHTML();
	console.log("Contenu HTML propre :", cleanHTML);
	return cleanHTML;
  };

  // Autres initialisations complémentaires…
  function initializeEditor() {
	// Par exemple, initialiser des plugins supplémentaires
  }
  initializeEditor();
});