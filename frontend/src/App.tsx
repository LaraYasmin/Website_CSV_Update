import React, { useState } from "react";
import Upload from "./components/uploadButton";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleUpload = async (data: string) => {
    setCsvData(data);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderCards = () => {
    if (!csvData) return null;

    const rows = csvData.split("\n").map((row) => row.split(","));
    const headers = rows[0];
    const filteredRows = rows.filter((row, index) => {
      if (index === 0) return true;
      return row.some((cell) =>
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return (
      <div className="card-container">
        {filteredRows.map((row, rowIndex) => (
          <div key={rowIndex} className="card">
            <ul>
              {row.map((cell, cellIndex) => (
                <li key={cellIndex}>
                  {headers[cellIndex]}: {cell}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <nav className="navbar navbar-light bg-body-tertiary">
        <form className="d-flex" role="search">
          <input
            type="text"
            className="form-control me-2 search-input"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
        </form>
        <div className="space">
          <Upload onUpload={handleUpload} />
        </div>
      </nav>
      {renderCards()}
    </div>
  );
};

export default App;
