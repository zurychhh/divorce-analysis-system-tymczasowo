"use client"
import React, { useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DivorceFormData } from "@/types/form-types";
import { useFormValidation } from "@/hooks/useFormValidation";

interface DivorceFormProps {
  formData: DivorceFormData;
  onDataUpdate: (data: Partial<DivorceFormData>) => void;
  onProgressChange: (progress: number) => void;
}

/**
 * Reguły walidacji dla formularza rozwodowego
 */
const validationRules = {
  marriageLength: (value: string) => {
    if (value === "") return null;
    const length = Number(value);
    if (isNaN(length)) return "Proszę podać liczbę";
    if (length < 0) return "Długość nie może być ujemna";
    if (length > 100) return "Proszę podać realistyczną wartość";
    return null;
  },
  
  childrenCount: (value: string) => {
    if (value === "") return null;
    const count = Number(value);
    if (isNaN(count)) return "Proszę podać liczbę";
    if (count < 0) return "Liczba nie może być ujemna";
    if (!Number.isInteger(Number(value))) return "Proszę podać liczbę całkowitą";
    if (count > 20) return "Proszę podać realistyczną wartość";
    return null;
  },
  
  assetsValue: (value: string) => {
    if (value === "") return null;
    const assets = Number(value);
    if (isNaN(assets)) return "Proszę podać liczbę";
    if (assets < 0) return "Wartość nie może być ujemna";
    return null;
  }
};

/**
 * Komponent formularza rozwodowego z walidacją
 */
const DivorceForm: React.FC<DivorceFormProps> = ({ formData, onDataUpdate, onProgressChange }) => {
  // Lista pól wymaganych do obliczenia progresu
  const requiredFields = ["marriageLength", "childrenCount", "mainDivorceCause", "assetsValue", "housingStatus"] as const;
  
  // Użyj custom hooka do walidacji formularza
  const {
    errors,
    touchField,
    updateData
  } = useFormValidation<DivorceFormData>(
    formData,
    validationRules,
    onDataUpdate
  );

  /**
   * Oblicza progres wypełnienia formularza
   */
  const calculateProgress = () => {
    const filled = requiredFields.filter((f) => formData[f] !== "").length;
    return (filled / requiredFields.length) * 40;
  };

  /**
   * Aktualizuje wskaźnik postępu
   */
  useEffect(() => {
    onProgressChange(calculateProgress());
  }, [formData, onProgressChange]);

  /**
   * Obsługuje zmianę wartości pola
   */
  const handleChange = (name: keyof DivorceFormData, value: string) => {
    updateData(name, value);
    touchField(name);
  };

  const progress = calculateProgress();

  return (
    <div className="w-full dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="relative">
        <Progress value={progress} className="w-full" />
        <span className="absolute -top-6 right-0 text-xs dark:text-gray-300">
          {Math.round(progress)}%
        </span>
      </div>

      <form className="space-y-4 mt-6">
        <div>
          <Label className="dark:text-gray-200 mb-1">Długość małżeństwa (w latach)</Label>
          <Input
            type="number"
            value={formData.marriageLength}
            onChange={(e) => handleChange("marriageLength", e.target.value)}
            onBlur={() => touchField("marriageLength")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.marriageLength ? "border-red-500" : ""}`}
          />
          {errors.marriageLength && (
            <p className="text-red-500 text-sm mt-1">{errors.marriageLength}</p>
          )}
        </div>

        <div>
          <Label className="dark:text-gray-200 mb-1">Status mieszkaniowy</Label>
          <Select 
            value={formData.housingStatus}
            onValueChange={(value) => handleChange("housingStatus", value)}
          >
            <SelectTrigger className={`bg-white dark:bg-gray-700 ${errors.housingStatus ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Wybierz obecną sytuację mieszkaniową" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="own_separate">Własne, osobne mieszkanie</SelectItem>
              <SelectItem value="own_shared">Własne, wspólne mieszkanie</SelectItem>
              <SelectItem value="rent">Wynajem</SelectItem>
              <SelectItem value="family">Mieszkanie z rodziną</SelectItem>
              <SelectItem value="temporary">Tymczasowe zakwaterowanie</SelectItem>
            </SelectContent>
          </Select>
          {errors.housingStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.housingStatus}</p>
          )}
        </div>

        <div>
          <Label className="dark:text-gray-200 mb-1">Liczba dzieci</Label>
          <Input
            type="number"
            value={formData.childrenCount}
            onChange={(e) => handleChange("childrenCount", e.target.value)}
            onBlur={() => touchField("childrenCount")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.childrenCount ? "border-red-500" : ""}`}
          />
          {errors.childrenCount && (
            <p className="text-red-500 text-sm mt-1">{errors.childrenCount}</p>
          )}
        </div>

        <div>
          <Label className="dark:text-gray-200 mb-1">Główna przyczyna rozwodu</Label>
          <Select 
            value={formData.mainDivorceCause}
            onValueChange={(value) => handleChange("mainDivorceCause", value)}
          >
            <SelectTrigger className={`bg-white dark:bg-gray-700 ${errors.mainDivorceCause ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Wybierz główną przyczynę" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="niezgodnosc">Niezgodność charakterów</SelectItem>
              <SelectItem value="zdrada">Zdrada</SelectItem>
              <SelectItem value="alkohol">Nadużywanie alkoholu</SelectItem>
              <SelectItem value="przemoc">Przemoc</SelectItem>
              <SelectItem value="finansowe">Problemy finansowe</SelectItem>
            </SelectContent>
          </Select>
          {errors.mainDivorceCause && (
            <p className="text-red-500 text-sm mt-1">{errors.mainDivorceCause}</p>
          )}
        </div>

        <div>
          <Label className="dark:text-gray-200 mb-1">Szacunkowa wartość majątku wspólnego (zł)</Label>
          <Input
            type="number"
            value={formData.assetsValue}
            onChange={(e) => handleChange("assetsValue", e.target.value)}
            onBlur={() => touchField("assetsValue")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.assetsValue ? "border-red-500" : ""}`}
          />
          {errors.assetsValue && (
            <p className="text-red-500 text-sm mt-1">{errors.assetsValue}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default DivorceForm;
