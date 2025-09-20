import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GiArtificialIntelligence } from "react-icons/gi";

import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <div className=" cursor-pointer fixed z-5 w-full backdrop:blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 ">
      {/* <img src={assets.logo}  alt="logo" className='w-32 sm:w-44' onClick={()=>{
            navigate('/') // agar user ne logo pe click kiya to home page pe redirect
        }}/> */}

      <div
        className="cursor-pointer flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        {/* AI Icon */}
        <GiArtificialIntelligence className="text-4xl text-[#6C63FF]" />

        {/* Logo Text */}
        <span className="text-3xl font-bold text-[#6C63FF]">
          Nexa<span className="text-[#8A7DFF]">Ai</span>
        </span>
      </div>

      {
        // if user is logged in userButton open other wise getstarted button
        user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </button>
          // {/* right arrow for get started button */}
        )
      }
    </div>
  );
};

export default Navbar;
