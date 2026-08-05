import { Challenge, Player, Team } from "./api-model";

export interface PlayerDetail {
  id: string;
  name: string;
  attributes: Record<string, string>;
  team: Team | null;
  score: number;
  solves: SolveDetail[];
  categoryProgress: Map<string, number>;
  // Raw value of the division attribute, or null when divisions are disabled or
  // the player never set one.
  division: string | null;
}

export interface TeamDetail {
  id: string;
  name: string;
  players: Player[];
  score: number;
  solves: TeamSolveDetail[];
  categoryProgress: Map<string, number>;
  // Client-side calculated division: the value shared by all members, else the
  // configured default; null when divisions are disabled.
  division: string | null;
}

export interface ChallengeDetail {
  challenge: Challenge;
  playerSolves: SolveDetail[];
  teamSolves: TeamSolveDetail[];
  solvedByPlayer: boolean;
  solvedByTeam: boolean;
  value: number;
}

export interface ChallengeDetailCategory {
  category: string;
  challenges: ChallengeDetail[];
  numSolved: number;
  numTotal: number;
}

export interface SolveDetail {
  playerId: string;
  solvedAt: Date;
  challengeName: string;
  challengeDisplayName: string;
  playerName: string;
  teamId: string | null;
  teamName: string | null;
}

export interface TeamSolveDetail {
  solvedAt: Date;
  challengeName: string;
  challengeDisplayName: string;
  players: Player[];
  teamId: string;
  teamName: string | null;
}

export interface ScoreboardRanking {
  lastSolveAt: Date | null;
  name: string;
  id: string;
  score: number;
  rank: number;
  challengesByCategory: ScoreboardChallengeByCategory[];
  // Division of this entry (player's own, or team's calculated division); null
  // when divisions are disabled.
  division: string | null;
}

export interface ScoreboardChallengeByCategory {
  category: string;
  scoreboardChallengeEntries: ScoreboardChallengeEntry[];
  numSolved: number;
  numTotal: number;
}

export interface ScoreboardChallengeEntry {
  challenge: Challenge;
  solved: boolean;
  solvedAt: Date | null;
}

export interface ActivityEntry {
  challenge: ChallengeDetail | null;
  solve: SolveDetail;
}
