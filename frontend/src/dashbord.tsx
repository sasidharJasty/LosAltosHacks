import { useEffect, useState } from "react";
import Switch from "react-switch";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastChart} from "./ForecastChart"; // Ensure this path is correct
import { Button } from './components/ui/button';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/sidebar";
import { supabase } from "./supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import ImageAnalysis from "./MealImageClassifier"
import { Package, TrendingUp, Truck, Users } from "lucide-react";

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

function DonationForm({ onClose, onSubmit }:any) {

  const orderTypes = [
    { name: 'Fresh Produce' },
    { name: 'Canned Goods'},
    { name: 'Bakery' },
    { name: 'Dairy'},
    { name: 'Frozen Foods'},
    { name: 'Beverages'}
  ];
  const [items, setItems] = useState('');
  const [restaurant, setRestaurant]= useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const status= 'available';
  const ana="";
  const [priority, setPriority] = useState('low');
  const [foodType, setFoodType] = useState(orderTypes[0].name);
  const [location, setLocation] = useState('');

  

  const handleSubmit = (e:any) => {
    e.preventDefault();
    onSubmit({ items, quantity, date, status, location, foodType, priority,ana,restaurant });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-lg overflow-scroll">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">New Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-scroll max-h-screen">
          <div className="mb-4">
            <Label htmlFor="items" className="block text-sm font-medium text-gray-700">Items</Label>
            <Input
              id="items"
              type="text"
              placeholder='e.g., Fresh Produce, Canned Goods'
              value={items}
              onChange={(e) => setItems(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Weight</Label>
            <Input
              id="quantity"
              type="number"
              placeholder='50 oz'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="date" className="block text-sm font-medium text-gray-700">Expiry Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Food Type</Label>
            <select
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            >
              {orderTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <Label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Priority</Label>
            <select
              id="foodType"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            >

                <option key="low" value="low">
                  low
                </option>
                <option key="medium" value="medium">
                  medium
                </option>
                <option key="high" value="high">
                  high
                </option>
            </select>
          </div>
          <div className="mb-4">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700">Address</Label>
            <Input
              id="location"
              type="text"
              placeholder='e.g., New York, NY'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700">Restaurant Name</Label>
            <Input
              id="location"
              type="text"
              placeholder='El Rodeo'
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
            />
          </div>
          {/*<ImageAnalysis prompt="Analyze food images and provide ingredient and nutrition details."
  analysisFormat="Analyze this meal image and list the ingredients with nutritional values(RESPOND ONLY WITH THE JSON AND NO OTHER TEXT, NO HALLUCINATIONS): Use this JSON format: 
  json_format: {
    image_description: 'A brief description of the image content.',
    ingredients: [
      {
        name: 'Ingredient Name',
        description: 'Details about the ingredient.',
        sub_ingredients: [
          {
            name: 'Sub-ingredient Name',
            description: 'Details about the sub-ingredient.'
          }
        ]
      }
    ],
    nutritional_values: {
      calories: 'Calories per serving',
      serving: 'Serving size',
      protein: 'Protein content per serving',
      total_fat: {
        total: 'Total fat content per serving',
        saturated_fat: 'Saturated fat content',
        trans_fat: 'Trans fat content'
      }
    }
  }"
  onAnalysisComplete={(analysis:any) => {toast.success("Analysis completed!.", {
    description: analysis});setAnalysis(analysis);}}
  onError={(error:any) => console.error("Error occurred:", error)}/>*/}
          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" onClick={onClose} variant="outline" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {


  const [user, setUser] = useState<User>();
  const [userType, setUserType] = useState("");
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data }:any = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setUserType(data.user ? (data.user.user_metadata.role) : "");
        getData(data.user);
      } else {
        navigate("/");
      }
    };

    fetchUser();
    
  }, [supabase.auth]);

  const getData = async (userDat:User) => {
    console.log(userDat.user_metadata.role);
    if (userDat.user_metadata.role === "donor"|| userDat.user_metadata.role==="dono"){
    const { data, error } = await supabase
      .from("donation")
      .select()
      .eq('user_id',userDat.id)
      .order('created_at', { ascending: true })
      .limit(3);
      
    console.log(data);
    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      setRecentDonations(data); // Update state with fetched data
    }}
    if (userDat.user_metadata.role === "receiver") {
      const { data, error } = await supabase
      .from('donation')
      .select()
      .eq("food_bank_id", userDat.id)
      .not("status", "eq", "delivered");
      if (error) {
      console.error("Error fetching donations:", error);
      } else {
      console.log(data);
      setRecentDonations(data as Donation[]);
      }
    }

  };

  const handleNewDonation = async (donation:Donation) => {
    if (!user) {
      alert("You must be logged in to make a donation");
      return;
    }

    // Insert the donation with user_id
    const { error } = await supabase
      .from("donation")
      .insert({
        name: donation.items,
        weight: donation.quantity,
        status: donation.status,
        user_id: user.id, // Ensure this is valid
        location: donation.location,
        expiry_date: donation.date,
        food_type: donation.foodType,
        priority: donation.priority,
        analysis:donation.ana,
        restaurant_title:donation.restaurant
      })

    if (error) {
      console.error("Error inserting donation:", error);
      alert("Error inserting donation:"+ error.message);
    } else {
      getData(user);
    }
  };

  // Prepare data for the chart
  const chartData = recentDonations.map(donation => ({
    date: donation.created_at.substring(0, 10),
    weight: donation.weight,
  }));

  const deliverItem = async(id:any) => {
    const { error } = await supabase
  .from('donation')
  .update({ status: "delivered" })
  .eq('id', id)
    if(error){
      alert("Error ordering item, Try again!");
      console.log(error);
    }else{
      toast.success("Order is delivered.", {
        description: "Check your Inventory to see your delivery."});
        if(user){
          getData(user);
        }
    }
  }

  

  return (
    <SidebarProvider>
      <Toaster position="top-right" expand={true} richColors duration={10000}/>
      <div className="flex w-full h-full overflow-scroll bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="w-fit">
          <AppSidebar />
        </div>
        <div className="h-fit mt-4 ml-0 rounded-lg mr-2"></div>
        <div>
          <div className="m-4 ml-14">
            {userType === "receiver" ? <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=' w-[75vw] h-[90vh]'
      >
        <h1 className="text-3xl font-bold mb-8 mt-[10vh]">{user?.user_metadata.foodbank.title} Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Incoming Orders</h2>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                
                <div
                  key={donation.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >

                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{donation.name} <span>by {donation.restaurant_title}</span> </span>


                    <span className={`text-sm text-primary ${donation.priority=== 'low' ? "text-green-400" :donation.priority=== 'medium' ? "text-yellow-500" :"text-red-400"}`}>Best Before: {donation.expiry_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 relative">
                    <Package className="w-4 h-4" />
                    <span>{donation.food_type} - {donation.weight} oz</span>
                    <div className="absolute right-4 flex">
                    <Switch  onChange={()=>{setChecked(!checked);
                      deliverItem(donation.id)}} checked={checked}/>
                    <h1 className="ml-2"> Delivered?</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={()=>{navigate("/foodbank/locations")}} className="w-full mt-4">View All Donations</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Distribution Center Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-primary">1,875</p>
                <p className="text-gray-600">Items in Stock</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-primary">250</p>
                <p className="text-gray-600">Daily Recipients</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Distribution Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Active Deliveries</span>
                  </div>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Volunteers On Duty</span>
                  </div>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div> : <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className=' w-[75vw] h-[90vh]'
            >
              <h1 className="text-4xl mt-14 font-bold mb-8">Donor Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
                  <div className="space-y-4">
                    {recentDonations.slice(0, 3).map((donation) => (
                      <div
                      key={donation.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{donation.name}</span>
                        <span className="text-gray-600">{donation.created_at.substring(0, 10)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{donation.weight} oz</span>
                        <span className="ml-4 h-fit my-auto text-sm font-medium text-primary text-green-400">
                        {donation.status}
                        </span>
                      </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" onClick={() => setShowForm(true)}>Make New Donation</Button>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">1,240</p>
                      <p className="text-gray-600">Meals Provided</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">89%</p>
                      <p className="text-gray-600">Distribution Rate</p>
                    </div>
                  </div>
                  <div className="mt-6 h-full">
                    <h3 className="text-lg font-semibold mb-3">Monthly Trend</h3>
                    <div className="h-1/2 bg-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <span className="ml-2 text-gray-600">Chart Coming Soon</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Donations Over Time</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>}
          </div>
        </div>
      </div>
      {showForm && (
        <DonationForm
          onClose={() => setShowForm(false)}
          onSubmit={handleNewDonation}
        />
      )}
    </SidebarProvider>
  );
}