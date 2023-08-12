
const express = require('express')
const router = express.Router();
const cookieParser = require('cookie-parser');
const app = express();
const routs = require('../controllers/user')
router.post('/register',routs.register)

 router.post('/login',routs.login)

router.put('/:id',routs.authenticateTokenUser,routs.updateUser)

router.get('/logout', routs.logout);
router.get('/getAllUsers',routs.authenticateTokenAdmin,routs.getAllUsers)

router.put('/deleteUser/:id',routs.authenticateTokenAdmin,routs.deletuser)


module.exports =router;  
