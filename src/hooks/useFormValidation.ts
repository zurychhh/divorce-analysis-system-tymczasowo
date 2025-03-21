// src/hooks/useFormValidation.ts.fix2
import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook do walidacji formularza
 * Naprawiona wersja z poprawnym eksportem
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: {
    [K in keyof T]?: (value: T[K]) => string | null;
  } = {},
  onUpdateCallback?: (data: Partial<T>) => void
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>>({});

  // Efekt do obsługi aktualizacji formularza - zapobiega aktualizacji podczas renderowania
  useEffect(() => {
    const hasUpdates = Object.keys(pendingUpdates).length > 0;
    if (hasUpdates && onUpdateCallback) {
      onUpdateCallback(pendingUpdates);
      setPendingUpdates({});
    }
  }, [pendingUpdates, onUpdateCallback]);

  // Efekt do synchronizacji z zewnętrznymi danymi
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error !== null && error !== undefined);
  }, [errors]);

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const validator = validationRules[name];
      return validator ? validator(value) : null;
    },
    [validationRules]
  );

  const validateAll = useCallback(() => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const updateData = useCallback(
    (name: keyof T, value: any) => {
      const error = validateField(name, value);

      // Aktualizuj błędy tylko dla pól, które były dotknięte
      if (touchedFields.has(name as string)) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }

      // Aktualizuj lokalny stan formularza
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Zapisz aktualizację do przetworzenia w useEffect
      setPendingUpdates(prev => ({ ...prev, [name]: value }));
    },
    [validateField, touchedFields]
  );

  const touchField = useCallback((name: keyof T) => {
    setTouchedFields((prev) => {
      const newSet = new Set(prev);
      newSet.add(name as string);
      return newSet;
    });

    // Waliduj pole po oznaczeniu jako dotknięte
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouchedFields(new Set());
    setPendingUpdates({});
  }, [initialData]);

  return {
    formData,
    errors,
    touchedFields,
    hasErrors,
    validateField,
    validateAll,
    updateData,
    touchField,
    resetForm
  };
}

// Upewnij się, że funkcja jest eksportowana jako default (dla kompatybilności z istniejącymi importami)
export default useFormValidation;