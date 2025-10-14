/*
File: script.js
Author: Thomas Boyajian
Date: 10/13/25
Description: 
Contains all functionality for generating the multiplication table based on user input. 
Validates input ranges, creates table elements dynamically, and ensures proper cleanup before rendering new results.
Includes error handling for invalid entries and DOM updates for smooth user interaction.
Comments throughout explain logic rather than restating code.
*/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tableForm");
  const errorMsg = document.getElementById("errorMsg");
  const container = document.getElementById("tableContainer");

  // Event listener for form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent page reload

    // Clear previous table and error messages
    errorMsg.textContent = "";
    container.innerHTML = "";

    // Get user inputs
    const hStart = parseInt(document.getElementById("hStart").value);
    const hEnd = parseInt(document.getElementById("hEnd").value);
    const vStart = parseInt(document.getElementById("vStart").value);
    const vEnd = parseInt(document.getElementById("vEnd").value);

    // ---------- Validation ----------
    if ([hStart, hEnd, vStart, vEnd].some(isNaN)) {
      return showError("All fields must be valid numbers.");
    }

    if (hStart < -50 || hEnd > 50 || vStart < -50 || vEnd > 50) {
      return showError("Values must be between -50 and 50.");
    }

    if (hStart > hEnd || vStart > vEnd) {
      return showError("Start values must be less than or equal to end values.");
    }

    // Prevent excessively large tables (browser freezing)
    const rows = Math.abs(vEnd - vStart) + 1;
    const cols = Math.abs(hEnd - hStart) + 1;
    if (rows * cols > 5000) {
      return showError("Table too large! Please use smaller ranges.");
    }

    // ---------- Table Generation ----------
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Header row
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // top-left corner cell
    for (let i = hStart; i <= hEnd; i++) {
      const th = document.createElement("th");
      th.textContent = i;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    // Body rows
    for (let i = vStart; i <= vEnd; i++) {
      const row = document.createElement("tr");

      // Left-side header
      const rowHeader = document.createElement("th");
      rowHeader.textContent = i;
      row.appendChild(rowHeader);

      // Table cells
      for (let j = hStart; j <= hEnd; j++) {
        const td = document.createElement("td");
        td.textContent = i * j;
        row.appendChild(td);
      }

      tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
  });

  // ---------- Helper Function ----------
  function showError(message) {
    errorMsg.textContent = message;
  }
});