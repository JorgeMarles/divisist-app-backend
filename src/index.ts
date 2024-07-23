import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import PingRouter from "./routes/pingRouter";
import MateriasRouter from "./routes/materiasRouter"
import DivisistRouter from "./routes/divisistRouter"
import http, { createServer } from 'http';
import ProgressManager from "./util/progressManager";
import cors from 'cors'
dotenv.config();


const PORT = process.env.PORT || 3000;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'


const app: Application = express();
const server: http.Server = createServer(app);
ProgressManager.setInstance(server)

app.use(cors())

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));


app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use('/ping',PingRouter);
app.use('/materias',MateriasRouter);
app.use('/divisist',DivisistRouter);
