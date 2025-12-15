import express from "express";

export const userRouter = express.Router()

userRouter.use("/", (req, res) => {
  res.send("oksddqsqs")
})