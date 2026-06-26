# O Phim

Ứng dụng xem phim trực tuyến miễn phí với chất lượng HD, hỗ trợ tiếng Việt. Ngoài phiên bản web, dự án còn cung cấp ứng dụng desktop đa nền tảng dành cho Windows, macOS và Linux.

## Tính năng chính

- Duyệt phim theo danh mục: phim mới, phim chiếu rạp, phim lẻ, phim bộ, hoạt hình
- Xếp hạng phim theo đánh giá và lượt xem
- Tìm kiếm phim với gợi ý tự động
- Xem phim trực tuyến với trình phát video tùy chỉnh
- Tải phim về máy dưới dạng MP4
- Lịch sử xem và danh sách "Tiếp tục xem"
- Giao diện thân thiện, tương thích mobile
- Ứng dụng desktop (Windows, macOS, Linux) với cập nhật tự động

## Công nghệ sử dụng

### Frontend (Web)
- **React 18** — thư viện xây dựng giao diện người dùng
- **React Router v6** — điều hướng SPA với lazy loading
- **SCSS (Sass)** — tổ chức stylesheet theo component
- **Swiper** — carousel/slider cho hero và danh sách phim
- **HLS.js** — phát video streaming HLS trên trình duyệt
- **React Helmet** — quản lý thẻ `<head>` cho SEO
- **Axios** — HTTP client giao tiếp với server

### Backend
- **Node.js** — HTTP server tùy chỉnh, xử lý proxy và streaming
- **FFmpeg** — chuyển đổi video MP4 phục vụ tải xuống

### Desktop (Electron)
- **Electron** — đóng gói ứng dụng desktop đa nền tảng
- **electron-builder** — build và phân phối bản cài đặt
- **electron-updater** — cập nhật tự động qua GitHub Releases

### CI/CD & Triển khai
- **GitHub Actions** — tự động build và phát hành ứng dụng desktop
- **Vercel** — deploy phiên bản web với SPA routing
- **Docker** — môi trường phát triển container hóa

### Testing
- **Jest** + **React Testing Library** — unit test và integration test

## Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường development (React + Server)
npm start

# Build production
npm run build

# Chạy server production
npm run serve
```

## Cấu trúc dự án

```
├── electron/         # Mã nguồn Electron (main process)
├── public/           # Tài nguyên tĩnh
├── scripts/          # Script build, deploy, kiểm tra
├── src/              # Mã nguồn React
│   ├── api/          # Tầng giao tiếp API
│   ├── components/   # Component tái sử dụng
│   ├── pages/        # Trang chính (Home, Catalog, Detail)
│   ├── config/       # Cấu hình routing
│   ├── constants/    # Dữ liệu tĩnh
│   ├── scss/         # Biến và mixin SCSS toàn cục
│   └── utils/        # Hàm tiện ích
├── server.js         # Backend HTTP server
├── docker-compose.yaml
└── package.json
```

## Desktop App

Ứng dụng desktop có thể build cho các nền tảng:

```bash
# Windows (NSIS + Portable)
npm run release:win

# macOS (DMG + ZIP)
npm run release:mac
```

Bản dựng sẽ tự động phát hành lên GitHub Releases thông qua GitHub Actions.
