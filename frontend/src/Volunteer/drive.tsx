import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/sidebar";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { TimeAway } from "../lib/utils";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeolocated } from "react-geolocated";
import { 
  MapPin, 
  Route as RouteIcon, 
  Clock, 
  Package, 
  CheckSquare,
  RefreshCw, 
  Truck,
  ShoppingBag,
  Star,
  CheckCircle,
  X,
  Menu,
  Layers,
  MoveUp,
  MoveDown,
  RotateCcw,
  ArrowDownUp
} from 'lucide-react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import axios from 'axios';

// Add custom CSS to style the Mapbox directions component
const customMapboxCSS = `
  .mapboxgl-ctrl-directions {
    max-height: 70vh;
    overflow-y: auto;
    width: 300px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background: white;
  }
  .mapboxgl-ctrl-directions .directions-control {
    font-family: system-ui, -apple-system, sans-serif;
  }
  .mapboxgl-ctrl-directions .directions-control-directions {
    font-size: 13px;
    padding: 12px;
  }
  .mapboxgl-popup-content {
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .mapboxgl-popup-content h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .mapboxgl-popup-content p {
    margin: 4px 0;
    font-size: 12px;
  }
  .mapboxgl-ctrl-attrib-inner {
    display: none;
  }
`;

interface Donation {
  id: number;
  name: string;
  weight: number;
  status: string;
  user_id: string;
  food_bank_id: string;
  location: string;
  expiry_date: string;
  food_type: string;
  priority: string;
  restaurant_title: string;
  destination?: string;
  isPickedUp?: boolean;
  coords?: [number, number];
  destinationCoords?: [number, number];
  [key: string]: any;
}

interface User {
  id: string;
  user_metadata: {
    role: string;
    name?: string;
    [key: string]: any;
  };
}

export default function DriverDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonations, setSelectedDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-122.03118015827938,37.41106558629359]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [recommendedDonations, setRecommendedDonations] = useState<Donation[]>([]);
  const [routeBounds, setRouteBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [manualRouteMode, setManualRouteMode] = useState(false);
  const { coords } = useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    });
  const navigate = useNavigate();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const directionsRef = useRef<any>(null);
  
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoidmd1ZGUyMDA5IiwiYSI6ImNtNzZvMXp6YjA4djIybHExenBvZXhxMGcifQ.MFH6I1WXFzVEHU_Oms3iFA';
  
  // Inject custom CSS for Mapbox
  useEffect(() => {
    // Add custom CSS to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = customMapboxCSS;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Start watching current location
  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      
          setCurrentLocation([coords.longitude, coords.latitude]);
    }else{
          console.error("Error getting current location:", coords);
          toast.error("Unable to get your current location");
        };},[]);
      
     
     

  // Initialize map with proper styles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Using a lighter style for minimalism
      center: currentLocation,
      zoom: 12
    });
    
    // Add directions control with better styling
    directionsRef.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      alternatives: false, // Simplify by showing only one route
      congestion: true,
      controls: {
        instructions: true,
        profileSwitcher: false, // Hide profile switcher for cleaner UI
        inputs: true,
      },
      styles: [
        {
          id: 'directions-route-line',
          type: 'line',
          source: 'directions',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          },
          filter: ['==', '$type', 'LineString']
        }
      ]
    });
    
    mapRef.current.addControl(directionsRef.current, 'top-left');
    
    // Add a clean current location marker
    new mapboxgl.Marker({ color: '#4361ee' })
      .setLngLat(currentLocation)
      .addTo(mapRef.current);
    
    // Set user's location as origin
    directionsRef.current.setOrigin(currentLocation);
    
    // Listen for route calculation events to get accurate distance and duration
    mapRef.current.on('directions.route', (e) => {
      if (e && e.route && e.route[0]) {
        const route = e.route[0];
        // Convert from meters to kilometers and round to 1 decimal place
        const distanceInKm = Math.round(route.distance / 100) / 10;
        // Convert from seconds to minutes and round up
        const durationInMinutes = Math.ceil(route.duration / 60);
        
        setRouteDistance(distanceInKm);
        setRouteDuration(durationInMinutes);
      }
    });
    
    // Add minimal controls to map
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [currentLocation]);
  
  // Update current location marker
  useEffect(() => {
    if (!mapRef.current) return;
    
    const markers = document.querySelectorAll('.current-location-marker');
    markers.forEach(marker => marker.remove());
    
    const el = document.createElement('div');
    el.className = 'current-location-marker';
    el.style.backgroundColor = '#4361ee';
    el.style.width = '14px';
    el.style.height = '14px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 0 2px rgba(67, 97, 238, 0.3)';
    
    new mapboxgl.Marker(el)
      .setLngLat(currentLocation)
      .addTo(mapRef.current);
      
    if (directionsRef.current) {
      directionsRef.current.setOrigin(currentLocation);
    }
    
    checkProximityToLocations();
  }, [currentLocation]);
  
  // Fetch user and donation data
  useEffect(() => {
    const fetchUserAndDonations = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user as User);
        } else {
          navigate("/");
          return;
        }
        
        const { data, error } = await supabase
          .from("donation")
          .select("*, food_bank_id")
          .eq("status", "in-transit");
          
        if (error) throw error;
        
        if (data) {
          const donationsWithMeta = await Promise.all(data.map(async (d) => {
            const donation = {
              ...d,
              destination: d.food_banks?.address || "Unknown destination",
              isPickedUp: false
            };
            
            try {
              // Get pickup coordinates
              const pickupResponse = await axios.get(
                `https://geocode.maps.co/search?q=${encodeURIComponent(donation.location)}&api_key=67b127218c68c066231087yjl011f86`
              );
              
              if (pickupResponse.data && pickupResponse.data.length > 0) {
                const lat = pickupResponse.data[0].lat;
                const lon = pickupResponse.data[0].lon;
                donation.coords = [parseFloat(lon), parseFloat(lat)];
              }
              
              // Get destination coordinates
              if (donation.destination && donation.destination !== "Unknown destination") {
                const destResponse = await axios.get(
                  `https://geocode.maps.co/search?q=${encodeURIComponent(donation.destination)}&api_key=67b127218c68c066231087yjl011f86`
                );
                
                if (destResponse.data && destResponse.data.length > 0) {
                  const lat = destResponse.data[0].lat;
                  const lon = destResponse.data[0].lon;
                  donation.destinationCoords = [parseFloat(lon), parseFloat(lat)];
                }
              }
            } catch (error) {
              console.error("Error fetching coordinates for donation:", donation.id, error);
            }
            
            return donation;
          }));
          
          setDonations(donationsWithMeta);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load delivery information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndDonations();
  }, [navigate]);
  
  // Add pickup and destination location markers
  useEffect(() => {
    if (!mapRef.current || donations.length === 0) return;
    
    // Clean up existing markers
    const markers = document.querySelectorAll('.pickup-marker, .destination-marker');
    markers.forEach(marker => marker.remove());
    
    // Add markers with consistent styling
    donations.forEach(donation => {
      if (donation.coords) {
        // Create a cleaner marker element
        const pickupEl = document.createElement('div');
        pickupEl.className = 'pickup-marker';
        pickupEl.style.width = '32px';
        pickupEl.style.height = '32px';
        pickupEl.style.backgroundSize = 'contain';
        pickupEl.style.backgroundRepeat = 'no-repeat';
        pickupEl.style.backgroundImage = donation.isPickedUp 
          ? 'url(https://cdn-icons-png.flaticon.com/512/9356/9356230.png)'  // Completed pickup icon
          : 'url(https://cdn-icons-png.flaticon.com/512/9356/9356283.png)'; // Pending pickup icon
        pickupEl.style.cursor = 'pointer';
        
        new mapboxgl.Marker(pickupEl)
          .setLngLat(donation.coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(
                `<h3>${donation.restaurant_title}</h3>
                 <p><strong>${donation.name}</strong> - ${donation.weight} oz</p>
                 <p><small>${donation.isPickedUp ? '✓ Picked up' : '⟳ Waiting for pickup'}</small></p>
                 <p><small>${donation.location}</small></p>`
              )
          )
          .addTo(mapRef.current);
      }
      
      if (donation.destinationCoords) {
        const destEl = document.createElement('div');
        destEl.className = 'destination-marker';
        destEl.style.width = '32px';
        destEl.style.height = '32px';
        destEl.style.backgroundSize = 'contain';
        destEl.style.backgroundRepeat = 'no-repeat';
        destEl.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4781/4781177.png)'; // Destination icon
        destEl.style.cursor = 'pointer';
        
        new mapboxgl.Marker(destEl)
          .setLngLat(donation.destinationCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(
                `<h3>Destination</h3>
                 <p>${donation.destination}</p>
                 <p><small>For: ${donation.name}</small></p>`
              )
          )
          .addTo(mapRef.current);
      }
    });
  }, [donations]);
  
  // Remaining utility functions (checkProximityToLocations, calculateDistance, etc.)
  const checkProximityToLocations = () => {
    if (!currentLocation) return;
    
    donations.forEach(donation => {
      if (donation.coords && !donation.isPickedUp) {
        const distance = calculateDistance(
          currentLocation[1], currentLocation[0],
          donation.coords[1], donation.coords[0]
        );
        
        if (distance < 0.2) {
          toast.info(`You're near pickup for ${donation.name}`, {
            action: {
              label: "Mark Picked Up",
              onClick: () => markAsPickedUp(donation.id)
            },
            duration: 10000
          });
        }
      }
      
      if (donation.destinationCoords && donation.isPickedUp) {
        const distance = calculateDistance(
          currentLocation[1], currentLocation[0],
          donation.destinationCoords[1], donation.destinationCoords[0]
        );
        
        if (distance < 0.2) {
          toast.info(`You've arrived at the destination for ${donation.name}`, {
            action: {
              label: "Mark Delivered",
              onClick: () => markAsDelivered(donation.id)
            },
            duration: 10000
          });
        }
      }
    });
  };
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };
  
  const deg2rad = (deg: number) => deg * (Math.PI/180);
  
  const markAsPickedUp = (donationId: number) => {
    setDonations(donations.map(d => 
      d.id === donationId ? { ...d, isPickedUp: true } : d
    ));
    
    setSelectedDonations(selectedDonations.map(d => 
      d.id === donationId ? { ...d, isPickedUp: true } : d
    ));
    
    toast.success("Item marked as picked up!");
    addMarkersToMap();
    updateRoute(); // Refresh route after status change
  };
  
  const addMarkersToMap = () => {
    if (!mapRef.current) return;
    
    const markers = document.querySelectorAll('.pickup-marker, .destination-marker');
    markers.forEach(marker => marker.remove());
    
    donations.forEach(donation => {
      if (donation.coords) {
        const el = document.createElement('div');
        el.className = 'pickup-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundImage = donation.isPickedUp 
          ? 'url(https://cdn-icons-png.flaticon.com/512/9356/9356230.png)'
          : 'url(https://cdn-icons-png.flaticon.com/512/9356/9356283.png)';
        
        new mapboxgl.Marker(el)
          .setLngLat(donation.coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(
                `<h3>${donation.restaurant_title}</h3>
                 <p><strong>${donation.name}</strong> - ${donation.weight} oz</p>
                 <p><small>${donation.isPickedUp ? '✓ Picked up' : '⟳ Waiting for pickup'}</small></p>
                 <p><small>${donation.location}</small></p>`
              )
          )
          .addTo(mapRef.current);
      }
      
      if (donation.destinationCoords) {
        const destEl = document.createElement('div');
        destEl.className = 'destination-marker';
        destEl.style.width = '32px';
        destEl.style.height = '32px';
        destEl.style.backgroundSize = 'contain';
        destEl.style.backgroundRepeat = 'no-repeat';
        destEl.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4781/4781177.png)';
        
        new mapboxgl.Marker(destEl)
          .setLngLat(donation.destinationCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(
                `<h3>Destination</h3>
                 <p>${donation.destination}</p>
                 <p><small>For: ${donation.name}</small></p>`
              )
          )
          .addTo(mapRef.current);
      }
    });
  };
  
  // Enhanced route planning with manual ordering option
  const updateRoute = async () => {
    if (!directionsRef.current || selectedDonations.length === 0) {
      toast.error("Please select at least one donation");
      return;
    }
    
    try {
      setRouteLoading(true);
      directionsRef.current.removeRoutes();
      directionsRef.current.setOrigin(currentLocation);
      
      const pickups = selectedDonations.filter(d => !d.isPickedUp && d.coords);
      const deliveries = selectedDonations.filter(d => d.isPickedUp && d.destinationCoords);
      
      // Use either manual order (selectedDonations order) or optimized order
      const orderedPickups = manualRouteMode ? pickups : optimizeStopOrder(pickups, currentLocation);
      
      // Add waypoints in the appropriate order
      orderedPickups.forEach((donation, index) => {
        if (donation.coords) {
          directionsRef.current.addWaypoint(index, donation.coords);
        }
      });
      
      let finalDestination: [number, number] | null = null;
      
      if (destination) {
        try {
          const destResponse = await axios.get(
            `https://geocode.maps.co/search?q=${encodeURIComponent(destination)}&api_key=67b127218c68c066231087yjl011f86`
          );
          
          if (destResponse.data && destResponse.data.length > 0) {
            const lat = destResponse.data[0].lat;
            const lon = destResponse.data[0].lon;
            finalDestination = [parseFloat(lon), parseFloat(lat)];
          }
        } catch (error) {
          console.error("Error getting destination coordinates:", error);
        }
      } 
      else if (deliveries.length > 0 && deliveries[0].destinationCoords) {
        finalDestination = deliveries[0].destinationCoords;
      }
      
      if (finalDestination) {
        directionsRef.current.setDestination(finalDestination);
        
        // Add remaining delivery destinations as waypoints
        const orderedDeliveries = manualRouteMode ? deliveries : deliveries;
        orderedDeliveries.slice(1).forEach((donation, index) => {
          if (donation.destinationCoords) {
            directionsRef.current.addWaypoint(orderedPickups.length + index, donation.destinationCoords);
          }
        });
      } else if (orderedPickups.length > 0 && orderedPickups[orderedPickups.length - 1].coords) {
        directionsRef.current.setDestination(orderedPickups[orderedPickups.length - 1].coords);
      } else {
        toast.error("No valid destination found");
        setRouteLoading(false);
        return;
      }
      
      toast.success(`Route created with ${orderedPickups.length + deliveries.length} stops`);
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("Failed to update route");
    } finally {
      setRouteLoading(false);
    }
  };
  
  const optimizeStopOrder = (donations: Donation[], startPoint: [number, number]) => {
    const result: Donation[] = [];
    const unvisited = [...donations];
    let currentPoint = startPoint;
    
    while (unvisited.length > 0) {
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      unvisited.forEach((donation, index) => {
        if (donation.coords) {
          const distance = calculateDistance(
            currentPoint[1], currentPoint[0],
            donation.coords[1], donation.coords[0]
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });
      
      const nextDonation = unvisited[closestIndex];
      result.push(nextDonation);
      
      if (nextDonation.coords) {
        currentPoint = nextDonation.coords;
      }
      
      unvisited.splice(closestIndex, 1);
    }
    
    return result;
  };
  
  const addRecommendedDonation = (donation: Donation) => {
    if (!selectedDonations.some(d => d.id === donation.id)) {
      setSelectedDonations([...selectedDonations, donation]);
      setRecommendedDonations(recommendedDonations.filter(d => d.id !== donation.id));
      toast.success(`Added ${donation.name} to your route`);
      updateRoute();
    }
  };
  
  const createRouteToSingleDonation = (donation: Donation) => {
    if (!directionsRef.current || !donation.coords) {
      toast.error("Cannot create route to this donation");
      return;
    }
    
    try {
      setRouteLoading(true);
      directionsRef.current.removeRoutes();
      directionsRef.current.setOrigin(currentLocation);
      
      if (!donation.isPickedUp && donation.coords) {
        directionsRef.current.setDestination(donation.coords);
        toast.success(`Route created to pickup ${donation.name}`);
      } 
      else if (donation.isPickedUp && donation.destinationCoords) {
        directionsRef.current.setDestination(donation.destinationCoords);
        toast.success(`Route created to deliver ${donation.name}`);
      } else {
        toast.error("Cannot determine route destination");
      }
    } catch (error) {
      console.error("Error creating single route:", error);
      toast.error("Failed to create route");
    } finally {
      setRouteLoading(false);
    }
  };
  
  const toggleDonationSelection = (donation: Donation) => {
    if (selectedDonations.find(d => d.id === donation.id)) {
      setSelectedDonations(selectedDonations.filter(d => d.id !== donation.id));
    } else {
      setSelectedDonations([...selectedDonations, donation]);
      
      if (selectedDonations.length === 0) {
        createRouteToSingleDonation(donation);
      }
    }
  };
  
  // New functions for reordering
  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...selectedDonations];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setSelectedDonations(newOrder);
  };
  
  const moveItemDown = (index: number) => {
    if (index === selectedDonations.length - 1) return;
    const newOrder = [...selectedDonations];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedDonations(newOrder);
  };
  
  const toggleRouteMode = () => {
    setManualRouteMode(!manualRouteMode);
    
    if (!manualRouteMode) {
      toast.info("Manual routing enabled. Rearrange stops by using the arrows.", {
        duration: 4000
      });
    } else {
      toast.info("Auto-optimization enabled. Route will be calculated for efficiency.", {
        duration: 4000
      });
      // Re-optimize and update the route
      updateRoute();
    }
  };
  
  const markAsDelivered = async (donationId: number) => {
    const donation = donations.find(d => d.id === donationId);
    
    if (!donation?.isPickedUp) {
      toast.error("You need to pick up this item before marking it as delivered");
      return;
    }
    
    if (donation.destinationCoords) {
      const distance = calculateDistance(
        currentLocation[1], currentLocation[0],
        donation.destinationCoords[1], donation.destinationCoords[0]
      );
      
      if (distance > 0.5) {
        toast.error("You need to be at the destination to mark item as delivered");
        return;
      }
    }
    
    try {
      const { error } = await supabase
        .from('donation')
        .update({ status: "delivered" })
        .eq('id', donationId);
        
      if (error) throw error;
      
      toast.success("Item successfully delivered!");
      
      setDonations(donations.filter(d => d.id !== donationId));
      setSelectedDonations(selectedDonations.filter(d => d.id !== donationId));
      
      // Update the route if there are still items selected
      if (selectedDonations.length > 1) {
        updateRoute();
      }
    } catch (error) {
      console.error("Error marking donation as delivered:", error);
      toast.error("Failed to update donation status");
    }
  };
  
  useEffect(() => {
    if (directionsRef.current && currentLocation) {
      directionsRef.current.setOrigin(currentLocation);
    }
  }, [currentLocation]);
  
  useEffect(() => {
    if (mapRef.current && directionsRef.current) {
      mapRef.current.on('route', (e) => {
        if (e && e.route) {
          const bounds = e.route.bbox;
          if (bounds) {
            setRouteBounds([
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]]
            ]);
            
            findDonationsNearRoute(bounds);
          }
        }
      });
    }
  }, [mapRef.current, directionsRef.current]);
  
  const findDonationsNearRoute = (bounds: number[]) => {
    if (!bounds || bounds.length !== 4) return;
    
    const bufferDegrees = 0.01;
    const expandedBounds = [
      bounds[0] - bufferDegrees,
      bounds[1] - bufferDegrees,
      bounds[2] + bufferDegrees,
      bounds[3] + bufferDegrees
    ];
    
    const nearbyDonations = donations.filter(donation => {
      if (selectedDonations.some(d => d.id === donation.id)) {
        return false;
      }
      
      if (donation.coords) {
        const [lon, lat] = donation.coords;
        const isWithinBounds = 
          lon >= expandedBounds[0] && 
          lon <= expandedBounds[2] && 
          lat >= expandedBounds[1] && 
          lat <= expandedBounds[3];
        
        return isWithinBounds;
      }
      
      return false;
    });
    
    setRecommendedDonations(nearbyDonations.slice(0, 3));
  };
  
  // Clean, minimalist UI with enhanced route control
  return (
    <SidebarProvider>
      <Toaster position="top-right" expand={true} richColors />
      <div className="flex w-full h-screen overflow-hidden bg-white">
        <div className="w-fit">
          <AppSidebar />
        </div>
        
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* Simplified header */}
          <div className="px-6 py-3 border-b bg-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium flex items-center">
                <Truck className="mr-2 h-5 w-5 text-primary" />
                Driver Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-4 w-4 mr-1" />
                {showSidebar ? "Hide Panel" : "Show Panel"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => mapRef.current?.flyTo({ center: currentLocation, zoom: 15 })}
              >
                <MapPin className="h-3 w-3 mr-1" />
                My Location
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 h-full overflow-hidden">
            {/* Expanded map area */}
            <div className={`${showSidebar ? 'col-span-3' : 'col-span-4'} h-full relative`}>
              <div ref={mapContainerRef} className="w-full h-full" />
              
              {/* Minimalist current location indicator */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-sm z-10 flex items-center">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                <span className="text-xs font-medium text-blue-900">Live Location</span>
              </div>
              
              {/* Route summary overlay when route is active */}
              {routeDistance > 0 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-md p-3 shadow-sm z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <RouteIcon className="h-3 w-3 mr-1 text-blue-500" />
                      <span className="text-xs font-medium">{routeDistance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-blue-500" />
                      <span className="text-xs font-medium">
                        {routeDuration < 60 
                          ? `${routeDuration} min` 
                          : `${Math.floor(routeDuration / 60)}h ${routeDuration % 60}m`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Layers className="h-3 w-3 mr-1 text-blue-500" />
                      <span className="text-xs font-medium">{selectedDonations.length} stops</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Streamlined right sidebar */}
            {showSidebar && (
              <div className="col-span-1 h-full overflow-y-auto border-l p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="destination" className="text-xs font-medium text-gray-500">
                        Set Final Destination
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-xs ${manualRouteMode ? 'bg-blue-50 text-blue-700' : ''}`}
                        onClick={toggleRouteMode}
                      >
                        {manualRouteMode ? (
                          <><RotateCcw className="h-3 w-3 mr-1" /> Auto</>
                        ) : (
                          <><ArrowDownUp className="h-3 w-3 mr-1" /> Custom</>
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        id="destination" 
                        placeholder="Enter destination address"
                        className="text-sm h-9"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                      <Button 
                        onClick={updateRoute}
                        disabled={selectedDonations.length === 0 || routeLoading}
                        size="sm"
                        className="px-3 whitespace-nowrap"
                      >
                        {routeLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>Route</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Recommended donations with cleaner design */}
                {recommendedDonations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      Nearby Pickups
                    </h3>
                    
                    <div className="space-y-2">
                      {recommendedDonations.map(donation => (
                        <Card key={donation.id} className="p-2 bg-white border border-dashed border-amber-200">
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{donation.name}</p>
                              <p className="text-xs text-gray-500 truncate">{donation.restaurant_title}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-xs h-7 text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                              onClick={() => addRecommendedDonation(donation)}
                            >
                              Add
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Selected donations with reordering controls */}
                <div className="mb-4">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Selected Stops ({selectedDonations.length})
                  </h3>
                  
                  {selectedDonations.length > 0 ? (
                    <div className="space-y-1.5 mb-4">
                      {selectedDonations.map((donation, index) => (
                        <Card 
                          key={donation.id} 
                          className="p-2 bg-white border-l-4 border-l-green-500"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{donation.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {donation.isPickedUp ? 'For delivery' : 'For pickup'}
                                </p>
                              </div>
                            
                              <div className="flex items-center ml-2">
                                {manualRouteMode && (
                                  <div className="flex flex-col mr-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={index === 0}
                                      className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                                      onClick={() => moveItemUp(index)}
                                    >
                                      <MoveUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={index === selectedDonations.length - 1}
                                      className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                                      onClick={() => moveItemDown(index)}
                                    >
                                      <MoveDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  onClick={() => toggleDonationSelection(donation)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {manualRouteMode && selectedDonations.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs h-7"
                          onClick={updateRoute}
                        >
                          Apply Order Changes
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-4 italic">
                      No deliveries selected yet
                    </p>
                  )}
                </div>
                
                {/* Available donations with cleaner design */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                    <Package className="h-3 w-3 mr-1 text-gray-500" />
                    Available Deliveries
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : donations.length === 0 ? (
                    <Card className="p-3 text-center text-sm text-gray-500 bg-white">
                      No deliveries assigned
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {donations
                        .filter(d => !selectedDonations.some(sd => sd.id === d.id))
                        .map(donation => {
                          const { text } = TimeAway(donation.expiry_date, 'Expired');
                          
                          return (
                            <Card 
                              key={donation.id} 
                              className="p-3 transition-all border border-gray-100 hover:border-blue-200 cursor-pointer bg-white"
                              onClick={() => toggleDonationSelection(donation)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{donation.name}</h3>
                                  <p className="text-xs text-gray-500 truncate">{donation.restaurant_title}</p>
                                </div>
                                
                                <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                  ${donation.priority === 'high' ? 'bg-red-50 text-red-700' :
                                    donation.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                                    'bg-green-50 text-green-700'}`}
                                >
                                  {donation.priority}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{text}</span>
                                </div>
                                <span className="font-medium">{donation.weight} oz</span>
                              </div>
                              
                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                                {donation.isPickedUp ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsDelivered(donation.id);
                                    }}
                                  >
                                    <CheckSquare className="h-3 w-3 mr-1" />
                                    Mark Delivered
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsPickedUp(donation.id);
                                    }}
                                  >
                                    <ShoppingBag className="h-3 w-3 mr-1" />
                                    Mark Picked Up
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs text-gray-600 hover:text-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    createRouteToSingleDonation(donation);
                                  }}
                                >
                                  <RouteIcon className="h-3 w-3 mr-1" />
                                  Route
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}