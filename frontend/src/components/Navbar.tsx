import Logo from "../assets/image.png";
import { DropDownNavbar } from "./NavMenu";


export default function Navbar() {
  return (
    <nav className="bg-white w-full dark:bg-[#0a0a0a] left-0 shadow backdrop-blur-md fixed top-0 z-50  p-1">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            className="invert dark:invert-0 mix-blend-difference h-[50px]"
            src={Logo}
            alt="Logo"
          />

        </a>
        <button
          data-collapse-toggle="navbar-dropdown"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-[#0a0a0a] dark:focus:ring-gray-600"
          aria-controls="navbar-dropdown"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className="hidden w-full md:block md:w-auto justify-items-center" id="navbar-dropdown">
          <ul className="flex flex-col font-medium ml-20 p-4 justify-items-center mx-auto w-fit md:p-0 mt-4 border border-gray-100 rounded-lg  md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  dark:border-gray-700">
            <li>
              <a
                href="#"
                className="block my-auto h-fit mt-2 text-white bg-red-700 rounded md:bg-transparent md:text-neutral-700 md:p-0 md:dark:text-indigo-500 dark:bg-indigo-500 md:dark:bg-transparent"
                aria-current="page"
              >
                Home
              </a>
            </li>
            <DropDownNavbar />
          </ul>
        </div>
        <div className="flex">
          <a href="#waitlist" className="mr-2  pr-2">
            <button className="w-fit px-5 py-2 hover:bg-green-500 hover:text-white transition-all rounded-md">
              Contact Us
            </button>
          </a>
          <a href="/login">
            <button className="w-fit px-7 py-2 bg-green-500 transition-all text-white hover:scale-105 hover:shadow-md hover:shadow-green-500 hover:bg-transparent hover:border-green-500 border hover:text-green-500 rounded-md">
              Get Started
            </button>
          </a>
        </div>
      </div>
    </nav>
  );
}
