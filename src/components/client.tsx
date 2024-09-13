"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Clipboard,
	Code,
	Database,
	History,
	Play,
	MoreHorizontal,
	Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function SpannerSQLClient() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);
	const [projectId, setProjectId] = useState("");
	const [instance, setInstance] = useState("");
	const [database, setDatabase] = useState("");
	const [confirmExecution, setConfirmExecution] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [queryHistory, setQueryHistory] = useState<
		Array<{ query: string; results: any[]; timestamp: string }>
	>([]);
	const [isMultilineFormat, setIsMultilineFormat] = useState(true);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [instances, setInstances] = useState<string[]>([]);
	const [databases, setDatabases] = useState<string[]>([]);
	const { toast } = useToast();

	const initializeSpanner = async () => {
		if (!projectId.trim()) {
			toast({
				title: "Error",
				description: "Please enter a Project ID.",
				variant: "destructive",
			});
			return;
		}

		try {
			const response = await fetch("/api/spanner", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type: "instances", projectId }),
			});
			const data = await response.json();
			if (response.ok) {
				setInstances(data);
				toast({
					title: "Success",
					description: "Spanner instances initialized successfully.",
				});
			} else {
				throw new Error(data.error || "Failed to fetch instances");
			}
		} catch (error) {
			console.error("Failed to fetch instances:", error);
			toast({
				title: "Error",
				description: "Failed to fetch instances. Please try again.",
				variant: "destructive",
			});
		}
	};

	const fetchDatabases = async () => {
		if (!instance) return;

		try {
			const response = await fetch("/api/spanner", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "databases",
					projectId,
					instanceId: instance,
				}),
			});
			const data = await response.json();
			if (response.ok) {
				setDatabases(data);
			} else {
				throw new Error(data.error || "Failed to fetch databases");
			}
		} catch (error) {
			console.error("Failed to fetch databases:", error);
			toast({
				title: "Error",
				description: "Failed to fetch databases. Please try again.",
				variant: "destructive",
			});
		}
	};

	const formatQuery = () => {
		const reservedWords = [
			"SELECT",
			"FROM",
			"WHERE",
			"AND",
			"OR",
			"ORDER BY",
			"GROUP BY",
			"HAVING",
			"LIMIT",
			"JOIN",
			"LEFT JOIN",
			"RIGHT JOIN",
			"INNER JOIN",
			"OUTER JOIN",
			"ON",
			"AS",
			"INSERT",
			"UPDATE",
			"DELETE",
			"CREATE",
			"ALTER",
			"DROP",
			"TABLE",
			"INDEX",
			"VIEW",
		];
		const regex = new RegExp(`\\b(${reservedWords.join("|")})\\b`, "gi");

		let formatted = query.replace(regex, (match) => match.toUpperCase());

		if (isMultilineFormat) {
			formatted = formatted
				.replace(/\s+/g, " ")
				.replace(/\s*([(),])\s*/g, "$1 ")
				.split(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT)\b/)
				.map((part, index, array) => {
					if (reservedWords.includes(part.trim().toUpperCase())) {
						return `\n${part.trim()}\n  `;
					}
					return part.trim();
				})
				.join("")
				.trim();
		} else {
			formatted = formatted.replace(/\s+/g, " ").trim();
		}

		setQuery(formatted);
	};

	const executeQuery = async () => {
		if (confirmExecution) {
			setIsDialogOpen(true);
		} else {
			runQuery();
		}
	};

	const runQuery = async () => {
		try {
			const response = await fetch("/api/spanner", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "query",
					projectId,
					instanceId: instance,
					databaseId: database,
					query,
				}),
			});
			const data = await response.json();
			if (response.ok) {
				setResults(data);
				setIsDialogOpen(false);
				setQueryHistory([
					...queryHistory,
					{ query, results: data, timestamp: new Date().toISOString() },
				]);
			} else {
				throw new Error(data.error || "Failed to execute query");
			}
		} catch (error) {
			console.error("Failed to execute query:", error);
			toast({
				title: "Error",
				description: "Failed to execute query. Please try again.",
				variant: "destructive",
			});
		}
	};

	const copyToClipboard = async (text: string, message: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Copied!",
				description: message,
			});
		} catch (err) {
			console.error("Failed to copy: ", err);
			toast({
				title: "Error",
				description: "Failed to copy to clipboard. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex flex-col h-screen bg-background text-foreground p-4">
			<Card className="mb-4">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div>
						<CardTitle className="text-2xl font-bold">
							Spanner SQL Client
						</CardTitle>
						<CardDescription>
							Execute and manage your Spanner SQL queries
						</CardDescription>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsSettingsOpen(true)}
					>
						<Settings className="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					<div className="flex space-x-2 mb-2">
						<Input
							type="text"
							placeholder="Project ID"
							value={projectId}
							onChange={(e) => setProjectId(e.target.value)}
							className="flex-grow"
						/>
						<Button onClick={initializeSpanner}>Initialize</Button>
					</div>
					<div className="flex space-x-2">
						<Select
							onValueChange={(value) => {
								setInstance(value);
								fetchDatabases();
							}}
							value={instance}
						>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Select instance" />
							</SelectTrigger>
							<SelectContent>
								{instances.map((inst) => (
									<SelectItem key={inst} value={inst}>
										{inst}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select onValueChange={setDatabase} value={database}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Select database" />
							</SelectTrigger>
							<SelectContent>
								{databases.map((db) => (
									<SelectItem key={db} value={db}>
										{db}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="query" className="flex-grow flex flex-col">
				<TabsList className="grid w-full grid-cols-2 mb-4">
					<TabsTrigger value="query">
						<Code className="mr-2 h-5 w-5" /> Editor
					</TabsTrigger>
					<TabsTrigger value="history">
						<History className="mr-2 h-5 w-5" /> History
					</TabsTrigger>
				</TabsList>
				<TabsContent
					value="query"
					className="flex-grow flex flex-col space-y-4"
				>
					<Card>
						<CardContent className="pt-6">
							<Textarea
								placeholder="Enter your SQL query here..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="font-mono text-sm min-h-[200px]"
							/>
						</CardContent>
						<CardFooter className="flex justify-between">
							<div className="space-x-2">
								<Button onClick={formatQuery}>
									<Code className="mr-2 h-4 w-4" /> Format
								</Button>
								<Button
									onClick={() =>
										copyToClipboard(query, "Query copied to clipboard")
									}
								>
									<Clipboard className="mr-2 h-4 w-4" /> Copy
								</Button>
							</div>
							<Button onClick={executeQuery}>
								<Play className="mr-2 h-4 w-4" /> Execute
							</Button>
						</CardFooter>
					</Card>

					{results.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg font-semibold">Results</CardTitle>
								<CardDescription>
									{results.length} rows returned
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[400px]">
									<Table>
										<TableHeader>
											<TableRow>
												{Object.keys(results[0]).map((key) => (
													<TableHead key={key} className="font-bold">
														{key}
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											{results.map((row, index) => (
												<TableRow
													key={row.id || `row-${index}`}
													className={index % 2 === 0 ? "bg-muted/50" : ""}
												>
													{Object.entries(row).map(([key, value]) => (
														<TableCell key={`${row.id || index}-${key}`}>
															{String(value)}
														</TableCell>
													))}
												</TableRow>
											))}
										</TableBody>
									</Table>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() =>
										copyToClipboard(
											JSON.stringify(results, null, 2),
											"Results copied to clipboard",
										)
									}
								>
									<Clipboard className="mr-2 h-4 w-4" /> Copy Results
								</Button>
							</CardFooter>
						</Card>
					)}
				</TabsContent>
				<TabsContent value="history">
					<Card>
						<CardHeader>
							<CardTitle>History</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[600px]">
								{queryHistory.map((item, index) => (
									<div
										key={item.timestamp}
										className="mb-4 p-4 bg-muted rounded-lg"
									>
										<div className="flex justify-between items-center mb-2">
											<span className="text-sm text-muted-foreground">
												{new Date(item.timestamp).toLocaleString()}
											</span>
											<div className="space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setQuery(item.query);
														executeQuery();
													}}
												>
													<Play className="mr-2 h-4 w-4" /> Re-run
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														copyToClipboard(
															item.query,
															"Query copied to clipboard",
														)
													}
												>
													<Clipboard className="mr-2 h-4 w-4" /> Copy
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														copyToClipboard(
															JSON.stringify(item.results, null, 2),
															"Results copied to clipboard",
														)
													}
												>
													<Clipboard className="mr-2 h-4 w-4" /> Copy Results
												</Button>
												<Dialog>
													<DialogTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Query Results</DialogTitle>
														</DialogHeader>
														<ScrollArea className="h-[400px]">
															<Table>
																<TableHeader>
																	<TableRow>
																		{Object.keys(item.results[0]).map((key) => (
																			<TableHead
																				key={key}
																				className="font-bold"
																			>
																				{key}
																			</TableHead>
																		))}
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{item.results.map((row, rowIndex) => (
																		<TableRow
																			key={row.id || `row-${rowIndex}`}
																			className={
																				rowIndex % 2 === 0 ? "bg-muted/50" : ""
																			}
																		>
																			{Object.entries(row).map(
																				([key, value]) => (
																					<TableCell
																						key={`${row.id || rowIndex}-${key}`}
																					>
																						{String(value)}
																					</TableCell>
																				),
																			)}
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</ScrollArea>
													</DialogContent>
												</Dialog>
											</div>
										</div>
										<pre className="bg-background p-2 rounded text-sm overflow-x-auto">
											{item.query}
										</pre>
									</div>
								))}
							</ScrollArea>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Query Execution</DialogTitle>
						<DialogDescription>
							Are you sure you want to execute this query?
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[300px]">
						<pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
							{query}
						</pre>
					</ScrollArea>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={runQuery}>Execute</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Settings</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="multiline-format">Multiline Format</Label>
							<Switch
								id="multiline-format"
								checked={isMultilineFormat}
								onCheckedChange={setIsMultilineFormat}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="confirm-execution">
								Confirm before execution
							</Label>
							<Switch
								id="confirm-execution"
								checked={confirmExecution}
								onCheckedChange={setConfirmExecution}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setIsSettingsOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}