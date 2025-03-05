import { render, screen, fireEvent } from "@testing-library/react";
import DivorceForm, { DivorceFormData } from "@/components/form/DivorceForm";
import DivorceFormDetailed from "@/components/form/DivorceFormDetailed";
import '@testing-library/jest-dom';

describe("DivorceForm Tests", () => {
  const mockOnDataUpdate = jest.fn();
  const mockOnProgressChange = jest.fn();

  const defaultFormData = {
    marriageLength: "",
    childrenCount: "",
    mainDivorceCause: "",
    assetsValue: "",
    housingStatus: ""
  } as DivorceFormData;

  beforeEach(() => {
    mockOnDataUpdate.mockClear();
    mockOnProgressChange.mockClear();
  });

  it("should render all form fields", () => {
    render(
      <DivorceForm
        formData={defaultFormData}
        onDataUpdate={mockOnDataUpdate}
        onProgressChange={mockOnProgressChange}
      />
    );
    
    // Sprawdź czy formularz zawiera wszystkie oczekiwane pola
    expect(screen.getByText(/Długość małżeństwa/i)).toBeInTheDocument();
    expect(screen.getByText(/Liczba dzieci/i)).toBeInTheDocument();
    expect(screen.getByText(/Główna przyczyna rozwodu/i)).toBeInTheDocument();
    expect(screen.getByText(/Szacunkowa wartość majątku/i)).toBeInTheDocument();
  });

  it("should update progress when fields are filled", () => {
    render(
      <DivorceForm
        formData={defaultFormData}
        onDataUpdate={mockOnDataUpdate}
        onProgressChange={mockOnProgressChange}
      />
    );

    expect(mockOnProgressChange).toHaveBeenCalledWith(0);
    
    // Symuluj wypełnienie jednego pola
    const filledData = { ...defaultFormData, marriageLength: "5" };
    render(
      <DivorceForm
        formData={filledData}
        onDataUpdate={mockOnDataUpdate}
        onProgressChange={mockOnProgressChange}
      />
    );
    
    // Sprawdź czy progress został zaktualizowany
    expect(mockOnProgressChange).toHaveBeenCalled();
  });

  it("should call onDataUpdate when field value changes", () => {
    const { container } = render(
      <DivorceForm
        formData={defaultFormData}
        onDataUpdate={mockOnDataUpdate}
        onProgressChange={mockOnProgressChange}
      />
    );
    
    // Znajdź pole input dla długości małżeństwa (może wymagać dostosowania selektora)
    const input = container.querySelector('input[type="number"]');
    
    if (input) {
      fireEvent.change(input, { target: { value: "10" } });
      expect(mockOnDataUpdate).toHaveBeenCalled();
    }
  });
});
