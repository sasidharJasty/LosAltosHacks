import { useState } from "react";
import { supabase } from "./supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const classifyMeal = (ingredients: string) => {
  if (/chicken|beef|pork|fish/i.test(ingredients)) return "meat";
  if (/tofu|soy|almond milk/i.test(ingredients)) return "vegan";
  if (/cheese|egg|milk/i.test(ingredients)) return "vegetarian";
  if (/corn|rice|quinoa/i.test(ingredients)) return "gluten_free";
  return "unknown";
};
const genAI = new GoogleGenerativeAI('AIzaSyCmE6owZZSeRac8-jeK-bVJCIuAtAnYzAM');

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});



const MealClassifier = () => {
  const [mealName, setMealName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMeal = async () => {
    if (!mealName || !ingredients) return alert("Enter meal details.");
    setLoading(true);

    const category = classifyMeal(ingredients);
    const ingrArray = ingredients.split(",").map((i) => i.trim());

    const prompt = `
    Using the following list of ingredients, generate a simple meal idea in JSON format.

    Include:
    - A descriptive meal name
    - Estimated total cost as a string
    - Basic nutrition info (calories, servings, fat), all as strings
    - A list of ingredients used with their amounts
    - Step-by-step cooking instructions in a string

    The output must match this JSON schema:
    {
      "meal": {
        "name": "Meal Name",
        "cost": "Total Cost",
        "nutrition": {
          "calories": "Calories",
          "servings": "Servings",
          "fat": "Fat Content"
        },
        "ingredients": [
          {
            "name": "Ingredient Name",
            "amount": "Amount"
          }
        ],
        "instructions": "Step-by-step instructions for preparing the meal."
      }
    }

    Here is the list of ingredients:
    ${ingrArray.join(", ")}
    `;

   

    try {
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            meal: {
              type: "object",
              properties: {
                name: { type: "string" },
                cost: { type: "string" },
                nutrition: {
                  type: "object",
                  properties: {
                    calories: { type: "string" },
                    servings: { type: "string" },
                    fat: { type: "string" }
                  },
                  required: ["calories", "servings", "fat"]
                },
                ingredients: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      amount: { type: "string" }
                    },
                    required: ["name", "amount"]
                  }
                }
              },
              required: ["name", "cost", "nutrition", "ingredients"]
            }
          },
          required: ["meal"]
        },
      };
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `Using a list of ingredients, generate a JSON meal object that includes:
      - Meal name
      - Estimated cost as a string
      - Nutrition info (calories, servings, fat), all as strings
      - Ingredient names and amounts
      - Clear step-by-step cooking instructions
      
      Ensure the response is in valid JSON matching this structure:
      {
        "meal": {
          "name": "Meal Name",
          "cost": "Total Cost",
          "nutrition": {
            "calories": "Calories",
            "servings": "Servings",
            "fat": "Fat Content"
          },
          "ingredients": [
            {
              "name": "Ingredient Name",
              "amount": "Amount"
            }
          ],
          "instructions": "Step-by-step instructions for preparing the meal."
        }
      }`
              }
            ]
          }
        ]
      });
      
      const result = await chatSession.sendMessage(prompt);
      const data = JSON.parse(result.response.text());
      
      console.log( data);
      // Parse JSON


      // Save to Supabase
      const { error } = await supabase.from("foods").insert([
        {
          name: mealName,
          ingredients,
          category,
          nutrition_info: data,
        },
      ]);

      if (error) throw new Error(error.message);

      setResult({ name: mealName, category, nutrition_info: data });
    } catch (error: any) {
      console.error("Gemini Error:", error.message);
      alert("Failed to analyze meal. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold">Smart Menu Insights</h2>
      <input
        type="text"
        placeholder="Meal Name"
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
        className="border p-2 rounded w-full mt-2"
      />
      <textarea
        placeholder="Enter ingredients (comma-separated)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        className="border p-2 rounded w-full mt-2"
      />
      <button
        onClick={analyzeMeal}
        className="bg-blue-500 text-white p-2 rounded mt-2"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Meal"}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold">Category: {result.category}</h3>
          <h4 className="font-bold mt-2">Ingredient Breakdown:</h4>
          <ul className="mt-2">
            {result.nutrition_info.map((item: any, index: number) => (
              <li key={index} className="p-2 border-b">
                <strong>{item.text}</strong> - {item.calories} kcal |{" "}
                {item.protein}g Protein | {item.fat}g Fat | {item.carbs}g Carbs
                <p className="text-sm text-gray-500">
                  Allergen Category: {item.allergens}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealClassifier;