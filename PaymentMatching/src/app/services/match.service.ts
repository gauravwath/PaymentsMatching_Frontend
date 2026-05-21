import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MatchSummaryDto,
  MatchResultDto,
  ResolveRequest,
  FilterType,
} from '../models/match.models';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly base = 'https://localhost:62254/api/match';

  constructor(private http: HttpClient) {}

  runMatch(systemFile: File, providerFile: File): Observable<MatchSummaryDto> {
    const form = new FormData();
    form.append('systemFile', systemFile, systemFile.name);
    form.append('providerFile', providerFile, providerFile.name);
    return this.http.post<MatchSummaryDto>(`${this.base}/run`, form);
  }

  getSession(sessionId: number, filter: FilterType = 'all'): Observable<MatchSummaryDto> {
    const params = new HttpParams().set('filter', filter);
    return this.http.get<MatchSummaryDto>(`${this.base}/${sessionId}`, { params });
  }

  resolve(resultId: number, resolutionSide: 'System' | 'Provider'): Observable<MatchResultDto> {
    const body: ResolveRequest = { resolutionSide };
    return this.http.patch<MatchResultDto>(`${this.base}/results/${resultId}/resolve`, body);
  }
}
