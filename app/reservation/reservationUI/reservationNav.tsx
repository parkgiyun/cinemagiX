"use client"
// { activeStep, setActiveStep }
// 이 컴포넌트에서 props 타입을 확인하고 필요하면 수정합니다.
// 현재 타입 정의:
// interface ReservationStateProps {
//   activeStep: number
//   setActiveStep: React.Dispatch<React.SetStateAction<number>>
// }

// 다음과 같이 변경:
interface ReservationStateProps {
  activeStep: number
  setActiveStep: (id: number) => void
}

const ReservationNav = ({ activeStep, setActiveStep }: ReservationStateProps) => {
  const steps = ["영화 선택", "극장 및 시간", "좌석 선택", "결제"]

  function classNames(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(" ")
  }

  const back = (i: number) => {
    setActiveStep(i)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {steps.map((item, i) => (
            <div key={item} className="flex items-center">
              {i > 0 && <div className="h-px w-4 bg-gray-300"></div>}
              <button
                onClick={() => back(i)}
                disabled={i > activeStep}
                className={classNames(
                  "flex items-center justify-center rounded-full w-10 h-10 text-sm font-medium transition-all",
                  activeStep === i
                    ? "bg-primary text-white"
                    : i < activeStep
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed",
                )}
              >
                {i + 1}
              </button>
              <div className="ml-2 text-sm font-medium">
                <span
                  className={classNames(
                    activeStep === i
                      ? "text-primary font-semibold"
                      : i < activeStep
                        ? "text-gray-700"
                        : "text-gray-400",
                  )}
                >
                  {item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReservationNav

