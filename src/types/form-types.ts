// Wspólne typy dla formularzy rozwodowych

/**
 * Dane formularza podstawowego
 */
export interface DivorceFormData {
  marriageLength: string;
  childrenCount: string;
  mainDivorceCause: string;
  assetsValue: string;
  housingStatus: string;
  location?: string;
}

/**
 * Dane formularza szczegółowego
 */
export interface DetailedFormData {
  // Podstawowe informacje
  custodyArrangement: string; // Preferowany układ opieki nad dziećmi
  propertyType: string; // Rodzaj własności
  livingArrangement: string; // Obecna sytuacja mieszkaniowa
  
  // Czynniki wpływające na decyzje
  hasDomesticViolence: boolean; // Czy występowała przemoc domowa
  hasAddictions: boolean; // Czy występowały uzależnienia
  hasMentalHealthIssues: boolean; // Czy występowały problemy ze zdrowiem psychicznym
  incomeDifference: string; // Różnica w dochodach
  hasPropertyDisputes: boolean; // Czy istnieją spory o majątek
  needsChildSupport: boolean; // Czy potrzebne są alimenty na dzieci
  needsAlimony: boolean; // Czy potrzebne jest wsparcie finansowe dla małżonka
  
  // Historia małżeństwa
  priorMarriages: string; // Wcześniejsze małżeństwa
  separationDuration: string; // Czas oddzielnego zamieszkania
  hasLegalRepresentation: boolean; // Czy korzysta z pomocy prawnej
  hasMediation: boolean; // Czy próbowano mediacji
  hasDocumentedInfidelity: boolean; // Czy jest udokumentowana niewierność
  
  // Aspekty finansowe
  monthlyIncome: string; // Miesięczny dochód
  monthlyExpenses: string; // Miesięczne wydatki
  debts: string; // Zadłużenie
  creditHistory: string; // Historia kredytowa
  
  // Dostępne wsparcie
  hasSocialSupport: boolean; // Wsparcie socjalne
  hasPsychologicalSupport: boolean; // Pomoc psychologiczna
  hasLegalAid: boolean; // Pomoc prawna
  hasJobAssistance: boolean; // Wsparcie w znalezieniu pracy
  hasHousingAssistance: boolean; // Pomoc mieszkaniowa
  hasChildcareSupport: boolean; // Wsparcie w opiece nad dziećmi
}

/**
 * Błędy walidacji formularza
 */
export interface FormErrors {
  [key: string]: string | null;
}

/**
 * Konfiguracja pola formularza
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch';
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}
