import express from "express";
import { getTurnsByWeek, getTurnsByDay, getTurnById, putTurnById } from "../controllers/turns.controller.js";
const routes = express.Router();

routes
.get("/", getTurnsByWeek)
.get("/:day", getTurnsByDay)
.get("/:day/:id", getTurnById)
.put("/:dia/:id", putTurnById);

export default routes;
