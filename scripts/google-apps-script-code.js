/**
 * GOOGLE APPS SCRIPT CODE
 * Copy code này vào Google Apps Script Editor
 * URL: https://script.google.com/
 * 
 * Sau khi deploy, copy URL và set vào PDF_SERVICE_URL trong .env.local
 */

/**
 * Tương đương với app.post("/generate", ...)
 */
function doPost(e) {
  try {
    // 1. Parse dữ liệu đầu vào (tương đương express.json())
    const requestData = JSON.parse(e.postData.contents);
    const html = requestData.html;

    // Kiểm tra dữ liệu (Health check & Validation)
    if (!html) {
      return createJsonResponse({ error: "HTML is required" }, 400);
    }

    console.log("[API] Generating PDF, HTML length: " + html.length);

    // 2. Chuyển đổi HTML sang PDF Blob
    const htmlBlob = Utilities.newBlob(html, "text/html", "contract.html");
    const pdfBlob = htmlBlob.getAs("application/pdf");

    // Đặt tên file (tương đương Content-Disposition)
    pdfBlob.setName("contract.pdf");

    // 3. Trả về dữ liệu
    // LƯU Ý: GAS Web App không thể res.send(binary) trực tiếp một cách mượt mà như Express.
    // Có 2 cách phổ biến nhất:

    // CÁCH A: Trả về chuỗi Base64 (Khuyên dùng cho API)
    const base64PDF = Utilities.base64Encode(pdfBlob.getBytes());
    return createJsonResponse({
      status: "ok",
      filename: "contract.pdf",
      data: base64PDF,
      contentType: "application/pdf"
    }, 200);

    /* // CÁCH B: Trả về link tải trực tiếp (Nếu bạn muốn lưu file vào Drive trước)
    const file = DriveApp.createFile(pdfBlob);
    return createJsonResponse({ url: file.getDownloadUrl() }, 200);
    */

  } catch (error) {
    console.error("[API] PDF generation error: " + error.toString());
    return createJsonResponse({
      error: "PDF generation failed",
      details: error.toString()
    }, 500);
  }
}

/**
 * Hàm hỗ trợ trả về JSON response
 */
function createJsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tương đương app.get("/health")
 */
function doGet(e) {
  return createJsonResponse({ 
    status: "ok", 
    service: "pdf-generator-gas",
    timestamp: new Date().toISOString()
  }, 200);
}

/**
 * Test function - có thể chạy trực tiếp trong GAS Editor
 */
function testPDFGeneration() {
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Test PDF</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; text-align: center; }
        .content { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Test PDF Generation</h1>
      <div class="content">
        <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Service:</strong> Google Apps Script PDF Generator</p>
        <p><strong>Status:</strong> Working correctly!</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    const htmlBlob = Utilities.newBlob(testHTML, "text/html", "test.html");
    const pdfBlob = htmlBlob.getAs("application/pdf");
    
    // Save to Drive for testing
    const file = DriveApp.createFile(pdfBlob);
    file.setName("GAS_PDF_Test_" + new Date().getTime() + ".pdf");
    
    console.log("✅ Test PDF created successfully!");
    console.log("📄 File ID: " + file.getId());
    console.log("🔗 File URL: " + file.getUrl());
    
    return {
      success: true,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      message: "Test PDF generated successfully"
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}