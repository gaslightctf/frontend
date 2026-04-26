export interface Metadata {
  version: string;
  eventName: string;
  eventOrganiser: string;
  eventLogoUrl: string;
  start: string;
  end: string;
  allowAnonymousAccess: boolean;
  playerAttributes: PlayerAttribute[];
  freezeStart: string | null;
  freezeEnd: string | null;
  teams: boolean;
  challengeMaximumValue: number;
  challengeMinimumValue: number;
  challengeSolvesBeforeMinimum: number;
}

export interface PlayerAttribute {
  name: string;
  title: string;
  description: string;
  public: boolean;
  required: boolean;
  values: PlayerAttributeValue[];
}

export interface PlayerAttributeValue {
  value: string;
  title: string;
  description: string;
}

export interface Challenge {
  name: string;
  displayName: string;
  author: string;
  description: string;
  hideUntil: string | null;
  event: string;
  difficulty: string;
  flagFormat: string;
  hasRemote: boolean;
  categories: string[];
  tags: string[];
  attachments: Attachment[];
}

export interface Attachment {
  fileName: string;
  downloadUrl: string;
}

export interface Service {
  name: string;
  hostname: string;
  port: number;
  protocol: string;
  appProtocol: string;
  tls: boolean;
}

export interface Player {
  id: string;
  name: string;
  attributes: Record<string, string>;
}

export interface CurrentPlayer {
  id: string;
  name: string;
  federatedId: string;
  apiKeyPlaceholder: string | null;
  roles: string[];
  attributes: Record<string, string>;
}

export interface CurrentTeam {
  id: string;
  name: string;
  joinToken: string | null;
  players: string[];
}

export interface Team {
  id: string;
  name: string;
  players: string[];
}

export interface Instance {
  id: string;
  playerId: string;
  name: string;
  timeout: string;
  status: ChallengeInstanceState;
  services: Service[];
}

export interface Solve {
  playerId: string;
  solvedAt: string;
  challengeName: string;
}

export enum ChallengeInstanceState {
  None,
  Starting,
  Running,
  Terminating,
}

export interface WebSocketMessage<T> {
  type: string;
  message: T;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
