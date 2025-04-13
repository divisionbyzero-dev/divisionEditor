# division-editor

**division-editor** est un éditeur HTML riche (WYSIWYG) open source qui permet d’éditer du contenu HTML tout en apportant un soin particulier aux zones de code. Il inclut des fonctionnalités avancées telles que la coloration syntaxique, la gestion fine de l’indentation (Tab/Shift+Tab), la modification des styles inline et la gestion d’images et de liens.

> **Projet expérimental**  
> Projet expérimental créé from scratch pour répondre à mes besoins et comprendre les défis de ce type d’outil.

## Fonctionnalités

- **Édition HTML en mode WYSIWYG** avec possibilité de passer en mode source.
- **Gestion des blocs de code** : coloration syntaxique (via [highlight.js](https://highlightjs.org/)), indentation automatique et prise en charge de Tab/Shift+Tab.
- **Palette de couleurs** : applique des couleurs sur le texte sélectionné grâce à une interface conviviale.
- **Éditeur de style d'éléments** : modifie les styles inline et certains attributs (liens, whiteSpace, etc.) via un modal dynamique.
- **Extraction du contenu HTML propre** pour récupérer le code sans les éléments de mise en forme additionnels.
- **Gestion des images** : upload (avec drag & drop et prévisualisation), insertion via URL et navigation dans une bibliothèque d’images.
- **Gestion des liens** : création et suppression de liens autour du texte sélectionné.

## Structure des fichiers

- **base.css**  
  Styles généraux du projet (mise en page, toolbar, éditeur WYSIWYG, modaux, etc.).

- **elementStyleEditor.css**  
  Styles du module d’édition de style inline d’éléments (modal, formulaire, boutons).

- **index.php**  
  Point d’entrée du projet, intègre les ressources et affiche l’éditeur via un serveur local.

- **codeManager.js**  
  Gère les blocs de code (insertion, coloration via highlight.js, indentation, mode source).

- **colorPalette.js**  
  Affiche une palette de couleurs et applique la couleur choisie au texte sélectionné.

- **editorUtils.js**  
  Fonctions utilitaires : debounce, formatage HTML, insertion HTML au caret, gestion de la sélection.

- **elementStyleEditor.js**  
  Module pour modifier les styles inline et certains attributs des éléments sélectionnés via un modal.

- **htmlContentExtractor.js**  
  Extrait le HTML “propre” de l’éditeur en supprimant les spans de coloration syntaxique.

- **imageHandler.js**  
  Gestion des images : upload (drag & drop), insertion par URL, bibliothèque d’images.

- **linkManager.js**  
  Création et suppression de liens autour du texte sélectionné.

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/VOTRE_COMPTE/division-editor.git
   cd division-editor
   ```
2. **Déployer sur un serveur local** (XAMPP, WAMP, MAMP…) et ouvrir `index.php`.
3. **Configurer** les modules (CodeManager, ColorPalette, etc.) selon vos besoins.

## Contribution

Ce projet est expérimental et en constante évolution.  
Vos contributions (issues, pull requests) sont les bienvenues !

## Licence

Distribué sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
