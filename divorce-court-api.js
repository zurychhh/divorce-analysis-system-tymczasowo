const fetch = require('node-fetch');

const API_URL = 'https://www.saos.org.pl/api/search/judgments';

const searchDivorceCases = async () => {
  const params = new URLSearchParams({
    pageSize: 10,
    courtType: 'COMMON',
    all: 'rozwód',
    judgmentTypes: 'SENTENCE'
  });

  try {
    const response = await fetch(`${API_URL}?${params}`);
    const data = await response.json();
    
    console.log(`Liczba wyników: ${data.items.length}`);
    data.items.forEach(judgment => {
      console.log(`ID: ${judgment.id}`);
      console.log(`Data wyroku: ${judgment.judgmentDate}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Błąd połączenia:', error);
  }
};

searchDivorceCases();
