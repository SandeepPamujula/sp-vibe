/**
 * FormField, FormRow, FormSection Component Tests
 */

import { render, screen } from '@testing-library/react';

import { FormField, FormRow, FormSection } from '../FormField';

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <input data-testid="test-input" />
      </FormField>
    );
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormField className="custom-class">
        <input />
      </FormField>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies span-2 class for span=2', () => {
    const { container } = render(
      <FormField span={2}>
        <input />
      </FormField>
    );
    expect(container.firstChild).toHaveClass('md:col-span-2');
  });

  it('applies full span class for span=full', () => {
    const { container } = render(
      <FormField span="full">
        <input />
      </FormField>
    );
    expect(container.firstChild).toHaveClass('col-span-full');
  });
});

describe('FormRow', () => {
  it('renders children in a grid', () => {
    const { container } = render(
      <FormRow>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </FormRow>
    );

    expect(container.firstChild).toHaveClass('grid');
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('applies 2-column grid by default', () => {
    const { container } = render(
      <FormRow>
        <div>Child</div>
      </FormRow>
    );
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  it('applies 3-column grid when cols=3', () => {
    const { container } = render(
      <FormRow cols={3}>
        <div>Child</div>
      </FormRow>
    );
    expect(container.firstChild).toHaveClass('md:grid-cols-3');
  });

  it('applies 4-column grid when cols=4', () => {
    const { container } = render(
      <FormRow cols={4}>
        <div>Child</div>
      </FormRow>
    );
    expect(container.firstChild).toHaveClass('lg:grid-cols-4');
  });

  it('applies gap spacing', () => {
    const { container } = render(
      <FormRow>
        <div>Child</div>
      </FormRow>
    );
    expect(container.firstChild).toHaveClass('gap-4');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormRow className="custom-row">
        <div>Child</div>
      </FormRow>
    );
    expect(container.firstChild).toHaveClass('custom-row');
  });
});

describe('FormSection', () => {
  it('renders children', () => {
    render(
      <FormSection>
        <div data-testid="section-content">Content</div>
      </FormSection>
    );
    expect(screen.getByTestId('section-content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <FormSection title="Expense Details">
        <div>Content</div>
      </FormSection>
    );
    expect(screen.getByText('Expense Details')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <FormSection title="Expense Details" description="Enter the expense information">
        <div>Content</div>
      </FormSection>
    );
    expect(screen.getByText('Enter the expense information')).toBeInTheDocument();
  });

  it('renders title and description in heading section', () => {
    render(
      <FormSection title="Section" description="Description">
        <div>Content</div>
      </FormSection>
    );

    const title = screen.getByText('Section');
    expect(title.tagName).toBe('H3');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormSection className="custom-section">
        <div>Content</div>
      </FormSection>
    );
    expect(container.firstChild).toHaveClass('custom-section');
  });

  it('has vertical spacing between elements', () => {
    const { container } = render(
      <FormSection>
        <div>Content</div>
      </FormSection>
    );
    expect(container.firstChild).toHaveClass('space-y-4');
  });
});
