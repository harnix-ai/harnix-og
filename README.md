# harnix-og

Dịch vụ tạo thumbnail blog Harnix (PNG 1200×630) từ link có chữ ký.

## Deploy
    npm i -g vercel
    vercel login
    cd harnix-og
    vercel link --project harnix-og        # tạo project mới khi được hỏi
    vercel env add OG_SECRET production    # dán khoá bí mật (đã gửi riêng trong chat)
    vercel deploy --prod

## Kiểm tra
    https://<domain>/og.png?health=1   -> ok

Link ảnh không có chữ ký đúng sẽ trả về 403.
