/*
 * Module: linkManager.js
 * Description: Module de gestion des liens dans l'éditeur, permettant de créer ou supprimer des liens.
 * Date de création: 25/01/2023
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */


import { EditorUtils } from './editorUtils.js';

export const LinkManager = {
   editor: null,
   createLinkButton: null,
   unlinkButton: null,

   init(config) {
	   this.editor = config.editor;
	   this.createLinkButton = config.createLinkButton;
	   this.unlinkButton = config.unlinkButton;
	   this.addListeners();
   },

   addListeners() {
	   if (this.createLinkButton) {
		   this.createLinkButton.addEventListener('click', () => {
			   EditorUtils.selection.save();
			   const url = prompt("Entrez l'URL du lien (laisser vide pour supprimer) :", "https://");
			   if (url !== null) {
				   EditorUtils.selection.restore();
				   if (url.trim() === "") {
					   document.execCommand('unlink', false, null);
				   } else {
					   document.execCommand('createLink', false, url);
				   }
				   this.editor.focus();
			   }
		   });
	   } else {
		   console.error("Bouton 'createLinkButton' introuvable");
	   }
	   // Ajout d'un event listener pour le bouton de suppression de lien si nécessaire
	   if (this.unlinkButton) {
		   this.unlinkButton.addEventListener('click', () => {
			   document.execCommand('unlink', false, null);
			   this.editor.focus();
		   });
	   }
   }
}