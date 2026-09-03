import { NextRequest, NextResponse } from 'next/server';
import { pool, withAuth } from '../../../db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ tableName: string }> }) {
  return withAuth(req, async () => {
    try {
      const { tableName } = await params;
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
      }

      const searchParams = req.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const size = parseInt(searchParams.get('size') || '50', 10);
      const offset = (page - 1) * size;

      const recordsQuery = `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`;
      const recordsResult = await pool.query(recordsQuery, [size, offset]);

      const countQuery = `SELECT COUNT(*) FROM "${tableName}"`;
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].count, 10);

      return NextResponse.json({
        records: recordsResult.rows,
        total: totalCount,
        page,
        size
      });
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ tableName: string }> }) {
  return withAuth(req, async () => {
    try {
      const { tableName } = await params;
      const searchParams = req.nextUrl.searchParams;
      const pkColumn = searchParams.get('pkColumn');
      const pkValue = searchParams.get('pkValue');

      if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !pkColumn || !/^[a-zA-Z0-9_]+$/.test(pkColumn) || !pkValue) {
        return NextResponse.json({ error: 'Invalid table or column name' }, { status: 400 });
      }

      const deleteQuery = `DELETE FROM "${tableName}" WHERE "${pkColumn}" = $1`;
      await pool.query(deleteQuery, [pkValue]);

      return new NextResponse(null, { status: 204 });
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  });
}
