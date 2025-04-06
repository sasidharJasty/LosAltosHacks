import { useState } from "react";

import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Link } from "react-router-dom";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import "./App.css";
import { Button } from "./components/ui/button";

import {
  FaUtensils,
  FaBarcode,
  FaChartLine,
  FaClipboardList,
  FaCheck,
  FaMobileAlt,
  FaLeaf,
  FaAppleAlt,
  FaDrumstickBite,
} from "react-icons/fa";

const FloatingIcon = ({ icon, className, duration = 3, delay = 0 }:any) => (
  <motion.div
    className={`absolute text-green-500/20 ${className}`}
    animate={{
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    {icon}
  </motion.div>
);

const GradientOrb = ({ className }:any) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
  </div>
);

const features = [
  {
    title: "Smart Donation Matching",
    description:
      "The platform automatically categorizes food donations using AI-powered image recognition and matches them with food banks based on factors like nutritional needs, perishability, and demand.",
    icon: <FaMobileAlt className="w-6 h-6" />,
    visualization: (
      <div className="h-full flex items-center justify-center p-8">
        <div className="relative flex space-x-8">
          {/* Web Browser */}
          <motion.div
            className="relative bg-white p-4 rounded-xl shadow-lg w-64"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-4 bg-gray-100 rounded-full w-full mb-2 flex items-center px-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-10 bg-gray-50 rounded-lg flex items-center px-3"
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 },
                  }}
                >
                  <span className="text-sm text-gray-600">
                    Menu Item {i + 1}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mobile Phone */}
          <motion.div
            className="relative bg-white p-3 rounded-xl shadow-lg w-32"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-8 bg-gray-50 rounded-lg flex items-center px-2"
                  variants={{
                    hidden: { x: 20, opacity: 0 },
                    visible: { x: 0, opacity: 1 },
                  }}
                >
                  <span className="text-xs text-gray-600">Item {i + 1}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-2 absolute bottom-1 left-[25%]"></div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    title: "Recipe Optimization",
    description:
      "Suggests meal recipes based on donated ingredients and available inventory to maximize food utilization with the lowest cost.",
    icon: <FaUtensils className="w-6 h-6" />,
    visualization: (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          className="relative bg-white p-6 rounded-xl shadow-lg w-80"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3">
            <motion.div
              className="bg-green-50 p-3 rounded-lg flex items-center justify-between"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center space-x-2">
                <FaDrumstickBite className="text-amber-600" />
                <span className="text-sm">Grilled Chicken</span>
              </div>
              <motion.div
                className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                $20
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-green-50 p-3 rounded-lg flex items-center justify-between"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center space-x-2">
                <FaLeaf className="text-green-600" />
                <span className="text-sm">Garden Salad</span>
              </div>
              <motion.div
                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                $12
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    title: "Seamless Food Exchange",
    description:
      "Enables smooth, efficient, and hassle-free food transfers between restaurants and food banks, ensuring surplus food reaches those in need without delays.",
    icon: <FaBarcode className="w-6 h-6" />,
    visualization: (
      <div className="h-full flex items-center justify-center p-6">
        <div className="relative">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-48 h-32 bg-gray-50 rounded-lg flex flex-col items-center justify-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FaBarcode className="w-32 h-16 text-gray-800" />
              <motion.div
                className="h-1 w-1 bg-red-500 rounded-full"
                animate={{
                  x: [-100, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.div>
            <motion.div
              className="mt-4 flex items-center justify-center space-x-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaCheck className="text-green-500" />
              <span className="text-sm text-gray-600">Ready for pickup</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    title: "AI-Powered Predictions",
    description:
      "Our AI system analyzes ordering patterns to help predict demand and reduce food waste while ensuring everyone gets their preferred meal.",
    icon: <FaChartLine className="w-6 h-6" />,
    visualization: (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg w-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-32">
              {[0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.9].map((height, index) => (
                <motion.div
                  key={index}
                  className="flex-1 bg-green-200 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${height * 100}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
            <motion.div
              className="h-1 bg-green-500 rounded-full"
              animate={{
                scaleX: [0, 1],
                opacity: [0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    title: "Kitchen Dashboard",
    description:
      "Kitchen staff can efficiently manage orders through a real-time dashboard showing upcoming orders and dietary requirements.",
    icon: <FaClipboardList className="w-6 h-6" />,
    visualization: (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg w-80"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-gray-50 p-3 rounded-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                    <span className="text-sm">Order #{i + 1}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    12:{(10 + i * 5).toString().padStart(2, "0")} PM
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  User ID: {1000 + i*274}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    ),
  },
];

function App() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50 to-green-100">
      <Navbar />
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <motion.div
          className=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -left-[20%] -top-[20%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-[20%] -bottom-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
          />
        </motion.div>

        {/* Main Content */}
        <div className="mt-16">
          <Hero />
        </div>
        <div className="relative container mx-auto px-6 ">
          {/* Detailed Features Section */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-40 mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900">
              Revolutionizing Food Rescue,
                <span className="text-green-500 ml-2">One Meal at a Time</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Effortlessly link food donors with recipients using AI-driven logistics and real-time data.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Features List */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? "bg-green-50 border-l-4 border-green-500"
                        : "hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 p-2 rounded-lg ${
                          activeFeature === index
                            ? "bg-green-500 text-white"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Feature Visualization */}
              <div className="relative h-[600px] bg-white/30 rounded-2xl overflow-hidden backdrop-blur-sm">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 p-8"
                >
                  {features[activeFeature].visualization}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-32 mb-20"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-12 text-white relative overflow-hidden group">
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-[url('/grid.svg')] opacity-30"
              />
              <motion.div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 md:w-2/3">
                <h2 className="text-4xl font-bold mb-6">
                We're here to revolutionize food distribution!
                </h2>
                <p className="text-lg text-white/90 mb-8">
                Our platform seamlessly connects restaurants, grocery stores, and food banks—ensuring surplus food is efficiently matched, delivered, and utilized to reduce waste and fight hunger.


                </p>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Join Us in Making a Difference!








                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;

function Hero() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Elements */}
      <BackgroundGrid />

      {/* Gradient Orbs */}
      <GradientOrb className="w-96 h-96 bg-green-200 left-0 top-0" />
      <GradientOrb className="w-96 h-96 bg-blue-200 right-0 bottom-0" />

      {/* Floating Icons */}
      <FloatingIcon
        icon={<FaLeaf className="w-12 h-12" />}
        className="top-32 left-1/4"
        duration={4}
      />
      <FloatingIcon
        icon={<FaUtensils className="w-10 h-10" />}
        className="bottom-32 right-1/4"
        duration={3.5}
        delay={0.5}
      />
      <FloatingIcon
        icon={<FaAppleAlt className="w-8 h-8" />}
        className="top-48 right-1/3"
        duration={4.5}
        delay={1}
      />

      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative text-center space-y-12 z-10"
      >
        <h1 className="text-6xl md:text-7xl font-bold !mt-[18vh] text-gray-900 tracking-tight">
        
Rescuing Food, Nourishing

          <br />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-green-500 inline-flex mt-6"
          >
            <span className="mr-2">
              {
                useTypewriter({
                  words: ["Communities", "Individuals", "Growth", "Innovation"],
                  loop: true,
                  delaySpeed: 2500,
                  deleteSpeed: 50,
                  typeSpeed: 70,
                })[0]
              }
            </span>
            <Cursor cursorStyle="_" cursorColor="#22C55E" />
          </motion.span>
        </h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          An AI-powered platform connecting donors and food banks to reduce waste and fight hunger using smart technology.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 !mt-18"
        >
          <Link to="/login">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-xl
                shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-0.5
                relative overflow-hidden group"
            >
              <motion.div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-300" />
              Get Started
            </Button>
          </Link>
          <Link to="/about">
            <Button
              variant="outline"
              className="border-green-500 text-green-600 px-8 py-6 text-lg rounded-xl
                hover:bg-green-50 transition-all duration-300"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
