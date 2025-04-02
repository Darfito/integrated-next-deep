import VisionXEngineRunner from "./components/VisionXEngineRunner";


export default function VisionXEnginePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          VisionX AI Marketplace Engine
        </h1>
        
        <VisionXEngineRunner />
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>Next.js + Nextflow Integration</p>
      </footer>
    </div>
  );
}