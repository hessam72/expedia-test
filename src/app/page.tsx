import ExpediaHtmlWidget from "@/components/ExpediaHtmlWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-8">
      <ExpediaHtmlWidget
        camref="1110ldRms"
        pubref="Wurora"
      />
    </div>
  );
}