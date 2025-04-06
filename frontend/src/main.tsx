import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider.tsx";
import App from "./App.tsx";
import LoginForm from "./Login.tsx";
import SignupForm from "./Signup.tsx";
import Dashbord from "./dashbord.tsx";
import Inventory from "./Donors/Inventory.tsx";
import FoodBankInventory from "./FoodBanks/Inventory.tsx"
import ResetPassword from "./resetPassword.tsx";
import AgStressGlobe from "./Shit.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NDVIMap from "./CalMap.tsx";
import NasaHeatmap from "./Heatmap.jsx";
import SatelliteScannerScreen from "./Screen.tsx";
import DriverDashboard from "./Volunteer/drive.js"
import History from "./Donors/History.tsx"
import Location from "./FoodBanks/Locations.tsx"
import FoodBankMealPlans from "./FoodBanks/MealPlans.tsx"
import Individuals from "./Individuals.tsx"


import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashbord />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/donor/inventory" element={<Inventory />} />
          <Route path="/donor/history" element={<History />} />
          <Route path="/foodbank/locations" element={<Location />} />
          <Route path="/foodbank/inventory" element={<FoodBankInventory />} />
          <Route path="/reset-password-form/:resetId" element={<ResetPassword />} />
          <Route path = "/foodbank/mealplans" element={<FoodBankMealPlans/>} />
          <Route path = "/calmap" element={<NDVIMap/>} />
          <Route path = "/satellitescanner" element={<SatelliteScannerScreen/>} />
          <Route path = "/stuffff" element={<AgStressGlobe/>} />
          <Route path = "/drive" element={<DriverDashboard/>} />
          {/* Smart Menu Insights Routes */}
          <Route path = "/heatmap" element={<NasaHeatmap/>} />
          <Route path = "/individuals" element = {<Individuals/>} />
          {/* Smart Menu Insights Routes */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
