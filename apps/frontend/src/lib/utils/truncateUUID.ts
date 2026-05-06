export function truncateUUID(uuid: string, length = 5) {
  if (!uuid) return '';
  return `${uuid.slice(0, length)}...${uuid.slice(-length)}`;
}
