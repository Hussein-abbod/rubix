import { Calendar, Video } from "lucide-react";

export function IntegrationsBar() {
  return (
    <section id="integrations" className="py-20 px-6 md:px-12 bg-[#1f1635]">
      <div className="max-w-[1280px] mx-auto">
        <p className="text-center text-sm font-semibold tracking-widest text-[#94A3B8] mb-10 uppercase">
          Works With
        </p>
        <div className="flex items-center justify-center gap-12 md:gap-24 flex-wrap">
          <div className="flex items-center gap-3 text-white/50 hover:text-white transition-all duration-300 grayscale hover:grayscale-0">
            <Calendar size={32} />
            <span className="text-lg font-semibold">Google Calendar</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 hover:text-white transition-all duration-300 grayscale hover:grayscale-0">
            <Video size={32} />
            <span className="text-lg font-semibold">Cisco Webex</span>
          </div>
        </div>
      </div>
    </section>
  );
}
