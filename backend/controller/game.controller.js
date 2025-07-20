import ApiError from "../utils/apiError.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// import ApiResponse from "../utils/apiResponce.js";

export const wordMeaning = async (req, res) => {
  try {
    const user = req.user;
    

    const targetLanguage =
      user?.userLanguage?.[0]?.learning_language || "English";
    const proficiency = user?.userLanguage?.[0]?.level || "Beginner";
    const nativeLanguage = user?.userLanguage?.[0]?.first_language || "hindi";

    const prompt = `
You are a language tutor.

Generate exactly 5 random, common, single words in the user's **native language**: ${nativeLanguage}.  
For each word, provide its single-word translation into ${targetLanguage} (${proficiency} level).

⚫ Format:  
[native language word] - [translated word in ${targetLanguage}]

⚫ Rules:  
- Native language word must always come **first**, followed by a dash and the translation.  
- Do NOT reverse the order.  
- Do NOT include any heading, introduction, explanation, numbers, emojis, or extra text.  
- Output ONLY the 5 word pairs. Nothing else.

✅ Example:  
વાદળ - Storm  
કોઠી - Market  
પંખી - Bird  
ધોરણ - Level  
મિત્ર - Friend

Now output **only 5 word pairs in the exact format above.**
`.trim();

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        stream: true,
        prompt,
      }),
    });

    if (!ollamaResponse.body) {
      return res.status(500).send("No response body from Ollama.");
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let fullResponse = ""; // 👈 collect everything here

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep the last incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullResponse += json.response; // 👈 accumulate
          }
        } catch (err) {
          console.warn("Skipping invalid JSON chunk :", line);
          continue;
        }
      }
    } 

    // Once finished, send full response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(fullResponse.trim()); // 👈 single full output

  } catch (err) {
    console.error(err);
    res.status(500).send("Error while processing AI response.");
  }
};


export const givePointsForWordGame = async (req, res) => {
  try {
    const user = req.user;
    const pointsToAdd = req.body.pointsToAdd ?? 1;

    let gamePoints;

    try {
      // Try to update gamePoints
      gamePoints = await prisma.gamePoints.update({
        where: { userId: user.id },
        data: {
          points: { increment: pointsToAdd },
          xp: { increment: pointsToAdd },
        },
        select: {
          id: true,
          points: true,
          xp: true,
          streak: true,
        },
      });
    } catch (err) {
      if (err.code === "P2025") {
        // Row does not exist yet
        gamePoints = await prisma.gamePoints.create({
          data: {
            userId: user.id,
            points: pointsToAdd,
            xp: pointsToAdd,
          },
          select: {
            id: true,
            points: true,
            xp: true,
            streak: true,
          },
        });
      } else {
        throw err;
      }
    }

    let levelUp = false;

    // Check if level should increase
    if (gamePoints.points >= 100 && gamePoints.points % 100 === 0) {
      const updatedLang = await prisma.userLanguage.updateMany({
        where: { userId: user.id },
        data: {
          level_in_number: { increment: 1 },
        },
      });

      if (updatedLang.count === 0) {
        // no existing userLanguage → create default
        await prisma.userLanguage.create({
          data: {
            userId: user.id,
            learning_language: "English", // or infer from req.user
            proficiency: "Beginner",
            level: "Beginner",
            level_in_number: 2, // because we’re levelling up
          },
        });
        levelUp = true;
      } else {
        levelUp = true;
      }
    }

    res.status(200).json({
      message: "Points added successfully",
      gamePoints,
      ...(levelUp && { levelUp: "Level increased by 1 🎉" }),
    });
  } catch (err) {
    console.error("Error adding points:", err);
    res.status(500).json({ error: "Failed to add points" });
  }
};

export const makeSentence = async (req, res) => {
  try {
    const user = req.user;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

   const targetLanguage =
      user?.userLanguage?.[0]?.learning_language || "English";
    const proficiency = user?.userLanguage?.[0]?.level || "Beginner";
    const nativeLanguage = user?.userLanguage?.[0]?.first_language || "hindi";

    const prompt = `
You are a professional language tutor.

The user's native language is: ${nativeLanguage}  
The user is learning: ${targetLanguage} (proficiency: ${proficiency})

✅ Write exactly 5 short, simple, and common sentences.  
✅ Each sentence must appear **twice on the same line**:  
   - first in ${nativeLanguage}  
   - then a dash (-)  
   - then the translation in ${targetLanguage}.

⚫ Example:  
   હું ઘરે જઈ રહ્યો છું - I am going home  
   મારા મિત્રને મળો - Meet my friend

🚫 Do not include numbers, explanations, extra words, or headings.  
🚫 Only output 5 lines with one sentence each.

Now output 5 such sentence pairs in the exact format above.
`.trim();

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        stream: true,
        prompt,
      }),
    });

    if (!ollamaResponse.body) {
      return res.status(500).send("No response body from Ollama.");
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let resultText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete

      for (const line of lines) {
        if (!line.trim()) continue;

        const json = JSON.parse(line);

        if (json.response) {
          resultText += json.response;
        }
      }
    }

    res.send(resultText.trim());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while generating AI response.");
  }
};


export const conversationAI = async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).send("Missing student message.");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    const targetLanguage =
      user?.userLanguage?.[0]?.learning_language || "English";
    const proficiency = user?.userLanguage?.[0]?.level || "Beginner";
    const nativeLanguage = user?.userLanguage?.[0]?.first_language || "Hindi";

    const prompt = `
You are a professional language tutor having a casual voice conversation with a student.

✅ The student's native language is: ${nativeLanguage}
✅ The student is learning: ${targetLanguage} (proficiency: ${proficiency})
✅ The student just said: "${message}"

⚫ Your task:
- First, politely point out and correct **any grammar mistakes** in the student's message (if any). If there are no grammar mistakes, say "No grammar mistakes. Well done!"
- Do NOT correct spelling mistakes.
- Then, continue the conversation naturally in ${targetLanguage} (3–5 short, chat-like sentences).
- Encourage the student to reply.

🚫 Do not include explanations or headings.
🚫 Write only in ${targetLanguage}.
🚫 Do not include any text in ${nativeLanguage}.
🚫 Do not include numbers, emojis, or extra text.

✅ Example output:
No grammar mistakes. Well done!
Hello! How are you?
What is your name?
Do you like music?
    `.trim();

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        stream: true,
        prompt,
      }),
    });

    if (!ollamaResponse.body) {
      return res.status(500).send("No response body from Ollama.");
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let resultText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);
          if (json.response) {
            resultText += json.response;
          }
        } catch (err) {
          console.warn("Skipping invalid JSON:", line);
        }
      }
    }

    res.send(resultText.trim());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while generating AI response.");
  }
};

