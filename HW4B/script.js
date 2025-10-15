/*
File: script.js
Author: Thomas Boyajian
Date: 10/15/25
Description:
HW4 Part 2 – Multiplication Table with jQuery UI sliders and tabs.
Synchronizes input fields with sliders, validates user ranges,
and dynamically generates multiplication tables displayed on
individual tabs using jQuery UI.
*/

// Wait for DOM to load
$(document).ready(function () {
  const $form = $("#tableForm");
  const $tabs = $("#tabs");
  const $errorMsg = $("#errorMsg");
  let tabCount = 1; // Counter for new tables

  // Slider configuration
  const sliderConfig = {
    min: -50,
    max: 50,
    slide: function (event, ui) {
      const inputId = $(this).attr("id").replace("slider-", "");
      $("#" + inputId).val(ui.value);
      generateTable(); // auto-update table live
    }
  };

  // Initialize sliders for each input
  $("#slider-hStart").slider(sliderConfig);
  $("#slider-hEnd").slider(sliderConfig);
  $("#slider-vStart").slider(sliderConfig);
  $("#slider-vEnd").slider(sliderConfig);

  // Keep sliders synced with typed values
  $("#hStart, #hEnd, #vStart, #vEnd").on("input", function () {
    const sliderId = "#slider-" + this.id;
    const value = parseInt($(this).val());
    if (!isNaN(value) && value >= -50 && value <= 50) {
      $(sliderId).slider("value", value);
      generateTable(); // live update
    }
  });

  // -------------------------------
  // Generate Multiplication Table
  // -------------------------------
  window.generateTable = function () {
    $errorMsg.text("");

    const hStart = parseInt($("#hStart").val());
    const hEnd = parseInt($("#hEnd").val());
    const vStart = parseInt($("#vStart").val());
    const vEnd = parseInt($("#vEnd").val());

    // Basic validation before generating
    if ([hStart, hEnd, vStart, vEnd].some(isNaN)) {
      $errorMsg.text("Please enter all numeric values.");
      return;
    }
    if (hStart > hEnd || vStart > vEnd) {
      $errorMsg.text("Start values must be less than or equal to end values.");
      return;
    }
    if (
      hStart < -50 || hEnd > 50 ||
      vStart < -50 || vEnd > 50
    ) {
      $errorMsg.text("Values must be between -50 and 50.");
      return;
    }

    // Create table dynamically
    const $table = $("<table>").addClass("multTable");
    const $thead = $("<thead>");
    const $tbody = $("<tbody>");

    // Header row (top labels)
    const $headerRow = $("<tr>");
    $headerRow.append($("<th>")); // empty top-left corner
    for (let j = hStart; j <= hEnd; j++) {
      $headerRow.append($("<th>").text(j));
    }
    $thead.append($headerRow);

    // Body rows
    for (let i = vStart; i <= vEnd; i++) {
      const $row = $("<tr>");
      $row.append($("<th>").text(i)); // left header cell
      for (let j = hStart; j <= hEnd; j++) {
        $row.append($("<td>").text(i * j));
      }
      $tbody.append($row);
    }

    $table.append($thead).append($tbody);

    // Add to a new tab
    addTableToTab($table, hStart, hEnd, vStart, vEnd);
  };

  // -------------------------------
  // Add Generated Table to Tabs
  // -------------------------------
  function addTableToTab($table, hStart, hEnd, vStart, vEnd) {
    const tabLabel = `H[${hStart}–${hEnd}] × V[${vStart}–${vEnd}]`;
    const tabId = "tab-" + tabCount++;

    // Create new tab header with close button
    const $li = $("<li>").append(
      $("<a>").attr("href", "#" + tabId).text(tabLabel),
      $("<span>")
        .addClass("ui-icon ui-icon-close")
        .attr("role", "presentation")
        .attr("title", "Close Tab")
    );

    // Create content div for the tab
    const $div = $("<div>")
      .attr("id", tabId)
      .append($table);

    // Add to DOM
    $tabs.find(".ui-tabs-nav").append($li);
    $tabs.append($div);
    $tabs.tabs("refresh");

    // Activate new tab
    const newIndex = $tabs.find(".ui-tabs-nav li").length - 1;
    $tabs.tabs("option", "active", newIndex);
  }

  // -------------------------------
  // Close Tabs (clicking the × icon)
  // -------------------------------
  $tabs.on("click", "span.ui-icon-close", function () {
    const panelId = $(this).closest("li").remove().attr("aria-controls");
    $("#" + panelId).remove();
    $tabs.tabs("refresh");
  });

  // -------------------------------
  // Close All Tabs Button
  // -------------------------------
  $("#closeAllTabs").on("click", function () {
    $("#tabs .ui-tabs-nav li:gt(0)").remove(); // remove all except Input Form
    $("#tabs > div:gt(0)").remove(); // remove all tab panels except input
    $("#tabs").tabs("refresh");
    $("#tabs").tabs("option", "active", 0); // focus back on Input Form
  });

  // Initialize empty tabs on load
  $tabs.tabs();
});
