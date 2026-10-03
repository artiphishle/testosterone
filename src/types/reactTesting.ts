export interface ReactRuntime {
  act(callback: () => void): unknown;
}

export interface ReactRoot {
  render(element: unknown): void;
  unmount(): void;
}

export interface MountedRoot {
  readonly container: HTMLDivElement;
  readonly root: ReactRoot;
}

export interface RenderResult {
  readonly container: HTMLDivElement;
  getByTestId(testId: string): Element;
  getByText(text: string): Element;
  unmount(): void;
}
