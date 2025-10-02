import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Read PRD from docs directory (source of truth)
    const prdPath = join(process.cwd(), '..', '..', 'docs', 'prd.json');
    const prdContent = readFileSync(prdPath, 'utf-8');
    const prd = JSON.parse(prdContent);
    
    return NextResponse.json(prd, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to load PRD:', error);
    return NextResponse.json(
      { error: 'Failed to load PRD' },
      { status: 500 }
    );
  }
}
