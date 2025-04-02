// D:\AI-Marketplace\integrated-next-deep\integrate-deeplake-next\src\app\test-visionx-engine\VisionXEngineRunner.tsx
'use client';

import { useState, useEffect } from 'react';

// Pre-defined model options
const MODEL_OPTIONS = [
  { value: "simple_cnn,densenet,resnet", label: "All Models" },
  { value: "simple_cnn", label: "Simple CNN" },
  { value: "densenet", label: "DenseNet" },
  { value: "resnet", label: "ResNet" }
];

// Define types for form data
interface FormData {
  model_types: string;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  device: string;
  val_frac: number;
  test_frac: number;
  seed: number;
  compare_models: boolean;
  resume_workflow: boolean;
}

// Define API response types
interface RunResponse {
  runId: string;
  message: string;
}

interface StatusResponse {
  status: string;
  runId: string;
  reportUrl: string | null;
  logExcerpt?: string;
  error?: string;
}

export default function VisionXEngineRunner() {
  // Default values
  const [formData, setFormData] = useState<FormData>({
    model_types: "simple_cnn,densenet,resnet",
    epochs: 4,
    batch_size: 64,
    learning_rate: 0.001,
    device: "cpu",
    val_frac: 0.2,
    test_frac: 0.2,
    seed: 42,
    compare_models: false,
    resume_workflow: false
  });

  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logExcerpt, setLogExcerpt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes for text/select/number fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert to number if the input type is number
    const processedValue = type === 'number' ? 
      (value === '' ? '' : Number(value)) : 
      value;
    
    setFormData({
      ...formData,
      [name]: processedValue as unknown // We'll handle the type conversion here
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Submit form to start VisionX pipeline
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/visionx/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start pipeline');
      }

      const data = await response.json() as RunResponse;
      setRunId(data.runId);
      setStatus('running');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for status updates when a run is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    const checkStatus = async () => {
      if (!runId) return;
      
      try {
        const response = await fetch(`/api/visionx/status?runId=${runId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        
        const data = await response.json() as StatusResponse;
        setStatus(data.status);
        
        if (data.logExcerpt) {
          setLogExcerpt(data.logExcerpt);
        }
        
        if (data.status === 'complete' || data.status === 'failed') {
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };
    
    if (runId && (status === 'running' || !status)) {
      // Check immediately
      checkStatus();
      // Then set up interval
      interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    }
    
    // Cleanup function
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runId, status]);

  // Determine button text
  const getButtonText = (): string => {
    if (isLoading) return 'Starting Pipeline...';
    if (formData.compare_models) return 'Run Model Comparison';
    if (formData.resume_workflow) return 'Resume Workflow';
    return 'Run Models';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">VisionX AI Marketplace Engine</h1>
      
      {/* Pipeline submission form */}
      <form onSubmit={handleSubmit} className="mb-8">
        {/* Special workflow options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-3">Workflow Options</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="compare_models"
                name="compare_models"
                checked={formData.compare_models}
                onChange={handleCheckboxChange}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="compare_models" className="text-gray-700">
                Compare All Models
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="resume_workflow"
                name="resume_workflow"
                checked={formData.resume_workflow}
                onChange={handleCheckboxChange}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="resume_workflow" className="text-gray-700">
                Resume Failed Workflow
              </label>
            </div>
          </div>
        </div>
        
        {/* Only show model selection if not comparing all models */}
        {!formData.compare_models && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Model Types:</label>
              <select
                name="model_types"
                value={formData.model_types}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={formData.compare_models}
              >
                {MODEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of models to train</p>
            </div>
            
            {/* Device Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Device:</label>
              <select
                name="device"
                value={formData.device}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="cpu">CPU</option>
                <option value="cuda">CUDA (GPU)</option>
              </select>
            </div>
            
            {/* Training Epochs */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Training Epochs:</label>
              <input
                type="number"
                name="epochs"
                value={formData.epochs}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="1"
                max="100"
              />
            </div>
            
            {/* Batch Size */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Batch Size:</label>
              <input
                type="number"
                name="batch_size"
                value={formData.batch_size}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="1"
                max="512"
              />
            </div>
            
            {/* Learning Rate */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Learning Rate:</label>
              <input
                type="number"
                name="learning_rate"
                value={formData.learning_rate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.0001"
                min="0.0001"
                max="0.1"
              />
            </div>
            
            {/* Validation Fraction */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Validation Split:</label>
              <input
                type="number"
                name="val_frac"
                value={formData.val_frac}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.05"
                min="0.05"
                max="0.5"
              />
            </div>
            
            {/* Test Fraction */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Test Split:</label>
              <input
                type="number"
                name="test_frac"
                value={formData.test_frac}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.05"
                min="0.05"
                max="0.5"
              />
            </div>
            
            {/* Random Seed */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Random Seed:</label>
              <input
                type="number"
                name="seed"
                value={formData.seed}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="1"
                max="1000"
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {getButtonText()}
        </button>
      </form>
      
      {/* Status display */}
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
          {error}
        </div>
      )}
      
      {runId && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Pipeline Run</h2>
          <p><strong>Run ID:</strong> {runId}</p>
          <p><strong>Status:</strong> {status}</p>
          
          {logExcerpt && (
            <div className="mt-2">
              <h3 className="font-semibold">Log Output:</h3>
              <pre className="mt-1 p-2 bg-black text-green-500 rounded text-sm overflow-auto max-h-60">
                {logExcerpt}
              </pre>
            </div>
          )}
          
          {status === 'complete' && (
  <div className="mt-4 flex flex-wrap gap-2">
    <a
      href={`/reports/${runId}.html`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      View Report
    </a>

    {formData.compare_models && (
      <a
        href={`/reports/comparison_report.html`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Model Comparison
      </a>
    )}
  </div>
)}


          {status === 'failed' && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">Pipeline execution failed. Check logs for details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}