const express = require('express');
const bcrypt = require('bcrypt');
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


//connect to db
db.getConnection((err, connection) => {
  if (err) throw err; //not connected
  console.log('Connected as ID ' + connection.threadId)
})


exports.register = async (req, res, next) => {
  console.log(req.body);
  db.query(`SELECT * FROM user WHERE email=?`, [req.body.email], (err, result) => {
    if (result.length > 0) {
      return res.status(404).send("Email already exists. Please log in.");
    } else {
      bcrypt.hash(req.body.pwd, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            msg: err
          });
        } else {
          const q = `INSERT INTO user (username, address, email, password, role, activeAccount) VALUES (
            ${db.escape(req.body.username)},
            ${db.escape(req.body.address)},
            ${db.escape(req.body.email)},
            ${db.escape(hash)},
            "1",
            "1"
          )`;

          db.query(q, (err, result) => {
            if (err) {
              throw err;
            }
            const token = jwt.sign(
              {
                userId: result.isertId,
                userRole: "1",
                username: req.body.username
              },
              'SECRETKEY',
              {
                expiresIn: '7d'
              }
            );
            res.cookie('token', token, {
              httpOnly: true
            });

            return res.status(200).json({ token });
          });
        }
      });
    }
  });
};

//login

exports.login = (req, res) => {
  db.query(
    `SELECT * FROM user WHERE email =? AND activeAccount= 1;`,[req.body.email],
    (err, result) => {
      if (err) {
        throw err;
      }
      if (!result.length) {
        return res.status(401).send({
          msg: 'Email or password is incorrect!'
        });
      }
      const user=result[0];
      bcrypt.compare(req.body.password, result[0]['password'], (bErr, bResult) => {
        if (bErr) {
          throw bErr;
        }
        if (bResult) {
          const token = jwt.sign({userId:user.id,username:user.username,userRole:user.role},'SECRETKEY',{ expiresIn: '7d'}
          );
          console.log(token)
          res.cookie('token', token, {
            httpOnly: true
          },);
          console.log(req.cookies)
          res.status(200).json({ token ,user});
        } else {
          return res.status(401).send({
            msg: 'Email or password is incorrect!'
          });
        }
      });
    }
  );
};

// logout

exports.logout = (req, res) => {
  console.log('loging out...')
  res.clearCookie('token');
  res.status(200).json({
    message: "logout"
  });
}


//Récupérer la liste des users
exports.getAllUsers = (req, res) => {
    db.query(
      `select * from user where role=1`,
      (err, result) => {
        if (err) {
          throw err;

        }
        const decodedToken=jwt.decode(req.cookies.token,'SECRETKEY');
        return res.status(201).json({
          user: result,
          token:decodedToken
        });
      });
  };

//MODIFIER PROFILE
exports.updateUser = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");
  const userInfo = jwt.decode(token, "SECRETKEY");
  if (userInfo.userRole !== 'admin') { return res.status(401).json("Not authenticated!") } else {
    const q =
      "UPDATE user SET `username`=?,`password`=?,`email`=?,`address`=?  WHERE id=? ";

    db.query(
      q,
      [

        req.body.username,
        req.body.password,
        req.body.email,
        req.body.address,
        req.params.id
      ],
      (err, result) => {
        if (err) res.status(500).json(err);
        if (result) return res.json("Updated!");
      }
    );
  }
};

//SUPPRIMER UN UTILISATEUR

exports.deletuser = (req, res) => {
  const q ="SELECT * FROM user where id=?";
  db.query(q, [req.params.id],(err, result) => {
    if (err) res.status(500).json(err);
    if (result){
      if(result[0].activeAccount==0){
        const a ="UPDATE `projet1cs`.`user` SET `activeAccount` = '1' WHERE (`id` = ?);";
        db.query(a, [req.params.id],(err, result) => {
        if (err) res.status(500).json(err);
        if (result) return res.json("Ruturned!");
      });}else{
        const b ="UPDATE `projet1cs`.`user` SET `activeAccount` = '0' WHERE (`id` = ?);";
        db.query(b, [req.params.id],(err, result) => {
        if (err) res.status(500).json(err);
        if (result) return res.json("deleted!");
      })
      }
    }
  });}




module.exports.authenticateTokenAdmin = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, 'SECRETKEY', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.userRole = decoded.userRole;
    console.log(req.userRole)
    if (req.userRole !== 0) {
      return res.status(401).json({ error: 'Not Authorized' });
    }
    next();
  });
};


module.exports.authenticateTokenUser= (req, res, next) =>{
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, 'SECRETKEY', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
      return;
    }
    req.userId = decoded.userId;
    req.username=decoded.username;
    req.userRole=decoded.userRole;
    console.log(req.userRole)
    if(req.userRole!==1){
      return res.status(401).json({error:'NOT Authorized'})
    }
    next();
  });
};



