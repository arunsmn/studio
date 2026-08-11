import { DrawingCanvas } from "../components/DrawingCanvas";

export default function Page() {
  return (
    <main
      style={{ background: "var(--bg)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center p-6"
    >
      <h1 style={{ color: "var(--text)" }} className="text-2xl font-bold mb-6">
        Skrawl
      </h1>
      <DrawingCanvas />
    </main>
  );
}
