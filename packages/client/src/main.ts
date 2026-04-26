import type { CommandResponse } from '@discord/embedded-app-sdk';
import './style.css';
import { discordSdk } from './discordSdk';
import { DraftBoard } from './draft-board';

type Auth = CommandResponse<'authenticate'>;

const app = document.querySelector<HTMLDivElement>('#app')!;
app.textContent = 'Connecting to Discord...';

setupDiscordSdk()
	.catch((err: unknown) => {
		app.textContent = `Setup failed: ${err instanceof Error ? err.message : String(err)}`;
	});

async function setupDiscordSdk() {
	await discordSdk.ready();

	const { code } = await discordSdk.commands.authorize({
		client_id: import.meta.env.VITE_CLIENT_ID,
		response_type: 'code',
		state: '',
		prompt: 'none',
		scope: ['applications.commands', 'identify', 'guilds', 'guilds.members.read', 'rpc.voice.read'],
	});

	const response = await fetch('/api/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code }),
	});
	const { access_token } = await response.json();

	const auth: Auth = await discordSdk.commands.authenticate({ access_token });
	if (auth == null) throw new Error('Authenticate command failed');

	app.textContent = '';
	new DraftBoard(app, auth.user.id);
}
