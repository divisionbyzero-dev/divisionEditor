<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Éditeur Avancé - Images & Liens</title>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<!-- Vos liens CSS et le chargement de Highlight.js, par exemple : -->
	  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">
	  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
	  <!-- Si besoin, configurez hljs pour ne pas ignorer le HTML non échappé (optionnel) -->
	  <script>
		hljs.configure({ ignoreUnescapedHTML: true });
		hljs.highlightAll();
	  </script>	
	  <link rel="stylesheet" href="css/base.css">
	  <link rel="stylesheet" href="css/elementStyleEditor.css">
			
</head>
<body>

	<div class="editor-container">
		<div class="toolbar">
			<button type="button" data-command="bold" title="Gras"><i class="material-icons">format_bold</i></button>
			<button type="button" data-command="italic" title="Italique"><i class="material-icons">format_italic</i></button>
			<button type="button" data-command="underline" title="Souligné"><i class="material-icons">format_underlined</i></button>
			 <button type="button" id="createLinkButton" title="Créer/Modifier Lien"><i class="material-icons">link</i></button>
			<button type="button" data-command="unlink" title="Supprimer Lien"><i class="material-icons">link_off</i></button>

			<button type="button" data-command="formatBlock" data-value="p" title="Paragraphe">P</button>
			<button type="button" data-command="formatBlock" data-value="h2" title="Titre H2">H2</button>
			<button type="button" data-command="formatBlock" data-value="h3" title="Titre H3">H3</button>
			<button type="button" data-command="formatBlock" data-value="h4" title="Titre H4">H4</button>
			<button type="button" data-command="insertUnorderedList" title="Liste à puces"><i class="material-icons">format_list_bulleted</i></button>
			<button type="button" id="colorPaletteButton" title="Colorer le texte"><i class="material-icons">format_color_text</i></button>
			<select id="languageSelector" title="Langage du code">
				<option value="plaintext">Plain Text</option>
				<option value="javascript">JavaScript</option>
				<option value="html">HTML</option>
				<option value="xml">XML</option>
				<option value="css">CSS</option>
				<option value="python">Python</option>
				<option value="php">PHP</option>
				<option value="sql">SQL</option>
				<option value="bash">Bash/Shell</option>
				</select>
			<button type="button" id="addCodeBlock" title="Insérer Bloc Code"><i class="material-icons">code</i></button>
			<button type="button" id="editElementStyleButton" title="Modifier les propriétés de l'élément"><i class="material-icons">edit</i></button>
			<button type="button" id="insertImageUrlButton" title="Insérer Image depuis URL"><i class="material-icons">insert_photo</i></button>
			<button type="button" id="uploadImageButton" title="Téléverser Image"><i class="material-icons">upload_file</i></button>
			<button type="button" id="browseImageLibraryButton" title="Bibliothèque d'images"><i class="material-icons">photo_library</i></button>
			 <input type="file" id="imageUploadInput" multiple accept="image/*" style="display: none;">

			<button type="button" id="toggleSource" title="Voir Source HTML"><i class="material-icons">html</i></button>
			<button type="button" id="printButton" title="Imprimer"><i class="material-icons">print</i></button>
		</div>

		<div id="uploadProgressContainer" class="upload-progress-container"></div>

		<div id="editor" class="editor-area" contenteditable="true" spellcheck="false">
			<h2>Éditeur avec Images et Liens</h2>
			<p>Essayez d'ajouter une image par URL, upload (glisser-déposer ou bouton), ou de coller une image.</p>
			<p>Sélectionnez du texte et <a href="https://www.google.com" target="_blank">créez un lien</a>.</p>
			<p><pre class="language-php"><code class="language-php hjs">function custom_word_count($string){
					preg_match_all('/\b\w{4,}\b/', $string, $matches);
					return count($matches[0]);
				}
				
				function maxLengthWord($string) {
					$words = explode(" ", $string);  // Split the string into an array of words.
					$maxLen = 0;  // Initialize the maximum length to 0.
				
					foreach($words as $word) {
						if(strlen($word) > $maxLen) {
							$maxLen = strlen($word);
						}
					}
				
					return $maxLen;
				}
</code></pre><p><br></p><br></p>
			
			<p><img src="https://programmeur.ch/medias/images/358902.webp" alt="Placeholder Image"></p>
		</div>

		<div id="sourceEditorContainer" class="source-editor-area-container" style="display: none;">
			 <pre><code id="sourceEditor" class="language-html source-editor-code" contenteditable="true" spellcheck="false"></code></pre>
		</div>

		<div id="imageLibraryModal" class="modal" style="display: none;">
			<div class="modal-content">
				<span class="close-button" id="closeImageLibraryModal">&times;</span>
				<h2>Bibliothèque d'Images</h2>
				<div id="imageLibraryContent" class="image-library-grid">
					<p>Chargement...</p>
				</div>
			</div>
		</div>
	</div>
	<script type="module" src="js/main.js"></script>

	<!-- Bouton placé en dehors de l'éditeur -->
	  <button id="extractContentBtn">Extraire le contenu HTML</button>
	  <script> 
	  document.addEventListener('DOMContentLoaded', () => {
	  // Exemple : bouton extérieur pour extraire le contenu HTML de l'éditeur via l'instance
		const extractBtn = document.getElementById('extractContentBtn');
		if (extractBtn) {
		  extractBtn.addEventListener('click', () => {
			// Appel de la méthode getContent sur l'éditeur
			const contenuHtml = editor.getContent();
			console.log("Contenu HTML extrait :", contenuHtml);
		  });
		} else {
		  console.warn("Bouton 'btnExtraire' non trouvé sur la page.");
		}
	});
	</script>
</body>
</html>