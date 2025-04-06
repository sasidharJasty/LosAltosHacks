import { useState, FormEvent, useEffect } from "react";

import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";

import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";

import logo from "./assets/imageBG.png";
import { TriangleAlert } from "lucide-react";


import { motion } from "framer-motion";
import { supabase } from "./supabase";


const LoginForm = () => {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

 

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      if (error) {
        setError(error.message);
      }
      if(data.user && data.session) {
      navigate("/dashboard");}
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.detail || "Login failed, please try again.";
      if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, []);



  return (

      <div className="min-h-screen flex flex-col md:flex-row">
        {error && (
          <div className="absolute top-4 left-10  w-[90%] md:w-[400px] z-50">
            <Alert className="bg-red-100 border-red-400 text-red-800">
              <TriangleAlert className="h-8 w-8" color="red"/>
              <div className="ml-6">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        <div className="md:w-2/5 w-full flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-gradient-to-br from-emerald-50 to-green-100">
          <div className="w-full max-w-md space-y-8">
            <a
              href="/"
              className="flex items-center justify-center space-x-3 mt-8"
            >
              <img src={logo} className="w-16 md:w-20 rounded-xl" alt="Logo" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                FreshBay
              </h1>
            </a>

            <form onSubmit={handleLogin} className="!mt-16 space-y-6">
              <h2 className="text-center text-2xl font-bold text-gray-900">
                Welcome back
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-md font-medium text-gray-700">
                    Email address
                  </Label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 
                    text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                    transition duration-200 ease-in-out"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-md font-medium text-gray-700">
                    Password
                  </Label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5
                    text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500
                    transition duration-200 ease-in-out"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-center text-sm !mb-4">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href="/signup/"
                    className="font-medium text-green-600 hover:text-green-500 transition-colors"
                  >
                    Sign up
                  </a>
                </p>
                <p className="text-gray-600">
                  Forgot your password?{" "}
                  <a
                    href="/password-reset/"
                    className="font-medium text-green-600 hover:text-green-500 transition-colors"
                  >
                    Reset it
                  </a>
                </p>
              </div>

              <Button
                type="submit"
                className={`w-full !mt-10 py-3 bg-green-600 hover:bg-green-700 text-white font-medium 
                rounded-lg transition duration-200 ease-in-out ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
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
                    Loading...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="hidden md:block md:w-3/5 relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
          {/* Abstract Background Shapes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"
            />
          </motion.div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-white p-12">
            {/* First Lunch Tray */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{
                scale: 1.05,
                rotateZ: -8,
                translateY: -5,
              }}
              className="absolute left-20 top-40 w-72 h-48 bg-white/10 backdrop-blur-lg rounded-xl transform -rotate-12 shadow-xl overflow-hidden cursor-pointer"
            >
              {/* Tray Sections */}
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3">
                <motion.div
                  className="bg-white/20 rounded-lg col-span-2 overflow-hidden"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                >
                  {/* Main dish with food icon */}
                  <motion.div
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                    className="h-full flex items-center justify-center flex-col space-y-2"
                  >
                    <motion.svg
                      className="w-10 h-10 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {/* Plate with food icon */}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M3 6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2M3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 11h8M8 15h8"
                      />
                    </motion.svg>
                    <span className="text-white/90 text-sm font-medium">
                      Main Course
                    </span>
                  </motion.div>
                </motion.div>
                <div className="space-y-2">
                  <motion.div
                    className="bg-white/20 rounded-lg h-1/2"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    {/* Vegetables icon */}
                    <motion.div
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      className="h-full flex items-center justify-center flex-col"
                    >
                      <motion.svg
                        className="w-6 h-6 text-white/90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                      >
                        {/* Carrot/vegetable icon */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v8M8 12h8"
                        />
                      </motion.svg>
                      <span className="text-white/90 text-xs mt-1">
                        Veggies
                      </span>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="bg-white/20 rounded-lg h-[45%]"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    {/* Milk carton icon */}
                    <motion.div
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      className="h-full flex items-center justify-center flex-col"
                    >
                      <motion.svg
                        className="w-6 h-6 text-white/90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {/* Milk carton shape */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M6 4h12v16H6zM6 8h12M9 4v4M15 4v4"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M10 12h4M10 15h4"
                        />
                      </motion.svg>
                      <span className="text-white/90 text-xs mt-1">Milk</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              {/* Tray rim with glow effect */}
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{
                scale: 1.05,
                rotateZ: 16,
                translateY: -5,
              }}
              className="absolute right-20 bottom-40 w-72 h-48 bg-white/10 backdrop-blur-lg rounded-xl transform rotate-12 shadow-xl overflow-hidden cursor-pointer"
            >
              {/* Tray Sections */}
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3">
                <motion.div
                  className="bg-white/20 rounded-lg col-span-2 group"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                >
                  {/* Animated food icons with hover effect */}
                  <motion.div
                    className="h-full flex items-center justify-center flex-col space-y-2"
                    initial={{ opacity: 0.5 }}
                    whileHover={{
                      opacity: 1,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <motion.svg
                      className="w-8 h-8 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 6h18M3 12h18M3 18h18"
                      />
                    </motion.svg>
                    <span className="text-white/90 text-sm font-medium">
                      Today's Special
                    </span>
                  </motion.div>
                </motion.div>
                <div className="space-y-2">
                  <motion.div
                    className="bg-white/20 rounded-lg h-[45%]"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    <motion.div
                      className="h-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.svg
                        className="w-6 h-6 text-white/90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="bg-white/20 rounded-lg h-1/2"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    <motion.div
                      className="h-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.svg
                        className="w-6 h-6 text-white/90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 19V5m0 14l-4-4m4 4l4-4"
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              {/* Tray rim with glow effect */}
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8 max-w-2xl"
            >
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-bold tracking-tight z-10"
              >
                Your Lunch,
                <br />
                <motion.span
                  animate={{
                    color: ["#A7F3D0"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-emerald-200"
                >
                  Smarter
                </motion.span>
              </motion.h2>

              {/* Modern Badge/Pill */}
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
                Powered by AI
              </motion.div>

              {/* Abstract App Visualization */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative mx-auto w-72 h-72"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-4 bg-gradient-to-l from-white/20 to-transparent rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-8 bg-gradient-to-t from-white/20 to-transparent rounded-full"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 1,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg
                    className="w-24 h-24 text-white/90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default LoginForm;
