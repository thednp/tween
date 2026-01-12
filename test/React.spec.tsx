// React.spec.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TweenBox } from "./fixtures/TweenBox";
import { TimelineBox } from "./fixtures/TimelineBox";

describe('React', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup()
  });

  it('can render component with useTween', async () => {
    render(<TweenBox />);

    const box = screen.getByTestId('box');

    expect(box.style.translate).toEqual('0px');
    expect(box.style.opacity).toEqual("1");

    fireEvent.click(box);

    vi.advanceTimersByTime(500);
    await vi.waitFor(() => {
      expect(box.style.translate).toEqual('300px');
    });
  });

  it('can render component with useTimeline', async () => {
    render(<TimelineBox />);

    const box = screen.getByTestId('box');

    expect(box.style.translate).toEqual('0px 0px');

    fireEvent.click(box);

    vi.advanceTimersByTime(500);
    await vi.waitFor(() => {
      expect(box.style.translate).toEqual('300px 300px');
    });
  });


});
