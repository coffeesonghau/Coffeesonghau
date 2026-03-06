/**
 * HỆ THỐNG QUẢN LÝ SÔNG HẬU COFFEE (API BACKEND V3 - ENTERPRISE)
 * Tích hợp Bảo mật SHA-256, Sửa lỗi Index, Module IT Admin và URL chínha
    // Cấu trúc cột chuẩn đã đồng bộ với giao diện
    KH: ["Thời gian", "ID Sales", "Người gửi", "Tên quán", "Địa chỉ", "Chủ quán", "SĐT", "Kênh Bán", "Tiềm năng", "Tình trạng mẫu", "Ngày hẹn", "Ghi chú"],
    DH: ["Mã Đơn", "Thời gian", "ID Sales", "Tên quán", "SĐT", "Địa chỉ", "Kênh Bán", "Trạng thái", "Trạng thái Kế Toán", "Chi Tiết Đơn", "TỔNG TIỀN", "Cart JSON", "Cập nhật cuối"],
    IT: ["Thời gian", "ID Sales", "Người yêu cầu", "Loại yêu cầu", "Mã Đơn", "Lý do", "Trạng thái"]
  },
  COLORS: { KH: "#fff2cc", DH: "#d9ead3", IT: "#fce5cd" },
  
  // TÀI KHOẢN MASTER ADMIN (Dùng cho trang it-admin.html)
  ADMIN: {
    user: "admin", 
    pass: hashPassword("admin123") // Mật khẩu IT Admin mặc định là admin123
  }
};

// =========================================
// 1. CORE ROUTER
// =========================================
function doOptions(e) {
  return createResponse({ status: "ok" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Đợi tối đa 10s nếu có nhiều Sales cùng lưu đơn

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Không có dữ liệu gửi lên.");
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);

    // Bộ định tuyến phân luồng API
    const actionMap = {
      // Nhóm API cho Sales (App chính)
      "checkID": () => handleCheckID(ss, data),
      "login": () => handleLogin(ss, data),
      "changePass": () => handleChangePass(ss, data),
      "resetPass": () => handleResetPass(ss, data),
      "saveData": () => handleSaveData(ss, data),
      "getOrders": () => handleGetOrders(ss, data),
      "updateOrder": () => handleUpdateOrder(ss, data),
      "sendITRequest": () => handleSendITRequest(ss, data),
      
      // Nhóm API cho IT Admin
      "loginIT": () => handleLoginIT(data),
      "getAllOrdersAdmin": () => handleGetAllOrdersAdmin(ss),
      "updateOrderStatus": () => handleUpdateOrderStatus(ss, data),
      "updateDelivery": () => handleUpdateDelivery(ss, data)
    };

    if (actionMap[data.action]) {
      return createResponse(actionMap[data.action]());
    } else {
      throw new Error("Hành động (Action) không được hỗ trợ.");
    }

  } catch (err) {
    return createResponse({ success: false, msg: "Lỗi Server: " + err.message });
  } finally {
    lock.releaseLock();
  }
}

// =========================================
// 2. HELPER FUNCTIONS & SECURITY
// =========================================
function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, sheetName, defaultHeaders, bgColor) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
    sheet.getRange(1, 1, 1, defaultHeaders.length)
      .setFontWeight("bold")
      .setBackground(bgColor)
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getTimeVN() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
}

function parseJSON(str, defaultVal = {}) {
  try { return str ? JSON.parse(str) : defaultVal; } catch (e) { return defaultVal; }
}

// Hàm băm mật khẩu chuẩn SHA-256 (Tăng cường bảo mật)
function hashPassword(password) {
  if (!password) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    if (hashVal.toString(16).length == 1) txtHash += '0';
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

// =========================================
// 3. AUTHENTICATION MODULE (Sales)
// =========================================
function handleCheckID(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  if (!sheet) throw new Error("Mất Sheet Nhân viên");
  const rows = sheet.getDataRange().getValues();
  const userRow = rows.find((r, index) => index > 0 && r[0].toString() === data.user.toString());
  return userRow ? { success: true, name: userRow[1] } : { success: false };
}

function handleLogin(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  const rows = sheet.getDataRange().getValues();
  
  // So sánh mật khẩu đã được mã hóa
  const hashedInputPass = hashPassword(data.password);
  const userRow = rows.find((r, index) => index > 0 && r[0].toString() === data.user.toString() && r[2].toString() === hashedInputPass);
  
  return userRow ? { success: true, name: userRow[1] } : { success: false, msg: "Sai tài khoản hoặc mật khẩu" };
}

function handleChangePass(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  const rows = sheet.getDataRange().getValues();
  const hashedOldPass = hashPassword(data.oldPass);
  
  const index = rows.findIndex((r, i) => i > 0 && r[0].toString() === data.user.toString() && r[2].toString() === hashedOldPass);
  if (index > -1) {
    sheet.getRange(index + 1, 3).setValue(hashPassword(data.newPass));
    return { success: true };
  }
  return { success: false, msg: "Mật khẩu cũ không đúng" };
}

function handleResetPass(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((r, i) => i > 0 && r[0].toString() === data.user.toString());
  if (index > -1) {
    sheet.getRange(index + 1, 3).setValue(hashPassword(data.newPass));
    return { success: true };
  }
  return { success: false, msg: "Không tìm thấy tài khoản" };
}

// =========================================
// 4. ORDER MANAGEMENT MODULE
// =========================================
function handleSaveData(ss, data) {
  let sheetKH = getOrCreateSheet(ss, CONFIG.SHEETS.KHACHHANG, CONFIG.HEADERS.KH, CONFIG.COLORS.KH);
  let sheetDH = getOrCreateSheet(ss, CONFIG.SHEETS.DONHANG, CONFIG.HEADERS.DH, CONFIG.COLORS.DH);

  let timeVN = getTimeVN();
  let maDonMoi = "DH" + new Date().getTime();
  let tongTienSo = Number(data.tong_tien_so) || 0;

  // 1. Lưu hồ sơ khách hàng
  sheetKH.appendRow([
    timeVN, data.id_sales, data.nguoi_gui, data.ten_quan, data.dia_chi, data.chu_quan,
    "'" + data.sdt_zalo, data.kenh_ban, data.tiem_nang, data.da_gui_mau, data.ngay_goi_lai, data.phan_hoi
  ]);

  // 2. Xử lý sản phẩm & Lưu đơn hàng
  let parsedItems = parseJSON(data.cart_json);
  let itemIDs = Object.keys(parsedItems);

  let lastColDH = sheetDH.getLastColumn();
  let currentHeaderDH = lastColDH > 0 ? sheetDH.getRange(1, 1, 1, lastColDH).getValues()[0] : CONFIG.HEADERS.DH;

  let newHeaders = itemIDs.filter(id => !currentHeaderDH.includes(id));
  if (newHeaders.length > 0) {
    currentHeaderDH.push(...newHeaders);
    sheetDH.getRange(1, 1, 1, currentHeaderDH.length)
      .setValues([currentHeaderDH])
      .setFontWeight("bold").setBackground(CONFIG.COLORS.DH).setHorizontalAlignment("center");
  }

  let rowDataDH = new Array(currentHeaderDH.length).fill("");
  let colMap = currentHeaderDH.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});

  rowDataDH[colMap["Mã Đơn"]] = maDonMoi;
  rowDataDH[colMap["Thời gian"]] = timeVN;
  rowDataDH[colMap["ID Sales"]] = data.id_sales;
  rowDataDH[colMap["Tên quán"]] = data.ten_quan;
  rowDataDH[colMap["SĐT"]] = "'" + (data.sdt_zalo || "");
  rowDataDH[colMap["Địa chỉ"]] = data.dia_chi || "";
  rowDataDH[colMap["Kênh Bán"]] = data.kenh_ban;
  rowDataDH[colMap["Trạng thái"]] = "Đang yêu cầu";
  rowDataDH[colMap["Trạng thái Kế Toán"]] = "Chưa tạo đơn";
  rowDataDH[colMap["Chi Tiết Đơn"]] = data.chi_tiet_don;
  rowDataDH[colMap["TỔNG TIỀN"]] = tongTienSo;
  rowDataDH[colMap["Cart JSON"]] = data.cart_json || "{}";
  rowDataDH[colMap["Cập nhật cuối"]] = "-";

  itemIDs.forEach(id => {
    if (colMap[id] !== undefined) rowDataDH[colMap[id]] = Number(parsedItems[id]) || 0;
  });

  sheetDH.appendRow(rowDataDH);
  return { success: true };
}

function handleGetOrders(ss, data) {
  let sheetDH = ss.getSheetByName(CONFIG.SHEETS.DONHANG);
  if (!sheetDH) return { success: true, orders: [] };

  let dataRange = sheetDH.getDataRange().getValues();
  if (dataRange.length <= 1) return { success: true, orders: [] };

  let headers = dataRange[0];
  let colMap = headers.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  let orders = [];

  for (let i = 1; i < dataRange.length; i++) {
    let row = dataRange[i];
    if (row[colMap["ID Sales"]] == data.id_sales) {
      orders.push({
        ma_don: row[colMap["Mã Đơn"]],
        thoi_gian: row[colMap["Thời gian"]],
        ten_quan: row[colMap["Tên quán"]],
        sdt: row[colMap["SĐT"]],
        dia_chi: row[colMap["Địa chỉ"]],
        kenh_ban: row[colMap["Kênh Bán"]],
        chi_tiet: row[colMap["Chi Tiết Đơn"]],
        tong_tien: row[colMap["TỔNG TIỀN"]],
        trang_thai: row[colMap["Trạng thái"]] || "Đang yêu cầu",
        trang_thai_ke_toan: row[colMap["Trạng thái Kế Toán"]] || "Chưa tạo đơn",
        cart_json: row[colMap["Cart JSON"]]
      });
    }
  }
  return { success: true, orders: orders.reverse() };
}

function handleUpdateOrder(ss, data) {
  let sheetDH = ss.getSheetByName(CONFIG.SHEETS.DONHANG);
  if (!sheetDH) throw new Error("Sheet Đơn hàng không tồn tại");

  let dataRange = sheetDH.getDataRange().getValues();
  let headers = dataRange[0];
  let colMap = headers.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  let rowIndex = dataRange.findIndex((r, idx) => idx > 0 && r[colMap["Mã Đơn"]] == data.ma_don);
  
  if (rowIndex === -1) throw new Error("Không tìm thấy mã đơn cần sửa");
  rowIndex += 1;

  let timeUpdate = getTimeVN();
  let updatedRow = [...dataRange[rowIndex - 1]];
  
  updatedRow[colMap["SĐT"]] = "'" + (data.sdt || "");
  updatedRow[colMap["Địa chỉ"]] = data.dia_chi || "";
  updatedRow[colMap["Chi Tiết Đơn"]] = data.chi_tiet_don;
  updatedRow[colMap["TỔNG TIỀN"]] = Number(data.tong_tien_so);
  updatedRow[colMap["Cart JSON"]] = data.cart_json;
  updatedRow[colMap["Cập nhật cuối"]] = timeUpdate;

  // Xóa các sản phẩm cũ một cách an toàn dựa trên cột mốc "Cập nhật cuối"
  let startProductIdx = colMap["Cập nhật cuối"] + 1;
  for(let i = startProductIdx; i < headers.length; i++) {
      updatedRow[i] = "";
  }

  let parsedItems = parseJSON(data.cart_json);
  let itemIDs = Object.keys(parsedItems);
  let newHeaders = itemIDs.filter(id => colMap[id] === undefined);
  
  if (newHeaders.length > 0) {
    headers.push(...newHeaders);
    sheetDH.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold").setBackground(CONFIG.COLORS.DH);
      
    newHeaders.forEach(h => {
        colMap[h] = headers.length - 1;
        updatedRow.push(""); 
    });
  }

  itemIDs.forEach(id => {
    updatedRow[colMap[id]] = Number(parsedItems[id]);
  });

  sheetDH.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
  return { success: true };
}

// =========================================
// 5. IT ADMIN MODULE
// =========================================
function handleSendITRequest(ss, data) {
  let sheetYC = getOrCreateSheet(ss, CONFIG.SHEETS.IT, CONFIG.HEADERS.IT, CONFIG.COLORS.IT);
  sheetYC.appendRow([getTimeVN(), data.id_sales, data.nguoi_gui, data.loai_yeu_cau, data.ma_don, data.ly_do, "Chờ xử lý"]);
  return { success: true };
}

function handleLoginIT(data) {
  if (data.user === CONFIG.ADMIN.user && hashPassword(data.password) === CONFIG.ADMIN.pass) {
    return { success: true, token: "admin_token_secure" };
  }
  return { success: false, msg: "Sai tài khoản Quản trị viên!" };
}

function handleGetAllOrdersAdmin(ss) {
  let sheetDH = ss.getSheetByName(CONFIG.SHEETS.DONHANG);
  if (!sheetDH) return { success: true, orders: [] };

  let dataRange = sheetDH.getDataRange().getValues();
  if (dataRange.length <= 1) return { success: true, orders: [] };

  let headers = dataRange[0];
  let colMap = headers.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  let orders = [];

  for (let i = 1; i < dataRange.length; i++) {
    let row = dataRange[i];
    orders.push({
      ma_don: row[colMap["Mã Đơn"]],
      thoi_gian: row[colMap["Thời gian"]],
      id_sales: row[colMap["ID Sales"]],
      ten_quan: row[colMap["Tên quán"]],
      sdt: row[colMap["SĐT"]],
      tong_tien: row[colMap["TỔNG TIỀN"]],
      trang_thai: row[colMap["Trạng thái"]] || "Đang yêu cầu",
      trang_thai_ke_toan: row[colMap["Trạng thái Kế Toán"]] || "Chưa tạo đơn",
      cart_json: row[colMap["Cart JSON"]]
    });
  }
  return { success: true, orders: orders.reverse() };
}

function handleUpdateOrderStatus(ss, data) {
  let sheetDH = ss.getSheetByName(CONFIG.SHEETS.DONHANG);
  let dataRange = sheetDH.getDataRange().getValues();
  let headers = dataRange[0];
  let colMap = headers.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  
  let rowIndex = dataRange.findIndex((r, idx) => idx > 0 && r[colMap["Mã Đơn"]] == data.ma_don);
  if (rowIndex === -1) throw new Error("Không tìm thấy mã đơn");

  sheetDH.getRange(rowIndex + 1, colMap["Trạng thái Kế Toán"] + 1).setValue(data.new_status);
  return { success: true };
}

function handleUpdateDelivery(ss, data) {
  let sheetDH = ss.getSheetByName(CONFIG.SHEETS.DONHANG);
  let dataRange = sheetDH.getDataRange().getValues();
  let headers = dataRange[0];
  let colMap = headers.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  
  let rowIndex = dataRange.findIndex((r, idx) => idx > 0 && r[colMap["Mã Đơn"]] == data.ma_don);
  if (rowIndex === -1) throw new Error("Không tìm thấy mã đơn");

  sheetDH.getRange(rowIndex + 1, colMap["Trạng thái"] + 1).setValue(data.new_status);
  return { success: true };
}