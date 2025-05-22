import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, FileInput, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Truck size={24} />
            <span className="text-xl font-bold">LogiLabel</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `px-3 py-2 rounded-md ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'} flex items-center space-x-1`
              }
            >
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/import" 
              className={({isActive}) => 
                `px-3 py-2 rounded-md ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'} flex items-center space-x-1`
              }
            >
              <FileInput size={18} />
              <span>Importar</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;