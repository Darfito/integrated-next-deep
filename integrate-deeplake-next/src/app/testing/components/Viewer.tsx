"use client";

import React, { useState, useEffect } from "react";

interface DatasetInfo {
  path: string;
  num_samples: number;
  tensors: string[];
  read_only: boolean;
}

const Viewer = () => {
  const [images, setImages] = useState<string[]>([]);
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDataset() {
      try {
        const response = await fetch("http://127.0.0.1:8000/dataset");
        const data = await response.json();
        setImages(data.images);
        setInfo(data.info);
      } catch (error) {
        console.error("Error fetching dataset:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDataset();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">DeepLake Image Viewer</h1>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {info && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-6 max-w-lg w-full text-center">
              <h2 className="text-lg font-semibold mb-2">Dataset Info</h2>
              <p><strong>Path:</strong> {info.path}</p>
              <p><strong>Total Samples:</strong> {info.num_samples}</p>
              <p><strong>Available Tensors:</strong> {info.tensors.join(", ")}</p>
              <p><strong>Read Only:</strong> {info.read_only ? "Yes" : "No"}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageSrc, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <img src={imageSrc} alt={`DeepLake Image ${index + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Viewer;
