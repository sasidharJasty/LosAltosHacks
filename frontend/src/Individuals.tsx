import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/sidebar";
import { supabase } from "./supabase";

import { Package } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner"





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




export default function Location() {



  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);


  const itemsPerPage = 10;

  





  const getData = async () => {
    const { data, error } = await supabase
      .from("foods")
      .select()
      console.log(data)
    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      console.log(data)
      setDonations(data); // Update state with fetched data
    }
  };


  useEffect(() => {

    getData();
    
  }, [supabase.auth]);
  









  const totalPages = Math.ceil(donations.length / itemsPerPage);

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

  

  return (
    <SidebarProvider>
      <Toaster position="top-right" expand={true} richColors/>
      <div className="flex w-full h-screen overflow-scroll bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="w-fit">
          <AppSidebar />
        </div>
        <div className="space-y-8 w-full h-full px-16 mt-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Individuals</h1>
              <p className="text-muted-foreground mt-2">
                Find the nearest food bank and place your order!
              </p>
            </div>
            
          </div>

         


          {/* Orders List */}
          <Card className="pb-5">
            <div className="p-6 space-y-4 relative">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Available Food
              </h2>
              
              <div className="space-y-4">
  {donations.map((meal, index) => {
    const parsedMeal = meal ? JSON.parse(meal['json']).meal : null; // Parse once here
    
    return parsedMeal ? (
      <div key={index} className="border p-4 rounded-lg mb-4 shadow-sm bg-white">
        {/* Meal Header - Name and Cost */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-primary">{parsedMeal.name}</h2>
          <p className="text-sm text-muted-foreground">cost: ${parsedMeal.cost}</p>
        </div>
        
        {/* Meal Nutrition - Calories and Fat */}
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <p>Calories: {parsedMeal.nutrition.calories}</p>
          <p>Fat: {parsedMeal.nutrition.fat}</p>
        </div>
        
        {/* Divider between Meal Info and Ingredients */}
        <div className="border-t border-muted-foreground my-2"></div>

        {/* Ingredients List */}
        <div className="space-y-2">
          {parsedMeal.ingredients.length > 0 ? (
            parsedMeal.ingredients.map((ingredient:any, index:any) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <p className="font-semibold text-primary">{ingredient.name}</p>
                <p className="text-xs text-muted-foreground">{ingredient.amount}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No ingredients available.</p>
          )}
        </div>

        {/* Divider after Ingredients Section */}
        <div className="border-t border-muted-foreground my-2"></div>
      </div>
    ) : (
      <p key={index} className="text-sm text-muted-foreground">No meal data available for this donation.</p>
    );
  })}
</div>

              <div className="flex justify-between mt-4">
                <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div> 
      
  



    </SidebarProvider>
  );
}