import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatchService } from './services/match.service';
import {
  MatchSummaryDto,
  MatchResultDto,
  FilterType,
} from './models/match.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'PaymentMatching';
  // ── Upload state ───────────────────────────────────────────────
  systemFile: File | null = null;
  providerFile: File | null = null;

  // ── Results state ──────────────────────────────────────────────
  summary: MatchSummaryDto | null = null;
  filteredResults: any[] = [];
  activeFilter: FilterType = 'all'; 

  // ── UI state ───────────────────────────────────────────────────
  isLoading = false;
  errorMsg: string | null = null;
  resolvingId: number | null = null;

  constructor(private matchSvc: MatchService) {}

  // ── File selection ─────────────────────────────────────────────
  onSystemFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.systemFile = input.files?.[0] ?? null;
  }

  onProviderFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.providerFile = input.files?.[0] ?? null;
  }

  // ── Run match ──────────────────────────────────────────────────
  runMatch(): void {
    if (!this.systemFile || !this.providerFile) {
      this.errorMsg = 'Please select both System CSV and Provider CSV before running.';
      return;
    }
    this.errorMsg = null;
    this.isLoading = true;

    this.matchSvc.runMatch(this.systemFile, this.providerFile).subscribe({
      next: (res) => {
        this.summary = res;
        this.applyFilter(this.activeFilter);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.error ?? 'An error occurred while processing the files.';
        this.isLoading = false;
      },
    });
  }

  // ── Filter ────────────────────────────────────────────────────
  applyFilter(filter: FilterType): void {
    this.activeFilter = filter;
    if (!this.summary) return;

    if (!this.summary.sessionId) {
      this.applyLocalFilter();
      return;
    }

    this.matchSvc.getSession(this.summary.sessionId, filter).subscribe({
      next: (res) => {
        // Keep the summary counts but refresh the results list
        if (this.summary) this.summary.results = res.results;
        this.filteredResults = res.results;
      },
      error: () => this.applyLocalFilter(),
    });
  }

  private applyLocalFilter(): void {
    if (!this.summary) return;
    switch (this.activeFilter) {
      case 'resolved':
        this.filteredResults = this.summary.results.filter((r) => r.isResolved);
        break;
      case 'unresolved':
        this.filteredResults = this.summary.results.filter((r) => !r.isResolved);
        break;
      default:
        this.filteredResults = [...this.summary.results];
    }
  }

  // ── Resolve ───────────────────────────────────────────────────
  resolve(row: MatchResultDto, side: 'System' | 'Provider'): void {
    this.resolvingId = row.id;
    this.matchSvc.resolve(row.id, side).subscribe({
      next: (updated) => {
        // Update the row in place
        Object.assign(row, updated);
        this.applyLocalFilter();
        this.resolvingId = null;
      },
      error: () => {
        this.resolvingId = null;
        this.errorMsg = 'Failed to resolve. Please try again.';
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  statusClass(status: string): string {
    return {
      MATCHED: 'badge-matched',
      AMOUNTMISMATCH: 'badge-mismatch',
      ONLYSYSTEM: 'badge-system',
      ONLYPROVIDER: 'badge-provider',
    }[status] ?? '';
  }

  statusLabel(status: string): string {
    return {
      MATCHED: 'Matched',
      AMOUNTMISMATCH: 'Amount Mismatch',
      ONLYSYSTEM: 'Only System',
      ONLYPROVIDER: 'Only Provider',
    }[status] ?? status;
  }

  formatAmount(val: number | null): string {
    return val != null ? val.toFixed(2) : '—';
  }
}

