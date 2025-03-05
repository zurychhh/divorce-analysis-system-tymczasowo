"use client"
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DetailedFormData {
  // Istniejące pola
  custodyPreference: string;
  propertyType: string;
  currentLivingSituation: string;
  violencePresent: boolean;
  addictionsPresent: boolean;
  documentedInfidelity: boolean;
  mediationAttempts: boolean;
  // Nowe pola finansowe
  monthlyIncome: string;
  monthlyCosts: string;
  debts: string;
  creditHistory: string;
  // Nowe pola wsparcia
  socialSupport: boolean;
  psychologicalSupport: boolean;
  legalAid: boolean;
  jobAssistance: boolean;
  housingAssistance: boolean;
  childcareSupport: boolean;
}

interface DivorceFormDetailedProps {
  formData: DetailedFormData;
  onDataUpdate: (data: Record<string, any>) => void;
  onProgressChange: (progress: number) => void;
  baseProgress?: number;
}

const DivorceFormDetailed = ({ 
  formData, 
  onDataUpdate, 
  onProgressChange,
  baseProgress = 40 
}: DivorceFormDetailedProps) => {
  
  React.useEffect(() => {
    const detailedFields = [
      "custodyPreference",
      "propertyType",
      "currentLivingSituation",
      "violencePresent",
      "addictionsPresent",
      "documentedInfidelity",
      "mediationAttempts",
      "monthlyIncome",
      "monthlyCosts",
      "debts",
      "creditHistory",
      "socialSupport",
      "psychologicalSupport",
      "legalAid",
      "jobAssistance",
      "housingAssistance",
      "childcareSupport"
    ] as const;
    
    const filled = detailedFields.filter(field => {
      const value = formData[field];
      return typeof value === "boolean" ? value : value !== "";
    }).length;
    
    const additionalProgress = (filled / detailedFields.length) * 60;
    onProgressChange(additionalProgress);
  }, [formData, onProgressChange]);

  const handleChange = (name: keyof DetailedFormData, value: any) => {
    if (name === "monthlyIncome" && (Number(value) < 0 || Number(value) > 1000000)) return;
    if (name === "monthlyCosts" && (Number(value) < 0 || Number(value) > 1000000)) return;
    if (name === "debts" && (Number(value) < 0 || Number(value) > 10000000)) return;
    onDataUpdate({ [name]: value });
  };

  return (
    <div className="w-full dark:bg-gray-800 p-6 rounded-lg">
      <div className="relative">
        <Progress value={baseProgress} className="w-full" />
        <span className="absolute -top-6 right-0 text-xs dark:text-gray-300">
          {Math.round(baseProgress)}%
        </span>
      </div>

      <form className="space-y-6 mt-6">
        {/* Sekcja finansowa */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Szczegóły finansowe</h3>
          
          <div>
            <Label>Miesięczny dochód (zł)</Label>
            <Input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleChange("monthlyIncome", e.target.value)}
            />
          </div>

          <div>
            <Label>Miesięczne koszty (zł)</Label>
            <Input
              type="number"
              value={formData.monthlyCosts}
              onChange={(e) => handleChange("monthlyCosts", e.target.value)}
            />
          </div>

          <div>
            <Label>Zadłużenie (zł)</Label>
            <Input
              type="number"
              value={formData.debts}
              onChange={(e) => handleChange("debts", e.target.value)}
            />
          </div>

          <div>
            <Label>Historia kredytowa</Label>
            <Select 
              value={formData.creditHistory}
              onValueChange={(value) => handleChange("creditHistory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Dobra</SelectItem>
                <SelectItem value="average">Przeciętna</SelectItem>
                <SelectItem value="bad">Zła</SelectItem>
                <SelectItem value="none">Brak historii</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sekcja wsparcia */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Programy wsparcia i pomoc</h3>
          
          <div className="flex items-center justify-between">
            <Label>Wsparcie socjalne</Label>
            <Switch
              checked={formData.socialSupport}
              onCheckedChange={(checked) => handleChange("socialSupport", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Pomoc psychologiczna</Label>
            <Switch
              checked={formData.psychologicalSupport}
              onCheckedChange={(checked) => handleChange("psychologicalSupport", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Pomoc prawna</Label>
            <Switch
              checked={formData.legalAid}
              onCheckedChange={(checked) => handleChange("legalAid", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Wsparcie w znalezieniu pracy</Label>
            <Switch
              checked={formData.jobAssistance}
              onCheckedChange={(checked) => handleChange("jobAssistance", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Pomoc mieszkaniowa</Label>
            <Switch
              checked={formData.housingAssistance}
              onCheckedChange={(checked) => handleChange("housingAssistance", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Wsparcie w opiece nad dziećmi</Label>
            <Switch
              checked={formData.childcareSupport}
              onCheckedChange={(checked) => handleChange("childcareSupport", checked)}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DivorceFormDetailed;