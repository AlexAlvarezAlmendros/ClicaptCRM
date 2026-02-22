import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Nuevo</Badge>);
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass("badge--success");
  });

  it("renders dot when dot=true", () => {
    const { container } = render(<Badge dot>Tag</Badge>);
    expect(container.querySelector(".badge__dot")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Badge className="custom">X</Badge>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(<Button variant="secondary" size="sm">Click</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn--secondary", "btn--sm");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isLoading", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders left icon", () => {
    const { container } = render(<Button leftIcon={Plus}>Add</Button>);
    // lucide-react renders an SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("adds icon-only class", () => {
    render(<Button iconOnly aria-label="Add"><Plus size={16} /></Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn--icon");
  });
});
