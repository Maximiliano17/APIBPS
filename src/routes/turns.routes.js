import express from "express";
import { getDays, getDayByName, getDayById, updateTurn } from '../controllers/turns.controllers.js';

const routes = express.Router(); 

routes  
.get("/days", getDays)   
.get('/days/:name', getDayByName)
.get('/days/:day/:id', getDayById)
.put('/turns', updateTurn);

export default routes; 