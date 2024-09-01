import "express-async-errors";
import express, {json, urlencoded} from "express";
import cors from "cors";
import userRouter from "./controllers/users.js";
import {mongoUrl} from "./utils/config.js";
import {connect} from "mongoose";
import {
	errorHandler,
	tokenExtractor,
	unknownEndpoint,
} from "./utils/middleware.js";
import loginRouter from "./controllers/login.js";

const app = express();

connect(mongoUrl).then(() => {
	console.log("Connected to MongoDB");
});

app.use(express.static("dist"));

app.use(cors());
app.use(json());
app.use(urlencoded({extended: true}));
app.use(tokenExtractor);

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

app.use(errorHandler, unknownEndpoint);

export default app;
