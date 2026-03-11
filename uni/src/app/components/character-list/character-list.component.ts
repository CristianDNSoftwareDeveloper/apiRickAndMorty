import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.model';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterCardComponent],
  template: `
    <div class="container">
      <header>
        <h1>Rick <span class="accent">and</span> Morty</h1>
        <p class="subtitle">Character Wiki</p>
      </header>

      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchName" 
            (ngModelChange)="onSearchChange()" 
            placeholder="Search characters..."
          >
          <span class="search-icon">🔍</span>
        </div>

        <div class="status-filters">
          <button 
            *ngFor="let status of ['all', 'alive', 'dead', 'unknown']" 
            [class.active]="currentStatus() === status"
            (click)="filterByStatus(status)"
          >
            {{ status | titlecase }}
          </button>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Searching the multiverse...</p>
      </div>

      <div class="error-state" *ngIf="error() && !loading()">
        <p>{{ error() }}</p>
        <button (click)="loadCharacters()">Try Again</button>
      </div>

      <div class="grid" *ngIf="!loading() && !error()">
        <div class="no-results" *ngIf="characters().length === 0">
          <p>No characters found in this dimension.</p>
        </div>
        <app-character-card 
          *ngFor="let char of characters()" 
          [character]="char"
        ></app-character-card>
      </div>

      <div class="pagination" *ngIf="!loading() && !error() && totalPages() > 1">
        <button [disabled]="currentPage() === 1" (click)="prevPage()">
          Previous
        </button>
        <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
        <button [disabled]="currentPage() === totalPages()" (click)="$any(nextPage())">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
    }

    h1 {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 900;
      color: #fff;
      letter-spacing: -1px;
    }

    .accent {
      color: #bcf60c; /* Rick's portal green-ish */
    }

    .subtitle {
      color: #9ca3af;
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }

    .filters {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 3rem;
      align-items: center;
    }

    .search-box {
      position: relative;
      width: 100%;
      max-width: 500px;
    }

    .search-box input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #fff;
      font-size: 1.1rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .search-box input:focus {
      border-color: #bcf60c;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 4px rgba(188, 246, 12, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      opacity: 0.5;
    }

    .status-filters {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .status-filters button {
      padding: 0.6rem 1.2rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 30px;
      color: #e5e7eb;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .status-filters button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .status-filters button.active {
      background: #bcf60c;
      color: #000;
      border-color: #bcf60c;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .loading-state, .error-state, .no-results {
      text-align: center;
      padding: 4rem 0;
      color: #9ca3af;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(188, 246, 12, 0.1);
      border-top-color: #bcf60c;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .pagination button {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #fff;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .pagination button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: #bcf60c;
    }

    .pagination button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-info {
      color: #9ca3af;
      font-size: 0.9rem;
      min-width: 100px;
      text-align: center;
    }

    @media (min-width: 768px) {
      .filters {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class CharacterListComponent implements OnInit {
  characters: WritableSignal<Character[]> = signal([]);
  loading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  searchName = '';
  currentStatus: WritableSignal<string> = signal('all');
  currentPage: WritableSignal<number> = signal(1);
  totalPages: WritableSignal<number> = signal(0);

  private searchSubject = new Subject<string>();

  constructor(private characterService: CharacterService) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadCharacters();
    });
  }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading.set(true);
    this.error.set(null);

    const statusParam = this.currentStatus() === 'all' ? undefined : this.currentStatus();

    this.characterService.getCharacters(this.searchName, statusParam, this.currentPage()).subscribe({
      next: (response) => {
        this.characters.set(response.results);
        this.totalPages.set(response.info.pages);
        this.loading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        if (err.status === 404) {
          this.characters.set([]);
          this.totalPages.set(0);
        } else {
          this.error.set('Failed to load characters. Please check your connection.');
        }
        this.loading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadCharacters();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadCharacters();
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchName);
  }

  filterByStatus(status: string): void {
    this.currentStatus.set(status);
    this.currentPage.set(1);
    this.loadCharacters();
  }
}
