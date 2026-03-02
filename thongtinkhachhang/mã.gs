// 1. BẠN HÃY COPY ĐƯỜNG LINK FILE GOOGLE SHEET CỦA BẠN VÀ DÁN VÀO GIỮA 2 DẤU NGOẶC KÉP BÊN DƯỚI NHÉ
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1D6z7mmyTwvwdfBttuY_3ZrCrQ09k6z9rELg8V5VFdn4/edit?usp=sharing";
const SHEET_NHANVIEN = "NhanVien"; 
const SHEET_KHACHHANG = "KhachHang"; 

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openByUrl(SHEET_URL);
    const sheetNV = ss.getSheetByName(SHEET_NHANVIEN);
    
    if (!sheetNV) return createResponse({success: false, msg: "Không tìm thấy sheet " + SHEET_NHANVIEN});
    const rowsNV = sheetNV.getDataRange().getValues();
    
    // 1. KIỂM TRA ID
    if (data.action === "checkID") {
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString()) {
          return createResponse({success: true, name: rowsNV[i][1]});
        }
      }
      return createResponse({success: false});
    }

    // 2. ĐĂNG NHẬP
    if (data.action === "login") {
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString() && rowsNV[i][2] === data.password) {
          return createResponse({success: true, name: rowsNV[i][1]});
        }
      }
      return createResponse({success: false, msg: "Sai tài khoản hoặc mật khẩu"});
    }

    // 3. ĐỔI MẬT KHẨU (BÊN TRONG APP)
    if (data.action === "changePass") {
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString() && rowsNV[i][2] === data.oldPass) {
          sheetNV.getRange(i + 1, 3).setValue(data.newPass);
          return createResponse({success: true});
        }
      }
      return createResponse({success: false, msg: "Mật khẩu cũ không đúng"});
    }

    // 4. QUÊN MẬT KHẨU (THIẾT LẬP LẠI)
    if (data.action === "resetPass") {
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString()) {
          sheetNV.getRange(i + 1, 3).setValue(data.newPass);
          return createResponse({success: true});
        }
      }
      return createResponse({success: false, msg: "Không tìm thấy tài khoản để đổi mật khẩu"});
    }

    // 5. LƯU DỮ LIỆU SALES (ĐÃ THÊM KÊNH BÁN & CHI TIẾT ĐƠN HÀNG)
    if (data.action === "saveData") {
      let sheetKH = ss.getSheetByName(SHEET_KHACHHANG);
      if (!sheetKH) return createResponse({success: false, msg: "Không tìm thấy sheet " + SHEET_KHACHHANG});
      
      // Nếu sheet trống, tạo Header bao gồm 2 cột mới
      if (sheetKH.getLastRow() === 0) {
        sheetKH.appendRow([
          "Thời gian", "ID Sales", "Người gửi", "Tên quán", "Địa chỉ", 
          "Chủ quán", "SĐT", "Cách pha", "Lượng dùng", "Gu", 
          "Hãng cũ", "Giá hiện tại", "Tiềm năng", 
          "Kênh Bán", "Chi Tiết Đơn (Sản phẩm & Tiền)", // <-- 2 CỘT MỚI Ở ĐÂY
          "Trạng thái", "Ngày hẹn", "Ghi chú"
        ]);
      }

      // Lưu dữ liệu đẩy từ Form lên
      sheetKH.appendRow([
        new Date(),
        data.id_sales,
        data.nguoi_gui,
        data.ten_quan,
        data.dia_chi,
        data.chu_quan,
        data.sdt_zalo,
        data.loai_ban,
        data.luong_dung,
        data.gu_hien_tai,
        data.hang_dang_dung,
        data.gia_hien_tai,
        data.tiem_nang,
        data.kenh_ban,       // <-- Giá trị dropdown: ban_le, dai_ly_quan, he_thong_npp
        data.chi_tiet_don,   // <-- VD: Truyền Thống 1 (500g) x2 => Tổng tiền: 160.000 đ
        data.da_gui_mau,
        data.ngay_goi_lai,
        data.phan_hoi
      ]);
      return createResponse({success: true});
    }

    return createResponse({success: false, msg: "Action không hợp lệ"});
  } catch(err) {
    return createResponse({success: false, msg: err.toString()});
  }
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}