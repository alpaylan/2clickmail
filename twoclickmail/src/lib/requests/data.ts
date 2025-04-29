import { type EmailObject, EmailData, type EmailPostRequest, type EmailGetRequest, type ProfileData } from '../types';
import Cookies from 'js-cookie';

export async function postMail(
  req: EmailPostRequest
): Promise<string | null> {
  try {
    console.log('Generating email website');

    const headers = JSON.parse(`{"Content-Type": "application/json"${Cookies.get('token') ? `, "Authorization": "Bearer ${Cookies.get('token')}"` : ''}}`);
    const response = await fetch(`${process.env.SERVER_URL}/email`, {
      method: 'POST',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(req)
    });
    if (response.ok) {
      const data = await response.json();
      console.log(JSON.stringify(data));
      return data;
    }

    console.error('Error generating email website:', response);
    return null;

  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function fetchEmail(
  req: EmailGetRequest
): Promise<EmailObject | null> {
  try {
    console.log('Fetching email website');
    const response = await fetch(`${process.env.SERVER_URL}/email?value=${req.value}`, {
      method: 'GET',
      mode: 'cors',
    });
    if (response.status === 200) {
      console.log('Fetched successfully');
      const data: EmailObject = await response.json();
      return data;
    }

    console.error('Error fetching website data:', response);
    return null;

  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function fetchProfile(token?: string): Promise<ProfileData | null> {
  try {
    if (!token) {
      token = Cookies.get('token');
    }
    console.log('Fetching profile data');

    const response = await fetch(`${process.env.SERVER_URL}/profile`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data: ProfileData = await response.json();
      console.log(JSON.stringify(data));
      return data;
    } else {
      console.error('Error fetching profile data:', JSON.stringify(response));
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}


export async function deleteEmail(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/profile/delete`, {
      method: 'POST',
      mode: 'cors',
      body: new URLSearchParams(JSON.stringify({ id: id }))
    });
    if (response.status === 200) {
      console.log('Deleted successfully');
      return true;
    } else {
      console.log('Failed to delete');
      return false;
    }
  }
  catch (error) {
    console.error('An error occurred:', error);
    return false;
  }
}

export async function updateEmail(
  email: EmailObject,
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/profile/update`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(JSON.stringify(email))
    });

    if (response.status === 200) {
      console.log('Updated successfully');
      return true;
    }
    else {
      console.log('Failed to update');
      return false;
    }
  }
  catch (error) {
    console.error('An error occurred:', error);
    return false;
  }
}
