'use client'

import React from 'react'
import DivorceFormDetailed from '@/components/form/DivorceFormDetailed'

export default function DetailedFormPage({ params }: { params: Promise<{ voivodeship: string }> }) {
  const { voivodeship } = React.use(params)
  const decodedVoivodeship = decodeURIComponent(voivodeship)

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-center">
          Szczegółowa analiza sprawy rozwodowej
          <span className="block text-2xl text-muted-foreground mt-2">
            Województwo {decodedVoivodeship}
          </span>
        </h1>
        <div className="w-full max-w-2xl">
          <DivorceFormDetailed />
        </div>
      </div>
    </div>
  )
} 