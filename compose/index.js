import fs from 'node:fs';
import child_process from 'child_process';
import path from 'path';
import {spawn} from "node:child_process";

try {
	const command = process.argv[2];

	if (!command) {
		console.error('Please provide a command: up or down');
		process.exit(1);
	}

	process.on('SIGINT', async () => {
		console.log('Caught SIGINT — cleaning up...');
		downContainers(services);
		try {
			console.log(`docker network rm ${network}`);
			child_process.execSync(`docker network rm ${network}`, {stdio: 'inherit'});
		} catch (e) {
			console.warn(`Failed to remove network ${network}`);
		}
		process.exit(0);
	});

	const data = fs.readFileSync('compose.json', 'utf8');
	let json = JSON.parse(data);
	let services = json["services"];
	const network = json["network"] ?? "mini_default";

	if (!services || Object.keys(services).length === 0) {
		throw new Error("No services found in compose.json");
	}
	sortServicesByDependencies(services);

	switch (command) {
		case 'up':
			upContainers(services, network);
			break;

		case 'down':
			downContainers(services, network);
			break;

		default:
			console.error(`Unknown command: ${command}`);
			process.exit(1);
	}

} catch (err) {
	console.error(err);

}

function sortServicesByDependencies(services) {
	const graph = new Map();
	const visited = new Set();
	const result = [];

	// Create a graph representation of dependencies
	for (const [name, config] of Object.entries(services)) {
		graph.set(name, config.depends_on || []);
	}
	console.log(graph);

	function visit(service) {
		if (visited.has(service)) return;
		visited.add(service);
		for (const dep of graph.get(service) || []) {
			visit(dep);
		}
		result.push(service);
	}

	for (const name of Object.keys(services)) {
		console.log(`Visiting service: ${name}`);
		visit(name);
	}

	let finalResult = result.map(name => [name, services[name]]);
	console.log(finalResult);
	return finalResult;
}

function upContainers(services, network) {
	try {
		console.log(`docker network create ${network}`);
		child_process.execSync(`docker network create ${network}`, {stdio: 'inherit'});
	} catch (e) {
		console.warn(`Network ${network} may already exist`);
	}

	for (let [name, service] of sortServicesByDependencies(services)) {
		if (service.build) {
			const contextPath = path.resolve(process.cwd(), service.build); // абсолютний шлях
			const dockerfilePath = path.join(contextPath, '.Dockerfile');
			const buildCommand = `docker build -f ${dockerfilePath} -t ${name} ${contextPath}`;
			console.log(`${buildCommand}`);
			child_process.execSync(buildCommand, {stdio: 'inherit'});
		}

		if (!service.image && !service.build) {
			console.error(`Service ${name} does not have an image or build defined.`);
			process.exit(1);
		}

		const ports = Object.entries(service.ports || {});
		const portFlags = ports.map(([hostPort, containerPort]) => `-p ${hostPort}:${containerPort}`).join(' ');

		const envs = Object.entries(service.env || {});
		const envFlags = envs.map(([key, value]) => `-e ${key}=${value}`).join(' ');

		const runCommand = `docker run -d --name ${name} --network ${network} ${portFlags} ${envFlags} ${name}`;
		console.log(`${runCommand}`);
		child_process.execSync(runCommand, {stdio: 'inherit'});

		const logsCommand = `docker logs -f ${name}`;
		console.log(`${logsCommand}`);
		const proc = spawn('docker', ['logs', '-f', name], {stdio: 'inherit'});
	}
	console.log('Starting services...');
}

function downContainers(services, network) {
	for (let [name, service] of sortServicesByDependencies(services)) {
		const stopCommand = `docker stop ${name}`;
		console.log(`${stopCommand}`);
		child_process.execSync(stopCommand, {stdio: 'inherit'});

		const removeCommand = `docker rm ${name}`;
		console.log(`${removeCommand}`);
		child_process.execSync(removeCommand, {stdio: 'inherit'});
	}

	try {
		console.log(`docker network rm ${network}`);
		child_process.execSync(`docker network rm ${network}`, {stdio: 'inherit'});
	} catch (e) {
		console.warn(`Failed to remove network ${network}`);
	}
}
