import type { CommandResponse } from '@discord/embedded-app-sdk';
import './style.css';
import { discordSdk } from './discordSdk';
import { DraftBoard } from './draft-board';

type Auth = CommandResponse<'authenticate'>;

const app = document.querySelector<HTMLDivElement>('#app')!;

if (isDiscordActivityLaunch()) {
	app.textContent = 'Connecting to Discord...';
	setupDiscordSdk()
		.catch((err: unknown) => {
			app.textContent = `Setup failed: ${err instanceof Error ? err.message : String(err)}`;
		});
} else {
	renderLandingPage();
}

function isDiscordActivityLaunch() {
	const params = new URLSearchParams(window.location.search);
	return ['frame_id', 'instance_id', 'channel_id', 'guild_id', 'platform'].some((key) => params.has(key));
}

function renderLandingPage() {
	document.body.classList.add('public-landing');
	app.innerHTML = `
		<main class="landing-page">
			<section class="landing-hero">
				<div class="landing-brand"><span></span>GodForge Drafts</div>
				<h1>Organized drafting inside Discord.</h1>
				<p>
					GodForge Drafts is a Discord Activity for competitive communities that need clean draft lobbies,
					team coordination, pick and ban phases, and shareable draft results.
				</p>
				<nav class="landing-nav" aria-label="Legal and support links">
					<a href="/terms">Terms of Service</a>
					<a href="/privacy">Privacy Policy</a>
					<a href="/support">Support</a>
				</nav>
			</section>

			<section class="landing-card-grid" aria-label="Activity features">
				<article>
					<h2>Draft Lobbies</h2>
					<p>Create structured drafting sessions for private leagues, scrims, and organized community matches.</p>
				</article>
				<article>
					<h2>Pick/Ban Flow</h2>
					<p>Run draft phases with clear turn order, team assignments, bans, picks, and results tracking.</p>
				</article>
				<article>
					<h2>Discord Native</h2>
					<p>Designed to run as an embedded Discord Activity for teams already coordinating in voice channels.</p>
				</article>
			</section>
		</main>
	`;
}

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
