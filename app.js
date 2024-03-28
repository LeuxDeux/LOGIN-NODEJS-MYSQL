const express = require('express');
const app = express();

app.use(express.urlencoded( { extended: false } )); //parsear para capturar datos de forms
app.use(express.json());

const dotenv = require('dotenv'); //variables de entorno
dotenv.config({path: './env/.env'});

app.use('/resources', express.static('public'));  //directorio publico para archivos estaticos.
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');    //motor de vistas

const bcryptjs = require('bcryptjs');   //criptografia de contraseñas

const session = require('express-session');     //manejo de sesiones
app.use(session({
    secret:'secret',       //clave secreta para cifrar las cookies
    resave: true,            //guarda la sesion aunque no haya cambios
    saveUninitialized:true   //guarda la cookie aunque no haya sido inicializada previamente
}));

//Conexion DB
const connection = require('./database/db');

app.get('/', (req, res) => {
    res.send('HOLA MUNDO');
});

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING AT PORT 3000');
});