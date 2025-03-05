"use client"
import React, { useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface DivorceFormData {
  marriageLength: string;
  childrenCount: string;
  mainDivorceCause: string;
  assetsValue: string;
  housingStatus: string;
}

interface DivorceFormProps {
  formData: DivorceFormData;
  onDataUpdate: (data: Partial<DivorceFormData>) => void;
  onProgressChange: (progress: number) => void;
}

const DivorceForm = ({ formData, onDataUpdate, onProgressChange }: DivorceFormProps) => {
  const fields = ["marriageLength", "childrenCount", "mainDivorceCause", "assetsValue", "housingStatus"] as const;
  
  const calculateProgress = () => {
    const filled = fields.filter((f: keyof DivorceFormData) => formData[f] !== "").length;
    return (filled / fields.length) * 40;
  };

  useEffect(() => {
    onProgressChange(calculateProgress());
  }, [formData, onProgressChange]);

  const handleChange = (name: keyof DivorceFormData, value: string) => {
    onDataUpdate({ [name]: value });
  };

  const progress = calculateProgress();

  return (
    <div className="w-full dark:bg-gray-800 p-6 rounded-lg">
      <div className="relative">
        <Progress value={progress} className="w-full" />
        <span className="absolute -top-6 right-0 text-xs dark:text-gray-300">
          {Math.round(progress)}%
        </span>
      </div>

      <form className="space-y-4 mt-6">
        <div>
          <Label className="dark:text-gray-200">Długość małżeństwa (w latach)</Label>
          <Input
            type="number"
            value={formData.marriageLength}
            onChange={(e) => handleChange("marriageLength", e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        <div>
          <Label className="dark:text-gray-200">Status mieszkaniowy</Label>
          <Select 
            value={formData.housingStatus}
            onValueChange={(value) => handleChange("housingStatus", value)}
          >
            <SelectTrigger className="bg-white dark:bg-gray-900">
              <SelectValue placeholder="Wybierz obecną sytuację mieszkaniową" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900">
              <SelectItem value="own_separate">Własne, osobne mieszkanie</SelectItem>
              <SelectItem value="own_shared">Własne, wspólne mieszkanie</SelectItem>
              <SelectItem value="rent">Wynajem</SelectItem>
              <SelectItem value="family">Mieszkanie z rodziną</SelectItem>
              <SelectItem value="temporary">Tymczasowe zakwaterowanie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="dark:text-gray-200">Liczba dzieci</Label>
          <Input
            type="number"
            value={formData.childrenCount}
            onChange={(e) => handleChange("childrenCount", e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        <div>
          <Label className="dark:text-gray-200">Główna przyczyna rozwodu</Label>
          <Select 
            value={formData.mainDivorceCause}
            onValueChange={(value) => handleChange("mainDivorceCause", value)}
          >
            <SelectTrigger className="bg-white dark:bg-gray-900">
              <SelectValue placeholder="Wybierz główną przyczynę" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900">
              <SelectItem value="niezgodnosc">Niezgodność charakterów</SelectItem>
              <SelectItem value="zdrada">Zdrada</SelectItem>
              <SelectItem value="alkohol">Nadużywanie alkoholu</SelectItem>
              <SelectItem value="przemoc">Przemoc</SelectItem>
              <SelectItem value="finansowe">Problemy finansowe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="dark:text-gray-200">Szacunkowa wartość majątku wspólnego</Label>
          <Input
            type="number"
            value={formData.assetsValue}
            onChange={(e) => handleChange("assetsValue", e.target.value)}
            className="dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </form>
    </div>
  );
};

export default DivorceForm;