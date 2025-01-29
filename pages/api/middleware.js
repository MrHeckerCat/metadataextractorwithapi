// pages/api/_middleware.js

import { NextResponse } from 'next/server';

const rateLimit = 100; // Number of requests
const timeWindow = 15 * 60 * 1000; // 15 minutes in milliseconds
const ipRequests = new Map();

export function middleware(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip;
  const now = Date.now();

  // Clean up old entries
  for (const [key, value] of ipRequests.entries()) {
    if (now - value.timestamp > timeWindow) {
      ipRequests.delete(key);
    }
  }

  // Get or create request count for this IP
  const requestData = ipRequests.get(ip) || { count: 0, timestamp: now };

  // Check if rate limit is exceeded
  if (requestData.count >= rateLimit) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded' }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Update request count
  requestData.count++;
  requestData.timestamp = now;
  ipRequests.set(ip, requestData);

  return NextResponse.next();
}
