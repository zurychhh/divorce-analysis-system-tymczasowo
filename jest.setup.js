require('@testing-library/jest-dom')

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Check: () => null,
  ChevronDown: () => null
})) 