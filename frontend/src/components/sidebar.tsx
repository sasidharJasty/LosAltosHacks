import { History, Home, Inbox, Utensils, MapPin, ChevronUp, Map, User2, Receipt, LogOut, Truck, Car } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";
import image from "../assets/imageBG.png"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { supabase } from "../supabase";

// Menu items with Drive option added
const donorItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Inventory",
    url: "/donor/inventory",
    icon: Inbox,
  },
  {
    title: "History",
    url: "/donor/history",
    icon: History,
  },
  {
    title: "Heat Map",
    url: "/calmap",
    icon: Map,
  },
  {
    title: "Drive",
    url: "/drive",
    icon: Truck,
  },
]

const receiverItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Locations",
    url: "/foodbank/locations",
    icon: MapPin,
  },
  {
    title: "Inventory",
    url: "/foodbank/inventory",
    icon: Inbox,
  },
  {
    title: "Meal Plans",
    url: "/foodbank/mealplans",
    icon: Utensils,
  },
  {
    title: "Heat Map",
    url: "/calmap",
    icon: Map,
  },
  {
    title: "Drive",
    url: "/drive",
    icon: Truck,
  },
]

interface User {
  id: string;
  user_metadata: {
    role: string;
    // Add more properties here as needed
    [key: string]: any; // Allow any other properties
    profile_image?: string;
  };
}

export function AppSidebar() {
  const [user, setUser] = useState<User>();
  const [showPopup, setShowPopup] = useState(false);
  const [items, setItems] = useState<{ title: string; url: string; icon: React.FC }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    console.log(error);
    if (!error) {
      setUser(undefined);
      navigate("/");
    }
  }
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data }: any = await supabase.auth.getUser();
      
      if (!data.user) {
        navigate("/");
      } else {
        setUser(data.user);
        setItems(data.user ? (data.user.user_metadata.role === "donor" || data.user.user_metadata.role === "dono" ? donorItems : receiverItems) : []);
        console.log(data.user);
      }
    };
    
    fetchUser();
  }, [navigate]);
  
  return (
    <Sidebar variant="sidebar" className="border-r shadow-sm">
      <SidebarHeader className="pt-6 pb-2 px-5">
        <a className="flex" href="/">
          <img src={image} className="w-40 object-contain" alt="Logo" />
        </a>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 px-2 mb-1">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`my-1 transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'}`}
                    >
                      <a href={item.url} className="rounded-md py-2.5">
                        {React.createElement(item.icon as React.ElementType, { 
                          className: `h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-600'}` 
                        })}
                        <span className={`text-sm ml-3 ${isActive ? 'font-medium' : ''}`}>{item.title}</span>
                        {item.title === "Drive" && (
                          <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">New</span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-4 px-3">
        <Separator className="mb-4" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full">
                <SidebarMenuButton className="relative flex items-center p-2 hover:bg-gray-100 rounded-md transition-all">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        className="w-9 h-9 rounded-md object-cover border"
                        src={user && user.user_metadata.profile_image ? user.user_metadata.profile_image : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                        alt="User Profile"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col ml-3">
                      <span className="font-medium text-sm">
                        {user ? user.user_metadata.first_name + " " + user.user_metadata.last_name : "Guest"}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">
                        {user ? user.user_metadata.email : "Guest"}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] p-2">
                <DropdownMenuItem className="relative p-3 cursor-default">
                  <div className="absolute top-2 right-2 text-[10px] bg-green-400 py-0.5 px-2 rounded-full">
                    <span className="text-white font-medium">{user ? user.user_metadata.role : "Guest"}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10 rounded-md object-cover border"
                      src={user && user.user_metadata.profile_image ? user.user_metadata.profile_image : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                      alt="User Profile"
                    />
                    <div className="flex flex-col ml-3">
                      <span className="font-medium">
                        {user ? user.user_metadata.first_name + " " + user.user_metadata.last_name : "Guest"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user ? user.user_metadata.email : "Guest"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all">
                  <User2 className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all">
                  <Receipt className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowPopup(true)}
                  className="flex items-center p-2 cursor-pointer hover:bg-red-50 rounded-md transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm text-red-500">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-1/3 min-h-[20vh] p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-bold mb-2">Are you sure you want to sign out?</h2>
            <p className="text-neutral-500">This action will log you out of your account and you will need to log in again to access your dashboard and other features.</p>
            <div className="flex justify-end mt-4">
              <button
                className="mr-2 px-6 py-2 border shadow-md hover:bg-neutral-200 transition-all rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-black shadow-md text-white hover:bg-neutral-800 transition-all rounded-md"
                onClick={() => {
                  handleLogout();
                  setShowPopup(false);
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  )
}
