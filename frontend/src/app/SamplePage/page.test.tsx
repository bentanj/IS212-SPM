import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Hello from './page';

test('renders the correct text', () => {
    render(<Hello name="Mike" />);
    expect(screen.getByText('Hello Mike')).toBeInTheDocument();
});