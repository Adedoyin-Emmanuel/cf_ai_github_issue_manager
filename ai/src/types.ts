/**
 * TypeScript interfaces for the GitHub issue management payload
 */

export interface Repository {
	url: string;
	name: string;
	stars: number;
	forks: number;
	owner: string;
	openIssues: number;
	description: string;
}

export interface Issue {
	issue_number: number;
	title: string;
	state: string;
	labels: string[];
	author: string;
	created_at: string;
	updated_at: string;
	body: string;
	url: string;
}

export interface ProcessedIssue {
	title: string;
	reasoning: string;
	duplicates: number[];
	issue_number: number;
	implementationOrder: number;
	priority: "Critical" | "High" | "Medium" | "Low";
	category: "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation";
}

export interface IssueManagementPayload {
	issues: Issue[];
	repository: Repository;
}

export interface IssueManagementResponse {
	success: boolean;
	timestamp: string;
	repository: Repository;
	issues: ProcessedIssue[];
}

export interface ErrorResponse {
	error: string;
	success: false;
	timestamp: string;
}
