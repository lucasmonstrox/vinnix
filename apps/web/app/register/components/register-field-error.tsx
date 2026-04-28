type RegisterFieldErrorProps = {
  id: string
  message: string | undefined
}

export function RegisterFieldError({ id, message }: RegisterFieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  )
}
