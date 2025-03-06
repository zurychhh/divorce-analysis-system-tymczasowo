"use client"
import { useParams } from "next/navigation";
import FormWithDivorceStats from "@/components/form/FormWithDivorceStats";

export default function AnalyzePage() {
  const { region } = useParams();
  return <FormWithDivorceStats initialRegion={region as string} />;
}
