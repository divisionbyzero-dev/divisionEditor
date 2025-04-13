/*
 * Module: editorUtils.js
 * Description: Module utilitaire fournissant diverses fonctions (debounce, formatage HTML, gestion de la sélection, etc.) pour l'éditeur.
 * Date de création: 06/01/2023
 * Auteur: divisionByZero.dev
 * Site: https://www.divisionbyzero.dev
 */

export const EditorUtils = {
  debounce(func, wait) {
	let timeout;
	return function(...args) {
	  clearTimeout(timeout);
	  timeout = setTimeout(() => func(...args), wait);
	};
  },

  highlightCodeSyntax(element) {
	if (!element || typeof hljs === 'undefined') return;
	element.removeAttribute('data-highlighted'); // Pour forcer la re-colorisation
	try {
	  hljs.highlightElement(element);
	} catch (e) {
	  console.error("Erreur dans highlightElement:", e, element);
	}
  },

  // Formatage simple du HTML pour une indentation basique
  formatHTML(html) {
	const tab = '\t';
	let result = '', indent = '';
	html = html.replace(/>\s+</g, '><');
	html.split(/>\s*</).forEach(function(element) {
	  let tagNameMatch = element.match(/^<?(\/?[\w\-]+)/);
	  let tagName = tagNameMatch ? tagNameMatch[1] : '';
	  let isClosingTag = tagName.startsWith('/');
	  if (isClosingTag && indent.length >= tab.length) {
		indent = indent.substring(tab.length);
	  }
	  result += indent + '<' + element + '>\n';
	  if (!isClosingTag && element.match(/^<?\w/) && !element.match(/\/$/) &&
		  !['br', 'hr', 'input', 'img', 'link', 'meta'].includes(tagName.replace('<', ''))) {
		indent += tab;
	  }
	});
	return result.substring(1, result.length - 2)
	  .replace(/&lt;/g, '<')
	  .replace(/&gt;/g, '>');
  },

  insertHtmlAtCaret(html, editor, sourceMode) {
	if (sourceMode) return;
	editor.focus();
	const sel = window.getSelection();
	if (sel && sel.rangeCount > 0) {
	  const range = sel.getRangeAt(0);
	  range.deleteContents();
	  const el = document.createElement("div");
	  el.innerHTML = html;
	  const frag = document.createDocumentFragment();
	  let node, lastNode;
	  while ((node = el.firstChild)) {
		lastNode = frag.appendChild(node);
	  }
	  range.insertNode(frag);
	  if (lastNode) {
		range.setStartAfter(lastNode);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	  }
	} else {
	  document.execCommand('insertHTML', false, html);
	}
  },

  selection: {
	savedRange: null,
	save() {
	  const sel = window.getSelection();
	  if (sel && sel.rangeCount > 0) {
		this.savedRange = sel.getRangeAt(0).cloneRange();
	  }
	},
	restore() {
	  if (this.savedRange) {
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(this.savedRange);
		this.savedRange = null;
	  }
	}
  }
};