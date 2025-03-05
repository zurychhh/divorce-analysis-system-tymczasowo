"use client"
import React, { useState } from "react";
import DivorceTrends from "./DivorceTrends";
import DivorceForm from "./DivorceForm";
import DivorceFormDetailed from "./DivorceFormDetailed";
import { Button } from "@/components/ui/button";

const FormWithDivorceStats = ({ initialRegion }) => {
  const [formStage, setFormStage] = useState("basic");
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    location: initialRegion,
    marriageLength: "",
    childrenCount: "",
    mainDivorceCause: "",
    assetsValue: "",
    childrenAges: [],
    custodyPreference: "",
    propertyType: "",
    violencePresent: false,
    addictionsPresent: false,
    documentedInfidelity: false,
    financialIndependence: "",
    currentLivingSituation: "",
    previousSeparations: false,
    mediationAttempts: false
  });

  const handleDataUpdate = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="w-full h-96 bg-black/5 dark:bg-white/5 rounded-lg p-4">
        <DivorceTrends selectedRegion={initialRegion} />
      </div>

      <div className="max-w-3xl mx-auto">
        {formStage === "basic" ? (
          <>
            <DivorceForm 
              formData={formData}
              onDataUpdate={handleDataUpdate}
              onProgressChange={setProgress}
            />
            <div className="flex gap-4 mt-6">
              <Button
                disabled={progress < 40}
                className="flex-1"
                variant="default"
              >
                Generuj analizę
              </Button>
              <Button
                disabled={progress < 40}
                className="flex-1"
                variant="outline"
                onClick={() => setFormStage("detailed")}
              >
                Podaj więcej szczegółów
              </Button>
            </div>
          </>
        ) : (
          <DivorceFormDetailed
            formData={formData}
            onDataUpdate={handleDataUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default FormWithDivorceStats;
