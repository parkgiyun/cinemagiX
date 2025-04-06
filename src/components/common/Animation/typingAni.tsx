import { Typewriter } from "react-simple-typewriter"
import { memo } from "react"

export const TypingText = ({ text, className }: { text: string; className: string }) => {
  return (
    <div className={className}>
      <Typewriter
        words={[text]} // 타이핑할 텍스트
        loop={1} // 한 번만 실행
        typeSpeed={100} // 타이핑 속도 (밀리초)
        deleteSpeed={50} // 삭제 속도 (사용 안 함)
        cursor={false} // 커서 제거하여 완료 상태를 명확하게 함
      />
    </div>
  )
}

const MemoTypingText = memo(TypingText)
MemoTypingText.displayName = "TypingText"
export default MemoTypingText

