import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateForm } from '@/schemas/formSchemas';

interface UseSchemaFormOptions<T> {
  initialValues: T;
  schema: z.ZodType<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
}

/**
 * Hook do zarządzania formularzem z walidacją schematów Zod
 * 
 * @param options - Opcje konfiguracyjne formularza
 * @returns Obiekt z metodami i stanem formularza
 */
export function useSchemaForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
  onError
}: UseSchemaFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  /**
   * Sprawdza walidację całego formularza
   */
  const validateFormData = useCallback(() => {
    const result = validateForm(schema, values);
    
    if (!result.success) {
      setErrors(result.errors);
      setIsValid(false);
      return false;
    }
    
    setErrors({});
    setIsValid(true);
    return true;
  }, [schema, values]);

  /**
   * Waliduje pojedyncze pole
   */
  const validateField = useCallback((name: keyof T, value: any) => {
    try {
      // Tworzymy częściowy schemat dla pojedynczego pola
      const partialSchema = z.object({ [name]: schema.shape[name] });
      partialSchema.parse({ [name]: value });
      
      // Jeśli walidacja przeszła, usuwamy błąd
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
      
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === name);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [name]: fieldError.message }));
          return fieldError.message;
        }
      }
      
      return null;
    }
  }, [schema]);

  /**
   * Obsługuje zmianę wartości pola
   */
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Jeśli pole zostało już dotknięte, waliduj je od razu
    if (touched[name as string]) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  /**
   * Oznacza pole jako dotknięte i waliduje je
   */
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  }, [validateField, values]);

  /**
   * Obsługuje wysłanie formularza
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Oznacz wszystkie pola jako dotknięte
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    const isValidForm = validateFormData();
    
    if (!isValidForm) {
      onError?.(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('Error during form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateFormData, errors, onError, onSubmit]);

  /**
   * Resetuje formularz do stanu początkowego
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateField,
    validateForm: validateFormData
  };
}
