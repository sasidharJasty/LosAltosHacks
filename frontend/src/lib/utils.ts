import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function TimeAway(futureDate: string, passedString: string) {
  const now = new Date();
  const distance = new Date(futureDate).getTime() - now.getTime();

  if (distance < 0) {
    return { text: passedString, status: 'expired' };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days} day${days > 1 ? 's' : ''} `, status: days <= 4 ? 'warning' : 'safe' };
  } else if (hours > 0) {
    return { text: `${hours} hour${hours > 1 ? 's' : ''} `, status: 'warning' };
  } else {
    return { text: `${minutes} minute${minutes > 1 ? 's' : ''} `, status: 'warning' };
  }
}