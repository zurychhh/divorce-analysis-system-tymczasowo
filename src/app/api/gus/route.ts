export async function GET(request: Request) {
  const API_URL = "https://bdl.stat.gov.pl/api/v1";
  const VARIABLE_ID = 6;
  const YEARS = [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  try {
    const promises = YEARS.map(async year => {
      const response = await fetch(`${API_URL}/data/By-Variable/${VARIABLE_ID}?year=${year}&unit-level=2&page-size=20&format=json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { year, data: await response.json() };
    });

    const results = await Promise.all(promises);
    const processedData = results.reduce((acc, {year, data}) => {
      data.results.forEach(result => {
        if (!acc[result.id]) {
          acc[result.id] = {
            name: result.name,
            values: {}
          };
        }
        const value = result.values?.[0]?.val;
        acc[result.id].values[year] = value || 0;
      });
      return acc;
    }, {});

    return Response.json({
      status: "success",
      data: processedData,
      metadata: {
        years: YEARS,
        variableId: VARIABLE_ID,
        measureUnit: "osoba",
        totalRegions: Object.keys(processedData).length
      }
    });
  } catch (error) {
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}
