import axios from "axios";
import { useState } from "react";

const categories = [
  "Electronics",
  "Clothing and Apparel",
  "Home and Kitchen",
  "Books and Stationery",
  "Beauty and Personal Care",
  "Toys and Games",
  "Sports and Outdoors",
  "Automotive",
  "Health and Wellness",
  "Furniture",
  "Grocery and Gourmet Food",
  "Pet Supplies",
  "Office Supplies",
  "Jewelry and Accessories",
  "Music and Entertainment",
  "Tools and Hardware",
  "Baby Products",
  "Arts and Crafts",
  "Travel and Luggage",
  "Garden and Outdoor Living",
];




export const getTimeAgoInGST = (createdAt: string): string => {
  const createdAtDate = new Date(createdAt);
  const now = new Date();

  // Convert current time and createdAt to GST (UTC+4)
  const gstOffset = 4 * 60; // GST is UTC+4, offset in minutes
  const createdAtInGST = new Date(createdAtDate.getTime() + gstOffset * 60000);
  const nowInGST = new Date(now.getTime() + gstOffset * 60000);

  // Calculate time difference in milliseconds
  const diffMs = nowInGST.getTime() - createdAtInGST.getTime();

  // Convert to days, hours, minutes
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays == 1) {
      return `${diffDays} day ago`;
  } else if (diffDays > 1) {
    return `${diffDays} days ago`;
  }else if (diffHours > 1) {
    return `${diffHours} hours ago`;
  }else if (diffHours == 1) {
      return `${diffHours} hour ago`;
  }else if (diffMinutes > 1) {
    return `${diffMinutes} minutes ago`;
  } else if (diffMinutes == 1) {
      return `${diffMinutes} minute ago`;
  } else {
      return `just now`;
  }
};

export function getDistanceFromLatLonInMi(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3963.1; // Radius of the Earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in miles
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}


export function useAuthToken() {

  
  const [token, setToken] = useState<string | null>(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_APP_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setAuth = (newToken: string) => {
    console.log("Setting token", newToken);
    setToken(newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const getToken = () => { token};

  return { setAuth, getToken, token, api };
}

export { categories };


