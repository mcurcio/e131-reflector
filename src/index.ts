import "dotenv/config";
import { Client, Server } from "e131";

const UNIVERSES = (process.env.UNIVERSES ?? "")
	.split(",")
	.map(s => parseInt(s))
	.filter(n => !isNaN(n));
const PORT = process.env.PORT ?? 5568;
const TARGETS = (process.env.TARGETS ?? "")
	.split(",")
	.filter(s => s.trim().length > 0);

async function main(): Promise<void> {
	console.log("UNIVERSES:", UNIVERSES);
	console.log("PORT:", PORT);
	console.log("TARGETS:", TARGETS);

	const clients = TARGETS.map(target => new Client(target));
	
	const server = new Server(UNIVERSES, PORT);
	server.on("listening", () => {
		console.log(`Server listening on port ${PORT}`);
	});
	server.on("packet", packet => {
		clients.forEach(client => {
			const out = client.createPacket(packet.getSlotsData().length);
			packet.getBuffer().copy(out.getBuffer());
			client.send(out);
		});
	});
	server.on("error", console.error);
}

main().catch(console.error);
