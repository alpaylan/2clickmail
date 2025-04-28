import Cookies from 'js-cookie';

export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/login`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usermail: email,
        password: password,
      })
    });

    if (response.status === 200) {
      console.log('Logged in successfully');
      const data = await response.text();
      Cookies.set('token', data);
      return true;
    }
    if (response.status === 401) {
      console.log('Invalid email or password');
      return false;
    }

    console.log('Failed to log in, status code:', response.status);
    return false;

  } catch (error) {
    console.error('An error occurred:', error);
    return false;
  }
}

export async function logoutUser() {
  try {
    // const _ = await fetch(`${process.env.SERVER_URL}/logout`, {
    //   method: 'POST',
    //   mode: 'cors',
    // });
    console.log('Logged out successfully');
    Cookies.remove('token');
  }
  catch (error) {
    console.error('An error occurred:', error);
  }
}

export async function registerUser(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/register`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usermail: email,
        password: password,
      })
    });
    if (response.status === 200) {
      console.log('Registered successfully');
      const data = await response.json();
      Cookies.set('token', data["Success"]);
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
