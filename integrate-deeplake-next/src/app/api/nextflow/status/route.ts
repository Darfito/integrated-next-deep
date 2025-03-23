// D:\AI-Marketplace\integrated-next-deep\integrate-deeplake-next\src\app\api\nextflow\status\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const runId = searchParams.get('runId');
  
  if (!runId) {
    return NextResponse.json(
      { message: 'Run ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Path to status file
    const workDir = path.join(process.cwd(), 'work', runId);
    const statusFile = path.join(workDir, 'status.json');
    const logFile = path.join(workDir, 'execution.log');
    
    // Check if status file exists
    if (!fs.existsSync(statusFile)) {
      return NextResponse.json(
        { message: 'Run not found', runId },
        { status: 404 }
      );
    }
    
    // Read status file
    const statusData = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    
    // Check for report file existence
    const reportPath = path.join(process.cwd(), 'public', 'reports', `${runId}.html`);
    const reportExists = fs.existsSync(reportPath);
    
    // Read last few lines of log if available
    let logExcerpt = null;
    if (fs.existsSync(logFile)) {
      const logContent = fs.readFileSync(logFile, 'utf8');
      // Get last 10 lines or fewer
      const logLines = logContent.split('\n');
      logExcerpt = logLines.slice(-10).join('\n');
    }
    
    // Combine status with report info
    const response = {
      ...statusData,
      runId,
      reportUrl: reportExists ? `/reports/${runId}.html` : null,
      logExcerpt
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { message: 'Failed to get status', error: (error as Error).message },
      { status: 500 }
    );
  }
}