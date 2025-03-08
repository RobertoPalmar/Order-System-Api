import { UserRole } from "@global/definitions";
import { encryptPassword } from "@global/utils";
import { User } from "@models/Database/user.model";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { config } from "dotenv";
import { SECRET_KEY_TOKEN } from "@global/config";

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, role, status } = req.body;

  const newUser = new User({
    name,
    email,
    password: await encryptPassword(password),
    role: role as UserRole,
    status
  })

  const saveUser = await newUser.save();

  //GENERATE TOKEN
  const token = jwt.sign({userID: saveUser._id, role: saveUser.role}, SECRET_KEY_TOKEN, { expiresIn: "1h" })

  res.status(201).json({token});
};

export const signIn = async (req: Request, res: Response) => {
  
};
