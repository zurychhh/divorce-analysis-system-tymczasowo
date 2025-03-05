'use client'

import React from 'react'
import DivorceForm from '@/components/form/DivorceForm'
import DivorceFormDetailed from '@/components/form/DivorceFormDetailed'
import { Button } from "@/components/ui/button"

export default function FormPage({ params }: { params: Promise<{ voivodeship: string }> }) {
  const { voivodeship } = React.use(params)
  const decodedVoivodeship = decodeURIComponent(voivodeship)
  const [progress, setProgress] = React.useState(0)
  const [showDetailed, setShowDetailed] = React.useState(false)
  const [formData, setFormData] = React.useState({
    marriageLength: "",
    childrenCount: "",
    mainDivorceCause: "",
    assetsValue: "",
    housingStatus: ""
  })
  
  const [detailedFormData, setDetailedFormData] = React.useState({
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

  const [detailedProgress, setDetailedProgress] = React.useState(40)

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
                formData={detailedFormData}
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