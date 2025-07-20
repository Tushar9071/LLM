import express from "express";
import {
  conversationAI,
  givePointsForWordGame,
  makeSentence,
  wordMeaning,
} from "../controller/game.controller.js";
import { verifyJWT } from "../middleware/middleware.js";

const route = express.Router();

route.post("/wordgame", verifyJWT, wordMeaning);
route.post("/wordgame/addpoint", verifyJWT, givePointsForWordGame);
route.post("/makesentence", verifyJWT, makeSentence);
route.post("/conversationAI", verifyJWT, conversationAI); // Updated function name

export default route;
