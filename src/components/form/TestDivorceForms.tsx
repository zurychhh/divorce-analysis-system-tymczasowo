"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useGUSData from "@/hooks/useGUSData";
import DivorceForm from "@/components/form/DivorceForm";
import DivorceFormDetailed from "@/components/form/DivorceFormDetailed";

const TestDivorceForms = () => {
 const [showDetailed, setShowDetailed] = useState(false);
 const { data: gusData, loading, error } = useGUSData({ 
   dataType: "divorceByRegion" 
 });

 return (
   <div className="p-4">
     <div className="mb-4 flex justify-between items-center">
       <Button 
         onClick={() => setShowDetailed(!showDetailed)}
         variant="outline"
       >
         {showDetailed ? "Pokaż podstawowy" : "Pokaż szczegółowy"}
       </Button>
       <div className="text-sm">
         {loading && "Ładowanie danych GUS..."}
         {error && "Błąd ładowania danych GUS"}
         {gusData && "Dane GUS załadowane"}
       </div>
     </div>
     
     {showDetailed ? <DivorceFormDetailed /> : <DivorceForm />}
   </div>
 );
};

export default TestDivorceForms;
