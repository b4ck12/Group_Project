chỉnh sửa docs với tất cả các docs khác nếu liên quan
    ? lúc nào chat, lúc nào thì gọi agent để bắt đầu làm việc
    ? gợi ý món ăn du lịch, giải đáp các thắc mắc nx>
    gợi ý cả món ăn trong quán các thứ tùy theo ý kiến của thành viên nhóm...
    ? vẫn là supabase khi deploy đko còn postgres chỉ dùng để dùng tên local trc khi deploy đko
    ép thuộc tính: dùng SQL truyền thống thì bắt buộc phải ép (force) đầu ra của AI về chung một định dạng (format) cố định với các thuộc tính bắt buộc.
       * *Bảng Event và Plan:* Chất vấn lý do tách rời hai bảng này trong khi quan hệ giữa chúng chỉ là 1-1 (một Event chỉ có một Plan). Đánh giá thiết kế này chưa tối ưu và bảng Event đang bị thừa.
       *  *Bảng Expense:* Đề nghị xóa bỏ bảng/phần chi phí này vì hệ thống không tích hợp tính năng thanh toán trực tuyến, việc giữ lại chỉ để hiển thị thông tin là không cần thiết.
       *  * *Thuộc tính của Plan và Plan Stop:* Chỉ ra rằng một Plan là một chuỗi gồm nhiều điểm dừng (Plan Stop), bao gồm ngày tháng, địa điểm (location), thời gian cụ thể, giá tiền, phương thức di chuyển.
       *   *Quản lý trạng thái và lịch sử thay đổi của Plan:* Phản biện việc nhóm định ghi đè (thay thế toàn bộ) dữ liệu Plan sau mỗi lần bình chọn (vote) hoặc khi thay đổi lịch trình lúc đang đi thực tế (ví dụ: trời mưa phải đổi sang địa điểm dự phòng - alternative stop). Giảng viên chỉ rõ các giai đoạn của Plan (vừa tạo / Initial Plan \rightarrow Voting \rightarrow chốt / Finalized Plan \rightarrow đang thực hiện / Ongoing) đều có dữ liệu khác nhau. Do đó, nhóm phải xây dựng kịch bản (scenario) chặt chẽ và tính toán lại các thuộc tính (attributes) trong Database để lưu trữ được cả danh sách ban đầu, danh sách đã chốt sau khi vote và các thay đổi phát sinh trong thực tế mà không làm mất dấu dữ liệu.
       *   Chat message là kênh chat chung cho cả nhóm (group channel) 
       *   thêm Bộ lọc (Filter):* Lọc bớt tin nhắn rác, ép buộc đầu vào của Plan phải có các thông tin cốt lõi (như Location và Date) trước khi đưa vào mô hình. Đây là cách đơn giản nhất.