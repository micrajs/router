export function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(2);
}

export function generateId(prefix = 'id') {
  return [prefix, generateRandomString(), generateRandomString()].join('-');
}
