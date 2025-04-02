import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Define the request body interface
interface RunRequest {
  params: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json() as RunRequest;
    const { params } = body;
    
    const runId = uuidv4();
    
    // Create necessary directories if they don't exist
    const workDir = path.join(process.cwd(), 'work', runId);
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    
    await mkdir(workDir, { recursive: true });
    await mkdir(reportsDir, { recursive: true });
    
    // Create a temporary file with parameters
    const paramsFilePath = path.join(workDir, 'params.txt');
    let paramsContent = '';
    
    // Format parameters for the params file
    for (const [key, value] of Object.entries(params)) {
      paramsContent += `${key}=${value}\n`;
    }
    
    // Write parameters to file
    await writeFile(paramsFilePath, paramsContent);
    
    // Create Windows paths that WSL can understand
    const winParamsFilePath = paramsFilePath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/mnt/$1').toLowerCase();
    
    // Execute the WSL script that will run Nextflow for VisionX
    const wslCommand = `wsl /home/darfito/run-visionx.sh "${runId}" "${winParamsFilePath}"`;
    
    console.log(`Executing WSL command: ${wslCommand}`);
    
    // Execute in background to avoid timeout
    exec(wslCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`WSL execution error: ${error.message}`);
        // Log error to a file
        const errorLog = path.join(workDir, 'wsl_error.log');
        fs.writeFileSync(errorLog, `Error: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`);
      }
    });
    
    // Create initial status file (the script will update it)
    const statusFile = path.join(workDir, 'status.json');
    await writeFile(statusFile, JSON.stringify({ status: 'running' }));
    
    // Return run ID immediately so client can track the job
    return NextResponse.json({ 
      runId,
      message: 'VisionX pipeline started in WSL' 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { message: 'Failed to start pipeline', error: (error as Error).message },
      { status: 500 }
    );
  }
}