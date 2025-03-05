import { render, screen } from "@testing-library/react";
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

  it("should update progress when fields are filled", () => {
    render(
      <DivorceForm
        formData={defaultFormData}
        onDataUpdate={mockOnDataUpdate}
        onProgressChange={mockOnProgressChange}
      />
    );

    expect(mockOnProgressChange).toHaveBeenCalledWith(0);
  });

  // Możesz dodać więcej testów tutaj
});
