import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="dark relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-neutral-950 p-6 text-white md:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.3),transparent),radial-gradient(ellipse_40%_35%_at_85%_110%,rgba(234,88,12,0.2),transparent),radial-gradient(ellipse_40%_35%_at_10%_110%,rgba(245,158,11,0.12),transparent)]"
      />
      <div className="relative w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
