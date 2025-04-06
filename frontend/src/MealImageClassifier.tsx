import React, { useState } from "react";

const CLOUDFLARE_WORKER_URL = "https://server.varshith-gudeus.workers.dev/"; // Replace with your deployed Worker URL

const MealImageClassifier: React.FC = () => {

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyzeImage = async (file: File) => {
    setLoading(true);
    setResult(null);

    try {
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () =>
            resolve(reader.result!.toString().split(",")[1]); // Remove 'data:image/jpeg;base64,'
          reader.onerror = (error) => reject(error);
        });

      const base64Image = await toBase64(file);

      const requestBody = JSON.stringify({
        inputs: [{ data: { image: { base64: base64Image } } }],
      });

      const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();

      const predictions =
        responseData.outputs?.[0]?.data?.concepts
          ?.map((item: any) => `${item.name} (${(item.value * 100).toFixed(2)}%)`)
          .join(", ") || "No predictions found.";

      setResult(predictions);
    } catch (error: any) {
      console.error("Error analyzing image:", error.message);
      alert("Failed to analyze image. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeImage(file);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">🍽️ Food Image Classifier</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {loading && <p className="mt-4 text-blue-600">Analyzing image...</p>}
      {result && <p className="mt-4 text-green-600">{result}</p>}
    </div>
  );
};

export default MealImageClassifier;
