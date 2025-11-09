const input = document.querySelector<HTMLInputElement>('#identification');
const button = document.querySelector<HTMLButtonElement>('#close-welcome-modal');
const modal = document.querySelector('#welcome-modal');

if (!(input && button && modal)) { throw Error('couldn\'t find welcome modal elements'); }

input.value = 'new user';
button.addEventListener('click', () => modal.classList.remove('in-use'), { once: true });

const info = { identity: input.value };
input.addEventListener('input', () => info.identity = input.value);

export default info;
