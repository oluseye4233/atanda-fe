import { JourneyHeader, JourneyMap } from "@/components/book/JourneyMap";

export default function BookCompanionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <JourneyHeader />
      <JourneyMap />
    </div>
  );
}
