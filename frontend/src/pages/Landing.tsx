import { Link } from "react-router-dom";
import { Camera, ScanSearch, ListOrdered, UserCheck, Database, PawPrint, ArrowRight } from "lucide-react";

const steps = [
  { icon: Camera, label: "Aerial Survey", description: "Capture wildlife from above" },
  { icon: ScanSearch, label: "AI Detection", description: "Automatic species recognition" },
  { icon: ListOrdered, label: "Species Count", description: "Detailed animal counts" },
  { icon: UserCheck, label: "Ranger Verified", description: "Professional review" },
  { icon: Database, label: "Conservation Data", description: "Structured records" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-forest-800 via-forest-900 to-forest-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M20,30 Q50,10 80,30 T100,70%22 stroke=%22white%22 fill=%22none%22/></svg>')]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-sm uppercase tracking-widest text-forest-200">
            <PawPrint size={18} className="text-accent-400" />
            <span>Welgevonden Game Reserve · Limpopo</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            GAME<span className="text-accent-400">COUNT</span>
          </h1>

          <p className="text-xl sm:text-2xl text-forest-100 mb-4 font-medium leading-relaxed">
            AI-Assisted Wildlife Population Counting
          </p>

          <p className="max-w-3xl mx-auto text-forest-200 text-lg mb-10 leading-relaxed">
            Turn aerial wildlife surveys into structured, reviewable conservation data. GAME COUNT combines advanced AI detection with ranger expertise to deliver accurate, verified population counts for wildlife management and conservation planning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/new-survey"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Camera size={20} />
              Start New Survey
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-600 text-white font-bold px-8 py-4 rounded-lg border border-forest-500 transition-all"
            >
              View Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="text-sm text-forest-300 mb-8">
            <p>Professional wildlife conservation operations platform</p>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-4">Conservation Workflow</h2>
          <p className="text-forest-500 text-lg max-w-2xl mx-auto">
            From aerial survey to verified conservation intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex flex-col items-center">
              {/* Card */}
              <div className="bg-white border border-earth-200 rounded-lg p-6 text-center mb-4 w-full hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-forest-100 to-forest-50 rounded-lg mb-4">
                  <step.icon size={28} className="text-forest-700" />
                </div>
                <h3 className="text-sm font-bold text-forest-800 mb-2 uppercase tracking-wide">{step.label}</h3>
                <p className="text-xs text-forest-500">{step.description}</p>
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block mb-4 text-earth-300">
                  <ArrowRight size={24} className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-forest-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border-2 border-forest-200 rounded-xl p-8 sm:p-12">
            <p className="text-2xl sm:text-3xl font-bold text-forest-800 mb-4">
              "AI Assists. Rangers Decide."
            </p>
            <p className="text-forest-600 text-lg leading-relaxed">
              GAME COUNT amplifies ranger expertise with advanced computer vision. AI provides the first-pass analysis, but conservation professionals maintain full authority over all verification and decisions. Every data point is ranger-approved before becoming part of conservation records.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-4">Platform Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Camera className="w-8 h-8" />}
            title="Aerial Survey Upload"
            description="Seamless image upload and storage for aerial wildlife imagery"
          />
          <FeatureCard
            icon={<ScanSearch className="w-8 h-8" />}
            title="AI-Powered Detection"
            description="Advanced computer vision identifies and counts wildlife with confidence scoring"
          />
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Conservation Records"
            description="Structured database of verified surveys and population observations"
          />
          <FeatureCard
            icon={<PawPrint className="w-8 h-8" />}
            title="Species Monitoring"
            description="Track population data for Elephant, Giraffe, Impala, Springbok and more"
          />
          <FeatureCard
            icon={<UserCheck className="w-8 h-8" />}
            title="Ranger Verification"
            description="Professional review tools for rangers to verify and adjust AI results"
          />
          <FeatureCard
            icon={<ArrowRight className="w-8 h-8" />}
            title="Operations Map"
            description="Visualize survey locations and wildlife activity across your reserve"
          />
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-forest-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Modernize Your Conservation Operations?</h2>
          <p className="text-forest-200 mb-8 text-lg">
            Begin your first wildlife survey and discover a new way to gather conservation intelligence.
          </p>
          <Link
            to="/new-survey"
            className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Camera size={20} />
            Create First Survey
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-earth-200 rounded-lg p-8 hover:shadow-lg hover:border-earth-300 transition-all">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg mb-4 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-forest-800 mb-2">{title}</h3>
      <p className="text-forest-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
