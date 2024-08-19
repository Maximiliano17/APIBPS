import express from 'express';
import mongoose from 'mongoose';
import { conectarDB } from '../ConexionMongo/conexion.js'; // Asegúrate de que tu función conectarDB esté definida en db.js
import routes from './routes/turns.routes.js'; // Importa las rutas desde routes.js

const app = express();
const port = 4000;

conectarDB(); // Conecta a la base de datos

app.use(express.json()); // Para analizar el cuerpo de las solicitudes como JSON

// Middleware para manejar las rutas
app.use('/api/v1', routes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});