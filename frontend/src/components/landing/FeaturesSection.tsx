import { FileText, Users, LayoutDashboard, Bell } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "One-Click PDF Parsing",
    description: "Upload a 15-page guideline. Get a structured task list in seconds, not hours.",
  },
  {
    icon: Users,
    title: "Smart Task Distribution",
    description: "Assign sections via dropdown. AI suggests optimal workload balance for your team.",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Kanban Dashboard",
    description: "Four statuses. Drag and drop. Real-time visibility into exactly who is falling behind.",
  },
  {
    icon: Bell,
    title: "Enterprise Alarm Integrations",
    description: "Google Calendar + Cisco Webex. Automated reminders. Zero missed deadlines.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-6 md:px-12 bg-surface-container/50">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Rubix solves every bottleneck in collaborative project work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glass-card rounded-2xl p-8 glass-hover fade-in-up stagger-${i + 1}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-5">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
