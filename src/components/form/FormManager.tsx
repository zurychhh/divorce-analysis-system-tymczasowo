"use client"

import React, { useState, useCallback } from 'react';
import { DivorceFormData } from '@/types/form-types';
import DivorceForm from './DivorceForm';
import DivorceFormDetailed from './DivorceFormDetailed';
import DivorceTrends from './DivorceTrends';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FormManagerProps {
  region: string;
}

/**
 * Komponent zarządzający procesem wypełniania formularzy
 */
const FormManager: React.FC<FormManagerProps> = ({ region }) => {
  // Stan dla formularza podstawowego
  const [formData, setFormData] = useState<DivorceFormData>({
    marriageLength: "",
    childrenCount: "",
    mainDivorceCause: "",
    assetsValue: "",
    housingStatus: "",
    location: region
  });

  // Stan dla formularza szczegółowego
  const [detailedFormData, setDetailedFormData] = useState({
    custodyArrangement: "",
    propertyType: "",
    livingArrangement: "",
    hasDomesticViolence: false,
    hasAddictions: false,
    hasMentalHealthIssues: false,
    incomeDifference: "",
    hasPropertyDisputes: false,
    needsChildSupport: false,
    needsAlimony: false,
    priorMarriages: "",
    separationDuration: "",
    hasLegalRepresentation: false,
    hasMediation: false,
    hasDocumentedInfidelity: false,
    monthlyIncome: "",
    monthlyExpenses: "",
    debts: "",
    creditHistory: "",
    hasSocialSupport: false,
    hasPsychologicalSupport: false,
    hasLegalAid: false,
    hasJobAssistance: false,
    hasHousingAssistance: false,
    hasChildcareSupport: false
  });

  // Stan postępu wypełniania formularzy
  const [progress, setProgress] = useState(0);
  const [detailedProgress, setDetailedProgress] = useState(40);
  
  // Stan widoku
  const [showDetailed, setShowDetailed] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /**
   * Aktualizuje podstawowy formularz
   */
  const handleDataUpdate = useCallback((data: Partial<DivorceFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Aktualizuje szczegółowy formularz
   */
  const handleDetailedDataUpdate = useCallback((data: Record<string, any>) => {
    setDetailedFormData(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Aktualizuje postęp podstawowego formularza
   */
  const handleProgressChange = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  /**
   * Aktualizuje postęp szczegółowego formularza
   */
  const handleDetailedProgressChange = useCallback((additionalProgress: number) => {
    setDetailedProgress(40 + (additionalProgress * 0.6));
  }, []);

  /**
   * Przechodzi do szczegółowego formularza
   */
  const handleShowDetailedForm = useCallback(() => {
    setShowDetailed(true);
  }, []);

  /**
   * Generuje analizę z aktualnych danych
   */
  const handleGenerateAnalysis = useCallback(() => {
    setShowResults(true);
    console.log('Generowanie analizy z danymi:', { 
      basic: formData, 
      detailed: showDetailed ? detailedFormData : null 
    });
  }, [formData, detailedFormData, showDetailed]);

  // Jeśli pokazujemy wyniki, renderujemy ekran z wynikami
  if (showResults) {
    return (
      <div className="w-full space-y-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Wyniki analizy</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Tutaj będą wyświetlane wyniki analizy.
            </p>
            
            <div className="mt-6">
              <Button onClick={() => setShowResults(false)}>
                Wróć do formularza
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      <div className="w-full h-96 bg-black/5 dark:bg-white/5 rounded-lg p-4">
        <DivorceTrends selectedRegion={region} />
      </div>

      <div className="max-w-3xl mx-auto">
        {showDetailed ? (
          <>
            <DivorceFormDetailed 
              formData={detailedFormData}
              onDataUpdate={handleDetailedDataUpdate}
              onProgressChange={handleDetailedProgressChange}
              baseProgress={40}
            />
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleGenerateAnalysis}
                className="flex-1"
                variant="default"
              >
                Generuj analizę
              </Button>
              <Button
                disabled={detailedProgress < 100}
                className="flex-1"
                variant="outline"
                onClick={handleGenerateAnalysis}
              >
                Generuj szczegółową analizę
              </Button>
            </div>
          </>
        ) : (
          <>
            <DivorceForm 
              formData={formData}
              onDataUpdate={handleDataUpdate}
              onProgressChange={handleProgressChange}
            />
            <div className="flex gap-4 mt-6">
              <Button
                disabled={progress < 40}
                className="flex-1"
                variant="default"
                onClick={handleGenerateAnalysis}
              >
                Generuj analizę
              </Button>
              <Button
                disabled={progress < 40}
                className="flex-1"
                variant="outline"
                onClick={handleShowDetailedForm}
              >
                Podaj więcej szczegółów
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FormManager;
