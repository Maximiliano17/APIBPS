import { esTurnoDisponible, getDayName, sumarMinutos } from "../helpers/turns.functions.js";

let diasConTurnos = [];

export const getTurnsByWeek = (req, res) => {
  const diasDisponibles = diasConTurnos.map((dia) => dia.diaSemana);
  res.json(diasDisponibles);
};

export const getTurnsByDay = (req, res) => {
  const { day } = req.params;
  const diaBuscado = diasConTurnos.find(
    (d) => d.diaSemana.toLowerCase() === day.toLowerCase()
  );
  if (!diaBuscado) {
    res
      .status(404)
      .json({ error: `No se encontraron turnos disponibles para ${day}.` });
  } else {
    res.json(diaBuscado.turnos);
  }
};

export const getTurnById = (req, res) => {
  const { day, id } = req.params;
  const diaBuscado = diasConTurnos.find(
    (d) => d.diaSemana.toLowerCase() === day.toLowerCase()
  );

  if (!diaBuscado) {
    res
      .status(404)
      .json({ error: `No se encontraron turnos disponibles para ${day}.` });
  } else {
    const turno = diaBuscado.turnos.find((t) => t.id === parseInt(id));

    if (!turno) {
      res
        .status(404)
        .json({ error: `No se encontró el turno ${id} para ${day}.` });
    } else {
      res.json(turno);
    }
  }
};

export const putTurnById = (req, res) => {
  const { day, id } = req.params;
  const { cliente } = req.body;

  const diaBuscado = diasConTurnos.find(
    (d) => d.diaSemana.toLowerCase() === day.toLowerCase()
  );

  if (!diaBuscado) {
    res
      .status(404)
      .json({ error: `No se encontraron turnos disponibles para ${day}.` });
  } else {
    const turno = diaBuscado.turnos.find((t) => t.id === parseInt(id));

    if (!turno) {
      res
        .status(404)
        .json({ error: `No se encontró el turno ${id} para ${day}.` });
    } else {
      turno.cliente = cliente;
      res.json({
        mensaje: `Nombre del cliente '${cliente}' asignado al turno ${id} de ${day}.`,
      });
    }
  }
};

const generarTurnosDisponibles = () => {
    const horaApertura = 10; // 10:00 AM
    const horaCierre = 19; // 7:00 PM
    const duracionTurno = 40; // Duración de cada turno en minutos
  
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const days = daysUntilFriday === 0 ? 7 : daysUntilFriday + 1; // Añadir 1 para incluir el viernes
  
    // Reiniciar el contador de IDs para cada día
    let contadorIDs = 1;
  
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
  
      const turnos = [];
      let hora = horaApertura;
  
      while (hora < horaCierre) {
        const horaInicio = `${hora}:00`;
        const horaFin = sumarMinutos(horaInicio, duracionTurno);
  
        const turnoDisponible = esTurnoDisponible(currentDate, horaInicio);
  
        turnos.push({
          id: contadorIDs,
          inicio: horaInicio,
          fin: horaFin,
          disponible: turnoDisponible,
          cliente: null, // Nombre del cliente inicialmente vacío
        });
  
        hora += 1; // Avanzar al siguiente turno sumando 1 hora
        contadorIDs++; // Incrementar el contador de IDs para cada turno
      }
  
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayName = getDayName(currentDate.getDay());
  
      diasConTurnos.push({
        fecha: dateStr,
        diaSemana: dayName,
        turnos: turnos,
      });
  
      // Reiniciar el contador de IDs para el siguiente día
      contadorIDs = 1;
    }
  
    console.log(
      "Días con turnos generados:",
      diasConTurnos.map((dia) => dia.diaSemana).join(", ")
    );
  };

generarTurnosDisponibles();
