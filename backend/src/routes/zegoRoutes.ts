import express from "express";
import { generateToken } from "../services/zegoService";

const router = express.Router();

router.get("/access_token", async (req, res) => {
  const { userID, expired_ts } = req.query;
  try {
    const token = await generateToken(userID as string, parseInt(expired_ts as string));
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;