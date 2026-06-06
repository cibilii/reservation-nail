"use client";
import { useEffect, useState } from "react";

const STEPS = [
  { id: 1, name: 'انتخاب سرویس', icon: '💅', desc: 'خدمات مورد نظر را انتخاب کنید' },
  { id: 2, name: 'اطلاعات و زمان', icon: '📅', desc: 'مشخصات و زمان رزرو' },
  { id: 3, name: 'تأیید نهایی', icon: '✅', desc: 'بررسی و ثبت رزرو' },
];

export default function BookingSteps({ currentStep = 1 }) {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStep(currentStep), 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="w-full py-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        {STEPS.map((step, index) => {
          const isCompleted = animatedStep > step.id;
          const isCurrent = animatedStep === step.id;
          const isPending = animatedStep < step.id;

          return (
            <div key={step.id} className="flex items-center w-full">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                {/* Glow effect for current step */}
                {isCurrent && (
                  <div className="absolute -inset-3 bg-purple-500/20 rounded-full blur-xl animate-pulse-glow"></div>
                )}

                <div
                  className={`
                    relative w-14 h-14 rounded-full flex items-center justify-center text-xl
                    transition-all duration-700 transform
                    ${
                      isCompleted
                        ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white scale-110 shadow-lg shadow-purple-500/30'
                        : isCurrent
                        ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white scale-125 shadow-xl shadow-purple-500/50 animate-pulse-glow'
                        : 'bg-white/5 text-gray-500 border-2 border-white/10'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 animate-fade-in-up"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={isCurrent ? 'animate-float' : ''}>{step.icon}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-3 text-sm font-medium hidden sm:block transition-all duration-500
                    ${isCurrent ? 'text-purple-400 font-bold scale-110' : 
                      isCompleted ? 'text-purple-300' : 'text-gray-600'}
                  `}
                >
                  {step.name}
                </span>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-1000 ease-out
                      ${
                        isCompleted
                          ? 'w-full bg-gradient-to-r from-purple-500 to-fuchsia-500'
                          : isCurrent
                          ? 'w-1/2 bg-gradient-to-r from-purple-500 to-white/10'
                          : 'w-0'
                      }
                    `}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="text-center sm:hidden mb-4">
        <span className="text-sm text-purple-400 font-medium">
          مرحله {currentStep} از {STEPS.length}: {STEPS[currentStep - 1]?.desc}
        </span>
      </div>
    </div>
  );
}
