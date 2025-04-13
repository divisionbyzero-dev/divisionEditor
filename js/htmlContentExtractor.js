/*
 * Module: htmlContentExtractor.js
 * Description: Module qui fournit une fonction pour récupérer le contenu HTML courant de l'éditeur.
 *              Ce contenu peut ensuite être stocké dans une base de données ou utilisé dans d'autres traitements.
 * Date de création: 28/02/2023
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

import { CodeManager } from './codeManager.js';

export const HtmlContentExtractor = {
  /**
   * Récupère le contenu HTML courant de l'éditeur.
   * Si la méthode getCleanHTML de CodeManager est disponible, elle est utilisée pour retourner
   * un contenu sans éléments de mise en forme ajouté par les modules de coloration syntaxique.
   * Sinon, la fonction retourne le innerHTML de l'élément ayant l'id "editor".
   *
   * @returns {string} Le contenu HTML propre de l'éditeur.
   */
  getContent: function() {
	if (CodeManager && typeof CodeManager.getCleanHTML === 'function') {
	  return CodeManager.getCleanHTML();
	} else {
	  console.warn("CodeManager non disponible. Retourne le contenu brut de l'éditeur.");
	  const editor = document.getElementById('editor');
	  return editor ? editor.innerHTML : '';
	}
  }
};