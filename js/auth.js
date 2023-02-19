// check if local-storage token is set
export function is_token_set() {
  const token = localStorage.getItem('token');
  if (token !== null) {
    return true;
  }
  return false;
}

// check if moderator flag is set
export function is_moderator_set() {
  const moderator = localStorage.getItem('moderator');
  if (moderator == '1') return true;
  return false;
}

// sets moderator flag
export function set_moderator() {
  localStorage.setItem('moderator', '1');
}
