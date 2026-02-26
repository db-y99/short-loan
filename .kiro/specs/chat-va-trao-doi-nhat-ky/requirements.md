# Tài liệu Yêu cầu: Chat và Trao đổi nhật ký

## Giới thiệu

Tính năng Chat và Trao đổi nhật ký là hệ thống giao tiếp và ghi chép sự kiện theo thời gian thực cho hệ thống quản lý cho vay. Tính năng này cho phép nhân viên trao đổi thông tin về hồ sơ vay, đồng thời tự động ghi lại các sự kiện quan trọng như phê duyệt, thanh toán lãi, và các thay đổi trạng thái hồ sơ. Hệ thống sử dụng kiến trúc Event Sourcing để đảm bảo tính toàn vẹn và khả năng truy xuất lịch sử đầy đủ.

## Thuật ngữ (Glossary)

- **Activity_Log_System**: Hệ thống quản lý nhật ký hoạt động và tin nhắn
- **Chat_Interface**: Giao diện chat hiển thị tin nhắn và sự kiện
- **Message**: Tin nhắn văn bản do nhân viên gửi
- **System_Event**: Sự kiện tự động được ghi bởi hệ thống (phê duyệt, từ chối, thanh toán)
- **Activity_Log_Entry**: Một bản ghi trong nhật ký hoạt động
- **Staff_User**: Nhân viên sử dụng hệ thống
- **Loan_Record**: Hồ sơ cho vay
- **Mention**: Thẻ tag nhân viên trong tin nhắn (@tên)
- **File_Storage_Service**: Dịch vụ lưu trữ file (Google Drive hoặc Supabase Storage)
- **Notification_Service**: Dịch vụ gửi thông báo email
- **Polling_Mechanism**: Cơ chế kiểm tra cập nhật định kỳ
- **Optimistic_UI**: Kỹ thuật hiển thị tin nhắn ngay lập tức trước khi server xác nhận
- **Image_Viewer**: Công cụ xem ảnh phóng to
- **Rich_Text_Editor**: Trình soạn thảo văn bản có định dạng (Quill Editor)

## Yêu cầu

### Yêu cầu 1: Gửi tin nhắn văn bản

**User Story:** Là một nhân viên, tôi muốn gửi tin nhắn văn bản vào hồ sơ vay, để trao đổi thông tin với đồng nghiệp về tình trạng khách hàng.

#### Tiêu chí chấp nhận

1. WHEN Staff_User gửi tin nhắn, THE Chat_Interface SHALL hiển thị tin nhắn ngay lập tức với biểu tượng đang gửi
2. WHEN Staff_User gửi tin nhắn, THE Activity_Log_System SHALL lưu tin nhắn với type là 'message'
3. WHEN tin nhắn được lưu thành công, THE Chat_Interface SHALL thay đổi biểu tượng đang gửi thành biểu tượng đã gửi
4. IF việc gửi tin nhắn thất bại, THEN THE Chat_Interface SHALL hiển thị biểu tượng lỗi và cho phép gửi lại
5. THE Activity_Log_System SHALL lưu user_id, user_name, content, và created_at cho mỗi tin nhắn

### Yêu cầu 2: Ghi sự kiện hệ thống tự động

**User Story:** Là một quản trị viên, tôi muốn hệ thống tự động ghi lại các hành động quan trọng, để có thể truy xuất lịch sử đầy đủ của hồ sơ.

#### Tiêu chí chấp nhận

1. WHEN hồ sơ được phê duyệt, THE Activity_Log_System SHALL tạo Activity_Log_Entry với type là 'approval' và system_message chứa thông tin phê duyệt
2. WHEN hồ sơ bị từ chối, THE Activity_Log_System SHALL tạo Activity_Log_Entry với type là 'approval' và system_message chứa lý do từ chối
3. WHEN thanh toán lãi được thực hiện, THE Activity_Log_System SHALL tạo Activity_Log_Entry với type là 'system_event' và system_message chứa thông tin thanh toán
4. WHEN hồ sơ được tạo, THE Activity_Log_System SHALL tạo Activity_Log_Entry với type là 'contract_created'
5. THE Activity_Log_System SHALL bao gồm timestamp chính xác cho mỗi sự kiện

### Yêu cầu 3: Upload và hiển thị hình ảnh

**User Story:** Là một nhân viên, tôi muốn đính kèm hình ảnh vào tin nhắn, để chia sẻ tài liệu hoặc bằng chứng liên quan đến hồ sơ.

#### Tiêu chí chấp nhận

1. WHEN Staff_User chọn hình ảnh để upload, THE Activity_Log_System SHALL tải hình ảnh lên File_Storage_Service
2. WHEN hình ảnh được tải lên thành công, THE Activity_Log_System SHALL lưu URL hình ảnh vào trường images
3. WHEN hình ảnh được lưu, THE Chat_Interface SHALL hiển thị thumbnail của hình ảnh trong tin nhắn
4. WHEN Staff_User nhấp vào thumbnail, THE Image_Viewer SHALL hiển thị hình ảnh ở kích thước đầy đủ
5. THE Activity_Log_System SHALL tạo Activity_Log_Entry với type là 'image_upload'
6. THE Activity_Log_System SHALL lưu hình ảnh vào thư mục riêng của Loan_Record trên File_Storage_Service

### Yêu cầu 4: Tag nhân viên và gửi thông báo

**User Story:** Là một nhân viên, tôi muốn tag đồng nghiệp trong tin nhắn, để họ nhận được thông báo và biết cần xem hồ sơ này.

#### Tiêu chí chấp nhận

1. WHEN Staff_User gõ ký tự '@' trong Rich_Text_Editor, THE Chat_Interface SHALL hiển thị danh sách nhân viên có thể tag
2. WHEN Staff_User chọn nhân viên từ danh sách, THE Rich_Text_Editor SHALL chèn Mention với user_id của nhân viên đó
3. WHEN tin nhắn có Mention được gửi, THE Activity_Log_System SHALL lưu danh sách user_id được tag vào trường mentions
4. WHEN tin nhắn có Mention được lưu, THE Notification_Service SHALL gửi email thông báo đến nhân viên được tag
5. THE Notification_Service SHALL bao gồm link trực tiếp đến Loan_Record trong email thông báo

### Yêu cầu 5: Đồng bộ hóa tin nhắn theo thời gian thực

**User Story:** Là một nhân viên, tôi muốn thấy tin nhắn mới từ đồng nghiệp ngay khi họ gửi, để có thể phản hồi kịp thời.

#### Tiêu chí chấp nhận

1. THE Polling_Mechanism SHALL kiểm tra cập nhật từ server mỗi 4 giây
2. WHEN có Activity_Log_Entry mới được tạo, THE Polling_Mechanism SHALL phát hiện thay đổi dựa trên updated_at của Loan_Record
3. WHEN phát hiện có cập nhật mới, THE Chat_Interface SHALL tải và hiển thị Activity_Log_Entry mới
4. THE Chat_Interface SHALL hiển thị Activity_Log_Entry mới mà không làm gián đoạn trải nghiệm người dùng
5. WHEN Staff_User đang soạn tin nhắn, THE Polling_Mechanism SHALL tiếp tục hoạt động nhưng không làm mất nội dung đang soạn

### Yêu cầu 6: Hiển thị lịch sử nhật ký theo thứ tự thời gian

**User Story:** Là một nhân viên, tôi muốn xem toàn bộ lịch sử trao đổi và sự kiện của hồ sơ, để hiểu rõ diễn biến của hồ sơ.

#### Tiêu chí chấp nhận

1. WHEN Staff_User mở Loan_Record, THE Chat_Interface SHALL hiển thị tất cả Activity_Log_Entry theo thứ tự thời gian tăng dần
2. THE Chat_Interface SHALL phân biệt rõ ràng giữa Message và System_Event bằng giao diện khác nhau
3. THE Chat_Interface SHALL hiển thị tên người gửi và thời gian cho mỗi Activity_Log_Entry
4. WHEN có nhiều hơn 50 Activity_Log_Entry, THE Chat_Interface SHALL tải thêm Activity_Log_Entry cũ hơn khi Staff_User cuộn lên trên
5. THE Chat_Interface SHALL hiển thị thumbnail cho Activity_Log_Entry có hình ảnh

### Yêu cầu 7: Lưu trữ nhật ký không giới hạn

**User Story:** Là một quản trị viên, tôi muốn hệ thống lưu trữ toàn bộ lịch sử nhật ký mà không bị giới hạn, để đảm bảo tính toàn vẹn dữ liệu.

#### Tiêu chí chấp nhận

1. THE Activity_Log_System SHALL lưu trữ tất cả Activity_Log_Entry mà không giới hạn số lượng
2. THE Activity_Log_System SHALL không ghi đè hoặc xóa Activity_Log_Entry cũ khi có Activity_Log_Entry mới
3. THE Activity_Log_System SHALL sử dụng UUID làm khóa chính để đảm bảo tính duy nhất
4. THE Activity_Log_System SHALL tạo index trên loan_id và created_at để tối ưu truy vấn
5. THE Activity_Log_System SHALL hỗ trợ soft delete thông qua trường deleted_at

### Yêu cầu 8: Phân loại nội dung nhật ký

**User Story:** Là một nhân viên, tôi muốn dễ dàng phân biệt các loại nội dung trong nhật ký, để nhanh chóng tìm thông tin cần thiết.

#### Tiêu chí chấp nhận

1. THE Activity_Log_System SHALL phân loại Activity_Log_Entry theo type: 'message', 'system_event', 'image_upload', 'approval', 'contract_created', 'contract_signed', 'disbursement'
2. THE Chat_Interface SHALL hiển thị biểu tượng khác nhau cho mỗi type của Activity_Log_Entry
3. THE Chat_Interface SHALL sử dụng màu sắc khác nhau để phân biệt Message và System_Event
4. WHERE Staff_User muốn lọc theo type, THE Chat_Interface SHALL cung cấp bộ lọc để chỉ hiển thị Activity_Log_Entry của type được chọn
5. THE Chat_Interface SHALL hiển thị System_Event với định dạng đặc biệt để dễ nhận biết

### Yêu cầu 9: Xử lý lỗi và trạng thái kết nối

**User Story:** Là một nhân viên, tôi muốn biết khi có vấn đề kết nối, để hiểu tại sao tin nhắn không được gửi.

#### Tiêu chí chấp nhận

1. IF Polling_Mechanism không thể kết nối đến server, THEN THE Chat_Interface SHALL hiển thị cảnh báo mất kết nối
2. WHEN kết nối được khôi phục, THE Chat_Interface SHALL tự động đồng bộ Activity_Log_Entry mới và ẩn cảnh báo
3. IF tin nhắn không được gửi sau 10 giây, THEN THE Chat_Interface SHALL hiển thị lỗi và cho phép thử lại
4. WHEN Staff_User thử gửi lại tin nhắn thất bại, THE Activity_Log_System SHALL không tạo Activity_Log_Entry trùng lặp
5. THE Chat_Interface SHALL lưu tin nhắn thất bại vào local storage để không mất dữ liệu

### Yêu cầu 10: Tích hợp với hệ thống lưu trữ file

**User Story:** Là một quản trị viên, tôi muốn file và hình ảnh được lưu trữ có tổ chức, để dễ dàng quản lý và sao lưu.

#### Tiêu chí chấp nhận

1. WHEN hình ảnh hoặc file được upload, THE File_Storage_Service SHALL lưu vào thư mục riêng của Loan_Record
2. THE File_Storage_Service SHALL tạo thư mục theo cấu trúc: /loans/{loan_id}/chat/{timestamp}_{filename}
3. WHEN hình ảnh được upload, THE File_Storage_Service SHALL nén hình ảnh nếu kích thước lớn hơn 2MB
4. THE Activity_Log_System SHALL lưu file_id hoặc URL đầy đủ vào trường images hoặc links
5. THE File_Storage_Service SHALL trả về URL công khai có thể truy cập được từ Chat_Interface
