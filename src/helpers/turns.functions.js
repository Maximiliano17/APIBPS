// Función auxiliar para sumar minutos a una hora dada (en formato HH:mm)
export const sumarMinutos = (hora, minutos) => {
  let [hours, mins] = hora.split(":");
  hours = parseInt(hours);
  mins = parseInt(mins);

  mins += minutos;
  hours += Math.floor(mins / 60);
  mins %= 60;

  return `${pad(hours)}:${pad(mins)}`;
};

// Función auxiliar para asegurarse de que los números tengan dos dígitos (por ejemplo, "09" en lugar de "9")
const pad = (num) => {
  return (num < 10 ? "0" : "") + num;
};

// Función auxiliar para obtener el nombre del día de la semana en texto
export const getDayName = (dayOfWeek) => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  return days[dayOfWeek];
};

// Función auxiliar para verificar si un turno es disponible
export const esTurnoDisponible = (date, horaInicio) => {
  const now = new Date();
  const turnoDate = new Date(date);
  turnoDate.setHours(parseInt(horaInicio.split(":")[0]));
  turnoDate.setMinutes(parseInt(horaInicio.split(":")[1]));

  return now < turnoDate;
};
