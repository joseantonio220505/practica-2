const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar la base de datos
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, precio REAL)");
});

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/productos', (req, res) => {
  db.all("SELECT * FROM productos", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener productos de la base de datos");
    } else {
      res.render('productos', { productos: rows });
    }
  });
});

app.get('/producto/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      res.status(404).send("Producto no encontrado");
    } else {
      res.render('producto', { producto: row });
    }
  });
});

app.get('/agregar-producto', (req, res) => {
  res.render('agregar-producto');
});

app.post('/agregar-producto', (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || isNaN(precio) || precio <= 0) {
    res.status(400).send('Datos inválidos');
    return;
  }
  db.run("INSERT INTO productos (nombre, precio) VALUES (?, ?)", [nombre, precio], function(err) {
    if (err) {
      res.status(500).send("Error al agregar producto a la base de datos");
    } else {
      res.redirect('/productos');
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
