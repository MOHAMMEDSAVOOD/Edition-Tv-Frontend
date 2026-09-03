import { NextRequest, NextResponse } from 'next/server';
import { pool, withAuth } from '../db';

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
        ORDER BY table_name
      `);
      return NextResponse.json(result.rows);
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  });
}
