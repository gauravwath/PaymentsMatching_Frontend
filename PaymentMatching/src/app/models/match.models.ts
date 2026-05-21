export type MatchStatus =
  | 'MATCHED'
  | 'AMOUNTMISMATCH'
  | 'ONLYSYSTEM'
  | 'ONLYPROVIDER';

export type ResolutionSide = 'System' | 'Provider';
export type FilterType = 'all' | 'unresolved' | 'resolved';

export interface MatchResultDto {
  id: number;
  orderId: string;
  currency: string;
  systemAmount: number | null;
  providerAmount: number | null;
  status: MatchStatus;
  isResolved: boolean;
  resolutionSide: ResolutionSide | null;
  resolvedAt: string | null;
}

export interface MatchSummaryDto {
  sessionId: number;
  totalCount: number;
  matchedCount: number;
  onlySystemCount: number;
  onlyProviderCount: number;
  amountMismatchCount: number;
  createdAt: string;
  results: MatchResultDto[];
}

export interface ResolveRequest {
  resolutionSide: ResolutionSide;
}
