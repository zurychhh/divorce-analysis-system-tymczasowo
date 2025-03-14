import { z } from 'zod';

/**
 * Moduł zawierający definicje schematów walidacji dla formularzy aplikacji
 * Używa biblioteki Zod do typowanej walidacji
 */

/**
 * Schema dla formularza podstawowego rozwodu
 */
export const divorceFormSchema = z.object({
  marriageLength: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Wartość nie może być ujemna'
    })
    .refine(val => val === '' || Number(val) <= 100, {
      message: 'Proszę podać realistyczną wartość'
    }),
  
  childrenCount: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Liczba nie może być ujemna'
    })
    .refine(val => val === '' || Number.isInteger(Number(val)), {
      message: 'Musi być liczbą całkowitą'
    })
    .refine(val => val === '' || Number(val) <= 20, {
      message: 'Proszę podać realistyczną wartość'
    }),
  
  mainDivorceCause: z.enum(['', 'niezgodnosc', 'zdrada', 'alkohol', 'przemoc', 'finansowe']),
  
  assetsValue: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Wartość nie może być ujemna'
    }),
  
  housingStatus: z.enum(['', 'own_separate', 'own_shared', 'rent', 'family', 'temporary'])
});

/**
 * Schema dla szczegółowego formularza rozwodowego
 */
export const detailedFormSchema = z.object({
  custodyArrangement: z.enum(['', 'mother', 'father', 'shared', 'other']),
  
  propertyType: z.enum(['', 'apartment', 'house', 'none', 'multiple']),
  
  livingArrangement: z.enum(['', 'together', 'separate', 'partially_separate']),
  
  hasDomesticViolence: z.boolean(),
  
  hasAddictions: z.boolean(),
  
  hasMentalHealthIssues: z.boolean(),
  
  incomeDifference: z.enum(['', 'none', 'small', 'significant', 'extreme']),
  
  hasPropertyDisputes: z.boolean(),
  
  needsChildSupport: z.boolean(),
  
  needsAlimony: z.boolean(),
  
  priorMarriages: z.enum(['', 'none', 'one', 'multiple']),
  
  separationDuration: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Wartość nie może być ujemna'
    }),
  
  hasLegalRepresentation: z.boolean(),
  
  hasMediation: z.boolean(),
  
  hasDocumentedInfidelity: z.boolean(),
  
  monthlyIncome: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Wartość nie może być ujemna'
    }),
  
  monthlyExpenses: z.string()
    .refine(val => val === '' || !isNaN(Number(val)), {
      message: 'Musi być liczbą'
    })
    .refine(val => val === '' || Number(val) >= 0, {
      message: 'Wartość nie może być ujemna'
    })
});

// Typy wygenerowane z schematów
export type DivorceFormValues = z.infer<typeof divorceFormSchema>;
export type DetailedFormValues = z.infer<typeof detailedFormSchema>;

/**
 * Pomocnicza funkcja do walidacji danych formularza
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Przekształć błędy Zod na przyjazny format
      const formattedErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        // Pobierz ścieżkę jako string (np. "name" lub "address.city")
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });
      
      return { success: false, errors: formattedErrors };
    }
    
    // Dla innych błędów zwróć ogólny komunikat
    return { 
      success: false, 
      errors: { _form: 'Wystąpił nieoczekiwany błąd walidacji' } 
    };
  }
}
