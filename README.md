# Readme plus a jour !!!!!

Le fichier php dataSort.php est le fichier principale

Il s'execute avec php ./dataSort.php

Il contient une partie d'extraction de donnée, une partie de trie (qui peut-etre mis en commentaire), 
une partie de sauvegarde en csv (actuellement les deux sont mis en commentaire), ainsi qu'une 
partie d'ecriture en json pour un affichage bricolé.

Il y a deux exports en CSV :
- dataSortNearCoord.csv qui est trié de manière a rassembler les points de coordonnée proches entre execute
 (au mieux ce n'est pas parfait) afin de rapprocher les addresses.
- dataSortRue.csv qui est trié de manière a ranger les adresse en fonction de leur rue. 

Les export sont de forme :
[{
    Rue, 
    Adresse, 
    Nombre, // Le nombre de logement dans le batiment a l'adresse
    Lat, 
    Long, 
}]

Dans les exports, toutes les données n'ont pas été conservé, a voir dans le fichier initial, get_rpls.json, 
si d'autre données sont interessante.

J'ai ajouté un index.html avec leaflet pour de la visualisation rapide.
Selon la methode de trie (trie par coordonnée proche ou pas de tri) les points sont rangé différement,
afin de rendre ca plus visible, un dégradé de couleurs s'accentue a mesure qu'un point est éloigné dans le tableau

Afin de lancer la visualisation rapide, il faut lancer php -S localhost:8000

Enfin, désolé pour le php, j'ai commencé a faire un script puis j'ai enchainé sans trop réflechir, en tout cas, les csv sont utilisable
