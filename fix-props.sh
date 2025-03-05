#!/bin/bash
sed -i '' 's/onProgressChange?: (progress: number) => void;/onProgressChange: (progress: number) => void;/g' src/components/form/DivorceFormDetailed.tsx
