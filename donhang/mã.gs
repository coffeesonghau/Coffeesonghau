/**
 * HỆ THỐNG QUẢN LÝ SÔNG HẬU COFFEE (API BACKEND V2 - ENTERPRISE)
 * Tối ưu tốc độ, Modular hoá và tự động khôi phục cấu trúc.
 */

const CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/1D6z7mmyTwvwdfBttuY_3ZrCrQ09k6z9rELg8V5VFdn4/edit?usp=sharing",
  SHEETS: {
    NHANVIEN: "NhanVien",
    KHACHHANG: "KhachHang",
    DONHANG: "Donhang",
    IT: "YeuCauIT"
  },
  HEADERS: {
    KH: ["Thời gian", "ID Sales", "Người gửi", "Tên quán", "Địa chỉ", "Chủ quán", "SĐT", "Cách pha", "Lượng dùng", "Gu", "Hãng cũ", "Giá hiện tại", "Tiềm năng", "Tình trạng mẫu", "Ngày hẹn", "Ghi chú"],
    DH: ["Mã Đơn", "Thời gian", "ID Sales", "Tên quán", "SĐT", "Địa chỉ", "Kênh Bán", "Trạng thái", "Chi Tiết Đơn", "TỔNG TIỀN", "Cart JSON", "Cập nhật cuối"],
    IT: ["Thời gian", "ID Sales", "Người yêu cầu", "Loại yêu cầu", "Mã Đơn", "Lý do", "Trạng thái"]
  },
  COLORS: { KH: "#fff2cc", DH: "#d9ead3", IT: "#fce5cd" }
};

// =========================================
// 1. CORE ROUTER & CONFIG
// =========================================
function doOptions(e) {
  return createResponse({ status: "ok" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Đợi 10s nếu có nhiều Sales cùng nhấn lưu lúc

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Không có dữ liệu gửi lên.");
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);

    // Bộ định tuyến (Router) tương tự các Framework Backend hiện đại
    const actionMap = {
      "checkID": () => handleCheckID(ss, data),
      "login": () => handleLogin(ss, data),
      "changePass": () => handleChangePass(ss, data),
      "resetPass": () => handleResetPass(ss, data),
      "saveData": () => handleSaveData(ss, data),
      "getOrders": () => handleGetOrders(ss, data),
      "updateOrder": () => handleUpdateOrder(ss, data),
      "sendITRequest": () => handleSendITRequest(ss, data)
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
// 2. HELPER FUNCTIONS
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

// =========================================
// 3. AUTHENTICATION MODULE
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
  
  const userRow = rows.find((r, index) => index > 0 && r[0].toString() === data.user.toString() && r[2] === data.password);
  return userRow ? { success: true, name: userRow[1] } : { success: false, msg: "Sai tài khoản hoặc mật khẩu" };
}

function handleChangePass(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  const rows = sheet.getDataRange().getValues();
  
  const index = rows.findIndex((r, i) => i > 0 && r[0].toString() === data.user.toString() && r[2] === data.oldPass);
  if (index > -1) {
    sheet.getRange(index + 1, 3).setValue(data.newPass);
    return { success: true };
  }
  return { success: false, msg: "Mật khẩu cũ không đúng" };
}

function handleResetPass(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.NHANVIEN);
  const rows = sheet.getDataRange().getValues();
  
  const index = rows.findIndex((r, i) => i > 0 && r[0].toString() === data.user.toString());
  if (index > -1) {
    sheet.getRange(index + 1, 3).setValue(data.newPass);
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
    "'" + data.sdt_zalo, data.loai_ban, data.luong_dung, data.gu_hien_tai, data.hang_dang_dung,
    data.gia_hien_tai, data.tiem_nang, data.da_gui_mau, data.ngay_goi_lai, data.phan_hoi
  ]);

  // 2. Xử lý sản phẩm & Lưu đơn hàng
  let parsedItems = parseJSON(data.cart_json);
  let itemIDs = Object.keys(parsedItems);
  
  let lastColDH = sheetDH.getLastColumn();
  let currentHeaderDH = lastColDH > 0 ? sheetDH.getRange(1, 1, 1, lastColDH).getValues()[0] : CONFIG.HEADERS.DH;

  // Thêm header mới nếu có sản phẩm chưa từng có
  let newHeaders = itemIDs.filter(id => !currentHeaderDH.includes(id));
  if (newHeaders.length > 0) {
    currentHeaderDH.push(...newHeaders);
    sheetDH.getRange(1, 1, 1, currentHeaderDH.length)
      .setValues([currentHeaderDH])
      .setFontWeight("bold").setBackground(CONFIG.COLORS.DH).setHorizontalAlignment("center");
  }

  // Tối ưu tốc độ: Map thẳng dữ liệu vào một mảng, chỉ dùng appendRow 1 lần duy nhất
  let rowDataDH = new Array(currentHeaderDH.length).fill("");
  let colMap = currentHeaderDH.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});

  rowDataDH[colMap["Mã Đơn"]] = maDonMoi;
  rowDataDH[colMap["Thời gian"]] = timeVN;
  rowDataDH[colMap["ID Sales"]] = data.id_sales;
  rowDataDH[colMap["Tên quán"]] = data.ten_quan;
  rowDataDH[colMap["SĐT"]] = "'" + (data.sdt_zalo || "");
  rowDataDH[colMap["Địa chỉ"]] = data.dia_chi || "";
  rowDataDH[colMap["Kênh Bán"]] = data.kenh_ban;
  rowDataDH[colMap["Trạng thái"]] = data.da_gui_mau;
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
        ma_don: row[colMap["Mã Đơn"]] || `DH_Cũ_${i}`,
        thoi_gian: row[colMap["Thời gian"]] || new Date(),
        ten_quan: row[colMap["Tên quán"]] || "",
        sdt: row[colMap["SĐT"]] || "",
        dia_chi: row[colMap["Địa chỉ"]] || "",
        kenh_ban: row[colMap["Kênh Bán"]] || "ban_le",
        chi_tiet: row[colMap["Chi Tiết Đơn"]] || "",
        tong_tien: row[colMap["TỔNG TIỀN"]] || 0,
        trang_thai: row[colMap["Trạng thái"]] || "Chưa rõ",
        cart_json: row[colMap["Cart JSON"]] || "{}"
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

  rowIndex += 1; // Index API Sheet bắt đầu từ 1
  let timeUpdate = getTimeVN();

  // Tạo mảng cập nhật để ghi đè (Tránh dùng setValue nhiều lần gây giật lag)
  let updatedRow = [...dataRange[rowIndex - 1]]; 
  
  updatedRow[colMap["SĐT"]] = "'" + (data.sdt || "");
  updatedRow[colMap["Địa chỉ"]] = data.dia_chi || "";
  updatedRow[colMap["Chi Tiết Đơn"]] = data.chi_tiet_don;
  updatedRow[colMap["TỔNG TIỀN"]] = Number(data.tong_tien_so);
  updatedRow[colMap["Cart JSON"]] = data.cart_json;
  updatedRow[colMap["Cập nhật cuối"]] = timeUpdate;

  // Làm sạch các ô số lượng sản phẩm cũ
  for(let i = 12; i < headers.length; i++) updatedRow[i] = "";

  // Cập nhật số lượng mới
  let parsedItems = parseJSON(data.cart_json);
  let itemIDs = Object.keys(parsedItems);

  let newHeaders = itemIDs.filter(id => colMap[id] === undefined);
  if (newHeaders.length > 0) {
    headers.push(...newHeaders);
    sheetDH.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold").setBackground(CONFIG.COLORS.DH);
    
    // Cập nhật lại colMap
    newHeaders.forEach(h => {
        colMap[h] = headers.length - 1;
        updatedRow.push(""); // Kéo dài mảng dữ liệu dòng tương ứng
    });
  }

  itemIDs.forEach(id => {
    updatedRow[colMap[id]] = Number(parsedItems[id]);
  });

  // Ghi toàn bộ dữ liệu 1 lần (Tối ưu x10 tốc độ)
  sheetDH.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

  return { success: true };
}

// =========================================
// 5. SYSTEM MODULE
// =========================================
function handleSendITRequest(ss, data) {
  let sheetYC = getOrCreateSheet(ss, CONFIG.SHEETS.IT, CONFIG.HEADERS.IT, CONFIG.COLORS.IT);
  sheetYC.appendRow([getTimeVN(), data.id_sales, data.nguoi_gui, data.loai_yeu_cau, data.ma_don, data.ly_do, "Chờ xử lý"]);
  return { success: true };
}