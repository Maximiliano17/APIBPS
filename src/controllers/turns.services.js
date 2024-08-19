// src/services/turns.services.js
import { Day } from "../Models/dayModel.js"; // Asegúrate de incluir la extensión .js si es necesario

export const getDaysFromDatabase = async () => {
    try {
        const days = await Day.find();
        return days;
    } catch (error) {
        console.error('Error al obtener los días de la base de datos:', error);
        throw new Error('Error al obtener los días de la base de datos');
    }
};

export const getDayByNameFromDatabase = async (name) => {
    try {
        const day = await Day.findOne({ dia: name });
        return day;
    } catch (error) {
        console.error(`Error al obtener el día ${name} de la base de datos:`, error);
        throw new Error(`Error al obtener el día ${name} de la base de datos`);
    }
};

export const getDayByIdFromDatabase = async (day, id) => {
    try {
        const dayDoc = await Day.findOne({ dia: day, 'turnos.id': id });
        const turn = dayDoc.turnos.id(id);
        return turn;
    } catch (error) {
        console.error(`Error al obtener el turno ${id} para el día ${day} de la base de datos:`, error);
        throw new Error(`Error al obtener el turno ${id} para el día ${day} de la base de datos`);
    }
};

export const saveTurnToDatabase = async (turnData) => {
    try {
        const { dia, turno, nombre } = turnData;

        // Encuentra el documento correspondiente al día y el turno específico
        const dayDoc = await Day.findOneAndUpdate(
            { dia, "turnos.id": turno },
            {
                $set: {
                    "turnos.$.cliente": nombre,
                    "turnos.$.disponible": false
                }
            },
            { new: true }
        );

        if (!dayDoc) {
            throw new Error(`Día o turno no encontrado: Día - ${dia}, Turno - ${turno}`);
        }

        return dayDoc;
    } catch (error) {
        throw new Error('Error al guardar el turno en la base de datos: ' + error.message);
    }
};