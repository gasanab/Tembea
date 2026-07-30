import { Check } from "lucide-react";

type Props = {
  currentStep: number;
};

export function CheckoutStepper({ currentStep }: Props) {
  const steps = [
    { id: 1, label: "Booking Created" },
    { id: 2, label: "Payment" },
    { id: 3, label: "Confirmation" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 mt-4 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-[20px] w-full h-[2px] bg-gray-200 -z-10" />
        <div 
          className="absolute left-0 top-[20px] h-[2px] bg-emerald-600 transition-all duration-500 -z-10" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }} 
        />
        
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-white px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                  isCompleted 
                    ? "bg-emerald-600 text-white border-2 border-emerald-600" 
                    : isActive
                      ? "bg-emerald-700 text-white border-[3px] border-emerald-100 ring-2 ring-emerald-700"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                }`}
              >
                {isCompleted ? <Check size={20} strokeWidth={3} /> : step.id}
              </div>
              <span className={`text-xs font-bold ${
                isActive ? "text-emerald-800" : isCompleted ? "text-emerald-600" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
