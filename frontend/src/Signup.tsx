import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { useNavigate } from "react-router-dom";
import { useGeolocated } from "react-geolocated";
import logo from "./assets/imageBG.png";
import "react-phone-number-input/style.css";

import React from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { supabase } from "./supabase";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SignupForm = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);  // To control popup visibility
  const [foodBankInfo, setFoodBankInfo] = useState({
    title: '',
    address: '',
    website: '',
    description: '',
  });
  const handleFoodBankInfoChange = (e:any) => {
    const { name, value } = e.target;
    setFoodBankInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Additional info state


  const profileImage="";

  const [loading, setLoading] = useState(false);

  const history = useNavigate();

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        history("/dashboard");
      }
    };

    checkUser();
  }, []);


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'receiver'&&foodBankInfo.title==='') {
      setIsPopupOpen(true);  // Open the popup if the role is receiver
      return;  // Don't submit the form, just return
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            profile_image: profileImage,
            role:role,
            foodbank:foodBankInfo,
            location: coords ? `${coords.latitude}, ${coords.longitude}` : null,
          },
        },
      });

      if (error) throw error;

      alert("Check your email for the confirmation link!");
      history("/login");
    } catch (error:any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-2/5 w-full flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="w-full max-w-md space-y-8">
          <a href="/" className="flex items-center justify-center space-x-3">
            <img src={logo} className="w-16 md:w-20 rounded-xl" alt="Logo" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              FreshBay
            </h1>
          </a>

          <form onSubmit={handleSignup} className="mt-8 space-y-6">
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Create your account
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 
                    text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                    transition duration-200 ease-in-out"
                    placeholder="John"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 
                    text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                    transition duration-200 ease-in-out"
                    placeholder="Doe"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 
                  text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                  transition duration-200 ease-in-out"
                  placeholder="example@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Role
                </Label>


                <Select onValueChange={setRole} >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select a Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="donor">Donor</SelectItem>
                        <SelectItem value="receiver">Receiver</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
              </div>



              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 
                  text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                  transition duration-200 ease-in-out"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>

            <Button
              type="submit"
              className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium 
              rounded-lg transition duration-200 ease-in-out ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
              onClick={() => {
                if (role === 'receiver') {
                  setIsPopupOpen(true);  // Open popup if role is 'receiver'
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
            
          </form>
        </div>
      </div>

      {/* Right Side - Animation Section */}
      <div className="hidden md:block md:w-3/5 relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Calendar Grid Background */}
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 gap-1 p-8 opacity-10">
            {[...Array(35)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="bg-white/10 rounded-lg"
              />
            ))}
          </div>

          {/* Floating AI Analysis Elements */}
          <motion.div
            animate={{
              y: [-10, 10],
              opacity: [0.5, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              yoyo: true,
            }}
            className="absolute top-20 left-20 p-4 bg-white/10 backdrop-blur-md rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-emerald-400 rounded-full"
              />
              <span className="text-white/90 text-sm">
                Analyzing meal preferences...
              </span>
            </div>
            <motion.div
              initial={{ width: "30%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1 bg-emerald-400/50 rounded-full mt-2"
            />
          </motion.div>

          {/* Floating Menu Cards */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute right-20 top-40 w-64 space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.5, x: 10 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm p-3 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center"
                  >
                    <span className="text-white/90 text-xs">#{i}</span>
                  </motion.div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                    <div className="h-2 w-16 bg-white/20 rounded-full" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Nutrition Data Visualization */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute bottom-40 left-20 w-72 h-72"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute inset-0 border-2 border-white/10 rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg) scale(${1 - i * 0.1})`,
                  }}
                >
                  <motion.div
                    className="w-2 h-2 bg-white/40 rounded-full"
                    style={{ transform: `translate(${50 + i * 5}%, -50%)` }}
                  />
                </motion.div>
              ))}
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/90 text-sm font-medium"
              >
                Nutrition
                <br />
                Analytics
              </motion.div>
            </div>
          </motion.div>

          {/* Smart Suggestions */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-20 right-20 p-4 bg-white/10 backdrop-blur-sm rounded-xl w-64"
          >
            <div className="flex items-center space-x-2 mb-3">
              <svg
                className="w-5 h-5 text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-white/90 text-sm">Smart Suggestions</span>
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="h-2 bg-white/20 rounded-full"
                  style={{ width: `${70 + i * 10}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-green-500/10" />
        </motion.div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 max-w-2xl"
          >
            <h2 className="text-5xl font-bold tracking-tight">
              Smart Lunch
              <br className="!mt-10" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-emerald-200"
              >
                <span>
                  {
                    useTypewriter({
                      words: [
                        "Planning",
                        "Analytics",
                        "Scheduling",
                        "Made Simple",
                      ],
                      loop: true,
                      delaySpeed: 2000,
                      deleteSpeed: 50,
                      typeSpeed: 70,
                    })[0]
                  }
                </span>
                <Cursor cursorStyle="_" cursorColor="#A7F3D0" />
              </motion.span>
              <br className="!mt-10" />
              Made Easy
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.6,
              }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm"
            >
              <span className="animate-pulse mr-2 h-2 w-2 bg-emerald-400 rounded-full" />
              Powered by Smart Analytics
            </motion.div>
          </motion.div>
        </div>
      </div>
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Food Bank Information</h3>
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={foodBankInfo.title}
                  onChange={handleFoodBankInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                />
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={foodBankInfo.address}
                  onChange={handleFoodBankInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                />
              </div>
              <div className="mb-4">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={foodBankInfo.website}
                  onChange={handleFoodBankInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={foodBankInfo.description}
                  onChange={handleFoodBankInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium 
              rounded-lg transition duration-200 ease-in-out px-4 py-2 "
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default SignupForm;
