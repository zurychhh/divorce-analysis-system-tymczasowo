import { useState, useEffect } from "react";
import { fetchGUSData } from "@/services/gusAPI";

interface UseGUSDataProps {
 dataType: "divorceByRegion" | "marriageDuration";
}

// Usuwamy definicję MOCK_DATA oraz flagę USE_MOCK

const useGUSData = ({ dataType }: UseGUSDataProps) => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<Error | null>(null);

 useEffect(() => {
   const getData = async () => {
     try {
       // Zawsze próbujemy pobrać prawdziwe dane
       const result = await fetchGUSData(dataType);
       setData(result);
       setLoading(false);
     } catch (err) {
       console.error("Error fetching GUS data:", err);
       setError(err as Error);
       setData(null); // Explicitly set to null rather than undefined
       setLoading(false);
     }
   };

   getData();
 }, [dataType]);

 return { data, loading, error };
};

export default useGUSData;