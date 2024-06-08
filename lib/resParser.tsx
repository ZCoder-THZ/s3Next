import { NextResponse } from 'next/server';
export const res = (data: any) => {
  return NextResponse.json(data);
};
