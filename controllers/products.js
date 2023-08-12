const express = require('express');
const jwt = require('jsonwebtoken');

require('dotenv').config();
var mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 100,
  port: process.env.DB_port,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});


db.getConnection((err, connection) => {
  if (err) throw err; //not connected
  console.log('Connected as ID ' + connection.threadId);
})


//AFFICHER LES PRODUITS
exports.getAllProduct = (req, res) => {
  db.query(
    `SELECT matricule,photo,nom,prix,marque,categorie
    FROM products
    WHERE id IN (
      SELECT MIN(id)
      FROM products
      GROUP BY matricule
    );
    `,
    (err, result) => {
      if (err) {
        throw err;
      }
      const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
      return res.status(201).json({
        products: result,
        token:decodedToken
      });
    });};

    //get all products to user
    exports.getAllProductUser = (req, res) => {
      const category = req.query.category; // Assuming the category is passed as a query parameter
    
      let query = "SELECT * FROM products WHERE quantite != 0";
      if (category) {
        query += ` AND categorie = '${category}'`;
      }
    
      db.query(query, (err, result) => {
        if (err) {
          throw err;
        }
        const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
        return res.status(201).json({
          products: result,
          token: decodedToken
        });
      });
    };
    

//CREATION DU PRODUIT
exports.createProduct = (req, res) => {
    db.query(
      `INSERT INTO products (photo,matricule,nom,prix,marque,quantite,categorie,taille,couleur ) VALUES (  
        ${db.escape(req.file.filename)},${db.escape(req.body.matricule)},${db.escape(req.body.productname)},${db.escape(req.body.prix)}, 
            ${db.escape(req.body.marque)}, ${db.escape(req.body.quantite)},${db.escape(req.body.categorie)},
            ${db.escape(req.body.taille)},${db.escape(req.body.couleur)}
        )`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        return res.status(201).send({
          message: 'reussite',
        });
      }
    );
  }

  exports.Commandeuser = (req, res) => {
    let user;
    const id=req.params.id;
    db.query(
      `select * from user where id=${id}`,
      (err, result1) => {
        if (err) {
          console.log(err);
        }
        user=result1;
        db.query("select * from command where id_user=?",[id],(error,result)=>{
          if (error) {
            console.log(error);
          }
          return res.status(201).send({
            user:user,
            commandes:result
          });
        })
      }
    );
  }

//MODIFIER PRODUIT
exports.getUpdateProduct = (req, res) => {
  const q = "SELECT * FROM products WHERE id=?";
  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
    res.json({product:result, token:decodedToken});
    });
  };

  exports.postUpdateProduct = (req, res) => {
    const { id } = req.params;
    const { quantite,taille, couleur } = req.body;
  
    const q = "UPDATE products SET quantite=?, taille=?, couleur=? WHERE id=?;";
    db.query(q, [quantite, taille, couleur, id], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if(result.affectedRows==0) return res.status(404).json("not found")
      const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
       return res.json({ token: decodedToken });
    });
  };

  exports.getUpdateGProduct = (req, res) => {
    const q = "SELECT * FROM products WHERE matricule=?";
    db.query(q, [req.params.matricule], (err, result) => {
      if (err) return res.status(500).json(err);
      const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
      res.json({product:result, token:decodedToken});
      });
    };
  
    exports.postUpdateGProduct = (req, res) => {
      const { mat } = req.params;
      const { nom,matricule, prix,marque,categorie } = req.body;
    
      const q = "UPDATE products SET nom=?, matricule=?, prix=?, marque=?, categorie=? WHERE matricule=?;";
      db.query(q, [nom, matricule, prix, marque, categorie,mat], (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }
        if(result.affectedRows==0) return res.status(404).json("not found ")
        const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
         return res.json({ token: decodedToken });
      });
    };
  

//delete product
exports.deleteOneproduct = (req, res) => {
  console.log('productId')
 const productId = req.params.id;
 console.log(productId)
 console.log('productId')

 const q = "DELETE FROM products WHERE id = ?";
 db.query(q, [productId], (err, result) => {
   console.log(result)
   if (err) {
     // Handle the error
     console.error(err);
     return res.status(500).json({ error: "An error occurred while deleting the product." });
   }

   // Check if the product was deleted successfully
   if (result.affectedRows === 0) {
     return res.status(404).json({ error: "Product not found." });
   } 

   // Product was deleted successfully
   return res.status(200).send({productId : productId});
   

 });
};

exports.ShowMore=(req,res)=>{
  const q ="SELECT * FROM products WHERE matricule=? ";
    db.query(q, [req.params.matricule],
      (err, result) => {
        if (err) res.status(500).json(err);
        if (result) {
        const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
        return res.json({products:result,token:decodedToken});
        }
      });
}  

exports.getOneProduct=(req, res) => {
  matricule=req.params.matricule;
  console.log(matricule)
  db.query(
    'SELECT * FROM products WHERE matricule = ?', [matricule],
    (err, result) => {
      if (err) {
        throw err;

      }
      const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
      return res.status(201).json({
      products: result,
      token:decodedToken
      });
    });
};

exports.getProductUser=(req, res) => {
  id=req.params.id;
  console.log(id)
  db.query(
    'SELECT * FROM products WHERE id = ? and quantite!=0', [id],
    (err, result) => {
      if (err) {
        throw err;

      }
      const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
      return res.status(201).json({
      product: result,
      token:decodedToken
      });
    });
};

exports.addToWishlist = (req, res) => {
  const productId = req.params.id;
  const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
  const checkIfExistsQuery = 'SELECT * FROM wishlist WHERE id_produit = ? and id_user=?';
  db.query(checkIfExistsQuery, [productId,decodedToken.userId], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      const insertQuery = 'INSERT INTO wishlist (id_produit,id_user) VALUES (?,?)';
      db.query(insertQuery, [productId,decodedToken.userId], (err, result) => {
        if (err) {
          throw err;
        }

        return res.status(200).json({ token: decodedToken ,msg:"added successfully"});
      });
    } else {
      return res.status(201).json({ token: decodedToken });
    }
  });
};


exports.deleteFromWishlist=(req,res)=>{
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const q='delete from wishlist where id_produit=? and id_user=?'
  db.query(q, [req.params.id,decodedToken.userId],(err, result) => {
      if (err) {
        throw err;
      }
  return res.status(201).json({token:decodedToken ,msg:"deleted!"});
    });
}

exports.AfficherWishlist=(req,res)=>{
  const q='SELECT * FROM products WHERE id IN (SELECT id_produit FROM wishlist where id_user=?) '
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  db.query(q,[decodedToken.userId],(err, result) => {
      if (err) {
        throw err;
      }
      return res.status(201).json({products:result,token:decodedToken});
    });
}

exports.addToCart = (req, res) => {
  const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
  const userId = decodedToken.userId;
  const productId = req.params.id;
  const quantity = req.body.quantity;

  const checkProductQuery = `SELECT * FROM panier WHERE id_user = ${userId} AND id_produit = ${productId}`;
  db.query(checkProductQuery, (error, results) => {
    if (error) {
      return res.status(500).send('Erreur lors de la vérification de la disponibilité du produit');
    }

    if (results.length > 0) {
      // Product already exists in the panier, update the quantity
      const existingQuantity = parseInt(results[0].quantite);
      const updatedQuantity = existingQuantity + parseInt(quantity);
      const updateQuery = `UPDATE panier SET quantite = ${updatedQuantity} WHERE id_user = ${userId} AND id_produit = ${productId}`;
      db.query(updateQuery, (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).send('Erreur lors de la mise à jour de la quantité du produit dans le panier');
        }
        return res.send(`La quantité du produit ${productId} a été mise à jour dans le panier`);
      });
    } else {
      // Product does not exist in the panier, insert a new row
      const getProductQuery = `SELECT * FROM products WHERE id = ${productId}`;
      db.query(getProductQuery, (error, results) => {
        if (error) {
          return res.status(500).send('Erreur lors de la récupération des informations sur le produit');
        }

        const product = results[0];
        const insertQuery = `INSERT INTO panier (id_user, id_produit, nom_produit, date_ajout, quantite, prix)
                             VALUES (${userId}, ${productId}, "${product.nom}", CURDATE(), ${quantity}, ${product.prix})`;
        db.query(insertQuery, (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).send('Erreur lors de l\'ajout ou de la mise à jour du produit dans le panier');
          }
          return res.send(`Le produit ${productId} a été ajouté ${quantity} fois au panier`);
        });
      });
    }
  });
};



exports.modifyCart=(req,res)=>{
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const q = `UPDATE panier SET quantite=? WHERE (id_produit = ?) and (id_user=?);`;
      db.query(q,[req.body.newQuantity,req.params.id,decodedToken.userId],(error, result) => {
          if (error) {
            console.log(error) 
              return res.status(500).send('Erreur lors de la modification du produit au panier');
          }
          console.log(result)
          return res.send(`Le produit a été modifié dans le panier`);
      });
}

exports.getCart=(req,res)=>{
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const q='Select * from panier where id_user=?'
  db.query(q,[decodedToken.userId],(err, result) => {
      if (err) {
        throw err;
      }
      const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
      return res.status(201).json({products:result,token:decodedToken});
    });
}

exports.deleteFromCart=(req,res) => {
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const productId = req.params.id;
  db.query('DELETE FROM panier WHERE id_user= ? and id_produit=?', [decodedToken.userId,productId], (error, results) => {
      if (error) throw error;
      res.status(200).send('Produit supprimé du panier!');
  });
};

// app.delete('/api/supprimer-produit-du-panier/:userId/:productId', (req, res) => {
//   // Supprimer un produit du panier
//   const userId = req.params.userId;
//   const productId = req.params.productId;
//   db.query('DELETE FROM panier WHERE id_user = ? AND id_produit = ?', [userId, productId], (error, results) => {
//       if (error) throw error;
//       res.status(200).send('Produit supprimé du panier!');
//   });
// });

  exports.acheter = async (req, res) => {
    const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
    const idUtilisateur = decodedToken.userId;
    let responseSent = false;
    var bool=false;

    const sqlSelectPanier = `SELECT * FROM panier WHERE id_user=${idUtilisateur}`;
    await db.query(sqlSelectPanier, async (err, resultPanier) => {
      if (err) {
        if (!responseSent) {
          responseSent = true;
          return res.status(500).send({ message: "Erreur lors de la récupération du panier de l'utilisateur" });
        }
      } else {
        if (resultPanier.length === 0) {
          if (!responseSent) {
            responseSent = true;
            return res.status(400).send({msg: "Cart empty!" });
          }}
          const queryPromises = resultPanier.map(element => {
            return new Promise((resolve, reject) => {
              db.query("SELECT * FROM products WHERE id=?", [element.id_produit], (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  if (element.quantite > result[0].quantite) {
                    console.log(element.quantite);
                    console.log(result[0].quantite);
                    bool = true;
                  }
                  resolve();
                }
              });
            });
          });
          await Promise.all(queryPromises);
          console.log(bool);
        if (bool) {
          responseSent = true;
          console.log(bool)
          return res.status(500).send({msg:"Quantity is not available"})  
        } else {
          
          if (req.body.paymentOnline=="1") {
          db.query("select * from cartes where num=? and codeCarte=?",[req.body.numCarte,req.body.codeCarte],async (error,result)=>{
            if(error){
              if (!responseSent) {
                responseSent = true;
                return res.status(500).send({ msg: "Wrong card!"});
              }
            }else 
            if(result.affectedRows==0){
              if (!responseSent) {
                responseSent = true;
                return res.status(500).send({msg:"Wrong card!"})
              }
            }else

        // const today = new Date();
        // console.log(today)
        // const currentMonth = today.getMonth() + 1;
        // const currentYear = today.getFullYear();
        // const mysqlDateExperation = result.dateExperation; 
        // const [year, month] = mysqlDateExperation.split('-');
        // if (currentYear > year || (currentYear === year && currentMonth >= month)) {
        //   if (!responseSent) {
        //     responseSent = true;
        //     return res.status(404).send({msg:"your card has expired."});
        //   } 
        // }
       
            if(result[0].credit<req.params.total){
              if (!responseSent) {
                responseSent = true;
                return res.status(401).send({msg:"Credit is not enough!"})
              }
            }
            const q = `INSERT INTO commande (id_user, date_achat, paymentOnline, numCarte, fullname, fullAddress, numTel, total,état) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?,?)`;
            const values = [
              idUtilisateur,
              req.body.paymentOnline,
              req.body.numCarte,
              req.body.fullname,
              req.body.fullAddress,
              req.body.numTel,
              req.params.total,
              "Confirmed"
            ];
            await db.query(q, values, async (error, result) => {
              if (error) {
                console.log(error)
                if (!responseSent) {
                  responseSent = true;
                  return res.status(500).send({ msg: "Erreur lors de l'insertion de la commande" });
                }
              } else {
                for (const element of resultPanier) {
                  const v = `INSERT INTO produit_commande (id_commande,id_produit,quantite) VALUES (?,?,?)`;
                  const valuesv = [
                    result.insertId,
                    element.id,
                    element.quantite,
                  ];
                  await db.query(v, valuesv, async (err, result) => {
                    if (err) {
                      console.error(err);
                      if (!responseSent) {
                        responseSent = true;
                        return res.status(500).send({ msg: "Erreur lors de l'insertion du produit_commande" });
                      }
                    }
                  });
                  await db.query("UPDATE products SET quantite=quantite-? WHERE (id = ?);",[element.quantite,element.id_produit], async (err, result) => {
                    if (err) {
                      console.error(err);
                      if (!responseSent) {
                        responseSent = true;
                        return res.status(500).send({ msg: "Erreur lors de l'insertion du produit_commande" });
                      }
                    }
                  });

                }
                await db.query("UPDATE cartes SET credit = credit-? WHERE (num = ?);",[req.params.total,req.body.numCarte],async(error,result)=>{
                  if(error){
                    console.error(err);
                    if (!responseSent) {
                      responseSent = true;
                      return res.status(500).send({ msg: "Erreur de calcul de nouveau crédit" });                     
                    }
                  }
                  await db.query("DELETE FROM panier WHERE id_user=?", [idUtilisateur],async (err, result) => {
                    if (err) {
                      console.error(err);
                      if (!responseSent) {
                        responseSent = true;
                        return res.status(500).send({ msg: "Erreur lors de commander le produit" });
                      }
                    } else {
                      if (!responseSent) {
                        responseSent = true;
                        return res.status(200).send({ msg: "Order is Confirmed" });
                      }
                    }
                  });
                })
              }
            });


          })
          } else {
            const q = `INSERT INTO commande (id_user, date_achat, paymentOnline, numCarte, fullname, fullAddress, numTel, total,état) VALUES (?, CURDATE(), ?,?, ?, ?, ?, ?, ?)`;
            const values = [
              idUtilisateur,
              req.body.paymentOnline,
              null,
              req.body.fullname,
              req.body.fullAddress,
              req.body.numTel,
              req.params.total,
              "Confirmed"
            ];
            await db.query(q, values, async (error, result) => {
              if (error) {
                console.log(error)
                return res.status(500).send({ message: "Erreur lors de l'insertion de la commande" });
              } else {
                for (const element of resultPanier) {
                  const v = `INSERT INTO produit_commande (id_commande,id_produit,quantite) VALUES (?,?,?)`;
                  const valuesv = [
                    result.insertId,
                    element.id,
                    element.quantite,
                  ];
                  await db.query(v, valuesv, async (err, result) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).send({ message: "Erreur lors de l'insertion du produit_commande" });
                    }
                  });
                  await db.query("UPDATE products SET quantite=quantite-? WHERE (id = ?);",[element.quantite,element.id_produit], async (err, result) => {
                    if (err) {
                      console.error(err);
                    return res.status(500).send({ message: "Erreur lors de l'insertion du produit_commande" });
                    }
                  });
                }
                await db.query("DELETE FROM panier WHERE id_user=?", [idUtilisateur], async (err, result) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).send({ message: "Erreur lors de commander le produit" });
                  } else {
                    return res.status(200).send({message: "La commande a été insérée avec succès"});
                  }
                });
              }
            });
          }
        }
      }
    });
  };

exports.getOrders=(req,res)=>{
  const decodedToken = jwt.decode(req.cookies.token, 'SECRETKEY');
  const q="SELECT * FROM commande ORDER BY date_achat";
  db.query(q, async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Erreur de get commande" });
    } else {
      res.status(200).send({ orders:result,token:decodedToken});
    }
})}

exports.modifyStatus=(req,res)=>{
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const q = `UPDATE commande SET état=? WHERE (id = ?);`;
      db.query(q,[req.body.newStatus,req.params.id],(error, result) => {
          if (error) {
            console.log(error) 
           return res.status(500).send('Erreur lors de la modification du produit au panier');
          }
          console.log(result)
          return res.send(`Status of order modified`);
      });
}

exports.Rechercheproduit=(req,res)=>{
  const category=req.query.category;
  const price=req.query.prix;
  console.log(category)
  if(!category && !price){
    db.query(
      `select * from products `,
      (err, result) => {
        if (err) {
          throw err;  
        }
        return res.status(201).send({
          products: result
        });
      });

  }else{
    if(category && !price){
      const sql = `SELECT * FROM products WHERE categorie = ?`;
  db.query(sql, [category], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    if (results.length!=0) {
      res.send({ products: results });
    } else {
      res.send({ message: 'No products found.' });
    }
  });

    }
   
    if( !category && price){
      const sql = `SELECT * FROM products WHERE prix <= ?`;
      db.query(sql, [price], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    if (results.length!=0) {
      res.send({ products: results });
    } else {
      res.send({ message: 'No products found.' });
    }
  });

    }
    if(category && price){
      const sql = `SELECT * FROM products WHERE categorie = ? and prix<=?`;
      db.query(sql, [category,price], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    if (results.length!=0) {
      res.send({ products: results });
    } else {
      res.send({ message: 'No products found.' });
    }
  });

    }
    
  
  }
}

exports.ordersUser=(req,res)=>{
  const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
  const q="Select * from commande where id_user=?"
  db.query(q,[decodedToken.userId],(error,result)=>{
    if(error){
      console.log(error)
    }
    res.status(200).send({commandes:result})
  })
  exports.deleteOneProduct = (req, res) => {
    console.log('productId')
   const productId = req.params.id;
   console.log(productId)
   console.log('productId')
 
   const q = "DELETE FROM products WHERE id = ?";
   db.query(q, [productId], (err, result) => {
     console.log(result)
     if (err) {
       // Handle the error
       console.error(err);
       return res.status(500).json({ error: "An error occurred while deleting the product." });
     }
 
     // Check if the product was deleted successfully
     if (result.affectedRows === 0) {
       return res.status(404).json({ error: "Product not found." });
     } 
 
     // Product was deleted successfully
     return res.status(200).send({productId : productId});
     
 
   });
 };
}

