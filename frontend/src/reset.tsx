import { useState, FormEvent } from "react";

import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";

import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import picture from "./assets/1bda7cc384dade154857ced4b7c627f9-full.jpg";
import logo from "./assets/A.png";
import {useAuthToken } from "./lib/constants";


const Reset = () => {
  const { api } = useAuthToken();
  const [email, setEmail] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password_reset/", {
        email: email,
      });
      setError(null);
      alert("Password reset link sent to your email, please check your inbox and spam.");


    } catch (error: any) {
      console.log(error);
      const errorMessage = error.response?.data?.detail || "Login failed, please try again.";
      if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      }else {
      setError(errorMessage);
    }
    } finally {
      setLoading(false);
    }
  };



  return (

      <div className="flex flex-col md:flex-row w-screen relative overflow-y-hidden md:h-screen">
        {error && (
          <div className="absolute w-[40%] top-0 ">
            <Alert className="bg-red-400/50">
              <AlertTitle >Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <div className="md:w-[40%] w-full flex flex-col justify-center items-center px-4 md:px-8">
          <div className="flex flex-col w-full justify-center items-center max-h-[100vh]">
            <form onSubmit={handleLogin} className="w-[70%] mx-auto flex flex-col">
              <div className="flex justify-center mb-4">
                <img src={logo} className="w-[30%] rounded-xl" alt="Logo" />
              </div>
              <h1 className="text-center font-bold text-2xl">Forgot your password?</h1>
              <h2 className="text-center text-green-400 text-lg mb-4">Enter your email to reset</h2>
              <Label className="text-lg mb-1">Email</Label>
              <input
                type="email"
                className="border rounded-lg px-4 py-2 w-full mb-4"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
             
              <p className="mt-2 mx-auto w-fit mb-10 text-sm">
              Remember your account? <a href="/signup/" className="text-green-500">Sign up!</a> or <a href="/login/" className="text-green-500">Log in!</a>
            </p>
            <div className="mt-4 space-y-2">
              
              <Button
                type="submit"
                className={`bg-green-500 px-8 py-2 text-white w-full ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </Button>
            </div>
              
            </form>
            
            
            
          </div>
        </div>
        <img className="hidden md:block w-[60%] object-cover" src={picture} alt="Background" />
      </div>

  );
};

export default Reset;
