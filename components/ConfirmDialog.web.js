export function confirmDestructive({ title, message, onConfirm }) {
  if (window.confirm(`${title}\n\n${message}`)) onConfirm();
}
