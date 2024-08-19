import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  id: Number,
  inicio: String,
  fin: String,
  disponible: Boolean,
  cliente: String // Puedes ajustar el tipo según necesites
});
      
const daySchema = new mongoose.Schema({
  dia: {
    type: String,
    required: true,
    unique: true // Asegura que cada día sea único en la base de datos
  },
  turnos: [turnoSchema]
}, { collection: 'Turns' }); // Especifica la colección correcta aquí

export const Day = mongoose.model('Day', daySchema);