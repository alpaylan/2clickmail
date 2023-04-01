import { EmailObject, EmailData, EmailRequest, ProfileData } from '../types';


export async function generate(
  email: EmailData
): Promise<string | null> {
  try {
    const response = await fetch('http://127.0.0.1:5000/generate', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({'params': JSON.stringify(email)})
    });
    if (response.ok) {
      const data = await response.json();
      return data.id;
    } else {
      console.error('Error generating email website:', response);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function fetchEmail(
  req: EmailRequest
): Promise<EmailObject | null> {
  try {
    const response = await fetch(`http://127.0.0.1:5000/email?type=${req.type}&value=${req.value}`, { 
      method: 'GET', 
      mode: 'cors',
      credentials: 'include',
    });

    if (response.ok) {
      const data: EmailObject = await response.json();
      return data;
    } else {
      console.error('Error fetching website data:', response);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function fetchProfile(): Promise<ProfileData | null> {
  try {
    const response = await fetch('http://127.0.0.1:5000/profile', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });
    if (response.ok) {
      const data: ProfileData = await response.json();
      return data;
    } else {
      console.error('Error fetching profile data:', response);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}


export async function deleteEmail(id: string): Promise<boolean> {
    try {
      const response = await fetch(`http://127.0.0.1:5000/profile/delete`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
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
      const response = await fetch(`http://127.0.0.1:5000/profile/update`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
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
  