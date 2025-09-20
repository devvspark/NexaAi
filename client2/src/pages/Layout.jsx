import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Menu, X, Sidebar as SidebarIcon } from 'lucide-react'; // renamed icon
import Sidebar from '../components/Sidebar'; // your custom sidebar
import { SignIn,useUser } from '@clerk/clerk-react';
import { GiArtificialIntelligence } from "react-icons/gi";

const Layout = () => {  
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false); // sidebar closed by default

  const {user}=useUser() // only logged in user can seen


  return user? ( //if user is logged in then we display this content
    <div className='flex flex-col items-start justify-start h-screen'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
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
          sidebar
            ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden' /> //ye tabhi chalegaa jab mobile screen ya screen bahut choti hogi tabhi sidebar hatega
            : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden' />
        }
      </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} /> {/* ✅ using your component */}
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet />
        </div>
      </div>
    </div>
  ) :(
    <div className='flex items-center justify-center h-screen'>
      <SignIn/>
    </div>
  )
};

export default Layout;
