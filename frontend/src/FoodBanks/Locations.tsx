import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/sidebar";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { TimeAway } from "../lib/utils"
import { useState, useRef, useEffect } from "react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Map } from 'lucide-react';

import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';

import axios from "axios";
import { 
 ShoppingCart, Package, MapPinned, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';


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

export default function Location() {
  const [user, setUser] = useState<User>();
  
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAForm, setAShowForm] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const INITIAL_CENTER: [number, number] = [
    -74.0242,
    40.6941
  ]
  const center = INITIAL_CENTER;
  const itemsPerPage = 10;

  const displayAllLocations = async () => {
    setShowAllLocations(true);
    
    // Check if all locations map is initialized
    if (allLocationsContainerRef.current && !allLocationsMapRef.current) {
      // Initialize the all locations map if it doesn't exist yet
      allLocationsMapRef.current = new mapboxgl.Map({
        container: allLocationsContainerRef.current,
        center: center,
        zoom: 10,
        style: 'mapbox://styles/mapbox/streets-v11'
      });
      
      // Give it a moment to initialize before adding markers
      setTimeout(async () => {
        await addMarkersToAllLocationsMap();
      }, 500);
    } else if (allLocationsMapRef.current) {
      // Map already exists, just resize and add markers
      allLocationsMapRef.current.resize();
      await addMarkersToAllLocationsMap();
    }
  };
  
  const addMarkersToAllLocationsMap = async () => {
    if (!allLocationsMapRef.current) return;
    
    // Clear existing markers
    const markers = document.querySelectorAll('.all-locations-marker');
    markers.forEach(marker => marker.remove());
    
    // Filter donations that aren't expired
    const validDonations = donations.filter(donation => {
      const { status } = TimeAway(donation.expiry_date, 'Expired');
      return status !== 'expired';
    });
    
    // Add markers for all valid donations
    for (const donation of validDonations) {
      try {
        const response = await axios.get(`https://geocode.maps.co/search?q=${donation.location.split(" ").join("+")}&api_key=67b127218c68c066231087yjl011f86`);
        if (response.data && response.data.length > 0) {
          const lat = response.data[0].lat;
          const lon = response.data[0].lon;
          
          const el = document.createElement('div');
          el.className = 'all-locations-marker';
          el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundSize = 'cover';
          
          new mapboxgl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                  `<h3>${donation.restaurant_title || 'Restaurant'}</h3>
                   <p>${donation.name} - ${donation.weight} oz</p>
                   <p>${donation.location}</p>
                   <p>Priority: ${donation.priority}</p>
                   <p>Expires: ${TimeAway(donation.expiry_date, 'Expired').text}</p>`
                )
            )
            .addTo(allLocationsMapRef.current);
        }
      } catch (error) {
        console.log("Error fetching coordinates for donation:", donation.id, error);
      }
    }
    
    // Adjust the map view to fit all markers
    if (validDonations.length > 0 && allLocationsMapRef.current) {
      allLocationsMapRef.current.flyTo({
        center: center,
        zoom: 10,
        essential: true
      });
    }
  };

  const orderItems = async(id:any) => {
    const { error } = await supabase
  .from('donation')
  .update({ food_bank_id: user?.id, status: "in-transit" })
  .eq('id', id)
    if(error){
      alert("Error ordering item, Try again!");
      console.log(error);
    }else{
      toast.success("Order is in Transit.", {
        description: "Check your Dashboard or Pending to see."});
        getData();
    }
  }



  const getData = async () => {
    const { data, error } = await supabase
      .from("donation")
      .select()
      .not("status", "eq", "delivered")
    .not("status", "eq", "in-transit"); 
    if (error) {
      console.error("Error fetching donations:", error);
    } else {
      console.log(data)
      setDonations(data); // Update state with fetched data
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      const { data }:any = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        console.log(data);
        getData();
      } else {
        navigate("/");
      }
    };

    fetchUser();
    
  }, [supabase.auth]);
  



  // Calculate metrics
  const totalFood = donations.reduce((acc, donation) => acc + donation.weight, 0);
 
  const totalOrders = donations.length;
  const inRiskOfExpiring = donations.filter(donation => {
    const { status } = TimeAway(donation.expiry_date, 'Expired');
    return status === 'warning';
  }).reduce((acc, donation) => acc + donation.weight, 0);


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

  const getLatLong = async (address:string, donation:Donation) => {
    try {
      const response = await axios.get(`https://geocode.maps.co/search?q=${address.split(" ").join("+")}&api_key=67b127218c68c066231087yjl011f86`);
      if (response.data && response.data.length > 0) {
        const lat = response.data[0].lat;
        const lon = response.data[0].lon;
        setShowForm(true);
        
        // Clear existing markers
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => marker.remove());
        
        // Create new marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = 'cover';
    
        // Check if mapRef is initialized
        if (mapRef.current) {
          new mapboxgl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                  `<h3>${donation.restaurant_title}</h3><p>${donation.name} - ${donation.weight}</p><p>${donation.location} </p>`
                )
            )
            .addTo(mapRef.current);
    
          mapRef.current.flyTo({ center: [lon, lat], zoom: 14 });
        }
      } else {
        console.log("No location data found for address:", address);
      }
    } catch (error) {
      console.log("Error fetching coordinates:", error);
    }
  };
  

  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const allLocationsMapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const allLocationsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapContainerRef.current) { // Check if the ref is not null
      mapboxgl.accessToken = 'pk.eyJ1Ijoidmd1ZGUyMDA5IiwiYSI6ImNtNzZvMXp6YjA4djIybHExenBvZXhxMGcifQ.MFH6I1WXFzVEHU_Oms3iFA';
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current, // Use the ref here
        center: center,
        zoom: 18, // Optional: Adjust the zoom level
        style: 'mapbox://styles/mapbox/streets-v11' // Optional: Choose your preferred style
      });
    }
  
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      if (allLocationsMapRef.current) {
        allLocationsMapRef.current.remove();
      }
    }
  }, []);

  useEffect(() => {
    if (showAllLocations && allLocationsMapRef.current) {
      allLocationsMapRef.current.resize();
    }
  }, [showAllLocations]);

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
              <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
              <p className="text-muted-foreground mt-2">
                AI-powered order management and predictions
              </p>
            </div>
            <Button onClick={displayAllLocations} className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              View All Locations
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
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
              <div className="flex items-center gap-4 relative">
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
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
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

          




          {/* Orders List */}
          <Card className="pb-5">
            <div className="p-6 space-y-4 relative">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Available Food
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
                        <h3 className="font-medium">{donation.name} <span className="text-neutral-500 text-sm">by {donation.restaurant_title}</span> </h3>
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
                        <div>
                          <Button onClick={()=>{orderItems(donation.id)}} className={` ${status === 'expired'?'cursor-not-allowed':''}`} disabled={status === 'expired'?true:false}>Order</Button>
                        </div>
                        <Button onClick={()=>{getLatLong(donation.location,donation)}}><MapPinned /></Button> 
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
      
  <div className={` inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ${showForm?'fixed':'hidden'}`}>
  <button
        onClick={() => setShowForm(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
      >
        &times;
      </button>
    <div className=" w-3/4 h-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
      
      <div ref={mapContainerRef} className="map-container"  style={{ width: '75vw', height: '75vh' }}></div>
    </div>
  </div>
  <div className={`inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ${showAllLocations ? 'fixed' : 'hidden'}`}>
        <button
          onClick={() => setShowAllLocations(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
        >
          &times;
        </button>
        <div className="w-3/4 h-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-green-50">All Available Donation Locations</h2>
          <div ref={allLocationsContainerRef} className="map-container" style={{ width: '75vw', height: '70vh' }}></div>
        </div>
      </div>



    </SidebarProvider>
  );
}