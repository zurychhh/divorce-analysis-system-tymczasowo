"use client"
import React, { useCallback, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DivorceFormData } from "@/types/form-types";
import { useFormValidation } from "@/hooks/useFormValidation";
import { startMeasure, endMeasure } from "@/lib/performance";

interface DivorceFormProps {
  formData: DivorceFormData;
  onDataUpdate: (data: Partial<DivorceFormData>) => void;
  onProgressChange: (progress: number) => void;
}

// Opcje dla pól select
const DIVORCE_CAUSES = [
  { value: "niezgodnosc", label: "Niezgodność charakterów" },
  { value: "zdrada", label: "Zdrada" },
  { value: "alkohol", label: "Nadużywanie alkoholu" },
  { value: "przemoc", label: "Przemoc" },
  { value: "finansowe", label: "Problemy finansowe" }
];

const HOUSING_OPTIONS = [
  { value: "own_separate", label: "Własne, osobne mieszkanie" },
  { value: "own_shared", label: "Własne, wspólne mieszkanie" },
  { value: "rent", label: "Wynajem" },
  { value: "family", label: "Mieszkanie z rodziną" },
  { value: "temporary", label: "Tymczasowe zakwaterowanie" }
];

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
 * Zoptymalizowany komponent formularza rozwodowego
 */
const DivorceFormOptimized: React.FC<DivorceFormProps> = React.memo(({ 
  formData, 
  onDataUpdate, 
  onProgressChange 
}) => {
  // Lista pól wymaganych do obliczenia progresu
  const requiredFields = useMemo(
    () => ["marriageLength", "childrenCount", "mainDivorceCause", "assetsValue", "housingStatus"] as const,
    []
  );
  
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
  const calculateProgress = useCallback(() => {
    startMeasure('calculateProgress');
    const filled = requiredFields.filter((f) => formData[f] !== "").length;
    const progress = (filled / requiredFields.length) * 40;
    endMeasure('calculateProgress');
    return progress;
  }, [formData, requiredFields]);

  /**
   * Aktualizuje wskaźnik postępu
   */
  React.useEffect(() => {
    onProgressChange(calculateProgress());
  }, [calculateProgress, onProgressChange]);

  /**
   * Obsługuje zmianę wartości pola
   */
  const handleChange = useCallback((name: keyof DivorceFormData, value: string) => {
    updateData(name, value);
    touchField(name);
  }, [updateData, touchField]);

  // Memoizowane renderowanie pól select dla poprawy wydajności
  const divorceOptionsItems = useMemo(() => (
    DIVORCE_CAUSES.map(option => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))
  ), []);

  const housingOptionsItems = useMemo(() => (
    HOUSING_OPTIONS.map(option => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))
  ), []);

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
          <Label htmlFor="marriageLength" className="dark:text-gray-200 mb-1">
            Długość małżeństwa (w latach)
          </Label>
          <Input
            id="marriageLength"
            type="number"
            value={formData.marriageLength}
            onChange={(e) => handleChange("marriageLength", e.target.value)}
            onBlur={() => touchField("marriageLength")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.marriageLength ? "border-red-500" : ""}`}
            aria-invalid={!!errors.marriageLength}
            aria-describedby={errors.marriageLength ? "marriageLength-error" : undefined}
          />
          {errors.marriageLength && (
            <p id="marriageLength-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.marriageLength}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="housingStatus" className="dark:text-gray-200 mb-1">
            Status mieszkaniowy
          </Label>
          <Select 
            value={formData.housingStatus}
            onValueChange={(value) => handleChange("housingStatus", value)}
          >
            <SelectTrigger 
              id="housingStatus"
              className={`bg-white dark:bg-gray-700 ${errors.housingStatus ? "border-red-500" : ""}`}
              aria-invalid={!!errors.housingStatus}
              aria-describedby={errors.housingStatus ? "housingStatus-error" : undefined}
            >
              <SelectValue placeholder="Wybierz obecną sytuację mieszkaniową" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {housingOptionsItems}
            </SelectContent>
          </Select>
          {errors.housingStatus && (
            <p id="housingStatus-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.housingStatus}
            </p>
          )}
        </div>

        {/* Pozostałe pola formularza podobnie zoptymalizowane */}
        <div>
          <Label htmlFor="childrenCount" className="dark:text-gray-200 mb-1">
            Liczba dzieci
          </Label>
          <Input
            id="childrenCount"
            type="number"
            value={formData.childrenCount}
            onChange={(e) => handleChange("childrenCount", e.target.value)}
            onBlur={() => touchField("childrenCount")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.childrenCount ? "border-red-500" : ""}`}
            aria-invalid={!!errors.childrenCount}
            aria-describedby={errors.childrenCount ? "childrenCount-error" : undefined}
          />
          {errors.childrenCount && (
            <p id="childrenCount-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.childrenCount}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="mainDivorceCause" className="dark:text-gray-200 mb-1">
            Główna przyczyna rozwodu
          </Label>
          <Select 
            value={formData.mainDivorceCause}
            onValueChange={(value) => handleChange("mainDivorceCause", value)}
          >
            <SelectTrigger 
              id="mainDivorceCause"
              className={`bg-white dark:bg-gray-700 ${errors.mainDivorceCause ? "border-red-500" : ""}`}
              aria-invalid={!!errors.mainDivorceCause}
              aria-describedby={errors.mainDivorceCause ? "mainDivorceCause-error" : undefined}
            >
              <SelectValue placeholder="Wybierz główną przyczynę" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {divorceOptionsItems}
            </SelectContent>
          </Select>
          {errors.mainDivorceCause && (
            <p id="mainDivorceCause-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.mainDivorceCause}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="assetsValue" className="dark:text-gray-200 mb-1">
            Szacunkowa wartość majątku wspólnego (zł)
          </Label>
          <Input
            id="assetsValue"
            type="number"
            value={formData.assetsValue}
            onChange={(e) => handleChange("assetsValue", e.target.value)}
            onBlur={() => touchField("assetsValue")}
            className={`dark:bg-gray-700 dark:text-gray-200 ${errors.assetsValue ? "border-red-500" : ""}`}
            aria-invalid={!!errors.assetsValue}
            aria-describedby={errors.assetsValue ? "assetsValue-error" : undefined}
          />
          {errors.assetsValue && (
            <p id="assetsValue-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.assetsValue}
            </p>
          )}
        </div>
      </form>
    </div>
  );
});

DivorceFormOptimized.displayName = 'DivorceFormOptimized';

export default DivorceFormOptimized;
