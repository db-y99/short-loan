# Tasks: Chat và Gửi ảnh

## 1. Setup Infrastructure
- [x] 1.1 Tạo Supabase Storage bucket `loan-chat-images`
- [x] 1.2 Cấu hình Storage policies (authenticated upload, public read)
- [x] 1.3 Setup Realtime subscription cho table `loan_activity_logs`
- [x] 1.4 Cài đặt fast-check library cho property-based testing

## 2. Core Data Layer
- [ ] 2.1 Tạo TypeScript types cho ActivityLog và OptimisticMessage
- [x] 2.2 Implement function `insertMessage(loanId, userId, userName, content)`
- [x] 2.3 Implement function `uploadImage(loanId, file)` trả về URL
- [x] 2.4 Implement function `insertImageLog(loanId, userId, userName, imageUrl)`
- [x] 2.5 Implement function `fetchActivityLogs(loanId, limit, offset)` với pagination

## 3. Realtime Subscription
- [x] 3.1 Implement hook `useRealtimeActivityLogs(loanId)` subscribe changes
- [x] 3.2 Handle INSERT events và update local state
- [x] 3.3 Handle connection status (connected/error/reconnecting)
- [x] 3.4 Auto-refetch messages khi reconnect sau disconnect

## 4. MessageInput Component
- [x] 4.1 Tạo component với textarea và send button
- [x] 4.2 Implement validation: không cho gửi tin nhắn rỗng
- [x] 4.3 Implement keyboard shortcuts (Enter gửi, Shift+Enter xuống dòng)
- [x] 4.4 Thêm button chọn ảnh với file input
- [x] 4.5 Implement file validation (size <5MB, type jpg/png/webp)
- [x] 4.6 Hiển thị preview ảnh trước khi gửi
- [x] 4.7 Hiển thị loading state khi đang upload/gửi

## 5. MessageBubble Component
- [x] 5.1 Tạo component hiển thị tin nhắn với avatar, tên, thời gian
- [x] 5.2 Style khác nhau cho tin nhắn của mình vs người khác
- [x] 5.3 Hiển thị status icon (sending/sent/error)
- [x] 5.4 Render thumbnail cho tin nhắn có ảnh
- [x] 5.5 Handle click thumbnail để mở ImageViewer
- [x] 5.6 Hiển thị retry button cho tin nhắn lỗi

## 6. SystemEventBubble Component
- [x] 6.1 Tạo component hiển thị system events
- [x] 6.2 Style centered với màu xám
- [x] 6.3 Hiển thị icon tương ứng với type (approval, disbursement, etc)
- [x] 6.4 Format timestamp

## 7. ImageViewer Component
- [x] 7.1 Tạo modal component hiển thị ảnh full size
- [x] 7.2 Implement zoom in/out functionality
- [x] 7.3 Đóng khi click outside hoặc nhấn ESC
- [x] 7.4 Hiển thị loading state khi ảnh đang load

## 8. ChatInterface Component
- [x] 8.1 Tạo component chính với layout (header, messages list, input)
- [x] 8.2 Fetch initial messages khi mount
- [x] 8.3 Integrate useRealtimeActivityLogs hook
- [x] 8.4 Implement optimistic UI state management
- [x] 8.5 Handle send message với optimistic update
- [x] 8.6 Handle send image với optimistic update
- [x] 8.7 Implement infinite scroll (load more khi scroll lên)
- [x] 8.8 Auto-scroll to bottom khi có tin nhắn mới (chỉ khi đang ở bottom)
- [x] 8.9 Hiển thị connection status banner

## 9. Error Handling
- [x] 9.1 Implement error handling cho upload failures
- [x] 9.2 Implement error handling cho message send failures
- [x] 9.3 Implement retry logic cho failed messages
- [x] 9.4 Save failed messages to localStorage
- [x] 9.5 Auto-retry khi connection restored
- [x] 9.6 Hiển thị user-friendly error messages

## 10. Property-Based Tests
- [-] 10.1 Write property test: Message persistence with complete data
- [ ] 10.2 Write property test: Optimistic UI state transitions
- [ ] 10.3 Write property test: Image upload and URL persistence
- [ ] 10.4 Write property test: Image storage path structure
- [ ] 10.5 Write property test: Thumbnail rendering for images
- [ ] 10.6 Write property test: Realtime synchronization
- [ ] 10.7 Write property test: Input preservation during updates
- [ ] 10.8 Write property test: Activity logs sorted by time
- [ ] 10.9 Write property test: Complete message rendering

## 11. Unit Tests
- [ ] 11.1 Test MessageInput: không cho gửi tin nhắn rỗng
- [ ] 11.2 Test MessageInput: validate file size và type
- [ ] 11.3 Test MessageInput: keyboard shortcuts
- [ ] 11.4 Test MessageBubble: render đúng cho own vs other messages
- [ ] 11.5 Test MessageBubble: hiển thị status icons
- [ ] 11.6 Test SystemEventBubble: render system messages
- [ ] 11.7 Test ImageViewer: open/close functionality
- [ ] 11.8 Test ChatInterface: optimistic UI updates
- [ ] 11.9 Test error handling và retry logic

## 12. Integration Tests
- [ ] 12.1 Test full flow: gửi tin nhắn và nhận qua realtime
- [ ] 12.2 Test full flow: upload ảnh và hiển thị thumbnail
- [ ] 12.3 Test pagination: load more messages
- [ ] 12.4 Test realtime sync giữa multiple clients
- [ ] 12.5 Test error recovery và retry

## 13. UI/UX Polish
- [ ] 13.1 Implement responsive design cho mobile
- [ ] 13.2 Add loading skeletons cho initial load
- [ ] 13.3 Add smooth animations cho tin nhắn mới
- [ ] 13.4 Optimize image thumbnails (lazy loading)
- [ ] 13.5 Add typing indicator (optional)
- [ ] 13.6 Format timestamps (hôm nay, hôm qua, dd/mm/yyyy)

## 14. Documentation
- [ ] 14.1 Document API functions với JSDoc
- [ ] 14.2 Tạo README cho component usage
- [ ] 14.3 Document Supabase setup steps
- [ ] 14.4 Tạo troubleshooting guide
