<?php

// Désactiver l'affichage des erreurs PHP côté client en production
// error_reporting(0);
// ini_set('display_errors', 0);
// Loggez les erreurs dans un fichier à la place

// --- Configuration ---
// Chemin ABSOLU sur le serveur où stocker les images originales
// Assurez-vous que ce dossier existe et est accessible en écriture par le serveur web (ex: www-data, apache)
$uploadDir = __DIR__ . '/files_storage/images/'; // Exemple: dossier 'uploads/images' au même niveau que ce script

// Chemin ABSOLU sur le serveur où stocker les miniatures
$thumbnailDir = $uploadDir . 'thumbs/'; // Exemple: sous-dossier 'thumbs'

// URL publique de base correspondant à $uploadDir
// C'est cette URL qui sera utilisée dans l'attribut src des images insérées
$baseURL = 'files_storage/images/'; // Exemple: si accessible via https://votredomaine.com/uploads/images/

// Dimensions maximales pour les miniatures
$thumbWidth = 150;
$thumbHeight = 150;

// Types MIME autorisés pour les images
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Taille maximale autorisée par fichier (en octets) - Exemple: 5 Mo
$maxFileSize = 5 * 1024 * 1024;
// --- Fin Configuration ---


// --- Définir l'en-tête de réponse comme JSON ---
header('Content-Type: application/json');

// --- CORS (Cross-Origin Resource Sharing) ---
// Permettre les requêtes depuis votre éditeur (si sur un domaine/port différent)
// ATTENTION: '*' est trop permissif pour la production. Remplacez par votre domaine spécifique.
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS pré-vol (pour CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	exit(0);
}

// --- Gestion de la requête POST ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405); // Method Not Allowed
	echo json_encode(['success' => false, 'message' => 'Méthode non autorisée. Utilisez POST.']);
	exit;
}

// Vérifier si le fichier a été envoyé et s'il n'y a pas d'erreur majeure
if (!isset($_FILES['imageFile']) || !is_uploaded_file($_FILES['imageFile']['tmp_name'])) {
	http_response_code(400); // Bad Request
	echo json_encode(['success' => false, 'message' => 'Aucun fichier image reçu ou erreur lors de l\'upload initial.']);
	exit;
}

$file = $_FILES['imageFile'];

// --- Validation du Fichier ---

// 1. Vérifier les erreurs d'upload PHP
if ($file['error'] !== UPLOAD_ERR_OK) {
	$phpUploadErrors = [
		UPLOAD_ERR_INI_SIZE   => 'Le fichier dépasse la taille maximale autorisée par le serveur (php.ini: upload_max_filesize).',
		UPLOAD_ERR_FORM_SIZE  => 'Le fichier dépasse la taille maximale spécifiée dans le formulaire HTML.',
		UPLOAD_ERR_PARTIAL    => 'Le fichier n\'a été que partiellement uploadé.',
		UPLOAD_ERR_NO_FILE    => 'Aucun fichier n\'a été uploadé.',
		UPLOAD_ERR_NO_TMP_DIR => 'Erreur serveur : Dossier temporaire manquant.',
		UPLOAD_ERR_CANT_WRITE => 'Erreur serveur : Écriture du fichier sur le disque impossible.',
		UPLOAD_ERR_EXTENSION  => 'Une extension PHP a arrêté l\'upload du fichier.',
	];
	$errorMessage = $phpUploadErrors[$file['error']] ?? 'Erreur inconnue lors de l\'upload.';
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => $errorMessage]);
	exit;
}

// 2. Vérifier la taille du fichier
if ($file['size'] > $maxFileSize) {
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => 'Le fichier est trop volumineux (Max: ' . ($maxFileSize / 1024 / 1024) . ' Mo).']);
	exit;
}

// 3. Vérifier le type MIME et si c'est une vraie image avec GD
if (!function_exists('gd_info')) {
	 http_response_code(500);
	 echo json_encode(['success' => false, 'message' => 'Erreur serveur: La librairie GD n\'est pas activée.']);
	 exit;
}

$imageInfo = getimagesize($file['tmp_name']);
$fileType = $imageInfo['mime'] ?? mime_content_type($file['tmp_name']); // Utiliser getimagesize ou fallback

if ($imageInfo === false || !in_array($fileType, $allowedTypes)) {
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => 'Type de fichier invalide ou non autorisé. Uniquement JPEG, PNG, GIF, WEBP.']);
	exit;
}


// --- Traitement et Stockage ---

// 1. Créer les dossiers de destination s'ils n'existent pas
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Erreur serveur: Impossible de créer le dossier d\'upload.']);
	exit;
}
if (!is_dir($thumbnailDir) && !mkdir($thumbnailDir, 0755, true)) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Erreur serveur: Impossible de créer le dossier des miniatures.']);
	exit;
}

// 2. Vérifier les permissions d'écriture
if (!is_writable($uploadDir) || !is_writable($thumbnailDir)) {
	 http_response_code(500);
	 echo json_encode(['success' => false, 'message' => 'Erreur serveur: Permissions d\'écriture manquantes pour les dossiers de destination.']);
	 exit;
}

// 3. Générer un nom de fichier unique
$originalFileName = basename($file['name']);
$fileExtension = strtolower(pathinfo($originalFileName, PATHINFO_EXTENSION));
// Créer un nom plus robuste contre les collisions
$safeFilename = bin2hex(random_bytes(8)) . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '', pathinfo($originalFileName, PATHINFO_FILENAME));
$uniqueFilename = $safeFilename . '.' . $fileExtension;

$destinationPath = $uploadDir . $uniqueFilename;
$thumbnailPath = $thumbnailDir . $uniqueFilename; // Miniature avec le même nom

// 4. Déplacer le fichier uploadé vers sa destination finale
if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Erreur serveur: Impossible de déplacer le fichier uploadé.']);
	exit;
}

// --- Création de la Miniature avec GD ---
$successThumbnail = false;
list($origWidth, $origHeight) = $imageInfo;
$ratio = $origWidth / $origHeight;

// Calculer les nouvelles dimensions en gardant le ratio
if ($thumbWidth / $thumbHeight > $ratio) {
	$newWidth = $thumbHeight * $ratio;
	$newHeight = $thumbHeight;
} else {
	$newHeight = $thumbWidth / $ratio;
	$newWidth = $thumbWidth;
}

// Charger l'image originale
$sourceImage = null;
switch ($fileType) {
	case 'image/jpeg':
		$sourceImage = imagecreatefromjpeg($destinationPath);
		break;
	case 'image/png':
		$sourceImage = imagecreatefrompng($destinationPath);
		break;
	case 'image/gif':
		$sourceImage = imagecreatefromgif($destinationPath);
		break;
	case 'image/webp':
		$sourceImage = imagecreatefromwebp($destinationPath);
		break;
}

if ($sourceImage) {
	// Créer la toile pour la miniature
	$thumbImage = imagecreatetruecolor($newWidth, $newHeight);

	// Gérer la transparence pour PNG/GIF/WEBP
	if (in_array($fileType, ['image/png', 'image/gif', 'image/webp'])) {
		imagealphablending($thumbImage, false); // Désactiver le blending pour garder la transparence
		imagesavealpha($thumbImage, true);      // Activer la sauvegarde du canal alpha
		$transparentColor = imagecolorallocatealpha($thumbImage, 0, 0, 0, 127); // Couleur transparente
		imagefill($thumbImage, 0, 0, $transparentColor); // Remplir avec la transparence
		 // Si GIF, récupérer la couleur transparente de l'original si elle existe
		 if($fileType == 'image/gif'){
			  $transparentIndex = imagecolortransparent($sourceImage);
			  if($transparentIndex >= 0){
				   $transparentColorGif = imagecolorsforindex($sourceImage, $transparentIndex);
				   $transparentColorAlloc = imagecolorallocatealpha($thumbImage, $transparentColorGif['red'], $transparentColorGif['green'], $transparentColorGif['blue'], 127);
				   imagefill($thumbImage, 0, 0, $transparentColorAlloc);
				   imagecolortransparent($thumbImage, $transparentColorAlloc); // Définir la couleur transparente pour la miniature
			  }
		 }
	}


	// Redimensionner l'image
	imagecopyresampled(
		$thumbImage,          // Destination image resource
		$sourceImage,         // Source image resource
		0, 0,                 // Destination x, y
		0, 0,                 // Source x, y
		$newWidth, $newHeight, // Destination width, height
		$origWidth, $origHeight // Source width, height
	);

	// Sauvegarder la miniature
	switch ($fileType) {
		case 'image/jpeg':
			$successThumbnail = imagejpeg($thumbImage, $thumbnailPath, 85); // Qualité 85%
			break;
		case 'image/png':
			 // Compression: 0 (pas de comp) à 9 (max comp)
			$successThumbnail = imagepng($thumbImage, $thumbnailPath, 7);
			break;
		case 'image/gif':
			$successThumbnail = imagegif($thumbImage, $thumbnailPath);
			break;
		case 'image/webp':
			$successThumbnail = imagewebp($thumbImage, $thumbnailPath, 85); // Qualité 85%
			break;
	}

	// Libérer la mémoire
	imagedestroy($sourceImage);
	imagedestroy($thumbImage);

	if (!$successThumbnail) {
		// Optionnel: logguer l'erreur mais ne pas bloquer la réponse principale
		error_log("Erreur lors de la création de la miniature pour: " . $uniqueFilename);
		// On pourrait quand même renvoyer success=true car l'original est sauvegardé
	}

} else {
	 error_log("Erreur lors du chargement de l'image source pour miniature: " . $destinationPath);
}


// --- Réponse JSON ---
$publicURL = rtrim($baseURL, '/') . '/' . $uniqueFilename; // Construire l'URL publique

http_response_code(200); // OK
echo json_encode([
	'success' => true,
	'url' => $publicURL,
	// Optionnel: renvoyer aussi l'URL de la miniature si besoin côté client
	// 'thumbnailUrl' => rtrim($baseURL, '/') . '/thumbs/' . $uniqueFilename
]);
exit;

?>