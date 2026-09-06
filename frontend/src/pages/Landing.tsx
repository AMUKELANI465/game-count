import { Link } from "react-router-dom";
import { UploadCloud, ScanSearch, ListOrdered, Database, BarChart3, ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import WildlifeMotif from "../components/WildlifeMotif";

const steps = [
  { icon: UploadCloud, label: "Upload", description: "Add a wildlife image" },
  { icon: ScanSearch, label: "AI Detection", description: "YOLO finds the animals" },
  { icon: ListOrdered, label: "Count", description: "Species-level totals" },
  { icon: Database, label: "Save", description: "Stored to your history" },
  { icon: BarChart3, label: "Analytics", description: "Trends across analyses" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-earth-200">
        <WildlifeMotif className="pointer-events-none absolute inset-0 h-full w-full text-neutral-950 opacity-[0.05]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-24 sm:pb-24 text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <Logo size={24} />
            </span>
          </div>

          <div className="kicker justify-center mb-5">
            <span>Elephant · Giraffe · Impala · Springbok</span>
          </div>

          <h1 className="text-5xl sm:text-7xl leading-[1.05] tracking-tight text-neutral-950">
            Count wildlife,
            <br />
            <span className="headline-accent">not hours.</span>
          </h1>

          <p className="mt-6 max-w-xl mx-auto text-earth-500 text-base sm:text-lg leading-relaxed">
            Upload a wildlife image and GameCount turns it into a structured animal count using AI - detected,
            counted, saved, and ready for your history and analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/new-survey" className="gc-button-primary">
              <UploadCloud size={18} />
              Analyze an Image
            </Link>
            <Link to="/analytics" className="gc-button-secondary">
              View Analytics
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="mt-8 text-xs text-earth-400 max-w-md mx-auto">
            AI results are estimates based on model confidence, not guaranteed accuracy. Every result can be
            reviewed and corrected before it's saved.
          </p>
        </div>
      </div>

      {/* Workflow */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">How it works</h2>
          <p className="text-earth-500 mt-2">Five steps from image to insight</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div key={step.label} className="gc-card p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-earth-100 mb-3">
                <step.icon size={22} className="text-neutral-800" />
              </div>
              <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">{step.label}</h3>
              <p className="text-xs text-earth-500 mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy */}
      <div className="bg-white border-y border-earth-200 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-4">"AI assists. Humans decide."</p>
          <p className="text-earth-500 text-base sm:text-lg leading-relaxed">
            GameCount gives you a fast first-pass count from computer vision. Every detection carries a
            confidence score, not a guarantee - review and correct results before treating them as final.
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">What GameCount does</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard
            icon={<UploadCloud size={24} />}
            title="Simple image upload"
            description="Drag and drop on desktop, camera or gallery on mobile. JPG, PNG or WEBP up to 20MB."
          />
          <FeatureCard
            icon={<ScanSearch size={24} />}
            title="Real AI detection"
            description="Ultralytics YOLO detects animals with bounding boxes and a confidence score per detection."
          />
          <FeatureCard
            icon={<Database size={24} />}
            title="History & analytics"
            description="Every saved analysis feeds your history and analytics automatically - no manual entry."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-neutral-950 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Count your first image</h2>
          <p className="text-earth-300 mb-8">Upload a wildlife image and see what GameCount finds.</p>
          <Link
            to="/new-survey"
            className="inline-flex items-center justify-center gap-2 bg-white text-neutral-950 font-bold px-6 py-3.5 rounded-full hover:bg-earth-100 transition-colors"
          >
            <UploadCloud size={18} />
            Analyze an Image
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="gc-card p-6">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-950 text-white mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-neutral-950 mb-1.5">{title}</h3>
      <p className="text-earth-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
