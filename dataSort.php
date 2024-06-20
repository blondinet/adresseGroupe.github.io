<?php


// Read the JSON file  
// $json = file_get_contents('get_rpls.json'); 

// // Decode the JSON file 
// $json_data = json_decode($json); 

// $json_data_final = json_encode(trieParCoord(getTabSorted($json_data)));

// // Retourner le JSON
// header('Content-Type: application/json');
// echo $json_data_final;
// die();

//toto

// $csv = ouvertureCsv('hlms_voix_estimées.csv');
// $csvSorted = triByVote($csv);

// // ecrireGroupCsv($csvSorted);
// $json_data_final = json_encode($csvSorted);

// header('Content-Type: application/json');
// echo $json_data_final;

// Créate clustered
$csvCluster = ouvertureCsv('hlms_clusters.csv');
$tabCluster = [];
foreach($csvCluster as $item) {
    if (!isset($tabCluster[$item['Cluster']])) {
        $tabCluster[$item['Cluster']-1] = [];
    }
    $tabCluster[$item['Cluster']-1][] = $item;
}

// var_dump($tabCluster);

$json_data_final = json_encode($tabCluster);

// Écrire le JSON dans un fichier
if (file_put_contents('data.json', $json_data_final)) {
    echo "Fichier JSON créé avec succès.";
} else {
    echo "Erreur lors de la création du fichier JSON.";
}


die();
function triByVote(array $csv) {
    $index = 0;
    $tabProcheAll = [];
    $tabBest = [];
    $fin = false;
    while (is_array($csv) && count($csv)>0 && $fin === false) {
        // Recherche de l'adresse avec le plus de vote lfi aux européenne
        $bestItem = getMaxVoteItem($csv);
        if ($bestItem === null) {
            $fin = true;
            break;
        }
        $tabBest[] = $bestItem;
        // Suppression de l'adresse qui a le plus de voix du csv
        $csv = searchAndDelete($csv, $bestItem);

        // Recherche des adresses les plus proches jusqu'a ce qu'on ai 50 portes (suppression dans le fichier pour pas de doublons)
        $tabMostProche = [];
        $tabMostProche[] = $bestItem;
        $compteur = 0;
        while ($compteur < 50 && count($csv) > 0 && $csv !== null) {
            $itemProche = rechercheItemPlusProche($csv, $bestItem);
            if ($itemProche !== null) {
                $lastCompteur = $compteur;
                $compteur += intval($itemProche['Nombre']);
                $tabMostProche[] = $itemProche;
                $csv = searchAndDelete($csv, $itemProche);
            }
        }
        $tabProcheAll[] = $tabMostProche;

        $index +=1;
        if ($index > 5000) {
            break;
        }
    }
    return $tabProcheAll;
}

function generateMapImageUrl($lat, $long) {
     // Définir l'URL de votre serveur PHP local avec la carte Leaflet
    $leafletUrl = 'http://localhost:8000';
    
}


function ecrireGroupCsv($tab) {

    // Chemin du fichier de sortie
    $outputFile = 'sorted_data.csv';

    // Ouvrir le fichier en mode écriture
    $fileHandle = fopen($outputFile, 'w');

    fputcsv($fileHandle, 
        [
            'Groupe', 
            'Adresse', 
            'Nombre de logements', 
            'Nombre de voix estimées', 
            'Distance vol d\'oiseau première adresse en m'
        ]
    );
    if ($fileHandle) {
        foreach ($tab as $groupIndex => $group) {
            $bestItem = null;
            foreach($group as $key=>$item) {
                if ($key === 0) {
                    $bestItem = $item;
                    fputcsv($fileHandle, [
                        "Groupe " . ($groupIndex + 1),
                        $item['Adresse'],
                        $item['Nombre'],
                        round($item['Voix estimées'], 2),
                        ''
                    ]);
                } else {
                    fputcsv($fileHandle, [
                        '',
                        $item['Adresse'],
                        $item['Nombre'],
                        round($item['Voix estimées'], 2),
                        round(getDistance($bestItem, $item), 0)
                    ]);
                }    
            }
            fputcsv($fileHandle, [
                '',
                '',
                '',
                '',
                ''
            ]);
        }
        
        // Fermer le fichier
        fclose($fileHandle);
        echo "Les données ont été écrites dans le fichier $outputFile\n";
    } else {
        echo "Impossible d'ouvrir le fichier $outputFile pour l'écriture.\n";
    }
}



function ecrireGroup($tab) {

    // Chemin du fichier de sortie
    $outputFile = 'groupes.txt';

    // Ouvrir le fichier en mode écriture
    $fileHandle = fopen($outputFile, 'w');

    fwrite($fileHandle, "--------------------------------------------------------------\n");
    if ($fileHandle) {
        foreach ($tab as $group) {
            $bestItem = null;
            foreach($group as $key=>$item) {
                if ($key === 0) {
                    $bestItem = $item;
                    // Le premier élément est le titre du groupe
                    // Écrire le titre dans le fichier
                    fwrite($fileHandle, "- Proche de celui-ci :\n");
                    writeInFile($fileHandle, $item);
                    fwrite($fileHandle, "\n");
                } else {
                    writeInFile($fileHandle, $item, $bestItem);
                }    
            }
            // Ajouter une ligne vide pour séparer les groupes
            fwrite($fileHandle, "--------------------------------------------------------------\n");
            fwrite($fileHandle, "\n");
        }
        
        // Fermer le fichier
        fclose($fileHandle);
        echo "Les données ont été écrites dans le fichier $outputFile\n";
    } else {
        echo "Impossible d'ouvrir le fichier $outputFile pour l'écriture.\n";
    }
}

function writeInFile($fileHandle, $item, $bestItem = null) {
    fwrite($fileHandle, "--------- Adresse : " . $item['Adresse'] . "\n");
    if ($bestItem !== null) {
        fwrite($fileHandle, "--------- Distance               : " . getDistance($bestItem, $item)) . "\n";
    }
    fwrite($fileHandle, "--------- Nombre de logement     : " . $item['Nombre'] . "\n");
    fwrite($fileHandle, "--------- Nombre de voix estimée : " . $item['Voix estimées'] . "\n");
    fwrite($fileHandle, "----------------------------------\n");
}

function searchAndDelete(array $csv, $itemProche) {
    for($i = 0; $i < count($csv); $i++) {        
        if ($csv[$i] === $itemProche) {
            array_splice($csv, $i, 1);
            return $csv;
        }
    }
    return $csv;
}
        
function rechercheItemPlusProche(array $csv, $bestItem) {
    $minDistance = 50000;
    $itemProche = null;
    foreach($csv as $c) {
        $distance = getDistance($bestItem, $c);
        if ($minDistance > $distance ) {
            $minDistance = $distance;
            $itemProche = $c;
        }
    }
    return $itemProche;
}

function getDistance($bestItem, $c, $earthRadius = 6371000) {
    $latitudeFrom = $bestItem['Lat'];
    $longitudeFrom = $bestItem['Long'];
    $latitudeTo = $c['Lat'];
    $longitudeTo = $c['Long'];

    // Convertir les degrés en radians
    $latFrom = deg2rad($latitudeFrom);
    $lonFrom = deg2rad($longitudeFrom);
    $latTo = deg2rad($latitudeTo);
    $lonTo = deg2rad($longitudeTo);

    // Calculer les différences des coordonnées
    $latDelta = $latTo - $latFrom;
    $lonDelta = $lonTo - $lonFrom;

    // Appliquer la formule de Haversine
    $a = sin($latDelta / 2) * sin($latDelta / 2) +
        cos($latFrom) * cos($latTo) *
        sin($lonDelta / 2) * sin($lonDelta / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    // Calculer la distance
    $distance = $earthRadius * $c;

    return $distance;
}

/**
 * Retourne l'adresse qui a le plus voté lfi
 */
function getMaxVoteItem($csv) {
    $maxVote = -1; 
    $bestItem = null;
    foreach($csv as $c) {
        if ($c['Voix estimées'] > $maxVote) {
            $maxVote = $c['Voix estimées'];
            $bestItem = $c;
        }
    }
    return $bestItem;
}

// Trier par nombre de voix
// Pour chaque sauf ceux déja trié, prendre le plus elever
// rechercher 50 fois le point le plus proche non trié
// Variante, rechercher avec la rue

function ouvertureCsv($csvFile) {
    // Ouvrir le fichier en mode lecture
    if (($handle = fopen($csvFile, 'r')) !== FALSE) {
        $data = [];
        
        // Lire la première ligne pour obtenir les en-têtes
        $headers = fgetcsv($handle, 1000, ',');

        // Lire les lignes restantes et les ajouter au tableau
        while (($row = fgetcsv($handle, 1000, ',')) !== FALSE) {
            $data[] = array_combine($headers, $row);
        }

        // Fermer le fichier
        fclose($handle);

        // Afficher le tableau pour vérifier le résultat
        return $data;
    } else {
        echo "Erreur lors de l'ouverture du fichier.";
    }
}


function mainCsvJson() {
    $tabFinal = trieParCoord();
    
    // createCSV('dataSortNearCoord.csv', $tabFinal);
    // createCSV('dataSortRue.csv', $tabFinal);
    
    $json_data_final = json_encode($tabFinal);
    
    // Retourner le JSON
    header('Content-Type: application/json');
    echo $json_data_final;
}
  


function getTabSorted($json_data) {

    $tabFinal = [];
    
    // for($i=0; $i<50; $i++) {
    //     $data = $json_data->features[$i];
    foreach($json_data->features as $data) {
        foreach($data->properties->cara as $cara) {
            foreach($cara->ITEM as $item) {
    
                $separed = explode("</br>", $item->NOM_);
                $tabAdresse = explode(' ', trim($separed[1]));
                
                $nombre = explode(' ', trim($separed[12]));
    
                $tabRue = array_slice($tabAdresse, 1, count($tabAdresse)-1);                
                $rue = trim(implode(' ', $tabRue));        
    
                // Nbr logements totaux : 4
    
                if (!isset($tabFinal[$rue])) {
                    $tabFinal[$rue] = array();
                    array_push($tabFinal[$rue], array(
                            "adresse"=> $separed[1],
                            "nombre"=> $nombre[count($nombre)-1],
                            "coordinate" => $data->geometry->coordinates
                        )
                    );
                    // $tabFinal[$rue][] = $separed[1];  
                } else {
                    array_push($tabFinal[$rue], array(
                            "adresse"=> $separed[1],
                            "nombre"=> $nombre[count($nombre)-1],
                            "coordinate" => $data->geometry->coordinates
                        )
                    );
                }
            }
        }
    }
    return $tabFinal;
}


function getRawData(): object {

    // Read the JSON file  
    $json = file_get_contents('get_rpls.json'); 
    
    // Decode the JSON file 
    $json_data = json_decode($json); 

    return $json_data;
}
  

function createCSV($nom, array $tabFinal) {

    // Création d'un fichier CSV
    $filename = $nom;
    $file = fopen($filename, 'w');

    // Ajout des en-têtes de colonne
    fputcsv($file, ['Rue', 'Adresse', 'Nombre', 'Lat', 'Long']);

    // Remplissage du fichier CSV avec les adresses triées
    foreach ($tabFinal as $rue => $informations) {
        foreach ($informations as $information) {
            fputcsv($file, [$rue, $information["adresse"], $information["nombre"], $information["coordinate"][1], $information["coordinate"][0]]);
        }
    }

    // print_r($tabFinal);
    fclose($file);

    echo "Fichier CSV créé avec succès.";



    // Convertir le tableau en format JSON
    $json_data = json_encode($tabFinal);
}


function trieParCoord(array $tabFinal) {
    $coordsWithAdresse = array();
    foreach($tabFinal as $key_row => $row) {
        foreach($row as $val) {
            $coordsWithAdresse[] = array(
                0 => $val['coordinate'][0],
                1 => $val['coordinate'][1],
                2 => $val['adresse']
            );
        }
    }
    
    $sorted_coords = nearest_neighbor_sort($coordsWithAdresse);

    $tabFinalSorted = array();

    foreach($sorted_coords as $coords) {
        foreach($tabFinal as $key => $final) {
            foreach($final as $item) {
                if ($item['adresse'] === $coords[2]) {
                    $tabFinalSorted[$key] = $final;
                    break;
                }
            }
        }
    }

    return $tabFinalSorted;
}


function distance($p1, $p2) {
    return sqrt(pow($p1[0] - $p2[0], 2) + pow($p1[1] - $p2[1], 2));
    // $lat1 = $p1[1];
    // $lon1 = $p1[0];
    // $lat2 = $p2[1];
    // $lon2 = $p2[0];

    // // Calcul de la distance (exemple avec la formule Haversine)
    // $earth_radius = 6371; // Rayon moyen de la Terre en km

    // $dlat = deg2rad($lat2 - $lat1);
    // $dlon = deg2rad($lon2 - $lon1);

    // $a = sin($dlat/2) * sin($dlat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dlon/2) * sin($dlon/2);
    // $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    // $distance = $earth_radius * $c;

    // return $distance;
}

function nearest_neighbor_sort($coords) {
    if (empty($coords)) {
        return [];
    }

    $sorted_coords = [$coords[0]];
    array_splice($coords, 0, 1);

    while (!empty($coords)) {
        $last = end($sorted_coords);
        $nearest_index = 0;
        $nearest_distance = distance($last, $coords[0]);

        foreach ($coords as $index => $point) {
            $current_distance = distance($last, $point);
            if ($current_distance < $nearest_distance) {
                $nearest_index = $index;
                $nearest_distance = $current_distance;
            }
        }

        $sorted_coords[] = $coords[$nearest_index];
        array_splice($coords, $nearest_index, 1);
    }

    return $sorted_coords;
}
?>