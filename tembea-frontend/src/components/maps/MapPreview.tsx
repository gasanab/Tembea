import { MapPinned } from "lucide-react";

export function MapPreview() {
  return (
    <div className="dashboard-card relative min-h-80 overflow-hidden p-5">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(46,204,113,.18)_25%,transparent_25%),linear-gradient(-45deg,rgba(46,204,113,.18)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(20,90,50,.12)_75%),linear-gradient(-45deg,transparent_75%,rgba(20,90,50,.12)_75%)] bg-[length:38px_38px] bg-[position:0_0,0_19px,19px_-19px,-19px_0]" />
      <div className="relative z-10 stack-sm">
        <span className="availability-pill w-fit">
          <MapPinned size={16} /> Rwanda map preview
        </span>
        <h3 className="text-2xl font-black">Discover clusters around Kigali, Volcanoes, Akagera, Nyungwe, and Lake Kivu.</h3>
      </div>
    </div>
  );
}
