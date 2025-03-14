'use client'

import React, { useState } from 'react'
import DivorceForm from '@/components/form/DivorceForm'
import DivorceFormDetailed from '@/components/form/DivorceFormDetailed'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button"

// Proste dane statyczne do wykresu
const chartData = [
  { year: "2015", "Rozwody": 1500, "Średnia krajowa": 1200 },
  { year: "2016", "Rozwody": 1550, "Średnia krajowa": 1250 },
  { year: "2017", "Rozwody": 1600, "Średnia krajowa": 1300 },
  { year: "2018", "Rozwody": 1650, "Średnia krajowa": 1350 },
  { year: "2019", "Rozwody": 1700, "Średnia krajowa": 1400 },
  { year: "2020", "Rozwody": 1750, "Średnia krajowa": 1450 },
  { year: "2021", "Rozwody": 1800, "Średnia krajowa": 1500 },
  { year: "2022", "Rozwody": 1850, "Średnia krajowa": 1550 },
];

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
        
        {/* Bezpośredni wykres bez użycia DivorceTrends */}
        <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden">
          <h3 className="text-lg font-medium mb-4 text-center">Trendy rozwodowe - {decodedVoivodeship}</h3>
          <div style={{ width: '100%', height: '90%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Rozwody"
                  stroke="#ff0000"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Średnia krajowa"
                  stroke="#888"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
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
