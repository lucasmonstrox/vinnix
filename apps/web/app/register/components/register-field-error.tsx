export function RegisterFieldError({
  id,
  message,
}: {
  id: string
  message: string | undefined
}) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  )
}
