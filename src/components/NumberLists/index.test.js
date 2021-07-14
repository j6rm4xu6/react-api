import { render, screen, mount } from '@testing-library/react';
import React from 'react';
import NumberLists from './index';

test('renders learn react link', () => {
  render(<NumberLists />);
  mount(<NumberLists />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
