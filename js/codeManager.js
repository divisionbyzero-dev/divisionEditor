/*
 * Module: codeManager.js
 * Gestion des blocs de code.
 * Insertion, sélection et mise en forme via hljs.highlightElement.
 * Date de création: 10/01/2023
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

import { EditorUtils } from './editorUtils.js';

export const CodeManager = {
  editor: null,
  sourceEditorContainer: null,
  sourceEditor: null,
  languageSelector: null,
  sourceMode: false, // false: mode visuel, true: mode source

  // Vérifie si un nœud est dans un bloc <code> ou un <pre> contenant <code>
  isInsideCodeBlock(node) {
	let current = node;
	while (current && current !== this.editor) {
	  if (current.nodeType === Node.ELEMENT_NODE) {
		const tagName = current.tagName.toLowerCase();
		if (tagName === "code") return true;
		if (tagName === "pre" && current.querySelector('code') && current.contains(node)) return true;
	  }
	  current = current.parentElement;
	}
	return false;
  },

  // Applique la coloration via hljs.highlightElement en préservant la position du curseur
  applyHighlight(codeElem) {
	if (!codeElem || typeof hljs === 'undefined') return;
	// Sauvegarde et restauration via une méthode basée sur le calcul d'offset
	const sel = window.getSelection();
	if (!sel.rangeCount || !codeElem.contains(sel.getRangeAt(0).startContainer)) {
	  try {
		hljs.highlightElement(codeElem);
	  } catch (e) {
		console.error("Erreur pendant hljs.highlightElement:", e, codeElem);
	  }
	  return;
	}
	const caretOffset = getCaretCharacterOffsetWithin(codeElem);
	codeElem.removeAttribute('data-highlighted');
	try {
	  hljs.highlightElement(codeElem);
	} catch (e) {
	  console.error("Erreur pendant hljs.highlightElement:", e, codeElem);
	}
	setCaretPosition(codeElem, caretOffset);

	// --- Fonctions auxiliaires locales ---
	function getCaretCharacterOffsetWithin(element) {
	  let caretOffset = 0;
	  const doc = element.ownerDocument || element.document;
	  const win = doc.defaultView || doc.parentWindow;
	  const sel = win.getSelection();
	  if (sel.rangeCount > 0) {
		const range = sel.getRangeAt(0);
		const preCaretRange = range.cloneRange();
		preCaretRange.selectNodeContents(element);
		preCaretRange.setEnd(range.startContainer, range.startOffset);
		caretOffset = preCaretRange.toString().length;
	  }
	  return caretOffset;
	}
	function setCaretPosition(element, offset) {
	  const range = document.createRange();
	  const sel = window.getSelection();
	  let currentNode = null;
	  let currentOffset = offset;
	  function traverse(node) {
		if (node.nodeType === Node.TEXT_NODE) {
		  if (node.textContent.length >= currentOffset) {
			currentNode = node;
			return true;
		  } else {
			currentOffset -= node.textContent.length;
		  }
		} else {
		  for (let i = 0; i < node.childNodes.length; i++) {
			if (traverse(node.childNodes[i])) return true;
		  }
		}
		return false;
	  }
	  traverse(element);
	  if (currentNode) {
		range.setStart(currentNode, currentOffset);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	  }
	}
  },

  init(editor, languageSelector, sourceEditorContainer, sourceEditor) {
	this.editor = editor;
	this.languageSelector = languageSelector;
	this.sourceEditorContainer = sourceEditorContainer;
	this.sourceEditor = sourceEditor;

	if (typeof hljs !== "undefined" && typeof hljs.listLanguages === "function") {
	  languageSelector.innerHTML = "";
	  const defaultOption = document.createElement('option');
	  defaultOption.value = 'plaintext';
	  defaultOption.textContent = 'plaintext';
	  languageSelector.appendChild(defaultOption);
	  hljs.listLanguages().forEach(lang => {
		const opt = document.createElement('option');
		opt.value = lang;
		opt.textContent = lang;
		languageSelector.appendChild(opt);
	  });
	} else {
	  console.warn("hljs ou hljs.listLanguages indisponible.");
	}

	// Sélection d'un bloc <code> au clic
	this.editor.addEventListener('click', (event) => {
	  const clickedPre = event.target.closest('pre');
	  let clickedCode = clickedPre ? clickedPre.querySelector('code') : event.target.closest('code');
	  this.editor.querySelectorAll('code.selected-code').forEach(code => code.classList.remove('selected-code'));
	  if (clickedCode) {
		clickedCode.classList.add('selected-code');
		this.updateLanguageSelectorFromSelectedCode();
	  }
	});

	// Mise à jour du langage lors d'un changement
	this.languageSelector.addEventListener('change', () => {
	  const selectedCode = this.editor.querySelector('code.selected-code');
	  if (selectedCode) {
		const newLang = this.languageSelector.value.trim().toLowerCase();
		const parentPre = selectedCode.closest('pre');
		const updateLangClass = (element) => {
		  if (!element) return;
		  let langClassFound = false;
		  const classes = element.className.split(' ').map(cls => {
			if (cls.startsWith('language-')) {
			  langClassFound = true;
			  return (newLang && newLang !== 'plaintext') ? 'language-' + newLang : '';
			}
			return cls;
		  }).filter(cls => cls && !cls.startsWith('hljs'));
		  if (!langClassFound && newLang && newLang !== 'plaintext') {
			classes.push('language-' + newLang);
		  }
		  element.className = classes.join(' ');
		};
		updateLangClass(selectedCode);
		updateLangClass(parentPre);
		this.applyHighlight(selectedCode);
	  }
	});

	// Gestion de la coloration sur retour à la ligne
	this.editor.addEventListener('input', EditorUtils.debounce((event) => {
	  if (event.inputType !== "insertParagraph" && event.inputType !== "insertLineBreak") return;
	  const selection = window.getSelection();
	  if (!selection || selection.rangeCount === 0) return;
	  const range = selection.getRangeAt(0);
	  let codeElem = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
		? range.commonAncestorContainer.parentElement
		: range.commonAncestorContainer;
	  codeElem = codeElem.closest('code');
	  if (codeElem) this.applyHighlight(codeElem);
	}, 300));

	// Gestion de la coloration à la perte du focus
	this.editor.addEventListener('blur', (event) => {
	  const codeElem = event.target.closest('code');
	  if (codeElem && (!event.relatedTarget || !codeElem.contains(event.relatedTarget))) {
		this.applyHighlight(codeElem);
	  }
	}, true);

	// Gestion de la touche Enter dans un bloc <code> pour insérer un saut de ligne
	this.editor.addEventListener('keydown', (event) => {
	  // Gestion du Tab et Shift+Tab pour l'indentation
	  if (event.key === "Tab") {
		const sel = window.getSelection();
		if (!sel.rangeCount) return;
		let container = sel.getRangeAt(0).startContainer;
		let codeElem = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
		codeElem = codeElem.closest('code');
		if (!codeElem) return;
		event.preventDefault();

		// Fonction pour obtenir les offsets de sélection dans l'élément
		function getSelectionOffsetsWithin(element) {
		  const sel = window.getSelection();
		  if(!sel.rangeCount) return { start: 0, end: 0 };
		  const range = sel.getRangeAt(0);
		  const preRange = range.cloneRange();
		  preRange.selectNodeContents(element);
		  preRange.setEnd(range.startContainer, range.startOffset);
		  const start = preRange.toString().length;
		  const selectedText = range.toString();
		  const end = start + selectedText.length;
		  return { start, end };
		}
		// Fonction pour positionner le curseur à un offset donné
		function setCaretPosition(element, offset) {
		  const range = document.createRange();
		  const sel = window.getSelection();
		  let currentNode = null;
		  let currentOffset = offset;
		  function traverse(node) {
			if (node.nodeType === Node.TEXT_NODE) {
			  if (node.textContent.length >= currentOffset) {
				currentNode = node;
				return true;
			  } else {
				currentOffset -= node.textContent.length;
			  }
			} else {
			  for (let i = 0; i < node.childNodes.length; i++) {
				if (traverse(node.childNodes[i])) return true;
			  }
			}
			return false;
		  }
		  traverse(element);
		  if (currentNode) {
			range.setStart(currentNode, currentOffset);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		  }
		}
		// Fonction pour ajouter ou retirer une tabulation sur chaque ligne sélectionnée
		function modifyIndentation(element, isIndent) {
		  const offsets = getSelectionOffsetsWithin(element);
		  const fullText = element.textContent;
		  
		  // Si la sélection est collapsée, insérer simplement une tabulation au caret
		  if (offsets.start === offsets.end) {
			const newText = fullText.substring(0, offsets.start) + "\t" + fullText.substring(offsets.start);
			element.textContent = newText;
			setCaretPosition(element, offsets.start + 1);
			return;
		  }
		  
		  // Trouver le début de la première ligne et la fin de la dernière ligne concernées par la sélection
		  let lineStart = fullText.lastIndexOf("\n", offsets.start);
		  lineStart = (lineStart === -1) ? 0 : lineStart + 1;
		  let lineEnd = fullText.indexOf("\n", offsets.end);
		  if (lineEnd === -1) {
			lineEnd = fullText.length;
		  }
		  
		  // Extraire le bloc correspondant et le transformer
		  const block = fullText.substring(lineStart, lineEnd);
		  const lines = block.split("\n");
		  const modifiedLines = lines.map(line => {
			return isIndent ? "\t" + line : (line.startsWith("\t") ? line.substring(1) : line);
		  });
		  // On reconstruit le bloc sans ajouter de "\n" supplémentaire
		  const modifiedBlock = modifiedLines.join("\n");
		  
		  // Construire le nouveau texte en remplaçant le bloc sélectionné
		  const newText = fullText.substring(0, lineStart) + modifiedBlock + fullText.substring(lineEnd);
		  element.textContent = newText;
		  
		  // Replacer le caret à la fin du bloc modifié
		  setCaretPosition(element, lineStart + modifiedBlock.length);
		
		  // Fonction auxiliaire pour calculer les offsets de la sélection dans l'élément
		  function getSelectionOffsetsWithin(element) {
			const sel = window.getSelection();
			if (!sel.rangeCount) return { start: 0, end: 0 };
			const range = sel.getRangeAt(0);
			const preRange = range.cloneRange();
			preRange.selectNodeContents(element);
			preRange.setEnd(range.startContainer, range.startOffset);
			const start = preRange.toString().length;
			const end = start + range.toString().length;
			return { start, end };
		  }
		
		  // Fonction auxiliaire pour replacer le caret dans l'élément à un offset donné
		  function setCaretPosition(element, offset) {
			const range = document.createRange();
			const sel = window.getSelection();
			let currentNode = null;
			let currentOffset = offset;
			function traverse(node) {
			  if (node.nodeType === Node.TEXT_NODE) {
				if (node.textContent.length >= currentOffset) {
				  currentNode = node;
				  return true;
				} else {
				  currentOffset -= node.textContent.length;
				}
			  } else {
				for (let i = 0; i < node.childNodes.length; i++) {
				  if (traverse(node.childNodes[i])) {
					return true;
				  }
				}
			  }
			  return false;
			}
			traverse(element);
			if (currentNode) {
			  range.setStart(currentNode, currentOffset);
			  range.collapse(true);
			  sel.removeAllRanges();
			  sel.addRange(range);
			}
		  }
		}

		// Selon que Shift est pressé ou non, on ajoute ou on retire l'indentation
		if (event.shiftKey) {
		  modifyIndentation(codeElem, false);
		} else {
		  modifyIndentation(codeElem, true);
		}
		// Appliquer la coloration après modification
		this.applyHighlight(codeElem);
		return;
	  }

	  // Gestion de la touche Enter déjà existante pour insérer un saut de ligne dans <code>
	  if (event.key === "Enter") {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		let container = range.startContainer;
		let codeElem = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
		codeElem = codeElem.closest('code');
		if (codeElem) {
		  event.preventDefault();
		  const newlineNode = document.createTextNode("\n");
		  range.deleteContents();
		  range.insertNode(newlineNode);
		  range.setStartAfter(newlineNode);
		  range.collapse(true);
		  selection.removeAllRanges();
		  selection.addRange(range);
		}
	  }
	});
  }, // Fin init

  updateLanguageSelectorFromSelectedCode() {
	const selectedCode = this.editor.querySelector('code.selected-code');
	let lang = 'plaintext';
	if (selectedCode) {
	  const classes = selectedCode.className.split(' ');
	  const langClass = classes.find(cls => cls.startsWith('language-'));
	  if (langClass) lang = langClass.substring('language-'.length);
	}
	if (Array.from(this.languageSelector.options).some(opt => opt.value === lang)) {
	  this.languageSelector.value = lang;
	} else {
	  console.warn(`Langage "${lang}" introuvable dans le sélecteur. Fallback vers plaintext.`);
	  this.languageSelector.value = 'plaintext';
	}
  },

  // Insère un bloc de code si le curseur est dans l'éditeur et n'est pas déjà dans un bloc code
  addCodeBlock() {
	const selection = window.getSelection();
	if (!selection.rangeCount) return;
	if (!this.editor.contains(selection.anchorNode)) {
	  console.warn("Insertion annulée : la sélection n'est pas dans l'éditeur.");
	  return;
	}
	const range = selection.getRangeAt(0);
	if (this.isInsideCodeBlock(range.startContainer)) {
	  console.log("Insertion annulée : déjà dans un bloc de code.");
	  return;
	}
	const language = this.languageSelector.value || 'plaintext';
	const langClass = language.trim().toLowerCase();
	const selectedText = range.toString();
	const pre = document.createElement('pre');
	const code = document.createElement('code');
	if (langClass && langClass !== 'plaintext') {
	  pre.classList.add('language-' + langClass);
	  code.classList.add('language-' + langClass);
	}
	code.textContent = selectedText || `// ${langClass} code...\n`;
	pre.appendChild(code);
	range.deleteContents();
	range.insertNode(pre);
	const pAfter = document.createElement('p');
	pAfter.innerHTML = '<br>';
	pre.parentNode.insertBefore(pAfter, pre.nextSibling);
	this.applyHighlight(code);
	const firstChild = code.firstChild;
	range.setStart(firstChild || code, 0);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
	this.editor.focus();
	code.classList.add('selected-code');
	this.updateLanguageSelectorFromSelectedCode();
  },

  // Bascule entre mode visuel et mode source
  toggleSourceMode() {
	this.sourceMode = !this.sourceMode;
	if (this.sourceMode) {
	  let rawHtml = this.getCleanHTML();
	  let formattedHtml = EditorUtils.formatHTML(rawHtml) || '';
	  formattedHtml = formattedHtml.replace(/^\s+/, '');
	  this.sourceEditor.textContent = formattedHtml;
	  this.editor.style.display = 'none';
	  this.sourceEditorContainer.style.display = 'block';
	  this.sourceEditor.className = 'language-html source-editor-code hljs';
	  EditorUtils.highlightCodeSyntax(this.sourceEditor);
	} else {
	  let updatedCode = this.sourceEditor.textContent;
	  this.editor.innerHTML = updatedCode;
	  this.sourceEditorContainer.style.display = 'none';
	  this.editor.style.display = 'block';
	  this.editor.querySelectorAll('pre code').forEach(codeBlock => this.applyHighlight(codeBlock));
	}
  },

  // Retourne le HTML nettoyé (sans spans ajoutés par la coloration)
  getCleanHTML() {
	const clone = this.editor.cloneNode(true);
	const codeBlocks = clone.querySelectorAll('pre code, code');
	codeBlocks.forEach(code => {
	  const plainText = code.textContent;
	  code.innerHTML = '';
	  code.appendChild(document.createTextNode(plainText));
	  code.classList.remove('hljs');
	  code.removeAttribute('data-highlighted');
	});
	return clone.innerHTML;
  }
};