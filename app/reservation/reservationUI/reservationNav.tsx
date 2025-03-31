"use client";
import { Disclosure } from "@headlessui/react";
import { TypingText } from "@/src/components/common/Animation/typingAni";
// { activeStep, setActiveStep }
interface ReservationStateProps {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

const ReservationNav = ({ activeStep, setActiveStep }: ReservationStateProps) => {
  const steps = ["Movie", "Cinema", "Seats", "Payment"];

  function classNames(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(" ");
  }

  const back = (i: number) => {
    setActiveStep(i);
  };

  return (
    <Disclosure as="nav" className="bg-white drop-shadow-[0_-6px_10px_rgba(0,0,0,0.1)] py-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* <div className="shrink-0">
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="size-8"
            />
          </div> */}
          <div
            className="flex items-center"
            style={{ justifyContent: "space-between", margin: "auto" }}
          >
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-10">
                {steps.map((item, i) => (
                  <div key={item} className="relative flex">
                    <span
                      key={item}
                      aria-current={activeStep === i ? "page" : undefined}
                      className={classNames(
                        activeStep === i
                          ? "drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] text-gray-900 scale-110 transition-all"
                          : "rounded-md text-gray-700 bg-white-500 hover:bg-gray-300",
                        "px-4 py-3 font-medium m-1",
                        "w-[100px] min-w-[100px] flex justify-center items-center"
                      )}
                      onClick={() => back(i)}
                    >
                      {/* // 클릭 시 해당 step 활성화 */}
                      <TypingText text={item} className=""></TypingText>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default ReservationNav;
