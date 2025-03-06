'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Scale } from 'lucide-react'

const voivodeships = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie"
]

export default function Home() {
  const router = useRouter()

  const handleVoivodeshipSelect = (value: string) => {
    router.push(`/form/${encodeURIComponent(value)}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-8 px-4">
        <Scale className="w-24 h-24 mx-auto text-primary animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Kalkulator prawdopodobieństwa
          <br />
          wyniku rozpraw sądowych
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Wybierz województwo, aby rozpocząć analizę sprawy rozwodowej
        </p>
        <div className="w-full max-w-md mx-auto">
          <Select onValueChange={handleVoivodeshipSelect}>
            <SelectTrigger className="w-full h-12 text-lg flex justify-center items-center border-white">
              <SelectValue 
                placeholder="Wybierz województwo" 
                className="flex-grow text-center"
              />
            </SelectTrigger>
            <SelectContent>
              <div className="w-full">
                {voivodeships.map((voivodeship) => (
                  <SelectItem 
                    key={voivodeship} 
                    value={voivodeship} 
                    className="text-center justify-center"
                  >
                    {voivodeship}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
