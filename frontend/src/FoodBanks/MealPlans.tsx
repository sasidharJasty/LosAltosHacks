import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/sidebar";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { TimeAway } from "../lib/utils";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Plus,
  Package,
  Utensils,
  Clock,
  DollarSign,
  ScrollText,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Donation {
  id: number;
  name: string;
  weight: number;
  status: string;
  user_id: string;
  location: string;
  expiry_date: string;
  food_type: string;
  priority: string;
  // Add more properties here as needed
  [key: string]: any; // Allow any other properties
}

interface User {
  id: string;
  user_metadata: {
    role: string;
    // Add more properties here as needed
    [key: string]: any; // Allow any other properties
  };
}

interface MealPlan {
  meal: {
    name: string;
    cost: string;
    nutrition: {
      calories: string;
      servings: string;
      fat: string;
    };
    ingredients: {
      name: string;
      amount: string;
    }[];
    instructions: string;
  };
}

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyCmE6owZZSeRac8-jeK-bVJCIuAtAnYzAM');

export default function FoodBankMealPlans() {
  const navigate = useNavigate();
  
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [mealPlanPage, setMealPlanPage] = useState(1);
  const itemsPerPage = 10;

  const classifyMeal = (ingredients: string[]) => {
    const ingredientsStr = ingredients.join(' ').toLowerCase();
    
    if (/chicken|beef|pork|fish|turkey|lamb|meat/i.test(ingredientsStr)) {
      return "meat-based";
    }
    if (/tofu|soy|almond milk|plant-based/i.test(ingredientsStr)) {
      return "vegan";
    }
    if (/cheese|egg|milk|dairy/i.test(ingredientsStr) && 
        !/chicken|beef|pork|fish/i.test(ingredientsStr)) {
      return "vegetarian";
    }
    if (/corn|rice|quinoa|gluten-free/i.test(ingredientsStr)) {
      return "gluten-free";
    }
    return "general";
  };

  const getMeals = async() => {
    if (donations.length === 0) {
      toast.error("No ingredients available to generate meal plans");
      return;
    }
    
    setGeneratingMeal(true);
    
    try {
      // Create a list of ingredient names for the prompt
      const ingredientNames = donations.map(d => d.name);
      const category = classifyMeal(ingredientNames);
      
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });
      
      // Create a formatted list of ingredients with their weights
      const ingredientsList = donations.map(d => 
        `${d.name} (${d.weight} oz, type: ${d.food_type})`
      ).join(", ");
      
      // Prepare the prompt for the AI
      const prompt = `
      Using the following list of ingredients, generate a nutritious meal idea in JSON format.
      
      Include:
      - A creative but practical meal name
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
      ${ingredientsList}
      
      This meal should be ${category} if possible based on the ingredients.
      `;
      
      // Set up generation config with schema validation
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
                },
                instructions: { type: "string" }
              },
              required: ["name", "cost", "nutrition", "ingredients", "instructions"]
            }
          },
          required: ["meal"]
        },
      };
      
      // Start a chat session for context
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `I need you to generate meal ideas from lists of ingredients. Always return a valid JSON object that follows the schema requirement.`
              }
            ]
          }
        ]
      });
      
      // Send the prompt and get the response
      const result = await chatSession.sendMessage(prompt);
      console.log("AI Response:", result.response.text());
      
      // Parse the JSON response
      const data = JSON.parse(result.response.text());
      
      // Save to Supabase for history
      const { error } = await supabase
        .from("foods")
        .insert({ 
          json: data,
          category: category,
          ingredients: ingredientsList
        });

      if (error) {
        console.error("Error inserting meal data:", error);
      }
      
      // Update the UI
      setCurrentMealPlan(data);
      setMealPlans(prev => [data, ...prev]);
      
      toast.success("Meal plan generated successfully!");
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      toast.error("Failed to generate meal plan. Please try again.");
    } finally {
      setGeneratingMeal(false);
    }
  };

  const getData = async (userDat: User) => {
    const { data, error } = await supabase
      .from("donation")
      .select()
      .eq("food_bank_id", userDat.id)
      .eq("status", "delivered");

    if (error) {
      console.error("Error fetching donations:", error);
      toast.error("Error loading ingredients");
    } else {
      setDonations(data);
    }
  };

  // Load previous meal plans
  const loadSavedMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const parsedMealPlans = data.map(item => 
          typeof item.json === 'string' ? JSON.parse(item.json) : item.json
        );
        setMealPlans(parsedMealPlans);
      }
    } catch (error) {
      console.error("Error loading saved meal plans:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data }: any = await supabase.auth.getUser();
      if (data.user) {
        getData(data.user);
        loadSavedMealPlans();
      } else {
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedDonations = donations.sort((a, b) => {
    const aTime = new Date(a.expiry_date).getTime();
    const bTime = new Date(b.expiry_date).getTime();
    if (aTime === bTime) {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const isValidPriority = (priority: string): priority is keyof typeof priorityOrder => {
        return priority in priorityOrder;
      };
  
      if (isValidPriority(a.priority) && isValidPriority(b.priority)) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        console.error("Invalid priority value:", a.priority, b.priority);
        return 0;
      }
    }
    return aTime - bTime;
  });

  const currentDonations = sortedDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(donations.length / itemsPerPage);
  
  // For meal plan pagination
  const totalMealPlanPages = Math.ceil(mealPlans.length / 3);
  const currentMealPlans = mealPlans.slice((mealPlanPage - 1) * 3, mealPlanPage * 3);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextMealPlanPage = () => {
    if (mealPlanPage < totalMealPlanPages) {
      setMealPlanPage(mealPlanPage + 1);
    }
  };

  const handlePreviousMealPlanPage = () => {
    if (mealPlanPage > 1) {
      setMealPlanPage(mealPlanPage - 1);
    }
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      <div className="flex w-full h-screen overflow-auto bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="w-fit">
          <AppSidebar />
        </div>
        <div className="space-y-8 w-full h-full px-8 md:px-16 pt-6 pb-12">
          <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mt-10">Meal Plans</h1>
              <p className="text-muted-foreground mt-2">
                AI-powered system for optimized recipes based on inventory.
              </p>
            </div>
            <Button 
              onClick={getMeals} 
              className="bg-primary hover:bg-primary/90"
              disabled={generatingMeal}
            >
              {generatingMeal ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Generate Meal Plan</>
              )}
            </Button>
          </div>

          {/* Ingredients Card */}
          <Card>
            <div className="p-6 space-y-4 relative">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Available Ingredients ({donations.length})
              </h2>

              {donations.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No ingredients available yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivered donations will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {currentDonations.map((donation) => {
                      const { text, status } = TimeAway(donation.expiry_date, "Expired");
                      const isExpired = status === "Expired";
                      
                      return (
                        <div
                          key={donation.id}
                          className={`py-4 flex items-center justify-between space-x-4 ${
                            isExpired ? "opacity-50" : ""
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold">{donation.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {donation.food_type} - {donation.weight} oz
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${isExpired ? "text-red-500" : ""}`}>{text}</p>
                            <span className="text-xs text-muted-foreground">{donation.priority} priority</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Meal Plan Suggestions */}
          <Card>
            <div className="p-6 space-y-4 relative">
              <h2 className="text-xl font-semibold flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-primary" />
                Meal Plan Suggestions
              </h2>

              {mealPlans.length === 0 ? (
                <div className="py-12 text-center">
                  <ScrollText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No meal plans generated yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the "Generate Meal Plan" button to create recipes from your ingredients.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentMealPlans.map((mealPlan, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg font-semibold mb-2">{mealPlan.meal.name}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                            <DollarSign className="h-3 w-3 mr-1" /> {mealPlan.meal.cost}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            <Clock className="h-3 w-3 mr-1" /> {mealPlan.meal.nutrition.servings} servings
                          </span>
                        </div>
                        
                        <div className="mb-3 text-sm">
                          <p><span className="font-medium">Calories:</span> {mealPlan.meal.nutrition.calories}</p>
                          <p><span className="font-medium">Fat:</span> {mealPlan.meal.nutrition.fat}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                          <ul className="text-sm space-y-1">
                            {mealPlan.meal.ingredients.slice(0, 5).map((ingredient, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{ingredient.name}</span>
                                <span className="text-muted-foreground">{ingredient.amount}</span>
                              </li>
                            ))}
                            {mealPlan.meal.ingredients.length > 5 && (
                              <li className="text-muted-foreground text-xs">
                                +{mealPlan.meal.ingredients.length - 5} more ingredients
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        {mealPlan.meal.instructions && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Instructions:</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {mealPlan.meal.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Meal Plan Pagination */}
                  {totalMealPlanPages > 1 && (
                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousMealPlanPage}
                        disabled={mealPlanPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center text-sm">
                        Page {mealPlanPage} of {totalMealPlanPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextMealPlanPage}
                        disabled={mealPlanPage === totalMealPlanPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
