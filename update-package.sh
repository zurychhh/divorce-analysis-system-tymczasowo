#!/bin/bash
sed -i '' 's/"react": "\^19.0.0"/"react": "\^18.2.0"/g' package.json
sed -i '' 's/"react-dom": "\^19.0.0"/"react-dom": "\^18.2.0"/g' package.json
