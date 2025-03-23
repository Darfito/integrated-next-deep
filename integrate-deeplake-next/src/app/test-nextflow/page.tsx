// import UserInformationList from "./components/userInfo";

import MedNISTRunner from "./components/MedNISTRunner";

export default function TestNextFlow() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          MedNIST Classification with Nextflow & MONAI
        </h1>

        <MedNISTRunner />
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>Next.js + Nextflow + MONAI Integration</p>
      </footer>
    </div>
  );
}
