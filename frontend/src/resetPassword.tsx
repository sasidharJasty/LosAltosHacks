import  { useState, FormEvent } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import picture from "./assets/1bda7cc384dade154857ced4b7c627f9-full.jpg";
import logo from "./assets/A.png";
import {useAuthToken } from "./lib/constants";


const Reset = () => {
  const { api } = useAuthToken();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const history = useNavigate();
  const  {resetId} = useParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if(password === password2){
    try {
      await api.post("/password_reset/confirm/", {
        password: password,
        token: resetId,
      });
      setError(null);
      alert("Login with your new password");


      setError("");
      history("/login");
      } catch (error:any) {
          console.log(error);
          setError(error.response.data.password ); // handle error properly
      }
  }else {
    setError("Password does not match");
  }
  setLoading(false);
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
            <form onSubmit={handleReset} className="w-[70%] mx-auto flex flex-col">
              <div className="flex justify-center mb-4">
                <img src={logo} className="w-[30%] rounded-xl" alt="Logo" />
              </div>
              <h1 className="text-center font-bold text-2xl">Reset your account's password</h1>
              <h2 className="text-center text-green-400 text-lg mb-4">Please enter you new password below</h2>
              <Label className="text-lg mb-1">New Password</Label>
              <input
                type="password"
                className="border rounded-lg px-4 py-2 w-full mb-4"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Label className="text-lg mb-1">Confirm Password</Label>
              <input
                type="password"
                className="border rounded-lg px-4 py-2 w-full mb-4"
                placeholder="*********"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
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
