"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ReactNode } from "react"

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  children?: ReactNode
}

export const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  children,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex space-x-2">
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
        {children}
      </div>
    </div>
  )
}

