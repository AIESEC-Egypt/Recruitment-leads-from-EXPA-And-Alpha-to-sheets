function dataExtraction(query) {
  let payload = { query };

  auth_url = "";

  var response_auth = UrlFetchApp.fetch(auth_url, { method: "post" });
  var listsAuth = JSON.parse(response_auth.getContentText());
  var token = "JWT " + listsAuth["data"]["externalLogin"]["token"];

  url_orcamentos = "";

  url = encodeURI(url_orcamentos);

  try {
    var response = UrlFetchApp.fetch(url, {
      method: "post",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (e) {
    Logger.log(e);
  }

  var lists = JSON.parse(response.getContentText());
  return lists.data.allMemberLeads;
}

function recruitment_leads() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Total");

  var page_number = 1;
  var allData = [];
  do {
    var query = `query AllMemberLeads {
                allMemberLeads(page: ${page_number}, perPage: 100) {
                    id
                    fullName
                    email
                    phone
                    expaId
                    dob
                    graduationYear
                    gender
                    city
                    reasonToApply
                    createdAt
                    aiesecRepresentative
                    committee {
                        name
                    }
                    university {
                        name
                    }
                    faculty {
                        name
                    }
                    referral {
                        name
                    }
                }
            }
            `;
    var data = dataExtraction(query);
    if (data.length != 0) allData.push(data);
    page_number++;
  } while (data.length != 0);
  Logger.log(allData);

  var ids = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues();
  var ids_expa = sheet.getRange(1, 3, sheet.getLastRow(), 1).getValues();
  var ids = ids.flat(1);
  var ids_expa = ids_expa.flat(1);
  var newRows = [];
  for (let data of allData) {
    for (let i = 0; i < data.length; i++) {
      Logger.log(i);
      var index = ids.indexOf(data[i].id);
      var index_expa = ids_expa.indexOf(data[i].expaId);
      if (index < 0 && index_expa < 0) {
        Logger.log("new");
        newRows.push([
          data[i].createdAt,
          data[i].id,
          data[i].expaId,
          data[i].fullName,
          data[i].email,
          data[i].phone,
          data[i].dob,
          data[i].graduationYear,
          data[i].gender,
          data[i].city,
          data[i].reasonToApply,
          data[i].committee.name,
          data[i].university.name,
          data[i].referral.name,
          data[i].faculty.name,
        ]);
      } else if (index_expa > 0) {
        let temp_row = [];
        temp_row.push([
          data[i].createdAt,
          data[i].id,
          data[i].expaId,
          data[i].fullName,
          data[i].email,
          data[i].phone,
          data[i].dob,
          data[i].graduationYear,
          data[i].gender,
          data[i].city,
          data[i].reasonToApply,
          data[i].committee.name,
          data[i].university.name,
          data[i].referral.name,
          data[i].faculty.name,
        ]);
        sheet
          .getRange(index_expa + 1, 1, temp_row.length, temp_row[0].length)
          .setValues(temp_row);
      }
    }
  }
  if (newRows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length)
      .setValues(newRows);
  }
}

function ids() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Total");
  var ids = sheet.getRange(1, 3, sheet.getLastRow(), 1).getValues().flat();
  var phone = sheet.getRange(1, 6, sheet.getLastRow(), 1).getValues().flat();

  let counter = 0;
  for (let i = 0; i < ids.length; i++) {
    if (ids[i].length == 0) {
      let new_id = "6" + String(phone[i]).slice(5, 10);
      sheet.getRange(i + 1, 3, 1, 1).setValue(new_id);
      Logger.log(i);
      counter++;
    }
  }
  Logger.log(counter);
}
