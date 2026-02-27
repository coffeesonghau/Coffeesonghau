// 1. BẠN HÃY COPY ĐƯỜNG LINK FILE GOOGLE SHEET CỦA BẠN VÀ DÁN VÀO GIỮA 2 DẤU NGOẶC KÉP BÊN DƯỚI NHÉ
// (Ví dụ: "https://docs.google.com/spreadsheets/d/1abc...xyz/edit")
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
    
    // MỞ TRỰC TIẾP BẰNG ĐƯỜNG LINK (Khắc phục lỗi không tìm thấy ID)
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

    // 3. ĐỔI MẬT KHẨU
    if (data.action === "changePass") {
      for (let i = 1; i < rowsNV.length; i++) {
        if (rowsNV[i][0].toString() === data.user.toString() && rowsNV[i][2] === data.oldPass) {
          sheetNV.getRange(i + 1, 3).setValue(data.newPass); 
          return createResponse({success: true});
        }
      }
      return createResponse({success: false, msg: "Mật khẩu cũ không đúng"});
    }

    // 4. LƯU DỮ LIỆU SALES
    if (data.action === "saveData") {
      let sheetKH = ss.getSheetByName(SHEET_KHACHHANG);
      if (!sheetKH) return createResponse({success: false, msg: "Không tìm thấy sheet " + SHEET_KHACHHANG});
      
      if (sheetKH.getLastRow() === 0) {
        sheetKH.appendRow(["Thời gian", "ID Sales", "Người gửi", "Tên quán", "Địa chỉ", "Chủ quán", "SĐT", "Cách pha", "Lượng dùng", "Gu", "Hãng cũ", "Giá hiện tại", "Tiềm năng", "Trạng thái", "Ngày hẹn", "Ghi chú"]);
      }

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