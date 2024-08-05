const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const axios = require('axios');

const MONGO_DB_URI = 'mongodb://0.0.0.0:27017'
const MONGO_DB_NAME = 'db_bot'

let daysCache = [];
let DatosTurnoBot = {}; // Variable para almacenar los datos del turno
let availableTurns = []; // Variable para almacenar los turnos disponibles del día seleccionado

// Función para obtener el día y la hora actual
function getCurrentDayAndTime() {
    const now = new Date();

    // Obtener el día de la semana
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDay = daysOfWeek[now.getDay()];

    // Obtener la hora en formato HH:MM
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinutes}`;

    return {
        day: currentDay,
        time: currentTime
    };
}

// Función para cargar los días desde la API
async function loadAllDays() {
    try {
        const apiURL = `http://localhost:4000/api/v1/days/`;
        const response = await axios.get(apiURL);
        console.log("API full response:", response.data);

        // Definir el orden de los días
        const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        // Obtener los días y ordenarlos según el orden definido
        const days = response.data
            .sort((a, b) => order.indexOf(a.dia) - order.indexOf(b.dia));

        console.log("API response (days):", days);
        return days;
    } catch (error) {
        console.error('Error al cargar los días:', error);
        return [];
    }
}

// Función para obtener los turnos de un día específico desde la API
async function getTurnsForDay(day) {
    try {
        const apiURL = `http://localhost:4000/api/v1/days/${day}`;
        const response = await axios.get(apiURL);
        const turnos = response.data.turnos || []; // Suponiendo que la respuesta de la API contiene un campo 'turnos'

        // Obtener el día y la hora actuales
        const currentDayAndTime = getCurrentDayAndTime();

        // Si el día es hoy, filtrar los turnos para mostrar solo aquellos después de la hora actual
        if (day === currentDayAndTime.day) {
            const currentTime = currentDayAndTime.time;
            return turnos.filter(turno => turno.inicio > currentTime && turno.disponible);
        }

        // Filtrar los turnos que están disponibles
        return turnos.filter(turno => turno.disponible);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error(`Día no encontrado en la API: ${day}`);
            return []; // Retornar un array vacío o manejar de otra manera según tu lógica
        } else {
            console.error(`Error al cargar los turnos para el día ${day}:`, error);
            throw error; // Propagar el error para manejarlo en un nivel superior si es necesario
        }
    }
}

// Función para normalizar el texto (convertir la primer letra a mayúscula y el resto en minúscula)
function normalizeText(text) {
    if (!text) return '';
    // Convertir la primer letra a mayúscula y el resto en minúscula
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para normalizar el día
function normalizeDay(day) {
    switch (day.toLowerCase()) {
        case 'lunes':
            return 'Lunes';
        case 'martes':
            return 'Martes';
        case 'miercoles':
        case 'miércoles':
            return 'Miércoles';
        case 'jueves':
            return 'Jueves';
        case 'viernes':
            return 'Viernes';
        case 'sabado':
        case 'sábado':
            return 'Sábado';
        case 'domingo':
            return 'Domingo';
        default:
            return '';
    }
}

// Función para filtrar los días disponibles a partir del día actual
function filterAvailableDays(days) {
    const currentDayAndTime = getCurrentDayAndTime();
    const currentDay = currentDayAndTime.day;
    const currentTime = currentDayAndTime.time;

    const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return days.filter(day => {
        const normalizedDay = normalizeText(day.dia);
        return order.indexOf(normalizedDay) > order.indexOf(currentDay) ||
               (order.indexOf(normalizedDay) === order.indexOf(currentDay) && day.inicio > currentTime);
    });
}

// Función para obtener los días no disponibles (anteriores al día actual)
function getUnavailableDays(days) {
    const currentDayAndTime = getCurrentDayAndTime();
    const currentDay = currentDayAndTime.day;
    const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return days.filter(day => {
        return order.indexOf(day.dia) < order.indexOf(currentDay);
    }).map(day => day.dia);
}

const flowPrincipal = addKeyword(['hola', 'alo', 'saludos'])
    .addAnswer('👋 ¡Hola! Bienvenido a la peluquería de Sandra ✂️', {
        media: 'https://github.com/Maximiliano17/BotPS/blob/master/assets/sandraPB.jpeg?raw=true',
    })
    .addAnswer(
        '¿En qué puedo ayudarte hoy?\n\nResponde con el mensaje en negrita: \n\n' +
        '*Catálogo* - Ver catálogo ✨\n' +
        '*Turno* - Pedir un turno 🗓️\n' +
        '*Baja* - Dar de baja mi turno ❌\n'
    );

const flowConsulta = addKeyword(['catálogo','catalogo'])
    .addAnswer('Si lo que deseas es cortarte el pelo, tenemos dos opciones de corte según tu presupuesto:')
    .addAnswer(
        '💇 $4000 / Corte de peluquera\n' +
        '💇‍♂️ $2000 / Corte de aprendiz'
    )
    .addAnswer('Si deseas cortarte, por favor escribe el comando "Hola" y selecciona "Pedir un turno".');

const flowSeleccionTurno = addKeyword(['Turno', 'turn'])
    .addAnswer('💬 Un momento por favor, estoy consultando los días de la semana disponibles...')
    .addAnswer('📅 *Días disponibles para turno:*', { capture: false }, async (ctx, { flowDynamic }) => {
        // Filtrar los días disponibles a partir del día actual
        const availableDays = filterAvailableDays(daysCache);

        const daysMessage = availableDays.map((day) => {
            const message = day.mensaje ? ` ${day.mensaje}` : '';
            return `📌 ${day.dia}${message}`;
        }).join('\n');
        await flowDynamic(daysMessage);
    })
    .addAnswer('*¿Qué día deseas agendar?* ❓', { capture: true }, async (ctx, { flowDynamic, fallBack }) => {
        const userResponse = ctx.body.trim();
        const normalizedResponse = normalizeText(userResponse);
        // Guardar el día seleccionado en DatosTurnoBot
        DatosTurnoBot.dia = normalizedResponse;

        // Verificar si el día seleccionado está en la lista de días no disponibles
        const unavailableDays = getUnavailableDays(daysCache);
        if (unavailableDays.includes(normalizedResponse)) {
            await flowDynamic(`❌ *No puedes seleccionar el día ${normalizedResponse} porque ya pasó.*`);
            return fallBack(); // Devolver el control al usuario para seleccionar otro día
        }

        // Verificar si el día seleccionado está en los días disponibles
        const normalizedDay = normalizeDay(normalizedResponse);
        const dayAvailable = daysCache.some(day => normalizeText(day.dia));

        if (dayAvailable) {
            // Obtener los turnos para el día seleccionado desde la API
            const turnsForDay = await getTurnsForDay(normalizedDay);
            availableTurns = turnsForDay; // Guardar los turnos disponibles del día seleccionado
            
            if (turnsForDay.length > 0) {
                const turnsMessage = `🗓️ *Los turnos disponibles para ${normalizedResponse} son:*\n\n  ${turnsForDay.map(turno => `*${turno.id}* : ${turno.inicio} / ${turno.fin}`).join('\n  ')}`;
                await flowDynamic(turnsMessage);                
            } else {
                await flowDynamic(`❌ *No hay turnos disponibles para ${normalizedResponse}.*`);
                return fallBack(); // Devolver el control al usuario para seleccionar otro día
            }
        } else {
            await flowDynamic(`❌ *Día no reconocido: ${userResponse}. Por favor, selecciona un día válido.*`);
            return fallBack(); // Devolver el control al usuario para seleccionar otro día
        }
    })

    .addAnswer('*Por favor, ingresa el número del turno que deseas seleccionar:*', { capture: true }, async (ctx, { flowDynamic, addAnswer }) => {
        const turnoSeleccionado = ctx.body.trim();
        DatosTurnoBot.turno = turnoSeleccionado;
    
        // Verificar si el número de turno seleccionado es válido
        const turnoValido = availableTurns.some(turno => turno.id == turnoSeleccionado);
        if (turnoValido) {
            // Aquí podrías continuar con el proceso de reserva del turno, por ejemplo, enviar la confirmación a la API o guardar en la base de datos
            await flowDynamic(`Has seleccionado el turno número *${turnoSeleccionado}* para el día *${DatosTurnoBot.dia}*.`);    
            // Pedir al usuario que ingrese el nombre para el turno seleccionado    
        } else {
            await flowDynamic(`❌ *El número de turno ${turnoSeleccionado} no es válido para el día ${DatosTurnoBot.dia}. Por favor, selecciona un número de turno válido.*`);
            // Devolver el control al usuario para que seleccione un número de turno válido
        }
    })

   .addAnswer('Por favor, ingresa el nombre de la persona para quien deseas reservar este turno:', { capture: true }, async (ctx, { flowDynamic }) => {
    const nombreCliente = ctx.body.trim();
    DatosTurnoBot.nombre = nombreCliente;

    console.log(DatosTurnoBot.dia)

    try {
        // Realizar la solicitud PUT a la API para confirmar la reserva
        const apiURL = `http://localhost:4000/api/v1/turns/`;
        const response = await axios.put(apiURL, {
            dia: DatosTurnoBot.dia,
            turno: DatosTurnoBot.turno,
            nombre: DatosTurnoBot.nombre
        });

        // Verificar si la solicitud fue exitosa
        if (response.status === 200) {
            // Mostrar mensaje de confirmación al usuario
            await flowDynamic(`El turno número ${DatosTurnoBot.turno} para el día ${DatosTurnoBot.dia} ha sido reservado exitosamente a nombre de ${DatosTurnoBot.nombre}. ¡Turno reservado exitosamente! 🎉`);
        } else {
            // Mostrar mensaje de error si la solicitud no fue exitosa
            console.error('Error al realizar la solicitud PUT a la API:', response);
            await flowDynamic(`❌ Ha ocurrido un error al confirmar la reserva del turno.`);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud PUT a la API:', error);
        // Mostrar mensaje de error si ocurre un error durante la solicitud
        await flowDynamic(`❌ Ha ocurrido un error al confirmar la reserva del turno.`);
    }
});
   
const flowBaja = addKeyword(['baja'])
    .addAnswer('Para cancelar tu turno, por favor proporciona la siguiente información en un solo mensaje:')
    .addAnswer('🔹 *Nombre completo*\n🔹 *Fecha del turno*\n🔹 *Horario del turno*\n\nEjemplo: Juan Pérez, 24/07/2023, 15:00 - 15:30');

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("👋 ¡Bienvenido a la peluquería de SANDRA! 💇‍♀️ Si quieres realizar una consulta, envía el mensaje 'Hola'", {
        delay: 1000,
    });

const main = async () => {
    daysCache = await loadAllDays();
    
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal, flowWelcome, flowSeleccionTurno, flowConsulta, flowBaja]);
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()