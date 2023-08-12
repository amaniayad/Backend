
const express = require('express')
const router = express.Router(); 
const cookieParser = require('cookie-parser');
const multer=require('multer');
const path=require('path');
 
const routs = require('../controllers/user')
const rout=require('../controllers/products')
router.use(cookieParser());

const storage=multer.diskStorage({
    destination:function(request,file,callback){
        callback(null,'./uploads')
    },
    
        filename:function(request,file,callback){
        callback(null,Date.now()+file.originalname);
        },
});
const uploade=multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*3
    },
})

router.get('/ShowMore/:matricule',routs.authenticateTokenAdmin,rout.ShowMore)
router.post('/createProduct',routs.authenticateTokenAdmin,uploade.single('imageP'),rout.createProduct)
router.get('/getAllProduct',routs.authenticateTokenAdmin,rout.getAllProduct)
router.get('/getAllProductUser',routs.authenticateTokenUser,rout.getAllProductUser)
router.get('/getOneProduct/:matricule',routs.authenticateTokenAdmin,rout.getOneProduct)
router.get('/getUpdateProduct/:id',routs.authenticateTokenAdmin,rout.getUpdateProduct)
router.post('/postUpdateProduct/:id',routs.authenticateTokenAdmin,rout.postUpdateProduct)
router.get('/getUpdateGProduct/:matricule',routs.authenticateTokenAdmin,rout.getUpdateGProduct)
router.post('/postUpdateGProduct/:mat',routs.authenticateTokenAdmin,rout.postUpdateGProduct)
router.delete('/deleteOneProduct/:id',routs.authenticateTokenAdmin,rout.deleteOneproduct)
router.get('/getUpdateProduct/:id',routs.authenticateTokenAdmin,rout.getUpdateProduct)
router.post('/postUpdateProduct/:id',routs.authenticateTokenAdmin,rout.postUpdateProduct)
router.post('/AddWishlist/:id',routs.authenticateTokenUser,rout.addToWishlist)
router.get('/getWishlist',routs.authenticateTokenUser,rout.AfficherWishlist)
router.delete('/deleteFromWishlist/:id',routs.authenticateTokenUser,rout.deleteFromWishlist)
router.get('/getProductUser/:id',routs.authenticateTokenUser,rout.getProductUser)
router.post('/getProductUser/:id',routs.authenticateTokenUser,rout.addToCart)
router.get('/cart',routs.authenticateTokenUser,rout.getCart)
router.put('/modifyCart/:id',routs.authenticateTokenUser,rout.modifyCart)
router.delete('/deleteFromCart/:id',routs.authenticateTokenUser,rout.deleteFromCart)
router.post('/acheterPanier/:total',routs.authenticateTokenUser,rout.acheter)
router.get('/getOrders',routs.authenticateTokenAdmin,rout.getOrders)
router.put('/modifyStatus/:id',routs.authenticateTokenAdmin,rout.modifyStatus)
router.get('/RecherchParTout',routs.authenticateTokenAdmin ,rout.Rechercheproduit);
router.get('/getOrdersUser',routs.authenticateTokenUser,rout.ordersUser)
router.get("/Commandeuser/:id",routs.authenticateTokenAdmin,rout.Commandeuser)
router.delete('/deleteOneProduct/:id',routs.authenticateTokenAdmin,rout.deleteOneproduct)

module.exports =router;  
