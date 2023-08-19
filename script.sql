`cartes`SELECT `cartes`.`num`,
    `cartes`.`dateExperation`,
    `cartes`.`codeCarte`,
    `cartes`.`credit`
FROM `projet1cs`.`cartes`;

SELECT `commande`.`id`,
    `commande`.`id_user`,
    `commande`.`date_achat`,
    `commande`.`paymentOnline`,
    `commande`.`numCarte`,
    `commande`.`fullname`,
    `commande`.`fullAddress`,
    `commande`.`numTel`,
    `commande`.`total`,
    `commande`.`état`
FROM `projet1cs`.`commande`;

SELECT `panier`.`id`,
    `panier`.`id_user`,
    `panier`.`id_produit`,
    `panier`.`nom_produit`,
    `panier`.`date_ajout`,
    `panier`.`quantite`,
    `panier`.`prix`
FROM `projet1cs`.`panier`;

SELECT `products`.`id`,
    `products`.`photo`,
    `products`.`matricule`,
    `products`.`nom`,
    `products`.`prix`,
    `products`.`marque`,
    `products`.`categorie`,
    `products`.`quantite`,
    `products`.`taille`,
    `products`.`couleur`
FROM `projet1cs`.`products`;

SELECT `produit_commande`.`id_commande`,
    `produit_commande`.`id_produit`,
    `produit_commande`.`quantite`
FROM `projet1cs`.`produit_commande`;

SELECT `user`.`id`,
    `user`.`username`,
    `user`.`address`,
    `user`.`email`,
    `user`.`password`,
    `user`.`role`,
    `user`.`activeAccount`
FROM `projet1cs`.`user`;

SELECT `wishlist`.`id`,
    `wishlist`.`id_produit`,
    `wishlist`.`id_user`
FROM `projet1cs`.`wishlist`;

