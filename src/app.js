import express from "express";
import bodyParser from "body-parser";
import turnsRoutes from "./routes/turns.routes.js";

// Settings

const app = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.json());

// Routes

app.use("/api/v1/turns", turnsRoutes);

// Server

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
