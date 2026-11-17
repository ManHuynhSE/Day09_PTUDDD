

### 1. Giá trị dẫn xuất (Derived State)
Ở màn Checkout, `errors` và `valid` được suy ra trực tiếp từ dữ liệu nhập liệu (`name`, `phone`, `address`...), nên tính trực tiếp mỗi lần render giúp dữ liệu luôn đồng bộ tuyệt đối và tránh re-render thừa. Nếu dùng `useState` riêng, ta phải tự cập nhật thủ công bằng `useEffect` hoặc trong từng hàm `onChange`, rất dễ xảy ra lỗi lệch trạng thái (ví dụ: người dùng đã sửa đúng input nhưng nút Submit vẫn bị khóa do state `valid` chưa kịp cập nhật).

### 2. Thứ tự gọi hàm trong `submit`
Nếu để `clear()` chạy trước `await createOrder(...)`, khi bị mất mạng giỏ hàng sẽ bị xóa sạch trong khi đơn hàng chưa hề được tạo trên server, khiến người dùng mất toàn bộ sản phẩm đã chọn và phải thêm lại từ đầu. Đặt `clear()` ngay sau `await createOrder(...)` đảm bảo giỏ hàng chỉ được làm rỗng khi API đã xác nhận đặt hàng thành công.

### 3. `PUT` hay `PATCH`
Nếu dùng `PUT /users/1` chỉ với `{ name, phone }`, `json-server` sẽ ghi đè toàn bộ object cũ, khiến user đó bị mất sạch các trường quan trọng khác như `email`, `password`, `role`... Bài này chọn `PATCH` vì phương thức này chỉ cập nhật đúng hai trường `name` và `phone` được gửi lên mà vẫn giữ nguyên các thông tin còn lại.

### 4. Cập nhật lạc quan (Optimistic UI)
Nếu bỏ đoạn hoàn lại `read: false` trong khối `catch`, khi mất mạng giao diện sẽ báo thông báo đã đọc nhưng thực tế trên server chưa lưu, dẫn đến việc tắt app mở lại thông báo vẫn hiện chưa đọc (lệch dữ liệu). 
* **Chức năng nên dùng:** Thả tim / yêu thích sách (Wishlist) hoặc đánh dấu thông báo đã đọc vì thao tác cần phản hồi tức thì và rủi ro thấp nếu lỗi.
* **Chức năng không nên dùng:** Thanh toán đơn hàng hoặc trừ tồn kho vì cần sự xác nhận chắc chắn từ server để tránh sai lệch tiền bạc.


