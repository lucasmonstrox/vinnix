export function RegisterUserId({ id }: { id: string | undefined }) {
  if (!id) return null
  return (
    <span className="mt-1 block font-mono text-xs opacity-70">id: {id}</span>
  )
}
