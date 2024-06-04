import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

jest.mock("../components/uploadButton", () => ({
  __esModule: true,
  default: ({ onUpload }: { onUpload: (data: string) => void }) => {
    const mockData = "name,age,city\nJohn,30,New York\nJane,25,San Francisco";
    return <button onClick={() => onUpload(mockData)}>Mock Upload</button>;
  },
}));

describe("App Component", () => {
  test("renders search input", () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  test("uploads CSV data and renders cards", async () => {
    render(<App />);
    const uploadButton = screen.getByText(/mock upload/i);

    fireEvent.click(uploadButton);

    expect(await screen.findByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane/i)).toBeInTheDocument();
  });

  test("filters cards based on search input", async () => {
    render(<App />);
    const uploadButton = screen.getByText(/mock upload/i);

    fireEvent.click(uploadButton);

    expect(await screen.findByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search/i);
    userEvent.type(searchInput, "John");

    expect(screen.getByText(/John/i)).toBeInTheDocument();
    expect(screen.queryByText(/Jane/i)).not.toBeInTheDocument();
  });
});
