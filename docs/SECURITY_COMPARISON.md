# 🔒 So sánh bảo mật: Direct Call vs Internal API Secret

## TL;DR

**Direct Function Call bảo mật hơn** vì:
- ✅ Không có attack surface (không có HTTP endpoint)
- ✅ Không có secret key có thể bị lộ
- ✅ Không bypass middleware
- ✅ Ít moving parts = ít lỗ hổng

---

## 📊 Phân tích chi tiết

### 🟢 Cách 1: Direct Function Call

#### Luồng hoạt động
```
User (authenticated) 
  → Next.js Server Action/API Route (có auth check)
    → Service (server-side code)
      → generateContractPDF() (direct import)
        → Puppeteer → PDF
```

#### Attack Surface
```
✅ Không có HTTP endpoint public
✅ Không có secret key
✅ Không bypass middleware
✅ Code chỉ chạy server-side
```

#### Các vector tấn công có thể

##### 1. Unauthorized Access
**Có thể không?** ❌ KHÔNG

**Lý do:**
- User phải login trước
- Middleware check authentication ở tầng đầu
- Service code chỉ chạy sau khi đã authenticated
- Không có cách nào bypass được

**Kịch bản:**
```
Attacker → /api/contracts/generate
         ↓
      Middleware check auth
         ↓
      ❌ Redirect to /login (nếu chưa login)
```

##### 2. Code Injection
**Có thể không?** ⚠️ CÓ (nhưng khó)

**Lý do:**
- Nếu attacker có thể inject code vào server
- Nhưng đây là server compromise, không phải lỗi của cách này

**Mitigation:**
- Input validation
- Sanitize contract data
- Regular security updates

##### 3. Resource Exhaustion (DoS)
**Có thể không?** ⚠️ CÓ

**Lý do:**
- Authenticated user có thể spam tạo hợp đồng
- Puppeteer tốn nhiều resources

**Mitigation:**
- Rate limiting
- Queue system
- Monitor resource usage

```typescript
// Example rate limiting
const rateLimiter = new Map();

export async function generateContractsAction(loanId: string) {
  const userId = await getCurrentUserId();
  
  // Check rate limit
  const lastCall = rateLimiter.get(userId);
  if (lastCall && Date.now() - lastCall < 60000) {
    throw new Error("Too many requests. Please wait 1 minute.");
  }
  
  rateLimiter.set(userId, Date.now());
  
  // Continue...
}
```

##### 4. Data Leakage
**Có thể không?** ⚠️ CÓ (nếu có bug)

**Lý do:**
- Nếu code có bug, có thể leak data của user khác
- Ví dụ: Không check ownership của loan

**Mitigation:**
- Always check user permissions
- Validate loanId belongs to user

```typescript
export async function generateContractsAction(loanId: string) {
  const user = await getCurrentUser();
  
  // ✅ Check ownership
  const loan = await getLoan(loanId);
  if (loan.userId !== user.id) {
    throw new Error("Unauthorized");
  }
  
  // Continue...
}
```

#### Security Score: 9/10
- ✅ No public endpoints
- ✅ No secrets to manage
- ✅ No bypass logic
- ⚠️ Still need rate limiting
- ⚠️ Still need input validation

---

### 🟡 Cách 2: Internal API Secret

#### Luồng hoạt động
```
User (authenticated)
  → Next.js Server Action/API Route (có auth check)
    → Service (server-side code)
      → HTTP fetch với x-internal-secret header
        → Middleware (bypass nếu secret đúng)
          → API Route /api/generate-pdf
            → Puppeteer → PDF
```

#### Attack Surface
```
⚠️ Có HTTP endpoint (/api/generate-pdf)
⚠️ Có secret key cần bảo vệ
⚠️ Có bypass logic trong middleware
✅ Endpoint chỉ accept với secret đúng
```

#### Các vector tấn công có thể

##### 1. Secret Key Leakage
**Có thể không?** ⚠️ CÓ

**Các cách secret có thể bị lộ:**

a) **Commit lên Git**
```bash
# ❌ Nguy hiểm
git add .env
git commit -m "Add env"
git push

# Attacker có thể:
# 1. Clone repo
# 2. Xem git history
# 3. Lấy được INTERNAL_API_SECRET
```

b) **Log files**
```typescript
// ❌ Nguy hiểm
console.log("Calling API with secret:", process.env.INTERNAL_API_SECRET);

// Logs có thể:
// 1. Được lưu vào file
// 2. Được gửi lên logging service
// 3. Được xem bởi nhiều người
```

c) **Error messages**
```typescript
// ❌ Nguy hiểm
throw new Error(`Failed to call API with secret ${secret}`);

// Error có thể:
// 1. Hiển thị trên UI (nếu có bug)
// 2. Được log ra console
// 3. Được gửi lên error tracking (Sentry, etc)
```

d) **Environment variable exposure**
```typescript
// ❌ Nguy hiểm - Next.js API route
export async function GET() {
  return Response.json(process.env); // Expose tất cả env vars!
}
```

e) **Server-Side Request Forgery (SSRF)**
```typescript
// ❌ Nguy hiểm
export async function POST(req: Request) {
  const { url } = await req.json();
  
  // Attacker có thể:
  // 1. Gửi url = "http://localhost:3000/api/generate-pdf"
  // 2. Đọc response để tìm hints về secret
  const response = await fetch(url);
  return response;
}
```

**Mitigation:**
- Không commit .env
- Không log secret
- Không expose trong error messages
- Rotate secret định kỳ
- Use secret management service (AWS Secrets Manager, etc)

##### 2. Brute Force Secret
**Có thể không?** ⚠️ CÓ (nhưng khó)

**Kịch bản:**
```typescript
// Attacker thử nhiều secret
for (let i = 0; i < 1000000; i++) {
  const response = await fetch("/api/generate-pdf", {
    headers: {
      "x-internal-secret": `secret-${i}`
    }
  });
  
  if (response.ok) {
    console.log("Found secret:", `secret-${i}`);
    break;
  }
}
```

**Khả năng thành công:**
- Nếu secret ngắn (< 16 chars): Cao
- Nếu secret dài (32+ chars, random): Rất thấp
- Nếu có rate limiting: Rất thấp

**Mitigation:**
- Secret phải dài (32+ characters)
- Secret phải random (không đoán được)
- Rate limiting trên endpoint
- Monitor failed attempts

##### 3. Timing Attack
**Có thể không?** ⚠️ CÓ (lý thuyết)

**Kịch bản:**
```typescript
// ❌ Vulnerable code
if (request.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET) {
  // String comparison có thể leak info qua timing
}
```

**Cách hoạt động:**
- So sánh string từ trái sang phải
- Nếu ký tự đầu sai → return nhanh
- Nếu ký tự đầu đúng → so sánh tiếp → chậm hơn
- Attacker đo thời gian để đoán từng ký tự

**Mitigation:**
```typescript
// ✅ Use constant-time comparison
import { timingSafeEqual } from 'crypto';

const providedSecret = Buffer.from(request.headers.get("x-internal-secret") || "");
const actualSecret = Buffer.from(process.env.INTERNAL_API_SECRET || "");

if (providedSecret.length === actualSecret.length && 
    timingSafeEqual(providedSecret, actualSecret)) {
  // OK
}
```

##### 4. Man-in-the-Middle (MITM)
**Có thể không?** ⚠️ CÓ (nếu không dùng HTTPS)

**Kịch bản:**
```
Service → HTTP (không mã hóa) → API
         ↓
    Attacker nghe lén
         ↓
    Lấy được x-internal-secret header
```

**Mitigation:**
- Always use HTTPS
- Trong production, Next.js tự động dùng HTTPS
- Nhưng trong dev, có thể dùng HTTP

##### 5. Replay Attack
**Có thể không?** ⚠️ CÓ

**Kịch bản:**
```
1. Attacker intercept request hợp lệ
2. Lưu lại header x-internal-secret
3. Replay request nhiều lần
```

**Mitigation:**
- Add timestamp/nonce vào request
- Validate timestamp
- Track used nonces

```typescript
// Better approach
const timestamp = Date.now();
const nonce = crypto.randomUUID();
const signature = hmac(secret, `${timestamp}:${nonce}:${data}`);

headers: {
  "x-timestamp": timestamp,
  "x-nonce": nonce,
  "x-signature": signature
}
```

##### 6. Unauthorized Access (nếu secret bị lộ)
**Có thể không?** ✅ CÓ

**Kịch bản:**
```
Attacker có secret → Gọi trực tiếp API
  → Bypass authentication
  → Tạo PDF tùy ý
  → DoS attack
```

**Impact:**
- Tạo PDF với data bất kỳ
- Resource exhaustion
- Cost increase (nếu dùng paid service)

#### Security Score: 6/10
- ⚠️ Has public endpoint (với secret)
- ⚠️ Secret có thể bị lộ
- ⚠️ Có bypass logic
- ⚠️ Nhiều attack vectors
- ✅ Vẫn tốt hơn không có protection

---

## 📊 Bảng so sánh

| Attack Vector | Direct Call | Internal Secret | Winner |
|--------------|-------------|-----------------|--------|
| **Unauthorized Access** | ❌ Không thể | ⚠️ Có thể (nếu secret lộ) | 🟢 Direct |
| **Secret Leakage** | ❌ Không có secret | ⚠️ Có thể bị lộ | 🟢 Direct |
| **Brute Force** | ❌ Không áp dụng | ⚠️ Có thể (nếu secret yếu) | 🟢 Direct |
| **Timing Attack** | ❌ Không áp dụng | ⚠️ Có thể | 🟢 Direct |
| **MITM** | ❌ Không có HTTP | ⚠️ Có thể (nếu không HTTPS) | 🟢 Direct |
| **Replay Attack** | ❌ Không áp dụng | ⚠️ Có thể | 🟢 Direct |
| **Code Injection** | ⚠️ Có thể | ⚠️ Có thể | 🟡 Tie |
| **DoS** | ⚠️ Có thể | ⚠️ Có thể | 🟡 Tie |
| **Data Leakage** | ⚠️ Có thể | ⚠️ Có thể | 🟡 Tie |

**Tổng kết:** Direct Call thắng 6-0-3

---

## 🎯 Kết luận

### Direct Function Call bảo mật hơn vì:

1. **Không có attack surface**
   - Không có HTTP endpoint public
   - Không có cách nào gọi từ bên ngoài

2. **Không có secret key**
   - Không có gì để lộ
   - Không cần rotate
   - Không cần manage

3. **Đơn giản hơn**
   - Ít code = ít bug
   - Ít config = ít lỗi
   - Dễ audit hơn

4. **Defense in depth**
   - Middleware vẫn check auth
   - Không bypass gì cả
   - Multiple layers of protection

### Internal API Secret vẫn OK nếu:

1. ✅ Secret được generate đúng cách (32+ chars, random)
2. ✅ Secret được lưu an toàn (secret manager, không commit)
3. ✅ Secret được rotate định kỳ
4. ✅ Có rate limiting
5. ✅ Có monitoring
6. ✅ Always use HTTPS
7. ✅ Use constant-time comparison
8. ✅ Add timestamp/nonce validation

**Nhưng đó là nhiều điều kiện!**

---

## 💡 Khuyến nghị

### Cho dự án này:
**Dùng Direct Function Call** vì:
- Đơn giản hơn
- Bảo mật hơn
- Ít config hơn
- Ít lỗi hơn

### Khi nào dùng Internal API Secret:
- Khi cần gọi từ external service
- Khi muốn tách biệt microservice
- Khi có team security chuyên nghiệp
- Khi có budget cho secret management

### Best practices chung:
1. Always validate user permissions
2. Rate limiting
3. Input validation
4. Monitor suspicious activities
5. Regular security audits
6. Keep dependencies updated

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
