"use client"

import MainSearch from "@/components/search/MainSearch";

export default function Home() {
 return <MainSearch onRegionSelect={(region) => window.location.href = `/analyze/${region}`} />;
}
