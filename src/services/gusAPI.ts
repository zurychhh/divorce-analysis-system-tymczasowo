export const fetchGUSData = async (dataType: string) => {
  const response = await fetch("/api/gus");
  const data = await response.json();
  console.log("GUS API response data:", data);
  return data;
};
