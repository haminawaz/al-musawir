// Runs once when the server starts: stop straight away if the backend address is missing,
// instead of failing on the first request.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  return import("./lib/backend").then(({ backendOrigin }) => {
    backendOrigin();
  });
}
