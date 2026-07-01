import { Upload, Brain, ListChecks } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload PDF",
    description: "Upload your project guideline. Rubix accepts any PDF and instantly extracts every section, word count, and requirement.",
  },
  {
    icon: Brain,
    number: "02",
    title: "AI Analysis",
    description: "Our AI analyzes the document structure, identifies key sections, and creates a structured task list in seconds.",
  },
  {
    icon: ListChecks,
    number: "03",
    title: "Automated Guidelines",
    description: "Tasks are assigned, deadlines are set, and integrations handle all reminders — zero missed deadlines.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">
            How Rubix Works
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Three simple steps to transform chaos into clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`glass-card rounded-2xl p-8 glass-hover fade-in-up stagger-${i + 1} ${i === 1 ? "md:mt-4" : ""} ${i === 2 ? "md:mt-8" : ""}`}
              >
                <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center mb-6">
                  <Icon size={28} className="text-primary" />
                </div>
                <div className="text-sm font-semibold text-primary-container tracking-widest mb-2">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{step.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
