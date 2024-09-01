import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import express from "express";

const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
	const {username, password} = req.body;
	try {
		const user = await User.findOne({username});

		const passwordCorrect =
			user === null ? false : bcrypt.compare(password, user.passwordHash);

		if (!(user && passwordCorrect)) {
			return res.status(401).json({
				error: "invalid username or password",
			});
		}

		const userForToken = {
			username: user.username,
			name: user.name,
			id: user._id,
		};

		const token = jwt.sign(userForToken, process.env.SECRET, {
			expiresIn: 60 * 60,
		});

		res.cookie("jwt", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			sameSite: "strict",
			maxAge: 24 * 60 * 60 * 1000,
		});

		res.status(200).send({
			username: user.username,
			name: user.name,
			id: user._id.toString(),
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({error: "Internal server error"});
	}
});

export default loginRouter;
