import { Day } from "../Models/dayModel.js";
import { saveTurnToDatabase } from "./turns.services.js";
  
// Obtener todos los días y sus turnos
export const getDays = async (req, res) => {
  try {
    const days = await Day.find().select('dia');
    res.json(days);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un día específico por su nombre
export const getDayByName = async (req, res) => {
  const { name } = req.params;
  try {
    const day = await Day.findOne({ dia: name });
    if (!day) return res.status(404).json({ message: 'Día no encontrado' });
    res.json(day);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDayById = async (req, res) => {
  const { day, id } = req.params;

  try {
    const foundDay = await Day.findOne({ dia: day });

    if (!foundDay) {
      return res.status(404).json({ message: 'Día no encontrado' });
    }

    const foundTurn = foundDay.turnos.find(turno => turno.id === parseInt(id));

    if (!foundTurn) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    res.json(foundTurn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
export const updateTurn = async (req, res) => {
  try {
      const turnData = req.body;
      const updatedDay = await saveTurnToDatabase(turnData);
      res.status(200).json({ message: 'Turno actualizado correctamente', data: updatedDay });
  } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el turno', error: error.message });
  }
};