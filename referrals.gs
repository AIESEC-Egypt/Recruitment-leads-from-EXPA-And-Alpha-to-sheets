function dataExtractionRef(query) {
  let payload = { query };

  auth_url = "";

  let response_auth = UrlFetchApp.fetch(auth_url, { method: "post" });
  let listsAuth = JSON.parse(response_auth.getContentText());
  let token = "JWT " + listsAuth["data"]["externalLogin"]["token"];

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

  let lists = JSON.parse(response.getContentText());
  return lists.data.allReferralMemberLeads;
}

function referrals_form() {
  let sheetRef =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Referrals_form");

  var page_numberRef = 1;
  var allDataRef = [];
  do {
    var queryRef = `query AllReferralMemberLeads {
                    allReferralMemberLeads(page: ${page_numberRef}, perPage: 500) {
                        id
                        createdAt
                        fullName
                        email
                        phone
                        committee
                        dob
                        gender
                        aiesecRepresentative
                    }
                }
          `;
    var data = dataExtractionRef(queryRef);
    if (data.length != 0) allDataRef.push(data);
    page_numberRef++;
  } while (data.length != 0);
  Logger.log(allDataRef);

  var ids = sheetRef.getRange(1, 1, sheetRef.getLastRow(), 1).getValues();
  var ids = ids.flat(1);
  Logger.log(ids);
  for (let i = 0; i < ids.length; i++) {
    ids[i] = String(ids[i]);
  }

  var newRows = [];
  for (let data of allDataRef) {
    for (let i = 0; i < data.length; i++) {
      Logger.log(i);
      var encodedid = Utilities.base64Decode(data[i].id);
      var decodedidstring = Utilities.newBlob(encodedid).getDataAsString();
      var decodedidid = decodedidstring.substring(17, 40);
      data[i].id = "99" + decodedidid;
      var index = ids.indexOf(String(data[i].id));
      Logger.log("encoded ids");
      Logger.log(index);
      if (index < 0) {
        Logger.log("new");
        newRows.push([
          data[i].id,
          data[i].createdAt,
          data[i].fullName,
          data[i].email,
          data[i].phone,
          data[i].dob,
          data[i].gender,
          data[i].committee,
          data[i].aiesecRepresentative,
        ]);
      } else {
        let temp_row = [];
        temp_row.push([
          data[i].id,
          data[i].createdAt,
          data[i].fullName,
          data[i].email,
          data[i].phone,
          data[i].dob,
          data[i].gender,
          data[i].committee,
          data[i].aiesecRepresentative,
        ]);
        sheetRef
          .getRange(index + 1, 1, temp_row.length, temp_row[0].length)
          .setValues(temp_row);
      }
    }
  }
  if (newRows.length > 0) {
    sheetRef
      .getRange(sheetRef.getLastRow() + 1, 1, newRows.length, newRows[0].length)
      .setValues(newRows);
  }
}
