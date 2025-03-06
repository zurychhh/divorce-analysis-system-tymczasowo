'use client'

import React, { useState } from 'react'
import DivorceForm from '@/components/form/DivorceForm'
import DivorceFormDetailed from '@/components/form/DivorceFormDetailed'
import { Button } from "@/components/ui/button"

export default function FormPage({ params }: { params: { voivodeship: string } }) {
  const { voivodeship } = params
  const decodedVoivodeship = decodeURIComponent(voivodeship)
  const [progress, setProgress] = useState(0)
  const [showDetailed, setShowDetailed] = useState(false)
  const [formData, setFormData] = useState({
    marriageLength: "",
    childrenCount: "",
    mainDivorceCause: "",
    assetsValue: "",
    housingStatus: ""
  })
  
  const [detailedFormData, setDetailedFormData] = useState({
    custodyPreference: "",
    previousMarriages: "",
    separationLength: "",
    attorneyHired: false,
    mediationAttempted: false,
    domesticViolence: false,
    substanceAbuse: false,
    mentalHealth: false,
    incomeDisparity: "",
    propertyDisputes: false,
    childSupport: false,
    alimonyExpected: false
  })

  const [detailedProgress, setDetailedProgress] = useState(40)

  const handleDataUpdate = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleDetailedDataUpdate = (data: any) => {
    setDetailedFormData(prev => ({ ...prev, ...data }))
  }

  const handleProgressChange = (progress: number) => {
    setProgress(progress)
  }

  const handleDetailedProgressChange = (additionalProgress: number) => {
    setDetailedProgress(40 + (additionalProgress * 0.6))
  }

  const handleDetailedForm = () => {
    setShowDetailed(true)
  }

  const handleGenerateAnalysis = () => {
    console.log('Generating analysis...')
  }

  const handleGenerateDetailedAnalysis = () => {
    console.log('Generating detailed analysis...')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-center">
          {showDetailed ? 'Szczegółowa analiza' : 'Analiza'} sprawy rozwodowej
          <span className="block text-2xl text-muted-foreground mt-2">
            Województwo {decodedVoivodeship}
          </span>
        </h1>
        <div className="w-full max-w-2xl">
          {showDetailed ? (
            <>
              <DivorceFormDetailed 
                formData={{
                  ...detailedFormData,
                  propertyType: "",
                  currentLivingSituation: "",
                  violencePresent: false,
                  documentedInfidelity: false,
                  mediationAttempts: false,
                  monthlyIncome: "",
                  monthlyCosts: "",
                  childrenCount: "",
                  marriageLength: "",
                  separationLength: "",
                  priorMarriages: detailedFormData.previousMarriages,
                  hasAttorney: false,
                  addictionsPresent: false,
                  mentalIssues: false,
                  incomeDifference: "",
                  propertyDisputes: false,
                  childSupportNeeded: false,
                  alimonyRequested: false,
                  custodyArrangement: "",
                  timeSeparated: "",
                  hasLawyer: false,
                  mediationTried: false,
                  domesticViolenceHistory: false,
                  substanceAbuseHistory: false,
                  debts: "",
                  creditHistory: "",
                  socialSupport: false,
                  psychologicalSupport: false,
                  legalAid: false,
                  jobAssistance: false,
                  housingAssistance: false,
                  childcareSupport: false
                }}
                onDataUpdate={handleDetailedDataUpdate}
                onProgressChange={handleDetailedProgressChange}
                baseProgress={40}
              />
              <div className="flex justify-between mt-8 gap-4">
                <Button 
                  onClick={handleGenerateAnalysis}
                  className="w-full"
                  variant="default"
                >
                  Generuj analizę
                </Button>
                <Button 
                  onClick={handleGenerateDetailedAnalysis}
                  disabled={detailedProgress < 100}
                  className="w-full"
                  variant="outline"
                >
                  Generuj szczegółową analizę
                </Button>
              </div>
            </>
          ) : (
            <>
              <DivorceForm 
                formData={formData}
                onDataUpdate={handleDataUpdate}
                onProgressChange={handleProgressChange}
              />
              <div className="flex justify-between mt-8 gap-4">
                <Button 
                  onClick={handleGenerateAnalysis}
                  disabled={progress < 40}
                  className="w-full"
                  variant="default"
                >
                  Generuj analizę
                </Button>
                <Button 
                  onClick={handleDetailedForm}
                  disabled={progress < 40}
                  className="w-full"
                  variant="outline"
                >
                  Podaj więcej szczegółów
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
