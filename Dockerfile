# Sử dụng môi trường Node.js (ví dụ bản 24.15.0)
FROM node:24.15.0-alpine

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy file cấu hình package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn dự án vào container
COPY . .

# Mở cổng mạng (ví dụ 3000)
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "start"]