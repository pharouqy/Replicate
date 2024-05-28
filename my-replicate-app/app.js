import Replicate from "replicate";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Assurez-vous que node-fetch est installé

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function runPrediction(req, res) {
  console.log(req.body);
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Créer la prédiction
    const prediction = await replicate.predictions.create({
      version:
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: { prompt },
    });

    console.log("Prediction created:", prediction);
    const getUrl = prediction.urls.get;

    // Attendre que la prédiction soit terminée
    let predictionResult;
    while (true) {
      const response = await fetch(getUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction status");
      }

      predictionResult = await response.json();

      if (
        predictionResult.status === "succeeded" ||
        predictionResult.status === "failed"
      ) {
        break;
      }

      // Attendre quelques secondes avant de vérifier à nouveau
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (predictionResult.status === "failed") {
      return res.status(500).json({ error: "Prediction failed" });
    }

    // Obtenir l'URL de l'image générée
    const imageUrl = predictionResult.output;
    console.log(imageUrl);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Erreur :", error);
    res
      .status(500)
      .json({ error: "Prediction failed", details: error.message });
  }
}

export default runPrediction;