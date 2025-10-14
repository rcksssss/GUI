/*
File: script.js
Author: Thomas Boyajian
Date: 10/13/25
Description:
Generates a multiplication table dynamically once the form passes jQuery Validation.
*/

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tableContainer");
  const errorMsg = document.getElementById("errorMsg");

  window.generateTable = function () {
    container.innerHTML = "";
    errorMsg.textContent = "";

    const hStart = parseInt(document.getElementById("hStart").value);
    const hEnd = parseInt(document.getElementById("hEnd").value);
    const vStart = parseInt(document.getElementById("vStart").value);
    const vEnd = parseInt(document.getElementById("vEnd").value);

    if (hStart > hEnd || vStart > vEnd) {
      errorMsg.textContent = "Start values must be less than or equal to end values.";
      return;
    }

    const rows = Math.abs(vEnd - vStart) + 1;
    const cols = Math.abs(hEnd - hStart) + 1;
    if (rows * cols > 5000) {
      errorMsg.textContent = "Table too large! Please use smaller ranges.";
      return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    for (let j = hStart; j <= hEnd; j++) {
      const th = document.createElement("th");
      th.textContent = j;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    for (let i = vStart; i <= vEnd; i++) {
      const row = document.createElement("tr");
      const rowHeader = document.createElement("th");
      rowHeader.textContent = i;
      row.appendChild(rowHeader);

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
  };
});
