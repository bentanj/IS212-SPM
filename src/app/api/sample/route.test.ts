import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/hello', () => {
    it('returns a success message', async () => {
        const mockRequest = {} as NextRequest; // minimal mock of NextRequest
        const response = await GET(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({ message: 'Hello from API' });
    });
});
