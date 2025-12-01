import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ containerId: string }> }
) {
  try {
    const { containerId } = await params;
    const url = new URL(request.url);
    const tail = url.searchParams.get('tail') || '100';
    const since = url.searchParams.get('since') || '1h';

    // Fetch real logs from Docker
    const command = `docker logs ${containerId} --tail ${tail} --since ${since} 2>&1`;
    console.log(`Executing: ${command}`);

    try {
      const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 5 }); // 5MB buffer
      
      return NextResponse.json({
        success: true,
        containerId,
        logs: stdout || 'No logs available',
      });
    } catch (execError: unknown) {
      const error = execError as { stdout?: string; stderr?: string; message?: string };
      // Docker logs command puts output in stdout even on "error"
      if (error.stdout) {
        return NextResponse.json({
          success: true,
          containerId,
          logs: error.stdout,
        });
      }
      
      return NextResponse.json({
        success: false,
        containerId,
        logs: `Failed to fetch logs: ${error.message || 'Unknown error'}`,
        error: error.stderr || error.message,
      });
    }
  } catch (error) {
    console.error('Failed to get logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
