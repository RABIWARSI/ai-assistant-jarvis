import { JarvisInterface } from '@/components/jarvis-interface'

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient HUD backdrop */}
      <div className="pointer-events-none absolute inset-0 hud-grid opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, oklch(0.3 0.06 210 / 0.35), transparent 60%)',
        }}
      />
      <div className="scanlines pointer-events-none absolute inset-0" />

      <JarvisInterface />
    </main>
  )
}
