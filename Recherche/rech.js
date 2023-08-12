const express=require('express');
const app=express();
const mysql=require('mysql');
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'mysqlamani20',
    database: 'projet1cs' 
  });
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database:', error);
      return;
    }
    console.log('Connected to the database!');
  });


app.get("/Rechercheparcouleur",(req,res)=>{
    const couleur = req.query.couleur;
connection.query(`SELECT * FROM products where couleur=?`,[couleur], (error, results) => {
  if (error) {
    console.error('Error executing query:', error);
    return;
  }
  if (results.length) {
    res.send({ products: results });
  } else {
    res.send({ message: 'No products found.' });
  }
  
});

})

app.get("/Rechercheparprix", (req, res) => {
    const prix = req.query.prix;
    connection.query('SELECT * FROM products WHERE prix <= ?', [prix], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }
      if (results.length) {
        res.send({ products: results });
      } else {
        res.send({ message: 'No products found.' });
      }
    });
  });

app.get('/Rechercheparcategorie', (req, res) => {
    const category = req.query.category;
    const sql = `SELECT * FROM products WHERE categorie = ?`;
    connection.query(sql, [category], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }
      if (results.length) {
        res.send({ products: results });
      } else {
        res.send({ message: 'No products found.' });
      }
    });
});

app.get("/amani",(req,res)=>{
const a=req.body.nom;
console.log(a)
connection.query("insert into cartes (num,dateExperation,credit) values(?,?,?)", [2,a,25], (error, results) => {
  if (error) {
    console.error('Error executing query:', error);
    return;
  }
res.send(a);
})
})
  



app.listen(5000)
  
  
  