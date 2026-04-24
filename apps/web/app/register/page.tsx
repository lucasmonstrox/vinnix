import { RegisterFooter } from "./components/register-footer"
import { RegisterForm } from "./components/register-form"
import { RegisterHeader } from "./components/register-header"

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <RegisterHeader />
        <RegisterForm />
        <RegisterFooter />
      </div>
    </main>
  )
}
