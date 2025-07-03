export interface Guest {
  id: string;
  name: string;
  color: string;
}

export function getGuest(): Guest {
  const user = localStorage.getItem('guest-data');
  return user ? JSON.parse(user) : null;
}

export function setGuest(guest: Guest) {
  localStorage.setItem('guest-data', JSON.stringify(guest));
}

export function clearGuest() {
  localStorage.removeItem('guest-data');
}
