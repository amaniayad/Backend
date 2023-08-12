const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path=require('path');

const app = express();
const userRoutes = require("./routes/userroutes");
const productRoutes = require("./routes/productroutes");
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use('/uploads',express.static(path.join(__dirname,'uploads')))

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
