// src/app/api/spanner/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { type, projectId, instanceId, databaseId, query } = body;
	console.log(
		"GOOGLE_APPLICATION_CREDENTIALS:",
		process.env.GOOGLE_APPLICATION_CREDENTIALS,
	);

	// 動的に @google-cloud/spanner をインポート
	const { Spanner } = await import("@google-cloud/spanner");

	const spanner = new Spanner({
		projectId: projectId,
	});

	switch (type) {
		case "instances":
			return getInstances(spanner);
		case "databases":
			return getDatabases(spanner, instanceId);
		case "query":
			return executeQuery(spanner, instanceId, databaseId, query);
		default:
			return NextResponse.json(
				{ error: "Invalid request type" },
				{ status: 400 },
			);
	}
}

async function getInstances(spanner: any) {
	try {
		const [instances] = await spanner.getInstances();
		console.log("instances:", instances);
		return NextResponse.json(instances.map((instance: any) => instance.id));
	} catch (error) {
		console.error("Failed to fetch instances:", error);
		return NextResponse.json(
			{ error: "Failed to fetch instances" },
			{ status: 500 },
		);
	}
}

async function getDatabases(spanner: any, instanceId: string) {
	try {
		const instance = spanner.instance(instanceId);
		const [databases] = await instance.getDatabases();
		return NextResponse.json(databases.map((database: any) => database.id));
	} catch (error) {
		console.error("Failed to fetch databases:", error);
		return NextResponse.json(
			{ error: "Failed to fetch databases" },
			{ status: 500 },
		);
	}
}

async function executeQuery(
	spanner: any,
	instanceId: string,
	databaseId: string,
	query: string,
) {
	try {
		const instance = spanner.instance(instanceId);
		const database = instance.database(databaseId);
		const [rows] = await database.run(query);
		return NextResponse.json(rows);
	} catch (error) {
		console.error("Failed to execute query:", error);
		return NextResponse.json(
			{ error: "Failed to execute query" },
			{ status: 500 },
		);
	}
}
