function total_leads() {
  let alpha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Total");
  let expa = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EXPA");

  let alpha_range = alpha
    .getRange(2, 1, alpha.getLastRow(), alpha.getLastColumn())
    .getValues();
  let expa_range = expa
    .getRange(2, 1, expa.getLastRow(), expa.getLastColumn())
    .getValues();
  let total_range = [];

  let alpha_ids = alpha
    .getRange(2, 3, alpha.getLastRow(), 1)
    .getValues()
    .flat();
  var newExpaRows = [];
  let counter = 0;
  for (let i = 0; i < expa_range.length; i++) {
    if (alpha_ids.indexOf(expa_range[i][2]) < 0) {
      newExpaRows.push(expa_range[i]);
    }
  }
  if (newExpaRows.length > 0) {
    alpha
      .getRange(
        alpha.getLastRow() + 1,
        1,
        newExpaRows.length,
        newExpaRows[0].length
      )
      .setValues(newExpaRows);
  }
}
