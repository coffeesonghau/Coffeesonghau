const SHEET_URL = "https://docs.google.com/spreadsheets/d/1D6z7mmyTwvwdfBttuY_3ZrCrQ09k6z9rELg8V5VFdn4/edit?usp=sharing";
const SHEET_NHANVIEN = "NhanVien"; 
const SHEET_KHACHHANG = "KhachHang"; 
const SHEET_DONHANG = "Donhang"; // THÊM SHEET MỚI

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); 

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openByUrl(SHEET_URL);
    const sheetNV = ss.getSheetByName(SHEET_NHANVIEN);
    
    // ==========================================
    // 1-4. CÁC CHỨC NĂNG ĐĂNG NHẬP (GIỮ NGUYÊN)
    // ==========================================
    if (data.action === "checkID") {
      const rowsNV = sheetNV.getDataRange().getValues();
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString()) return createResponse({success: true, name: rowsNV[i][1]});
      }
      return createResponse({success: false});
    }

    if (data.action === "login") {
      const rowsNV = sheetNV.getDataRange().getValues();
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString() && rowsNV[i][2] === data.password) {
          return createResponse({success: true, name: rowsNV[i][1]});
        }
      }
      return createResponse({success: false, msg: "Sai tài khoản hoặc mật khẩu"});
    }

    if (data.action === "changePass") {
      const rowsNV = sheetNV.getDataRange().getValues();
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString() && rowsNV[i][2] === data.oldPass) {
          sheetNV.getRange(i + 1, 3).setValue(data.newPass);
          return createResponse({success: true});
        }
      }
      return createResponse({success: false, msg: "Mật khẩu cũ không đúng"});
    }

    if (data.action === "resetPass") {
      const rowsNV = sheetNV.getDataRange().getValues();
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString()) {
          sheetNV.getRange(i + 1, 3).setValue(data.newPass);
          return createResponse({success: true});
        }
      }
      return createResponse({success: false, msg: "Không tìm thấy tài khoản"});
    }

    // ==========================================
    // 5. TÁCH DỮ LIỆU LƯU VÀO 2 SHEET RIÊNG BIỆT
    // ==========================================
    if (data.action === "saveData") {
      let sheetKH = ss.getSheetByName(SHEET_KHACHHANG);
      let sheetDH = ss.getSheetByName(SHEET_DONHANG);
      
      if (!sheetKH || !sheetDH) return createResponse({success: false, msg: "Không tìm thấy sheet KhachHang hoặc Donhang"});

      let timeVN = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd'T'HH:mm:ss");
      let maDonMoi = "DH" + new Date().getTime(); 
      let tongTienSo = Number(data.tong_tien_so) || 0;

      // 5A. GHI VÀO SHEET KHÁCH HÀNG (Chỉ hồ sơ)
      let headerKH = ["Thời gian", "ID Sales", "Người gửi", "Tên quán", "Địa chỉ", "Chủ quán", "SĐT", "Cách pha", "Lượng dùng", "Gu", "Hãng cũ", "Giá hiện tại", "Tiềm năng", "Tình trạng mẫu", "Ngày hẹn", "Ghi chú"];
      if (sheetKH.getLastRow() === 0) {
        sheetKH.appendRow(headerKH);
        sheetKH.getRange(1, 1, 1, headerKH.length).setFontWeight("bold").setBackground("#fff2cc");
        sheetKH.setFrozenRows(1);
      }
      sheetKH.appendRow([
        timeVN, data.id_sales, data.nguoi_gui, data.ten_quan, data.dia_chi, data.chu_quan, 
        "'" + data.sdt_zalo, data.loai_ban, data.luong_dung, data.gu_hien_tai, data.hang_dang_dung, 
        data.gia_hien_tai, data.tiem_nang, data.da_gui_mau, data.ngay_goi_lai, data.phan_hoi
      ]);

      // 5B. GHI VÀO SHEET ĐƠN HÀNG (Doanh thu & Sản phẩm)
      let parsedItems = {};
      if (data.cart_json) {
        try { parsedItems = JSON.parse(data.cart_json); } catch(e) {}
      }

      let fixedHeadersDH = ["Mã Đơn", "Thời gian", "ID Sales", "Tên quán", "Kênh Bán", "Trạng thái", "Chi Tiết Đơn", "TỔNG TIỀN", "Cart JSON"];
      let lastColDH = sheetDH.getLastColumn();
      let headerDH = lastColDH > 0 ? sheetDH.getRange(1, 1, 1, lastColDH).getValues()[0] : fixedHeadersDH;

      let itemIDs = Object.keys(parsedItems);
      let isHeaderChanged = false;

      for (let i = 0; i < itemIDs.length; i++) {
        let spID = itemIDs[i];
        if (headerDH.indexOf(spID) === -1) {
          headerDH.push(spID);
          isHeaderChanged = true;
        }
      }

      if (isHeaderChanged || lastColDH === 0) {
        let headerRange = sheetDH.getRange(1, 1, 1, headerDH.length);
        headerRange.setValues([headerDH]);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#d9ead3");
        sheetDH.setFrozenRows(1);
      }

      let rowDataDH = new Array(headerDH.length).fill("");
      function fillColDH(colName, val, isNumber = false) {
        let idx = headerDH.indexOf(colName);
        if (idx > -1) rowDataDH[idx] = isNumber ? (Number(val) || 0) : val;
      }

      fillColDH("Mã Đơn", maDonMoi);
      fillColDH("Thời gian", timeVN);
      fillColDH("ID Sales", data.id_sales);
      fillColDH("Tên quán", data.ten_quan);
      fillColDH("Kênh Bán", data.kenh_ban);
      fillColDH("Trạng thái", data.da_gui_mau);
      fillColDH("Chi Tiết Đơn", data.chi_tiet_don);
      fillColDH("Cart JSON", data.cart_json || "{}");
      fillColDH("TỔNG TIỀN", tongTienSo, true);
      
      for (let i = 0; i < itemIDs.length; i++) {
        let spID = itemIDs[i];
        fillColDH(spID, parsedItems[spID], true); // Chèn số lượng từng món
      }

      sheetDH.appendRow(rowDataDH);

      return createResponse({success: true});
    }

    // ==========================================
    // 6. LẤY DANH SÁCH ĐƠN HÀNG TỪ SHEET "Donhang"
    // ==========================================
    if (data.action === "getOrders") {
      let sheetDH = ss.getSheetByName(SHEET_DONHANG);
      if (!sheetDH) return createResponse({success: true, orders: []});

      let dataRange = sheetDH.getDataRange().getValues();
      if(dataRange.length <= 1) return createResponse({success: true, orders: []});

      let headers = dataRange[0];
      let orders = [];

      let idxMaDon = headers.indexOf("Mã Đơn");
      let idxThoiGian = headers.indexOf("Thời gian");
      let idxIdSales = headers.indexOf("ID Sales");
      let idxTenQuan = headers.indexOf("Tên quán");
      let idxKenh = headers.indexOf("Kênh Bán");
      let idxChiTiet = headers.indexOf("Chi Tiết Đơn");
      let idxTongTien = headers.indexOf("TỔNG TIỀN");
      let idxTrangThai = headers.indexOf("Trạng thái");
      let idxCartJson = headers.indexOf("Cart JSON");

      for (let i = 1; i < dataRange.length; i++) {
        let row = dataRange[i];
        // Lấy đúng đơn của Sales ID đang đăng nhập
        if (row[idxIdSales] == data.id_sales) {
          orders.push({
            ma_don: idxMaDon > -1 && row[idxMaDon] ? row[idxMaDon] : "DH_Cũ_" + i,
            thoi_gian: idxThoiGian > -1 ? row[idxThoiGian] : new Date(),
            ten_quan: idxTenQuan > -1 ? row[idxTenQuan] : "",
            kenh_ban: idxKenh > -1 ? row[idxKenh] : "ban_le",
            chi_tiet: idxChiTiet > -1 ? row[idxChiTiet] : "",
            tong_tien: idxTongTien > -1 ? row[idxTongTien] : 0,
            trang_thai: idxTrangThai > -1 ? row[idxTrangThai] : "Chưa rõ",
            cart_json: idxCartJson > -1 ? row[idxCartJson] : "{}"
          });
        }
      }
      return createResponse({success: true, orders: orders.reverse()});
    }

    // ==========================================
    // 7. CẬP NHẬT ĐƠN HÀNG LÊN SHEET "Donhang"
    // ==========================================
    if (data.action === "updateOrder") {
      let sheetDH = ss.getSheetByName(SHEET_DONHANG);
      let dataRange = sheetDH.getDataRange().getValues();
      let headers = dataRange[0];
      let idxMaDon = headers.indexOf("Mã Đơn");

      let rowIndex = -1;
      for(let i = 1; i < dataRange.length; i++) {
         if(idxMaDon > -1 && dataRange[i][idxMaDon] == data.ma_don) {
             rowIndex = i + 1; 
             break;
         }
      }

      if(rowIndex !== -1) {
          let idxChiTiet = headers.indexOf("Chi Tiết Đơn");
          let idxTongTien = headers.indexOf("TỔNG TIỀN");
          let idxCartJson = headers.indexOf("Cart JSON");

          if(idxChiTiet > -1) sheetDH.getRange(rowIndex, idxChiTiet + 1).setValue(data.chi_tiet_don);
          if(idxTongTien > -1) sheetDH.getRange(rowIndex, idxTongTien + 1).setValue(data.tong_tien_so);
          if(idxCartJson > -1) sheetDH.getRange(rowIndex, idxCartJson + 1).setValue(data.cart_json);

          // Cập nhật lại số lượng sản phẩm vào các cột
          let parsedItems = JSON.parse(data.cart_json || "{}");
          for(let key in parsedItems) {
              let colIdx = headers.indexOf(key);
              if(colIdx > -1) {
                  sheetDH.getRange(rowIndex, colIdx + 1).setValue(parsedItems[key]);
              } else {
                  // Tự đẻ cột mới nếu thêm món chưa có trong sheet
                  let newColNum = headers.length + 1;
                  sheetDH.getRange(1, newColNum).setValue(key);
                  sheetDH.getRange(rowIndex, newColNum).setValue(parsedItems[key]);
                  headers.push(key); 
              }
          }
          return createResponse({success: true});
      } else {
          return createResponse({success: false, msg: "Không tìm thấy mã đơn cần sửa"});
      }
    }

    return createResponse({success: false, msg: "Action không hợp lệ"});
    
  } catch(err) {
    return createResponse({success: false, msg: err.toString()});
  } finally {
    lock.releaseLock();
  }
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}