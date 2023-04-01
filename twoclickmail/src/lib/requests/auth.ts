export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: email,
        password: password,
      })
    });

    if (response.status === 200) {
      console.log('Logged in successfully');
      console.error(response);
      localStorage.setItem('loggedIn', 'true');
      return true;
    } else {
      console.log('Failed to log in');
      return false;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return false;
  }
}

export async function logoutUser() {
  try {
    const _ = await fetch('http://127.0.0.1:5000/logout', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
    });
    console.log('Logged out successfully');
    localStorage.setItem('loggedIn', 'false');
    // Cookies.remove('session');
  }
  catch (error) {
    console.error('An error occurred:', error);
  }
}

export async function registerUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: email,
        password: password,
      })
    });
    if (response.status === 200) {
      console.log('Registered successfully');
      return true;
    } else {
      console.log('Failed to register');
      return false;
    }
  }
  catch (error) {
    console.error('An error occurred:', error);
    return false;
  }
}
