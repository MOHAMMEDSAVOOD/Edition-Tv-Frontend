import { NextRequest, NextResponse } from 'next/server';
import { pool, withAuth } from '../../../db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ tableName: string }> }) {
  return withAuth(req, async () => {
    try {
      const { tableName } = await params;
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
      }

      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `;
      const columnsResult = await pool.query(columnsQuery, [tableName]);

      const pkQuery = `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tco
        JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = tco.constraint_name
          AND kcu.constraint_schema = tco.constraint_schema
          AND kcu.constraint_name = tco.constraint_name
        WHERE tco.constraint_type = 'PRIMARY KEY'
          AND kcu.table_schema = 'public'
          AND kcu.table_name = $1
      `;
      const pkResult = await pool.query(pkQuery, [tableName]);

      const fkQuery = `
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      `;
      const fkResult = await pool.query(fkQuery, [tableName]);

      return NextResponse.json({
        columns: columnsResult.rows,
        primaryKeys: pkResult.rows,
        foreignKeys: fkResult.rows,
      });
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  });
}
