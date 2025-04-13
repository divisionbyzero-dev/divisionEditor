<?php

// error_reporting(0); // Décommenter en production
// ini_set('display_errors', 0); // Décommenter en production

// --- Configuration (ADAPTEZ À VOTRE STRUCTURE SERVEUR) ---

// Chemin ABSOLU sur le serveur où sont stockées les images originales
// Exemple: '/var/www/html/mon_site/uploads/images/' ou __DIR__ si dans un sous-dossier
$uploadDir = __DIR__ . '/files_storage/images/'; // Assurez-vous que ça correspond à upload_handler.php

// Chemin ABSOLU sur le serveur où sont stockées les miniatures
$thumbnailDir = $uploadDir . 'thumbs/'; // Assurez-vous que ça correspond à upload_handler.php

// --- CORRECTION IMPORTANTE : URLs Publiques ---
// URL publique de base CORRESPONDANT à $uploadDir.
// DOIT être accessible depuis le navigateur.
// Commencez par '/' pour relatif à la racine du site OU URL complète 'http(s)://...'
$baseURL = '/text-editor/files_storage/images/'; // EXEMPLE RELATIF À LA RACINE DU SITE WEB
// OU $baseURL = 'https://votredomaine.com/files_storage/images/'; // EXEMPLE URL COMPLÈTE

// URL publique de base CORRESPONDANT à $thumbnailDir
$thumbBaseURL = $baseURL . 'thumbs/';

// Extensions de fichiers image à rechercher (en minuscules)
$allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
// --- Fin Configuration ---


// --- Définir l'en-tête de réponse comme JSON ---
header('Content-Type: application/json');

// --- CORS (Si nécessaire, à adapter pour la production) ---
// header('Access-Control-Allow-Origin: *');

// --- Initialiser le tableau de résultats ---
$imageList = [];

// --- Vérifier si le dossier d'upload existe et est lisible ---
if (!is_dir($uploadDir) || !is_readable($uploadDir)) {
	error_log("Le dossier d'upload '" . $uploadDir . "' n'existe pas ou n'est pas lisible pour list_images.php.");
	echo json_encode($imageList); // Renvoie []
	exit;
}

// --- Scanner le répertoire des images originales ---
// Utilisation de glob pour plus de simplicité et filtrage direct
$files = glob($uploadDir . '*.{'.implode(',', $allowedImageExtensions).'}', GLOB_BRACE | GLOB_NOSORT);

if ($files === false) {
	 error_log("Erreur lors de l'utilisation de glob() dans list_images.php pour le dossier : " . $uploadDir);
	 $files = []; // Assurer un tableau vide en cas d'erreur glob
}

// --- Traiter chaque fichier trouvé ---
foreach ($files as $filePath) {
	$fileName = basename($filePath);
	$thumbnailPath = $thumbnailDir . $fileName;

	// Vérifier si la miniature correspondante existe
	$thumbnailExists = file_exists($thumbnailPath);

	// Construire les URLs publiques (avec rtrim pour éviter double //)
	$fullUrl = rtrim($baseURL, '/') . '/' . $fileName;
	$thumbnailUrl = $thumbnailExists ? (rtrim($thumbBaseURL, '/') . '/' . $fileName) : $fullUrl; // Fallback sur l'original si pas de thumb

	// Générer un texte alt simple
	$altText = ucfirst(str_replace(['_', '-'], ' ', pathinfo($fileName, PATHINFO_FILENAME)));

	// Ajouter les informations de l'image au tableau
	$imageList[] = [
		'fullUrl'      => $fullUrl,
		'thumbnailUrl' => $thumbnailUrl,
		'alt'          => $altText,
	];
}

// Optionnel: Trier le tableau $imageList si nécessaire

// --- Renvoyer la liste encodée en JSON ---
echo json_encode($imageList);
exit;

?>