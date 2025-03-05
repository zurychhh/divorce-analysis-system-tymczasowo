"use client"

import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const MainSearch = ({ onRegionSelect }) => {
 const regions = [
   "dolnośląskie",
   "kujawsko-pomorskie", 
   "lubelskie",
   "lubuskie",
   "łódzkie",
   "małopolskie",
   "mazowieckie", 
   "opolskie",
   "podkarpackie",
   "podlaskie",
   "pomorskie",
   "śląskie",
   "świętokrzyskie",
   "warmińsko-mazurskie",
   "wielkopolskie",
   "zachodniopomorskie"
 ];

 return (
   <div className="min-h-screen flex flex-col items-center justify-center">
     <div className="max-w-md w-full mx-auto text-center space-y-8">
       <h1 className="text-3xl font-medium dark:text-white">
         Kalkulator symulacji rozwodowej
       </h1>
       
       <Select onValueChange={onRegionSelect}>
         <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-900 border-2 hover:border-gray-300 dark:hover:border-gray-500">
           <SelectValue placeholder="Wybierz województwo" />
         </SelectTrigger>
         <SelectContent className="bg-white dark:bg-gray-900">
           {regions.map(region => (
             <SelectItem key={region} value={region} className="dark:text-white">{region}</SelectItem>
           ))}
         </SelectContent>
       </Select>

       <p className="text-sm text-gray-500 dark:text-gray-400">
         Wybierz województwo, aby rozpocząć analizę
       </p>
     </div>
   </div>
 );
};

export default MainSearch;
