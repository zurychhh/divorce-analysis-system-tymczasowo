import { useState, useEffect } from "react";
import { fetchGUSData } from "@/services/gusAPI";

interface UseGUSDataProps {
 dataType: "divorceByRegion" | "marriageDuration";
}

const MOCK_DATA = {
 divorceByRegion: {
   data: [
     { id: "dolnoslaskie", name: "Dolnośląskie", divorceCount: 1200 },
     { id: "mazowieckie", name: "Mazowieckie", divorceCount: 2100 }
   ],
   average: 1650
 }
};

const USE_MOCK = false; // Toggle between mock/real data

const useGUSData = ({ dataType }: UseGUSDataProps) => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
   const getData = async () => {
     try {
       if (USE_MOCK) {
         setTimeout(() => {
           setData(MOCK_DATA[dataType]);
           setLoading(false);
         }, 1000);
         return;
       }

       const result = await fetchGUSData(dataType);
       setData(result);
       setLoading(false);
     } catch (err) {
       setError(err);
       setLoading(false);
     }
   };

   getData();
 }, [dataType]);

 return { data, loading, error };
};

export default useGUSData;
