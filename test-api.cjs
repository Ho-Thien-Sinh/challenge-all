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
    console.error('--- Chi tiết lỗi đăng ký ---');
    console.error('error:', error);
    if (error.response) {
      console.error('error.response.data:', error.response.data);
      console.error('error.response.status:', error.response.status);
      console.error('error.response.headers:', error.response.headers);
    }
    if (error.message) {
      console.error('error.message:', error.message);
    }
    if (error.stack) {
      console.error('error.stack:', error.stack);
    }
    console.error('---------------------------');
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
    console.error('--- Chi tiết lỗi đăng nhập ---');
    console.error('error:', error);
    if (error.response) {
      console.error('error.response.data:', error.response.data);
      console.error('error.response.status:', error.response.status);
      console.error('error.response.headers:', error.response.headers);
    }
    if (error.message) {
      console.error('error.message:', error.message);
    }
    if (error.stack) {
      console.error('error.stack:', error.stack);
    }
    console.error('-----------------------------');
    return false;
  }
} 