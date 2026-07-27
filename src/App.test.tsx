import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("정상적으로 렌더링된다", () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
