/*
 * Module: sourcePrintManager.js
 * Description: Module de gestion du mode source et de l'impression, permettant de basculer entre l'affichage visuel et le code source, ainsi que d'imprimer le contenu.
 * Date de création: 30/03/2025
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

export const SourcePrintManager = {
  editor: null,
  sourceEditorContainer: null,
  sourceEditor: null,
  toggleSourceButton: null,
  printButton: null,
  codeManager: null,

  init(config) {
	this.editor = config.editor;
	this.sourceEditorContainer = config.sourceEditorContainer;
	this.sourceEditor = config.sourceEditor;
	this.toggleSourceButton = config.toggleSourceButton;
	this.printButton = config.printButton;
	this.codeManager = config.codeManager;

	// Démarrer en mode visuel
	this.sourceEditorContainer.style.display = 'none';
	this.editor.style.display = 'block';
	// Icône initiale pour la bascule (passer en mode source)
	this.toggleSourceButton.innerHTML = '<i class="material-icons">code</i>';

	// Bascule du mode source / visuel
	this.toggleSourceButton.addEventListener('click', () => {
	  this.codeManager.toggleSourceMode();
	  if (this.codeManager.sourceMode) {
		// En mode source, changer l'icône pour revenir en mode visuel
		this.toggleSourceButton.innerHTML = '<i class="material-icons">visibility</i>';
	  } else {
		// En mode visuel, afficher l'icône pour passer en mode source
		this.toggleSourceButton.innerHTML = '<i class="material-icons">code</i>';
	  }
	});

	// Bouton pour imprimer
	this.printButton.addEventListener('click', () => {
	  window.print();
	});
  }
};