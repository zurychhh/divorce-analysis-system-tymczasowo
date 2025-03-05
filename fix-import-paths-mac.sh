#!/bin/bash
sed -i '' 's/import { cn } from "\.\.\/\.\.\/lib\/utils"/import { cn } from "@\/lib\/utils"/g' src/components/ui/card.tsx
sed -i '' 's/import { cn } from "\.\.\/\.\.\/lib\/utils"/import { cn } from "@\/lib\/utils"/g' src/components/ui/select.tsx
sed -i '' 's/import { cn } from "\.\.\/\.\.\/lib\/utils"/import { cn } from "@\/lib\/utils"/g' src/components/ui/progress.tsx
sed -i '' 's/import { cn } from "\.\.\/\.\.\/lib\/utils"/import { cn } from "@\/lib\/utils"/g' src/components/ui/switch.tsx
sed -i '' 's/import { cn } from "\.\.\/\.\.\/lib\/utils"/import { cn } from "@\/lib\/utils"/g' src/components/ui/button.tsx
