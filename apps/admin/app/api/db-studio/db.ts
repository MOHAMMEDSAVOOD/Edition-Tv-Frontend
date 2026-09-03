import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5435', 10),
  database: process.env.POSTGRES_DB || 'edition_platform',
  user: process.env.POSTGRES_USER || 'edition_user',
  password: process.env.POSTGRES_PASSWORD || 'edition_password_secret',
});

const JWT_SECRET = process.env.JWT_SECRET || 'dGhpc19pc19hX3Zlcnlfc2VjdXJlX2xvbmdfc2VjcmV0X2tleV9mb3JfZWRpdGlvbl9wbGF0Zm9ybV9qd3RfYXV0aGVudGljYXRpb25fMjAyNl8=';
const jwtSecretBuffer = Buffer.from(JWT_SECRET, 'base64');

export async function withAuth(req: NextRequest, handler: (req: NextRequest, user: Record<string, unknown>) => Promise<NextResponse>) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecretBuffer) as Record<string, unknown>;
    return await handler(req, decoded);
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}

export { pool };
