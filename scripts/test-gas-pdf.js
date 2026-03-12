/**
 * Test Google Apps Script PDF Generator
 */

const GAS_URL = process.env.PDF_SERVICE_URL;

const testHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Test PDF - Google Apps Script</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .contract {
      border: 2px solid #000;
      padding: 20px;
      margin: 20px 0;
      background-color: #f9f9f9;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
    }
    .signature-box {
      text-align: center;
      width: 200px;
    }
  </style>
</head>
<body>
  <h1>HỢP ĐỒNG CẦM CỐ TÀI SẢN</h1>
  
  <div class="contract">
    <p><strong>Bên A (Bên vay):</strong> Nguyễn Văn A</p>
    <p><strong>CMND/CCCD:</strong> 123456789</p>
    <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, Hà Nội</p>
    
    <hr style="margin: 20px 0;">
    
    <p><strong>Bên B (Bên cho vay):</strong> Công ty TNHH Short Loan</p>
    <p><strong>Địa chỉ:</strong> 456 Đường DEF, Quận GHI, Hà Nội</p>
    
    <hr style="margin: 20px 0;">
    
    <p><strong>Số tiền vay:</strong> 100.000.000 VNĐ (Một trăm triệu đồng)</p>
    <p><strong>Lãi suất:</strong> 2%/tháng</p>
    <p><strong>Thời hạn:</strong> 12 tháng</p>
    <p><strong>Tài sản thế chấp:</strong> Xe máy Honda Wave RSX 110cc, BKS: 30A1-12345</p>
  </div>
  
  <p style="text-align: center; margin: 30px 0;">
    <strong>Hà Nội, ngày 11 tháng 03 năm 2026</strong>
  </p>
  
  <div class="signature-section">
    <div class="signature-box">
      <p><strong>Bên A (Bên vay)</strong></p>
      <p style="margin-top: 60px;">(Ký và ghi rõ họ tên)</p>
    </div>
    <div class="signature-box">
      <p><strong>Bên B (Bên cho vay)</strong></p>
      <p style="margin-top: 60px;">(Ký và ghi rõ họ tên)</p>
    </div>
  </div>
</body>
</html>
`;

async function testGoogleAppsScript() {
  try {
    if (!GAS_URL) {
      throw new Error('PDF_SERVICE_URL environment variable is not set');
    }
    
    console.log('🧪 Testing Google Apps Script PDF Generator');
    console.log('📍 URL:', GAS_URL);
    
    // Test 1: Health check
    console.log('\n1️⃣ Health Check...');
    const healthResponse = await fetch(GAS_URL, {
      method: 'GET',
    });
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test 2: Generate PDF
    console.log('\n2️⃣ Generating PDF...');
    const startTime = Date.now();
    
    const pdfResponse = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: testHTML }),
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!pdfResponse.ok) {
      const error = await pdfResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`PDF generation failed: ${error.error || pdfResponse.statusText}`);
    }
    
    const result = await pdfResponse.json();
    
    if (result.error) {
      throw new Error(`Google Apps Script error: ${result.error}`);
    }
    
    if (!result.data) {
      throw new Error('No PDF data received');
    }
    
    // Save PDF to file
    const fs = require('fs');
    const pdfBuffer = Buffer.from(result.data, 'base64');
    fs.writeFileSync('test-gas-output.pdf', pdfBuffer);
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`📄 File saved: test-gas-output.pdf (${pdfBuffer.length} bytes)`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Response:`, {
      status: result.status,
      filename: result.filename,
      contentType: result.contentType,
      dataSize: result.data.length + ' characters (base64)'
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test
testGoogleAppsScript();