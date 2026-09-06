import { lazy, Suspense } from 'react'

// Code-split: Three.js (the scene + lamp) lives in its own chunk and only
// loads after the page is interactive.
const LampApp = lazy(() => import('./components/LampApp'))

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 text-sm text-neutral-400">
          Loading lamp…
        </div>
      }
    >
      <LampApp />
    </Suspense>
  )
}

export default App