# 🐻 Tiệm Tích Điểm Bubu & Dudu (Bubu & Dudu Family Rewards)

Ứng dụng web tích điểm thưởng cute phong cách **Bubu & Dudu** dành cho gia đình và các cặp đôi. Giúp việc nhà và việc học tập rèn luyện thói quen trở nên vui nhộn, hào hứng hơn bao giờ hết!

---

## ✨ Tính Năng Nổi Bật

1. **Nhân vật Mascot Bubu & Dudu Độc Quyền**:
   - Hình vẽ vector sắc nét, đáng yêu của Bubu (gấu trắng) và Dudu (gấu nâu).
   - Biểu cảm thay đổi linh hoạt: Nhảy cẫng ăn mừng khi được cộng điểm, mếu máo dễ thương khi bị trừ lỗi, thả tim yêu thương.
2. **Ghi Nhận & Tùy Chỉnh Điểm Linh Hoạt**:
   - **Thưởng (+ Điểm Gấu 🐻)**: Rửa bát, hút bụi, nấu ăn, làm bài tập, đi ngủ sớm, massage cho người thương...
   - **Nhắc nhở / Phạt (- Điểm Gấu 🐻)**: Chưa làm bài tập, bày bừa, thức khuya, quên rửa bát...
   - Thêm/sửa/xóa mọi đầu việc kèm số điểm tùy chỉnh (+5 đến +100 điểm) và icon emoji sinh động.
   - Thao tác 1 chạm siêu nhanh kèm modal xác nhận cute và hiệu ứng pháo hoa giấy (confetti).
3. **Tiệm Đổi Quà (Voucher Shop)**:
   - Dùng điểm gấu đổi các món quà thực tế: Trà sữa full topping, Vé miễn rửa bát 1 bữa, Vé xem phim, Massage VIP...
   - Tự tạo thêm các voucher đặc quyền riêng cho gia đình.
4. **Nhật Ký & Lịch Sử Minh Bạch**:
   - Lưu lại chi tiết ai làm việc gì, lúc mấy giờ, kèm lời nhắn/ghi chú.
   - Hỗ trợ nút hoàn tác (Undo) nếu bấm nhầm.
5. **Bảng Phong Thần & Báo Cáo Tuần**:
   - Xếp hạng Quán Quân, Á Quân, Hạng Ba kèm chuỗi ngày chăm chỉ (Streak 🔥).
   - Thống kê tổng số việc đã hoàn thành, tổng điểm gấu và quà đã đổi.
6. **Âm Thanh & Trải Nghiệm Thú Vị**:
   - Âm thanh leng keng vui nhộn bằng Web Audio API (không cần tải file ngoài, hoạt động 100% offline).
   - Lưu trữ tự động trên thiết bị (LocalStorage).
   - Chức năng **Xuất / Khôi phục Backup (JSON)** giúp dễ dàng chuyển dữ liệu giữa các điện thoại.

---

## 🚀 Hướng Dẫn Sử Dụng

### Khởi chạy dự án:
```bash
cd /Users/thaihung/.gemini/antigravity/scratch/bubu-dudu-rewards
npm run dev -- --host
```

- **Mở trên máy tính**: Truy cập [http://localhost:5173/](http://localhost:5173/)
- **Mở trên điện thoại (cùng mạng Wi-Fi)**: Truy cập theo địa chỉ IP mạng nội bộ (ví dụ: `http://192.168.100.44:5173/`).
- **Thêm ra màn hình chính điện thoại (dùng như app)**:
  - Trên Safari (iOS): Bấm nút **Chia sẻ (Share)** $\rightarrow$ Chọn **Thêm vào MH chính (Add to Home Screen)**.
  - Trên Chrome (Android): Bấm menu 3 chấm $\rightarrow$ Chọn **Cài đặt ứng dụng / Thêm vào màn hình chính**.
