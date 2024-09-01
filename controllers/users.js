import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
	const users = await User.find({});
	return res.status(200).json(users);
});

userRouter.post("/", async (req, res) => {
	if (!req.body.password && req.body.password.length > 3) {
		return res.status(400).json({
			error: "Password is required and its length must be greater than 3",
		});
	}
	const {username, name, password} = req.body;

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({
		username,
		name,
		passwordHash,
	});

	const savedUser = await user.save();

	const userForToken = {
		username: savedUser.username,
		name: savedUser.name,
		id: savedUser._id,
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

	
	res.status(201).json(savedUser);
});

export default userRouter;
