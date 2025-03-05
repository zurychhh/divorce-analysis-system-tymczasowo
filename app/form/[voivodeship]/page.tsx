const [detailedFormData, setDetailedFormData] = React.useState({
  custodyPreference: "",
  propertyType: "",
  currentLivingSituation: "",
  violencePresent: false,
  addictionsPresent: false,
  mentalIssues: false,
  incomeDifference: "",
  propertyDisputes: false,
  childSupportNeeded: false,
  alimonyRequested: false,
  custodyArrangement: "",
  priorMarriages: "",
  timeSeparated: "",
  hasLawyer: false,
  mediationTried: false,
  domesticViolenceHistory: false,
  substanceAbuseHistory: false,
  documentedInfidelity: false,
  mediationAttempts: false,
  monthlyIncome: "",
  monthlyCosts: "",
  debts: "",
  creditHistory: "",
  socialSupport: false,
  psychologicalSupport: false,
  legalAid: false,
  jobAssistance: false,
  housingAssistance: false,
  childcareSupport: false
}) 

<DivorceFormDetailed 
  formData={{
    ...detailedFormData,
    separationLength: "",
    hasAttorney: false,
    addictionsPresent: false
  }}
  onDataUpdate={handleDetailedDataUpdate}
  onProgressChange={handleDetailedProgressChange}
  baseProgress={40}
/> 