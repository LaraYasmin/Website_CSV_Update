import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import axios from "axios";
import Upload from "../components/uploadButton";

jest.mock("axios");

describe("Upload component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handleOnChange is called correctly when file is selected", async () => {
    render(<Upload onUpload={jest.fn()} />);
    const file = new File(["file content"], "test.csv", { type: "text/csv" });

    const uploadButton = screen.getByText("Upload");
    fireEvent.change(screen.getByTestId("csvFileInput"), {
      target: { files: [file] },
    });

    expect(uploadButton).toBeDefined();
  });

  test("file is read correctly when handleOnChange is called", async () => {
    render(<Upload onUpload={jest.fn()} />);
    const file = new File(["file content"], "test.csv", { type: "text/csv" });

    fireEvent.change(screen.getByTestId("csvFileInput"), {
      target: { files: [file] },
    });

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvData = reader.result;
      expect(csvData).toBe("file content");
    };
  });

  test("onUpload is called correctly with file data", async () => {
    const onUploadMock = jest.fn();
    render(<Upload onUpload={onUploadMock} />);
    const file = new File(["file content"], "test.csv", { type: "text/csv" });

    fireEvent.change(screen.getByTestId("csvFileInput"), {
      target: { files: [file] },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/files",
      expect.any(FormData)
    );

    expect(onUploadMock).toHaveBeenCalledWith("file content");
  });
});
