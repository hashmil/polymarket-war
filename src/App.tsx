import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { ReportView } from "./views/ReportView.tsx";

const DashboardView = import.meta.env.DEV
  ? lazy(() =>
      import("./views/DashboardView.tsx").then((m) => ({
        default: m.DashboardView,
      }))
    )
  : null;

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportView />} />
        {DashboardView && (
          <Route
            path="/dashboard"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted font-mono text-sm">
                    Loading dashboard...
                  </div>
                }
              >
                <DashboardView />
              </Suspense>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}
