import { NextRequest, NextResponse } from 'next/server';

const IMAGE_AI_URL = process.env.IMAGE_AI_INTERNAL_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query string from search params
    const params = new URLSearchParams();
    if (searchParams.get('storeId')) params.append('storeId', searchParams.get('storeId')!);
    if (searchParams.get('startDate')) params.append('startDate', searchParams.get('startDate')!);
    if (searchParams.get('endDate')) params.append('endDate', searchParams.get('endDate')!);
    if (searchParams.get('employeeId')) params.append('employeeId', searchParams.get('employeeId')!);
    if (searchParams.get('limit')) params.append('limit', searchParams.get('limit')!);
    if (searchParams.get('offset')) params.append('offset', searchParams.get('offset')!);

    const queryString = params.toString();
    const url = `${IMAGE_AI_URL}/attendance/logs${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Image AI service error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Attendance logs error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
