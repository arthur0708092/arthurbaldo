const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./db');

const app = express();
dotenv.config();

app.use(express.json());

// Corrigido de './routes/produtos' para './produto'
const produtosRoutes = require('./produto'); 
app.use('/produtos', produtosRoutes);

module.exports = app;