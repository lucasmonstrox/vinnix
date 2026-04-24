import Link from "next/link"

export function RegisterFooter() {
  return (
    <footer className="
      flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground
    ">
      <p>
        Já possui conta?{" "}
        <Link
          className="
            text-primary underline-offset-4
            hover:underline
          "
          href="/"
        >
          Entrar
        </Link>
      </p>
      <p>© {new Date().getFullYear()} vinnix — registro de demonstração.</p>
    </footer>
  )
}
