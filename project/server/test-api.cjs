const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:5001/api/v1';

// Tạo email ngẫu nhiên để test
const testEmail = `test-${uuidv4().substring(0, 8)}@example.com`;
const testPassword = 'Test@1234';
let authToken = '';

// Hàm in kết quả test
function logTest(description, success, response = null) {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${description}`);
  
  if (response) {
    console.log('   Status:', response.status);
    if (response.data) {
      console.log('   Data:', JSON.stringify(response.data, null, 2));
    }
  }
  console.log('');
}

// Test đăng ký tài khoản mới
async function testRegister() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword
    });
    logTest('Đăng ký tài khoản mới', true, response);
    return true;
  } catch (error) {
    logTest('Đăng ký tài khoản mới', false, error.response);
    return false;
  }
}

// Test đăng nhập
async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    if (response.data && response.data.token) {
      authToken = response.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      logTest('Đăng nhập', true, { status: response.status, data: { token: '***' } });
      return true;
    }
    
    logTest('Đăng nhập', false, response);
    return false;
  } catch (error) {
    logTest('Đăng nhập', false, error.response);
    return false;
  }
}

// Test lấy thông tin user hiện tại
async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${BASE_URL}/users/me`);
    logTest('Lấy thông tin user hiện tại', true, response);
    return response.data;
  } catch (error) {
    logTest('Lấy thông tin user hiện tại', false, error.response);
    return null;
  }
}

// Test lấy danh sách categories
async function testGetCategories() {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    logTest('Lấy danh sách categories', true, { status: response.status, data: { count: response.data.length } });
    return response.data;
  } catch (error) {
    logTest('Lấy danh sách categories', false, error.response);
    return [];
  }
}

// Test lấy danh sách bài viết
async function testGetArticles() {
  try {
    const response = await axios.get(`${BASE_URL}/articles?limit=5`);
    logTest('Lấy danh sách bài viết', true, { status: response.status, data: { count: response.data.length } });
    return response.data;
  } catch (error) {
    logTest('Lấy danh sách bài viết', false, error.response);
    return [];
  }
}

// Chạy tất cả các test
async function runAllTests() {
  console.log('🚀 Bắt đầu kiểm tra API...\n');
  
  // Test đăng ký và đăng nhập
  await testRegister();
  await testLogin();
  
  // Test các API yêu cầu xác thực
  if (authToken) {
    await testGetCurrentUser();
    await testGetCategories();
    await testGetArticles();
  }
  
  console.log('✅ Hoàn thành kiểm tra API');
}

// Chạy test
runAllTests().catch(console.error);
