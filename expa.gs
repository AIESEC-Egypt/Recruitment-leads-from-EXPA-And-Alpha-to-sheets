const expa_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EXPA");
function dataExtraction_Leads(graphql) {
  var requestOptions = {
    method: "post",
    payload: graphql,
    contentType: "application/json",
    headers: {
      access_token: "",
    },
  };
  var response = UrlFetchApp.fetch(
    `https://gis-api.aiesec.org/graphql?access_token=${requestOptions["headers"]["access_token"]}`,
    requestOptions
  );
  var recievedDate = JSON.parse(response.getContentText());
  Logger.log(recievedDate.data.memberLeads.data);
  return recievedDate.data.memberLeads.data;
}

// Take the raw data recieved from the HTTP response and arrange it into the corresponding sheet
function expa_leads() {
  var queryLeads = `query {
      memberLeads(
        filters: { created_at: { from: "01/09/2023" } }
        page: 1
        per_page: 10000
      ) {
        paging {
          total_items
        }
        data {
          referral_type{name}
          motivation_reason{name}
          backgrounds{constant_name}
          email
          id
          created_at
          lead_name
          phone
          lc_alignment {
            keywords
          }
          home_lc {
            full_name
          }
        }
      }
    }`;

  var graphql_Leads = JSON.stringify({ query: queryLeads });
  var dataSet_Leads = dataExtraction_Leads(graphql_Leads);
  console.log("Data has been extracted");
  if (dataSet_Leads.length == 0) {
    return;
  }

  var rows = [];
  var dataSet = dataSet_Leads;

  var ids = expa_sheet
    .getRange(1, 3, expa_sheet.getLastRow(), 1)
    .getValues()
    .flat(1);
  for (var i = 0; i < dataSet.length; i++) {
    if (!dataSet[i].phone) continue;
    let lc = dataSet[i].home_lc.full_name.slice(
      10,
      dataSet[i].home_lc.full_name.length
    );
    if (ids.indexOf(Math.floor(dataSet[i].id)) > -1) {
      Logger.log("old");
      Logger.log(i);
      var row = [];
      row.push([
        dataSet[i].created_at,
        "-",
        dataSet[i].id,
        dataSet[i].lead_name,
        dataSet[i].email,
        dataSet[i].phone,
        "-",
        "-",
        "-",
        "-",
        dataSet[i].motivation_reason ? dataSet[i].motivation_reason.name : "-",
        lc,
        dataSet[i].lc_alignment ? dataSet[i].lc_alignment.keywords : "-",
        dataSet[i].referral_type ? dataSet[i].referral_type.name : "-",
        dataSet[i].backgrounds.length > 0
          ? dataSet[i].backgrounds[0].constant_name
          : "-",
      ]);
      var index = ids.indexOf(Math.floor(dataSet[i].id)) + 1;
      expa_sheet.getRange(index, 1, 1, row[0].length).setValues(row);
    } else {
      Logger.log("new");
      rows.push([
        dataSet[i].created_at,
        "-",
        dataSet[i].id,
        dataSet[i].lead_name,
        dataSet[i].email,
        dataSet[i].phone,
        "-",
        "-",
        "-",
        "-",
        dataSet[i].motivation_reason ? dataSet[i].motivation_reason.name : "-",
        lc,
        dataSet[i].lc_alignment ? dataSet[i].lc_alignment.keywords : "-",
        dataSet[i].referral_type ? dataSet[i].referral_type.name : "-",
        dataSet[i].backgrounds.length > 0
          ? dataSet[i].backgrounds[0].constant_name
          : "-",
      ]);
    }
  }
  if (rows.length > 0) {
    rows.reverse();
    expa_sheet
      .getRange(expa_sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}
