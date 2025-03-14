import { useState, useCallback } from 'react';
import { FormErrors } from '@/types/form-types';

/**
 * Custom hook do walidacji formularza
 * 
 * @param initialData Początkowe dane formularza
 * @param validationRules Funkcje walidacji dla poszczególnych pól
 * @param onUpdateCallback Callback wywoływany po aktualizacji danych
 * @returns Obiekt z danymi, błędami i funkcjami do zarządzania formularzem
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: {
    [K in keyof T]?: (value: T[K]) => string | null;
  } = {},
  onUpdateCallback?: (data: Partial<T>) => void
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  /**
   * Sprawdza, czy formularz zawiera błędy
   */
  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error !== null && error !== undefined);
  }, [errors]);

  /**
   * Waliduje pojedyncze pole
   */
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const validator = validationRules[name];
      return validator ? validator(value) : null;
    },
    [validationRules]
  );

  /**
   * Waliduje wszystkie pola formularza
   */
  const validateAll = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formData[fieldName]);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  /**
   * Aktualizuje dane formularza
   */
  const updateData = useCallback(
    (name: keyof T, value: any) => {
      const error = validateField(name, value);

      // Aktualizuj błędy tylko dla pól, które były dotknięte
      if (touchedFields.has(name as string)) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }

      // Aktualizuj dane formularza
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        
        // Wywołaj callback, jeśli został przekazany
        if (onUpdateCallback) {
          onUpdateCallback({ [name]: value } as Partial<T>);
        }
        
        return newData;
      });
    },
    [validateField, touchedFields, onUpdateCallback]
  );

  /**
   * Oznacza pole jako dotknięte (użytkownik wchodził w interakcję)
   */
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

  /**
   * Resetuje formularz do stanu początkowego
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouchedFields(new Set());
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
