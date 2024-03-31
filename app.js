const express = require('express');
const app = express();

app.use(express.urlencoded( { extended: false } )); //parsear para capturar datos de forms
app.use(express.json());

const dotenv = require('dotenv'); //variables de entorno
dotenv.config({path: './env/.env'});

app.use('/resources', express.static('public'));  //directorio publico para archivos estaticos.
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');    //motor de vistas, express buscara en carpeta views

const bcryptjs = require('bcryptjs');   //criptografia de contraseñas

const session = require('express-session');     //manejo de sesiones
app.use(session({
    secret:'secret',       //clave secreta para cifrar las cookies
    resave: true,            //guarda la sesion aunque no haya cambios
    saveUninitialized:true   //guarda la cookie aunque no haya sido inicializada previamente
}));

//Conexion DB
const connection = require('./database/db');

//Rutas 

app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});

//register

app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    connection.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHaash}, async(error, results)=>{
        if(error){
            throw error;
        }else{
            res.render('register', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon: 'succes',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            });
        }
    });
});

//autentificacion

app.post('/auth', async (req, res)=> {
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) { //si la long es = 0 o si no coincide la pass
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "¡Usuario y/o contraseña incorrectas!",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name;
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage: "¡Login Correcto!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
        });
    }else{
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor ingrese un usuario y contraseña",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: 1500,
            ruta: 'login'
        });
    }
});

//auth pages
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión'
        });
    }
});

app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING AT PORT 3000');
});