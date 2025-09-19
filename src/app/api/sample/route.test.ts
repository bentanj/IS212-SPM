//  Unit test for src/app/api/sample/route.ts
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/sample', () => {
    it('returns a success message', async () => {
        const mockRequest = {} as NextRequest;
        const response = await GET(mockRequest);

        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ message: 'Hello from API' });
    });
});
