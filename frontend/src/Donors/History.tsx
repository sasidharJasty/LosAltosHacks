import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/sidebar";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { TimeAway } from "../lib/utils"
import { useState, useEffect } from "react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  ShoppingCart,  Package, ChartBar, AlertTriangle,
  ChartLine, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import DonationForm from "@/components/DonationForm";

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



export default function History() {
  const [user, setUser] = useState<User>();
  
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  
  const orderTypes = donations.reduce((acc:any, donation:Donation) => {
    console.log(acc)
    const type = donation.food_type;
    if (!acc[type]) {
      acc[type] = { name: type, value: 0 };
    }
    acc[type].value += donation.weight;
    return acc;
  }, {});

  const COLORS = ['#22c55e', '#84cc16','#FFFF00', '#14b8a6', '#06b6d4'];

  const getData = async (userDat:User) => {

    const { data, error } = await supabase
      .from("donation")
      .select()
      .eq("user_id",userDat.id)
      .or("status.eq.delivered,status.eq.in-transit");
      

    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      setDonations(data); // Update state with fetched data
    }
  };
  const orderTypesArray = Object.values(orderTypes);

  useEffect(() => {
    const fetchUser = async () => {
      const { data }:any = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        console.log(data);
        
        getData(data.user);
      } else {
        navigate("/");
      }
    };

    fetchUser();
    
  }, [supabase.auth]);



  // Calculate metrics
  
  const totalFood = donations.reduce((acc, donation) => acc + donation.weight, 0);
  const pendingDeliveries = donations.filter(donation => donation.status === 'available').length;
  const totalOrders = donations.length;
  const inRiskOfExpiring = donations.filter(donation => {
    const { status } = TimeAway(donation.expiry_date, 'Expired');
    return status === 'expired' || status === 'warning';
  }).reduce((acc, donation) => acc + donation.weight, 0);



  const monthlyData = [
    { name: 'Sept', oz: 45 },
    { name: 'Oct', oz: 53 },
    { name: 'Nov', oz: 33 },
    { name: 'Dec', oz: 55 },
    { name: 'Jan', oz: 62 },
    { name: 'Feb', oz: totalFood-inRiskOfExpiring }];
  // Calculate pagination
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
        // Handle the case where priority is not valid (e.g., log an error)
        console.error("Invalid priority value:", a.priority, b.priority);
        return 0; // Or another appropriate default sorting behavior
      }
    }
    return aTime - bTime;
  });
  const currentDonations = sortedDonations.slice(indexOfFirstItem, indexOfLastItem);
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
        priority: donation.priority
      })

    if (error) {
      console.error("Error inserting donation:", error);
      alert("Error inserting donation: "+ error.message);
    } else {
      getData(user);
    }
  };

  

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-scroll bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="w-fit">
          <AppSidebar />
        </div>
        <div className="space-y-8 w-full h-full px-16 mt-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">History</h1>
              <p className="text-muted-foreground mt-2">
              Track your past deliveries, including delivered and in-transit orders
              </p>
            </div>

          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <ShoppingCart className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Food</p>
                  <h3 className="text-2xl font-bold">{totalFood} oz</h3>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Deliveries</p>
                  <h3 className="text-2xl font-bold">{pendingDeliveries}</h3>
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> -3%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <h3 className="text-2xl font-bold">{totalOrders}</h3>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> +8%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Risk of Expiring</p>
                  <h3 className="text-2xl font-bold">{inRiskOfExpiring} oz</h3>
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> -5%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Order Trends */}
            <Card className="col-span-2">
              <div className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <ChartLine className="h-5 w-5 mr-2 text-primary" />
                  History Volume Trends
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="oz" 
                        stroke="#22c55e" 
                        fill="#22c55e20" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Order Types Distribution */}
            <Card>
              <div className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <ChartBar className="h-5 w-5 mr-2 text-primary" />
                  History Types
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypesArray}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderTypesArray.map(( _,index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>



            
          </div>

          {/* Orders List */}
          <Card>
            <div className="p-6 space-y-4 relative">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                History
              </h2>
              
              <div className="divide-y divide-border">
                {currentDonations.map((donation) => {
                  const { text, status } = TimeAway(donation.expiry_date, 'Expired');
                  return (
                    <div
                      key={donation.id}
                      className={`p-4  m-1 rounded-md flex items-center justify-between ${
                        status === 'expired' ? 'bg-neutral-200 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{donation.name}</h3>
                        <p className="text-sm text-muted-foreground">{donation.food_type}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{donation.weight} oz</p>
                          <p className="text-sm text-muted-foreground">Amount</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              status === 'expired' ? 'text-red-500' :
                              status === 'warning' ? 'text-yellow-500' :
                              'text-green-500'
                            }`}
                          >
                            {text}
                          </p>
                          <p className="text-sm text-muted-foreground">Expires in</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            donation.priority === 'high' ? 'text-red-500' :
                            donation.priority === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {donation.priority}
                          </p>
                          <p className="text-sm text-muted-foreground">Priority</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'expired' ? 'bg-red-500/10 text-red-500' :
                            donation.status === 'in progress' ? 'bg-primary/10 text-primary' :
                            donation.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                            donation.status === 'available' ? 'bg-green-500/10 text-green-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {status ==='expired'?'expired':donation.status}
                          </span>
                        </div>
                      </div>
                    </div>
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
      {showForm && (
        <DonationForm
          onClose={() => setShowForm(false)}
          onSubmit={handleNewDonation}
        />
      )}
    </SidebarProvider>
  );
}