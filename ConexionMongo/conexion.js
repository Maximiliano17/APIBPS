import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/DBBPS';
 
export const conectarDB = async () => {
  console.log('Intentando conectar a MongoDB...');
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('No se pudo conectar a MongoDB', err);
  }

  // Verificar el estado de la conexión
  const connectionState = mongoose.connection.readyState;
  console.log(`Estado de la conexión: ${connectionState}`);
};