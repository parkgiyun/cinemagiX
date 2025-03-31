import { Button as ShadcnButton } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ButtonProps as ShadcnButtonProps } from "@/components/ui/button"

interface ButtonProps extends ShadcnButtonProps {
  loading?: boolean
  loadingText?: string
}

export const Button = ({ children, loading = false, loadingText, ...props }: ButtonProps) => {
  return (
    <ShadcnButton disabled={loading || props.disabled} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "로딩 중..."}
        </>
      ) : (
        children
      )}
    </ShadcnButton>
  )
}

