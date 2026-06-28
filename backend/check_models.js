require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the simple SDK, but we can try to hit the API or just try a few known ones.
    // Actually, let's try gemini-1.5-flash again but with a different client config if possible.
    console.log("Checking gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-1.5-flash!");
  } catch (err) {
    console.error("Error with gemini-1.5-flash:", err.message);
    try {
        console.log("Checking gemini-1.0-pro...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result2 = await model2.generateContent("Hi");
        console.log("Success with gemini-1.0-pro!");
    } catch (err2) {
        console.error("Error with gemini-1.0-pro:", err2.message);
    }
  }
}
listModels();
