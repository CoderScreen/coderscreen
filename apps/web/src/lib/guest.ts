export interface Guest {
  id: string;
  name: string;
  email: string;
  color: string;
}

export function getGuest(): Guest | null {
  const user = localStorage.getItem('guest-data');
  if (!user) {
    return null;
  }

  return JSON.parse(user) as Guest;
}

export function setGuest(guest: Guest) {
  localStorage.setItem('guest-data', JSON.stringify(guest));
}

export function clearGuest() {
  localStorage.removeItem('guest-data');
}
