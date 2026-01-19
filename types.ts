
export enum Scenario {
  TRADITIONAL = 'Traditional',
  CASUAL = 'Casual',
  FESTIVE = 'Festive'
}

export enum ShotType {
  CLOSEUP = 'Closeup',
  MIDLENGTH = 'Mid-length',
  EXTREME_CLOSEUP = 'Extreme Close-up'
}

export interface JewelryAnalysis {
  type: string;
  material: string;
  style: string;
  description: string;
}

export interface GeneratedResult {
  id: string;
  scenario: Scenario;
  imageUrl: string;
  prompt: string;
}

export interface ExpansionShot {
  type: ShotType;
  imageUrl: string;
}

export interface AppState {
  uploadedImage: string | null;
  analysis: JewelryAnalysis | null;
  results: Record<Scenario, GeneratedResult | null>;
  loadingScenarios: Record<Scenario, boolean>;
  expansionResults: Record<Scenario, ExpansionShot[] | null>;
  loadingExpansion: Record<Scenario, boolean>;
  isAnalyzing: boolean;
  status: string;
  selectedExpansionScenario: Scenario | null;
}
