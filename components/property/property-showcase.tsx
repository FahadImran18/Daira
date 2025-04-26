"use client";

import Link from 'next/link';
import { motion } from '@/lib/framer-motion';
import { Building, Home, Building2, Warehouse, Trees } from 'lucide-react';

const propertyTypes = [
  { 
    name: 'Houses', 
    icon: Home, 
    link: '/properties?type=house',
    description: 'From cozy family homes to luxurious villas',
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  { 
    name: 'Apartments', 
    icon: Building, 
    link: '/properties?type=apartment',
    description: 'Modern apartments in prime locations',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    name: 'Plots', 
    icon: Building2, 
    link: '/properties?type=plot',
    description: 'Residential and commercial plots for development',
    color: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  { 
    name: 'Commercial', 
    icon: Warehouse, 
    link: '/properties?type=commercial',
    description: 'Offices, shops, and other commercial properties',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  { 
    name: 'Farmhouses', 
    icon: Trees, 
    link: '/properties?type=farmhouse',
    description: 'Expansive farmhouses for weekend getaways',
    color: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400'
  },
];

export default function PropertyShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {propertyTypes.map((type, index) => {
        const Icon = type.icon;
        
        return (
          <Link href={type.link} key={index}>
            <motion.div 
              className={`p-6 rounded-xl ${type.color} border border-transparent hover:border-emerald-600/20 hover:shadow-lg transition-all duration-300`}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`rounded-full ${type.iconColor} bg-white/80 dark:bg-gray-800 p-3 w-14 h-14 flex items-center justify-center mb-4`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}