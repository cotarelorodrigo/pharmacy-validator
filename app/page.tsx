import { Prescription } from "@/components/prescription";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Prescription Validator</h1>
          <p className="text-sm text-muted-foreground">
            Use your camera to validate prescription details in real-time
          </p>
        </div>
        <Prescription />
      </div>
    </main>
  );
}
