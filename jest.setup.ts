import '@testing-library/jest-dom';
import 'whatwg-fetch';

jest.mock('next/server', () => {
    return {
        NextResponse: {
            json: (body: any) => ({
                status: 200,
                json: async () => body,
                text: async () => JSON.stringify(body),
            }),
        },
    };
});
