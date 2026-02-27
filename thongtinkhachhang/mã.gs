const SHEET_NAME = "NhanVien"; // Tên sheet chứa: ID, Ten, MatKhau (SHA256)

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  
  // 1. KIỂM TRA ID (Để hiện tên)
  if (data.action === "checkID") {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() === data.user.toString()) {
        return ContentService.createTextOutput(JSON.stringify({success: true, name: rows[i][1]}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success: false}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. ĐĂNG NHẬP
  if (data.action === "login") {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() === data.user.toString() && rows[i][2] === data.password) {
        return ContentService.createTextOutput(JSON.stringify({success: true, name: rows[i][1]}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success: false, msg: "Sai tài khoản hoặc mật khẩu"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 3. ĐỔI MẬT KHẨU
  if (data.action === "changePass") {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() === data.user.toString() && rows[i][2] === data.oldPass) {
        sheet.getRange(i + 1, 3).setValue(data.newPass);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success: false, msg: "Mật khẩu cũ không đúng"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}