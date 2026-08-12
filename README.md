# Digital Creative Admin

React admin độc lập, chỉ giao tiếp với API trong `Digital_Crative_BE`.

## Cấu hình

1. Backend `.env`:

```env
ALLOWED_ORIGINS=http://localhost:8082,http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=mat-khau-rat-manh-12-ky-tu
```

Tài khoản Admin chỉ được tạo lần đầu khi email chưa tồn tại. Sau khi tạo, nên bỏ
`ADMIN_PASSWORD` khỏi môi trường và đổi mật khẩu bằng API tài khoản.

2. Admin `.env`:

```env
VITE_API_URL=http://localhost:8080
```

3. Chạy:

```powershell
npm install
npm run dev
```

## Cấu trúc

- `features/`: màn hình theo nghiệp vụ
- `components/`: UI dùng chung
- `services/`: giao tiếp API, refresh token
- `store/`: auth/session
- `routes/`: định tuyến và route guard
- `types/`: contracts phía frontend
- `layouts/`: khung giao diện admin

API không cung cấp hard delete. Resource không có `DeletedAt` sẽ không hiện nút
xóa mềm.

## Tính năng quản trị

- Danh mục tự động cho toàn bộ `DbSet`, chia theo nhóm nghiệp vụ.
- Tìm kiếm, lọc dữ liệu đang hoạt động/đã xóa, sắp xếp, phân trang 10–100 dòng.
- Xem chi tiết, chỉnh sửa trường được phép, xóa mềm, khôi phục và bulk action.
- Xuất trang dữ liệu hiện tại thành CSV UTF-8.
- Bảng tài chính, audit, token và webhook chỉ đọc; trường tiền luôn bất biến.
- Mọi cập nhật, xóa mềm và khôi phục đều ghi audit log.
